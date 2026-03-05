const router = require('express').Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, washing, drying, folding, ready, delivered, cancelled] }
 *       - in: query
 *         name: customer_id
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of orders
 */
// Get all orders
router.get('/', auth, async (req, res) => {
  try {
    const { status, customer_id, search, page = 1, limit = 20 } = req.query;
    let where = 'WHERE 1=1';
    const params = [];
    if (status) { where += ' AND o.status = ?'; params.push(status); }
    if (customer_id) { where += ' AND o.customer_id = ?'; params.push(customer_id); }
    if (search) { where += ' AND (o.order_number LIKE ? OR c.name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    const offset = (page - 1) * limit;
    const [orders] = await pool.execute(
      `SELECT o.*, c.name as customer_name FROM lms_orders o LEFT JOIN lms_customers c ON o.customer_id = c.id ${where} ORDER BY o.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`,
      params
    );
    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) as total FROM lms_orders o LEFT JOIN lms_customers c ON o.customer_id = c.id ${where}`, params
    );
    res.json({ orders, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get a single order with items and QC checks
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const [[order]] = await pool.execute(
      'SELECT o.*, c.name as customer_name FROM lms_orders o LEFT JOIN lms_customers c ON o.customer_id = c.id WHERE o.id = ?',
      [req.params.id]
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const [items] = await pool.execute('SELECT * FROM lms_order_items WHERE order_id = ?', [req.params.id]);
    const [qcChecks] = await pool.execute('SELECT * FROM lms_quality_checks WHERE order_id = ?', [req.params.id]);
    res.json({ ...order, items, qcChecks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer_id, total_weight]
 *             properties:
 *               customer_id: { type: integer, example: 1 }
 *               priority: { type: string, enum: [normal, urgent], example: normal }
 *               pickup_date: { type: string, format: date, example: "2026-03-10" }
 *               delivery_date: { type: string, format: date, example: "2026-03-12" }
 *               total_weight: { type: number, example: 5.5 }
 *               cost_per_pound: { type: number, example: 2.5 }
 *               special_instructions: { type: string }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     item_name: { type: string, example: Shirt }
 *                     quantity: { type: integer, example: 3 }
 *                     wash_type: { type: string, enum: [standard, delicate, heavy], example: standard }
 *                     special_instructions: { type: string }
 *     responses:
 *       200:
 *         description: Order created
 */
// Create order
router.post('/', auth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { customer_id, priority, pickup_date, delivery_date, total_weight, cost_per_pound, special_instructions, items } = req.body;
    const order_number = `LMS-${Date.now()}`;
    const total_cost = total_weight * (cost_per_pound || 2.5);
    const [result] = await conn.execute(
      'INSERT INTO lms_orders (order_number, customer_id, priority, pickup_date, delivery_date, total_weight, cost_per_pound, total_cost, total_items, special_instructions, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [order_number, customer_id, priority || 'normal', pickup_date, delivery_date, total_weight, cost_per_pound || 2.5, total_cost, items?.length || 0, special_instructions, req.user.id]
    );
    const orderId = result.insertId;
    if (items?.length) {
      // Filter out items with empty item_name
      const validItems = items.filter(item => item.item_name && item.item_name.trim() !== '');
      for (const item of validItems) {
        await conn.execute(
          'INSERT INTO lms_order_items (order_id, item_name, quantity, wash_type, special_instructions) VALUES (?,?,?,?,?)',
          [orderId, item.item_name, item.quantity || 1, item.wash_type || 'standard', item.special_instructions || null]
        );
      }
    }
    await conn.execute(
      'INSERT INTO lms_compliance_logs (order_id, action, description, performed_by) VALUES (?,?,?,?)',
      [orderId, 'ORDER_CREATED', `Order ${order_number} created`, req.user.id]
    );
    await conn.commit();
    res.json({ id: orderId, order_number, message: 'Order created' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, washing, drying, folding, ready, delivered, cancelled]
 *                 example: washing
 *     responses:
 *       200:
 *         description: Status updated
 */
// Update order status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.execute('UPDATE lms_orders SET status = ? WHERE id = ?', [status, req.params.id]);
    await pool.execute(
      'INSERT INTO lms_compliance_logs (order_id, action, description, performed_by) VALUES (?,?,?,?)',
      [req.params.id, 'STATUS_UPDATE', `Status changed to ${status}`, req.user.id]
    );
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

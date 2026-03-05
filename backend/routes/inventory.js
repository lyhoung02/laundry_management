const router = require('express').Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory item management
 */

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get all inventory items
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: low_stock
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: List of inventory items
 */
router.get('/', auth, async (req, res) => {
  try {
    const { category, low_stock } = req.query;
    let where = 'WHERE 1=1';
    const params = [];
    if (category) { where += ' AND category = ?'; params.push(category); }
    if (low_stock === 'true') where += ' AND quantity <= min_quantity';
    const [items] = await pool.execute(
      `SELECT i.*, c.name as customer_name FROM lms_inventory_items i LEFT JOIN lms_customers c ON i.customer_id = c.id ${where} ORDER BY name`,
      params
    );
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Create an inventory item
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category]
 *             properties:
 *               name: { type: string, example: White Sheet }
 *               category: { type: string, example: Bedding }
 *               rfid_tag: { type: string }
 *               quantity: { type: integer, example: 50 }
 *               min_quantity: { type: integer, example: 10 }
 *               unit: { type: string, example: piece }
 *               customer_id: { type: integer }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Item created
 */
router.post('/', auth, async (req, res) => {
  try {
    const { name, category, rfid_tag, quantity, min_quantity, unit, customer_id, notes } = req.body;
    const [r] = await pool.execute(
      'INSERT INTO lms_inventory_items (name, category, rfid_tag, quantity, min_quantity, unit, customer_id, notes) VALUES (?,?,?,?,?,?,?,?)',
      [name, category, rfid_tag, quantity || 0, min_quantity || 10, unit || 'piece', customer_id, notes]
    );
    res.json({ id: r.insertId, message: 'Item created' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     summary: Update an inventory item
 *     tags: [Inventory]
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
 *             properties:
 *               name: { type: string }
 *               category: { type: string }
 *               rfid_tag: { type: string }
 *               quantity: { type: integer }
 *               min_quantity: { type: integer }
 *               unit: { type: string }
 *               condition_status: { type: string, enum: [good, fair, poor] }
 *               customer_id: { type: integer }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, category, rfid_tag, quantity, min_quantity, unit, condition_status, customer_id, notes } = req.body;
    await pool.execute(
      'UPDATE lms_inventory_items SET name=?,category=?,rfid_tag=?,quantity=?,min_quantity=?,unit=?,condition_status=?,customer_id=?,notes=? WHERE id=?',
      [name, category, rfid_tag, quantity, min_quantity, unit, condition_status, customer_id, notes, req.params.id]
    );
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * @swagger
 * /api/inventory/{id}:
 *   delete:
 *     summary: Delete an inventory item
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.execute('DELETE FROM lms_inventory_items WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

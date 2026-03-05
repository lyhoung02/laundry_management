const router = require('express').Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management
 */

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: List of customers
 */
router.get('/', auth, async (req, res) => {
  try {
    const [customers] = await pool.execute('SELECT * FROM lms_customers ORDER BY name');
    res.json(customers);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: ABC Hotel }
 *               email: { type: string, example: abc@hotel.com }
 *               phone: { type: string, example: "0812345678" }
 *               address: { type: string, example: "123 Main St" }
 *               type: { type: string, enum: [individual, business], example: business }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Customer created
 */
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, phone, address, type, notes } = req.body;
    const [r] = await pool.execute(
      'INSERT INTO lms_customers (name, email, phone, address, type, notes) VALUES (?,?,?,?,?,?)',
      [name, email, phone, address, type || 'individual', notes]
    );
    res.json({ id: r.insertId, message: 'Customer created' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Update a customer
 *     tags: [Customers]
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
 *               email: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *               type: { type: string, enum: [individual, business] }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, phone, address, type, notes } = req.body;
    await pool.execute(
      'UPDATE lms_customers SET name=?,email=?,phone=?,address=?,type=?,notes=? WHERE id=?',
      [name, email, phone, address, type, notes, req.params.id]
    );
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Delete a customer
 *     tags: [Customers]
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
    await pool.execute('DELETE FROM lms_customers WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

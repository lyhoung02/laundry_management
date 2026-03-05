const router = require('express').Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

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

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.execute('DELETE FROM lms_inventory_items WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

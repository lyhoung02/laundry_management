const router = require('express').Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const [customers] = await pool.execute('SELECT * FROM lms_customers ORDER BY name');
    res.json(customers);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

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

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.execute('DELETE FROM lms_customers WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

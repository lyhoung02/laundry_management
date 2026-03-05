const router = require('express').Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { date, status } = req.query;
    let where = 'WHERE 1=1';
    const params = [];
    if (date) { where += ' AND DATE(s.scheduled_at) = ?'; params.push(date); }
    if (status) { where += ' AND s.status = ?'; params.push(status); }
    const [schedules] = await pool.execute(
      `SELECT s.*, o.order_number, u.name as assigned_name 
       FROM lms_schedules s 
       LEFT JOIN lms_orders o ON s.order_id = o.id 
       LEFT JOIN lms_users u ON s.assigned_to = u.id 
       ${where} ORDER BY s.scheduled_at`,
      params
    );
    res.json(schedules);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, order_id, schedule_type, scheduled_at, assigned_to, notes } = req.body;
    const [r] = await pool.execute(
      'INSERT INTO lms_schedules (title, order_id, schedule_type, scheduled_at, assigned_to, notes) VALUES (?,?,?,?,?,?)',
      [title || null, order_id || null, schedule_type || null, scheduled_at || null, assigned_to || null, notes || null]
    );
    res.json({ id: r.insertId, message: 'Scheduled' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/complete', auth, async (req, res) => {
  try {
    await pool.execute(
      'UPDATE lms_schedules SET status=?, completed_at=NOW() WHERE id=?',
      ['completed', req.params.id]
    );
    res.json({ message: 'Completed' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

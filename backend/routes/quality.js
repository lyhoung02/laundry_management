const router = require('express').Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const [checks] = await pool.execute(
      `SELECT q.*, o.order_number, u.name as checked_by_name 
       FROM lms_quality_checks q 
       LEFT JOIN lms_orders o ON q.order_id = o.id 
       LEFT JOIN lms_users u ON q.checked_by = u.id 
       ORDER BY q.checked_at DESC LIMIT 50`
    );
    res.json(checks);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { order_id, temperature, detergent_used, wash_cycle, result, notes } = req.body;
    const [r] = await pool.execute(
      'INSERT INTO lms_quality_checks (order_id, checked_by, temperature, detergent_used, wash_cycle, result, notes) VALUES (?,?,?,?,?,?,?)',
      [order_id, req.user.id, temperature, detergent_used, wash_cycle, result || 'pass', notes]
    );
    await pool.execute(
      'INSERT INTO lms_compliance_logs (order_id, action, description, performed_by) VALUES (?,?,?,?)',
      [order_id, 'QUALITY_CHECK', `QC ${result}: temp=${temperature}°C, detergent=${detergent_used}`, req.user.id]
    );
    res.json({ id: r.insertId, message: 'QC recorded' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

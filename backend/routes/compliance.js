const router = require('express').Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Compliance
 *   description: Compliance audit logs
 */

/**
 * @swagger
 * /api/compliance:
 *   get:
 *     summary: Get latest 100 compliance log entries
 *     tags: [Compliance]
 *     responses:
 *       200:
 *         description: List of compliance log entries
 */
router.get('/', auth, async (req, res) => {
  try {
    const [logs] = await pool.execute(
      `SELECT l.*, o.order_number, u.name as performed_by_name 
       FROM lms_compliance_logs l 
       LEFT JOIN lms_orders o ON l.order_id = o.id 
       LEFT JOIN lms_users u ON l.performed_by = u.id 
       ORDER BY l.created_at DESC LIMIT 100`
    );
    res.json(logs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

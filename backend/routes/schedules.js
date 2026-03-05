const router = require('express').Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: Schedule management
 */

/**
 * @swagger
 * /api/schedules:
 *   get:
 *     summary: Get all schedules
 *     tags: [Schedules]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date, example: "2026-03-10" }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, completed] }
 *     responses:
 *       200:
 *         description: List of schedules
 */
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

/**
 * @swagger
 * /api/schedules:
 *   post:
 *     summary: Create a schedule entry
 *     tags: [Schedules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string, example: Pickup run }
 *               order_id: { type: integer }
 *               schedule_type: { type: string, enum: [pickup, delivery, wash], example: pickup }
 *               scheduled_at: { type: string, format: date-time, example: "2026-03-10T09:00:00" }
 *               assigned_to: { type: integer }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Schedule created
 */
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

/**
 * @swagger
 * /api/schedules/{id}/complete:
 *   patch:
 *     summary: Mark a schedule as completed
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Completed
 */
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

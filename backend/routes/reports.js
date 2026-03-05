const router = require('express').Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Analytics and reporting
 */

/**
 * @swagger
 * /api/reports/analytics:
 *   get:
 *     summary: Get analytics report
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date, example: "2026-02-01" }
 *         description: Start date (defaults to 30 days ago)
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date, example: "2026-03-05" }
 *         description: End date (defaults to today)
 *     responses:
 *       200:
 *         description: Daily revenue, top customers, wash types, KPIs
 */
router.get('/analytics', auth, async (req, res) => {
  try {
    const { from, to } = req.query;
    const startDate = from || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const endDate = to || new Date().toISOString().split('T')[0];

    const [dailyRevenue] = await pool.execute(
      `SELECT DATE(created_at) as date, SUM(total_cost) as revenue, COUNT(*) as orders 
       FROM lms_orders WHERE created_at BETWEEN ? AND ? AND status != 'cancelled' 
       GROUP BY DATE(created_at) ORDER BY date`,
      [startDate, endDate + ' 23:59:59']
    );

    const [topCustomers] = await pool.execute(
      `SELECT c.name, COUNT(o.id) as orders, SUM(o.total_cost) as revenue 
       FROM lms_orders o JOIN lms_customers c ON o.customer_id = c.id 
       WHERE o.created_at BETWEEN ? AND ? GROUP BY c.id ORDER BY revenue DESC LIMIT 5`,
      [startDate, endDate + ' 23:59:59']
    );

    const [washTypes] = await pool.execute(
      `SELECT wash_type, COUNT(*) as count FROM lms_order_items GROUP BY wash_type`
    );

    const [[kpis]] = await pool.execute(
      `SELECT 
        AVG(TIMESTAMPDIFF(HOUR, created_at, actual_delivery)) as avg_turnaround_hours,
        AVG(total_cost / NULLIF(total_weight, 0)) as avg_cost_per_pound,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) / COUNT(*) * 100 as completion_rate,
        SUM(total_weight) as total_weight_processed
       FROM lms_orders WHERE created_at BETWEEN ? AND ?`,
      [startDate, endDate + ' 23:59:59']
    );

    res.json({ dailyRevenue, topCustomers, washTypes, kpis });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

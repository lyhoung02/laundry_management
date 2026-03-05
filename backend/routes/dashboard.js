const router = require('express').Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics
 */

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Order stats, inventory stats, customer count, recent orders, weekly revenue, orders by status
 */
router.get('/stats', auth, async (req, res) => {
  try {
    const [[orderStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status IN ('washing','drying','folding') THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today_orders,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN total_cost ELSE 0 END) as today_revenue,
        SUM(total_cost) as total_revenue
      FROM lms_orders WHERE status != 'cancelled'
    `);

    const [[inventoryStats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_items,
        SUM(quantity) as total_quantity,
        SUM(CASE WHEN quantity <= min_quantity THEN 1 ELSE 0 END) as low_stock
      FROM lms_inventory_items
    `);

    const [[customerStats]] = await pool.execute('SELECT COUNT(*) as total FROM lms_customers');

    const [recentOrders] = await pool.execute(`
      SELECT o.*, c.name as customer_name 
      FROM lms_orders o LEFT JOIN lms_customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC LIMIT 5
    `);

    const [weeklyRevenue] = await pool.execute(`
      SELECT DATE(created_at) as date, SUM(total_cost) as revenue, COUNT(*) as orders
      FROM lms_orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND status != 'cancelled'
      GROUP BY DATE(created_at) ORDER BY date
    `);

    const [ordersByStatus] = await pool.execute(`
      SELECT status, COUNT(*) as count FROM lms_orders GROUP BY status
    `);

    res.json({ orderStats, inventoryStats, customerStats: customerStats, recentOrders, weeklyRevenue, ordersByStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

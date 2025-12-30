const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const { validateInvestment } = require('../middleware/validation');
const {
  getInvestments,
  getInvestment,
  createInvestment,
  getInvestmentStats,
  updateInvestmentReturns
} = require('../controllers/investmentController');

/**
 * @swagger
 * tags:
 *   name: Investments
 *   description: User investment management
 */

/**
 * @swagger
 * /api/investments:
 *   get:
 *     summary: Get user investments
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, pending, cancelled]
 *         description: Filter by investment status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of user investments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 total:
 *                   type: number
 *                 page:
 *                   type: number
 *                 pages:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Investment'
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, getInvestments);

/**
 * @swagger
 * /api/investments/stats:
 *   get:
 *     summary: Get investment statistics
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Investment statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalInvestments:
 *                       type: number
 *                     totalInvested:
 *                       type: number
 *                     totalReturns:
 *                       type: number
 *                     byStatus:
 *                       type: array
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', auth, getInvestmentStats);

/**
 * @swagger
 * /api/investments/{id}:
 *   get:
 *     summary: Get single investment
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Investment ID
 *     responses:
 *       200:
 *         description: Investment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Investment'
 *       404:
 *         description: Investment not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', auth, getInvestment);

/**
 * @swagger
 * /api/investments:
 *   post:
 *     summary: Create new investment
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - packageId
 *               - amount
 *             properties:
 *               packageId:
 *                 type: string
 *                 description: Investment package ID
 *               amount:
 *                 type: number
 *                 description: Investment amount
 *     responses:
 *       201:
 *         description: Investment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Investment'
 *       400:
 *         description: Validation error or insufficient balance
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, validateInvestment, createInvestment);

/**
 * @swagger
 * /api/investments/{id}/returns:
 *   put:
 *     summary: Update investment returns (Admin only)
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Investment ID
 *     responses:
 *       200:
 *         description: Investment returns updated successfully
 *       404:
 *         description: Investment not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.put('/:id/returns', auth, adminAuth, updateInvestmentReturns);

module.exports = router;
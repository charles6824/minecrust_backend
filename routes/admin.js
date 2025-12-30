const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getAllTransactions,
  processTransaction,
  getAllInvestments,
  updateUserBalance,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageStatus
} = require('../controllers/adminController');
const { updatePaymentConfig } = require('../controllers/paymentConfigController');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
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
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         active:
 *                           type: number
 *                         newThisMonth:
 *                           type: number
 *                     investments:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         active:
 *                           type: number
 *                         totalAmount:
 *                           type: number
 *                     transactions:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: number
 *                         totalDeposits:
 *                           type: number
 *                         totalWithdrawals:
 *                           type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/dashboard', auth, adminAuth, getDashboardStats);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by user status
 *     responses:
 *       200:
 *         description: List of users
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
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/users', auth, adminAuth, getUsers);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   patch:
 *     summary: Update user status (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.patch('/users/:id/status', auth, adminAuth, updateUserStatus);

/**
 * @swagger
 * /api/admin/users/{id}/balance:
 *   patch:
 *     summary: Update user balance (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [add, subtract]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: User balance updated successfully
 *       400:
 *         description: Insufficient balance
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.patch('/users/:id/balance', auth, adminAuth, updateUserBalance);

/**
 * @swagger
 * /api/admin/transactions:
 *   get:
 *     summary: Get all transactions (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [deposit, withdrawal, investment, return, bonus]
 *         description: Filter by transaction type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, processing]
 *         description: Filter by transaction status
 *     responses:
 *       200:
 *         description: List of all transactions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/transactions', auth, adminAuth, getAllTransactions);

/**
 * @swagger
 * /api/admin/transactions/{id}/process:
 *   patch:
 *     summary: Process transaction (approve/reject) (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *               adminNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction processed successfully
 *       400:
 *         description: Transaction already processed
 *       404:
 *         description: Transaction not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.patch('/transactions/:id/process', auth, adminAuth, processTransaction);

/**
 * @swagger
 * /api/admin/investments:
 *   get:
 *     summary: Get all investments (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, pending, cancelled]
 *         description: Filter by investment status
 *     responses:
 *       200:
 *         description: List of all investments
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/investments', auth, adminAuth, getAllInvestments);

// Package management routes
router.post('/packages', auth, adminAuth, createPackage);
router.put('/packages/:id', auth, adminAuth, updatePackage);
router.delete('/packages/:id', auth, adminAuth, deletePackage);
router.patch('/packages/:id/toggle', auth, adminAuth, togglePackageStatus);

router.put('/payment-config', auth, adminAuth, updatePaymentConfig);

module.exports = router;
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validateTransaction } = require('../middleware/validation');
const {
  getTransactions,
  getTransaction,
  createDeposit,
  createWithdrawal,
  getTransactionStats
} = require('../controllers/transactionController');

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: User transaction management
 */

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get user transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: List of user transactions
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
 *                     $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, getTransactions);

/**
 * @swagger
 * /api/transactions/stats:
 *   get:
 *     summary: Get transaction statistics
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction statistics
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
 *                     totalDeposits:
 *                       type: number
 *                     totalWithdrawals:
 *                       type: number
 *                     byTypeAndStatus:
 *                       type: array
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', auth, getTransactionStats);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get single transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', auth, getTransaction);

/**
 * @swagger
 * /api/transactions/deposit:
 *   post:
 *     summary: Create deposit transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - method
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Deposit amount
 *               method:
 *                 type: string
 *                 enum: [crypto, paypal, bank_transfer]
 *                 description: Payment method
 *               reference:
 *                 type: string
 *                 description: Transaction reference/hash
 *               walletAddress:
 *                 type: string
 *                 description: Crypto wallet address
 *     responses:
 *       201:
 *         description: Deposit request submitted successfully
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
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/deposit', auth, validateTransaction, createDeposit);

/**
 * @swagger
 * /api/transactions/withdrawal:
 *   post:
 *     summary: Create withdrawal transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - method
 *               - walletAddress
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Withdrawal amount
 *               method:
 *                 type: string
 *                 enum: [crypto, paypal, bank_transfer]
 *                 description: Payment method
 *               walletAddress:
 *                 type: string
 *                 description: Destination wallet address
 *     responses:
 *       201:
 *         description: Withdrawal request submitted successfully
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
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Validation error or insufficient balance
 *       401:
 *         description: Unauthorized
 */
router.post('/withdrawal', auth, validateTransaction, createWithdrawal);

module.exports = router;
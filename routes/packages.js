const express = require('express');
const router = express.Router();
const { auth, adminAuth, optionalAuth } = require('../middleware/auth');
const { validatePackage } = require('../middleware/validation');
const {
  getPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageStatus
} = require('../controllers/packageController');

/**
 * @swagger
 * tags:
 *   name: Investment Packages
 *   description: Investment package management
 */

/**
 * @swagger
 * /api/packages:
 *   get:
 *     summary: Get all investment packages
 *     tags: [Investment Packages]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of investment packages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InvestmentPackage'
 */
router.get('/', optionalAuth, getPackages);

/**
 * @swagger
 * /api/packages/{id}:
 *   get:
 *     summary: Get single investment package
 *     tags: [Investment Packages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Package ID
 *     responses:
 *       200:
 *         description: Investment package details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/InvestmentPackage'
 *       404:
 *         description: Package not found
 */
router.get('/:id', optionalAuth, getPackage);

/**
 * @swagger
 * /api/packages:
 *   post:
 *     summary: Create new investment package (Admin only)
 *     tags: [Investment Packages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - minAmount
 *               - maxAmount
 *               - duration
 *               - roi
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               minAmount:
 *                 type: number
 *               maxAmount:
 *                 type: number
 *               duration:
 *                 type: number
 *               roi:
 *                 type: number
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               riskLevel:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       201:
 *         description: Package created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post('/', auth, adminAuth, validatePackage, createPackage);

/**
 * @swagger
 * /api/packages/{id}:
 *   put:
 *     summary: Update investment package (Admin only)
 *     tags: [Investment Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Package ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InvestmentPackage'
 *     responses:
 *       200:
 *         description: Package updated successfully
 *       404:
 *         description: Package not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.put('/:id', auth, adminAuth, validatePackage, updatePackage);

/**
 * @swagger
 * /api/packages/{id}:
 *   delete:
 *     summary: Delete investment package (Admin only)
 *     tags: [Investment Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Package ID
 *     responses:
 *       200:
 *         description: Package deleted successfully
 *       404:
 *         description: Package not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.delete('/:id', auth, adminAuth, deletePackage);

/**
 * @swagger
 * /api/packages/{id}/toggle:
 *   patch:
 *     summary: Toggle package active status (Admin only)
 *     tags: [Investment Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Package ID
 *     responses:
 *       200:
 *         description: Package status toggled successfully
 *       404:
 *         description: Package not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.patch('/:id/toggle', auth, adminAuth, togglePackageStatus);

module.exports = router;
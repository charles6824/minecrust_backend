const express = require('express');
const { transferFunds, searchUserByWalletId } = require('../controllers/transferController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/', transferFunds);
router.get('/search/:walletId', searchUserByWalletId);

module.exports = router;
const cron = require('node-cron');
const Investment = require('../models/Investment');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const processInvestments = async () => {
  try {
    console.log('Running investment processing...');
    
    const activeInvestments = await Investment.find({ 
      status: { $in: ['active', 'pending'] } 
    }).populate('packageId');
    let updated = 0;
    let completed = 0;
    
    for (const investment of activeInvestments) {
      await investment.updateCurrentValue();
      
      // Auto-complete if past end date
      if (investment.status === 'completed') {
        const user = await User.findById(investment.userId);
        user.balance += investment.currentValue;
        await user.save();
        
        await Transaction.create({
          userId: investment.userId,
          type: 'return',
          amount: investment.currentValue,
          status: 'approved',
          method: 'internal',
          adminNotes: `Investment auto-completed - ${investment.packageId.name}`
        });
        
        completed++;
      }
      
      await investment.save();
      updated++;
    }
    
    console.log(`Updated ${updated} investments, completed ${completed}`);
  } catch (error) {
    console.error('Investment processing error:', error);
  }
};

// Run every 6 hours
const updateDailyReturns = cron.schedule('0 */6 * * *', processInvestments, {
  scheduled: false
});

module.exports = { updateDailyReturns, processInvestments };
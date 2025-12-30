const cron = require('node-cron');
const Investment = require('../models/Investment');

// Run daily at midnight
const updateDailyReturns = cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Running daily returns update...');
    
    const activeInvestments = await Investment.find({ status: 'active' });
    
    for (const investment of activeInvestments) {
      await investment.updateCurrentValue();
      await investment.save();
    }
    
    console.log(`Updated ${activeInvestments.length} investments`);
  } catch (error) {
    console.error('Daily returns update error:', error);
  }
}, {
  scheduled: false
});

module.exports = { updateDailyReturns };
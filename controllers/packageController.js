const InvestmentPackage = require('../models/InvestmentPackage');

// @desc    Get all packages
// @route   GET /api/packages
// @access  Public
const getPackages = async (req, res) => {
  try {
    const { active } = req.query;
    const filter = active === 'true' ? { isActive: true } : {};
    
    const packages = await InvestmentPackage.find(filter)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: packages.length,
      data: packages
    });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single package
// @route   GET /api/packages/:id
// @access  Public
const getPackage = async (req, res) => {
  try {
    const package = await InvestmentPackage.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');

    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.json({
      success: true,
      data: package
    });
  } catch (error) {
    console.error('Get package error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create package
// @route   POST /api/packages
// @access  Private/Admin
const createPackage = async (req, res) => {
  try {
    const packageData = {
      ...req.body,
      createdBy: req.user.id
    };

    const package = new InvestmentPackage(packageData);
    await package.save();

    await package.populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      data: package
    });
  } catch (error) {
    console.error('Create package error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update package
// @route   PUT /api/packages/:id
// @access  Private/Admin
const updatePackage = async (req, res) => {
  try {
    const package = await InvestmentPackage.findById(req.params.id);

    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        package[key] = req.body[key];
      }
    });

    await package.save();
    await package.populate('createdBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Package updated successfully',
      data: package
    });
  } catch (error) {
    console.error('Update package error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete package
// @route   DELETE /api/packages/:id
// @access  Private/Admin
const deletePackage = async (req, res) => {
  try {
    const package = await InvestmentPackage.findById(req.params.id);

    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    await InvestmentPackage.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle package status
// @route   PATCH /api/packages/:id/toggle
// @access  Private/Admin
const togglePackageStatus = async (req, res) => {
  try {
    const package = await InvestmentPackage.findById(req.params.id);

    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    package.isActive = !package.isActive;
    await package.save();

    res.json({
      success: true,
      message: `Package ${package.isActive ? 'activated' : 'deactivated'} successfully`,
      data: package
    });
  } catch (error) {
    console.error('Toggle package status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageStatus
};
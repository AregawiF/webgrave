const Memorial = require('../models/memorial.model');
const Flower = require('../models/flower.model');
const User = require('../models/user.model');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Count total memorials
    const totalMemorials = await Memorial.countDocuments();
    
    // Calculate total revenue (memorials × $20)
    const memorialRevenue = totalMemorials * 20;
    
    // Get flower tributes revenue
    const flowerTributes = await Flower.find();
    const flowerRevenue = flowerTributes.reduce((total, flower) => total + flower.amount, 0);
    
    // Calculate total revenue
    const totalRevenue = memorialRevenue + flowerRevenue;
    
    // Count total users
    const totalUsers = await User.countDocuments();
    
    // Get recent memorials
    const recentMemorials = await Memorial.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName createdAt totalTributes');
      
    // Get recent tributes
    const recentTributes = await Flower.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('memorialId', 'fullName')
      .select('amount createdAt');
    
    res.json({
      totalMemorials,
      totalUsers,
      totalRevenue,
      memorialRevenue,
      flowerRevenue,
      recentMemorials,
      recentTributes
    });
  } catch (error) {
    console.error('Get admin dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to retrieve dashboard statistics' });
  }
};

// Get all memorials for admin
exports.getAllMemorials = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Apply search filter if provided
    if (search) {
      query.$or = [
        { fullName: new RegExp(search, 'i') },
        { biography: new RegExp(search, 'i') }
      ];
    }

    // Get total count for pagination
    const total = await Memorial.countDocuments(query);

    // Prepare sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get paginated results
    const memorials = await Memorial.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'firstName lastName email')
      .select('-tributes');

    res.json({
      memorials,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Admin get all memorials error:', error);
    res.status(500).json({ message: 'Failed to retrieve memorials' });
  }
};

// Get all tributes for admin
exports.getAllTributes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Prepare sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get total count for pagination
    const total = await Flower.countDocuments();

    // Get paginated results
    const tributes = await Flower.find()
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('memorialId', 'fullName')
      .populate('senderId', 'firstName lastName email');

    res.json({
      tributes,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Admin get all tributes error:', error);
    res.status(500).json({ message: 'Failed to retrieve tributes' });
  }
};

// Get all users for admin
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Apply search filter if provided
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Prepare sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get paginated results
    const users = await User.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password');

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Admin get all users error:', error);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
};


// adminGetUserProfile
exports.adminGetUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile had errors:', error); // Detailed error logging
    res.status(500).json({ 
      message: 'Error fetching profile',
      error: error.message 
    });
  }
};


// adminDeleteProfile
exports.adminDeleteProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete profile had errors:', error); // Detailed error logging
    res.status(500).json({ 
      message: 'Error deleting profile',
      error: error.message 
    });
  }
};


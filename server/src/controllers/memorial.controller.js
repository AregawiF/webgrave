const Memorial = require('../models/memorial.model');
const { generateMemorialQRCode } = require('../utils/qr-code');

// Create a new memorial
exports.createMemorial = async (req, res) => {
  try {
    const memorialData = {
      ...req.body,
      creator: req.user.id  // Set creator from authenticated user
    };

    // Generate QR code for the memorial
    const { qrCode, uniqueCode } = await generateMemorialQRCode(memorialData._id);
    memorialData.qrCode = uniqueCode;

    const memorial = new Memorial(memorialData);
    await memorial.save();

    res.status(201).json({
      memorial,
      qrCodeImage: qrCode
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all memorials (public, no authentication)
exports.getAllMemorials = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const searchQuery = search ? { 
      $or: [
        { 'deceased.firstName': { $regex: search, $options: 'i' } },
        { 'deceased.lastName': { $regex: search, $options: 'i' } },
        { 'deceased.biography': { $regex: search, $options: 'i' } }
      ]
    } : {};

    const memorials = await Memorial.find(searchQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Memorial.countDocuments(searchQuery);

    res.json({
      memorials,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific memorial by ID (public, no authentication)
exports.getMemorialById = async (req, res) => {
  try {
    const memorial = await Memorial.findById(req.params.id);
    
    if (!memorial) {
      return res.status(404).json({ message: 'Memorial not found' });
    }
    
    res.json(memorial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a memorial (authenticated and must be creator)
exports.updateMemorial = async (req, res) => {
  try {
    const memorial = await Memorial.findById(req.params.id);
    
    if (!memorial) {
      return res.status(404).json({ message: 'Memorial not found' });
    }
    
    // Ensure only the creator can update
    if (memorial.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this memorial' });
    }
    
    const updatedMemorial = await Memorial.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    res.json(updatedMemorial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a memorial (authenticated and must be creator)
exports.deleteMemorial = async (req, res) => {
  try {
    const memorial = await Memorial.findById(req.params.id);
    
    if (!memorial) {
      return res.status(404).json({ message: 'Memorial not found' });
    }
    
    // Ensure only the creator can delete
    if (memorial.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this memorial' });
    }
    
    await Memorial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Memorial deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Change memorial status (authenticated and must be creator)
exports.updateMemorialStatus = async (req, res) => {
  try {
    const memorial = await Memorial.findById(req.params.id);
    
    if (!memorial) {
      return res.status(404).json({ message: 'Memorial not found' });
    }
    
    // Ensure only the creator can change status
    if (memorial.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to change memorial status' });
    }
    
    memorial.status = req.body.status;
    await memorial.save();
    
    res.json(memorial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
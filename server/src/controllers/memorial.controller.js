const Memorial = require('../models/memorial.model');
const uploadCloudinary = require('../utils/uploadCloudinary');


// Create a new memorial
exports.createMemorial = async (req, res) => {
  try {
    // Upload main picture to Cloudinary
    const mainPictureResult = await uploadCloudinary(req.files.mainPicture[0].path);
    
    const memorialData = {
      ...req.body,
      mainPicture: mainPictureResult.secure_url,
      createdBy: req.user.userId
    };

    // Parse dates
    if (req.body.birthDate) memorialData.birthDate = new Date(req.body.birthDate);
    if (req.body.deathDate) memorialData.deathDate = new Date(req.body.deathDate);
    if (req.body.serviceDate) memorialData.serviceDate = new Date(req.body.serviceDate);

    // Parse arrays and objects
    if (req.body.languagesSpoken) memorialData.languagesSpoken = JSON.parse(req.body.languagesSpoken);
    if (req.body.education) memorialData.education = JSON.parse(req.body.education);
    if (req.body.familyMembers) memorialData.familyMembers = JSON.parse(req.body.familyMembers);
    if (req.body.causeOfDeath) memorialData.causeOfDeath = JSON.parse(req.body.causeOfDeath);
    
    // Parse booleans
    memorialData.birthdayReminder = req.body.birthdayReminder === 'true';
    memorialData.militaryService = req.body.militaryService === 'true';
    memorialData.enableDigitalFlowers = req.body.enableDigitalFlowers === 'true';
    memorialData.isPublic = req.body.isPublic === 'true';

    // Handle additional media
    if (req.files.additionalMedia) {
      const mediaPromises = req.files.additionalMedia.map(async (file) => {
        const result = await uploadCloudinary(file.path);
        return {
          type: file.mimetype.startsWith('image/') ? 'photo' : 'video',
          url: result.secure_url
        };
      });
      memorialData.additionalMedia = await Promise.all(mediaPromises);
    }

    const memorial = new Memorial(memorialData);
    await memorial.save();
    console.log(memorial);

    res.status(201).json(memorial);
  } catch (error) {
    console.error('Create memorial error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get all memorials with filters
exports.getAllMemorials = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      isPublic,
      createdBy
    } = req.query;

    const query = {};

    // Apply filters
    if (search) {
      query.$or = [
        { fullName: new RegExp(search, 'i') },
        { biography: new RegExp(search, 'i') }
      ];
    }
    if (status) query.status = status;
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';
    if (createdBy) query.createdBy = createdBy;

    // Get total count for pagination
    const total = await Memorial.countDocuments(query);

    // Get paginated results
    const memorials = await Memorial.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name email')
      .select('-tributes'); // Exclude tributes for list view

    res.json({
      memorials,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Get memorials error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get a specific memorial
exports.getMemorialById = async (req, res) => {
  try {
    const memorial = await Memorial.findById(req.params.id);

    if (!memorial) {
      return res.status(404).json({ message: 'Memorial not found' });
    }

    // Check if memorial is public or if user is the creator
    if (!memorial.isPublic && (req.user.userId.toString() !== memorial.createdBy.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(memorial);
  } catch (error) {
    console.error('Get memorial error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update a memorial
exports.updateMemorial = async (req, res) => {
  console.log('Update memorial:', req.body);  
  try {
    const memorial = await Memorial.findById(req.params.id);

    if (!memorial) {
      return res.status(404).json({ message: 'Memorial not found' });
    }

    console.log('user role:', req.user.role);

    // Check if user is the creator
    if (req.user.userId.toString() !== memorial.createdBy.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = { ...req.body };
    
    // Handle main picture update
    if (req.files?.mainPicture) {
      const mainPictureResult = await uploadCloudinary(req.files.mainPicture[0].path);
      updates.mainPicture = mainPictureResult.secure_url;
    }

    // Parse dates
    if (updates.birthDate) updates.birthDate = new Date(updates.birthDate);
    if (updates.deathDate) updates.deathDate = new Date(updates.deathDate);
    if (updates.serviceDate) updates.serviceDate = new Date(updates.serviceDate);

    // Parse arrays and objects
    if (updates.languagesSpoken) updates.languagesSpoken = JSON.parse(updates.languagesSpoken);
    if (updates.education) updates.education = JSON.parse(updates.education);
    if (updates.familyMembers) updates.familyMembers = JSON.parse(updates.familyMembers);
    if (updates.causeOfDeath) updates.causeOfDeath = JSON.parse(updates.causeOfDeath);

    // Parse booleans
    if (updates.birthdayReminder !== undefined) updates.birthdayReminder = updates.birthdayReminder === 'true';
    if (updates.militaryService !== undefined) updates.militaryService = updates.militaryService === 'true';
    if (updates.enableDigitalFlowers !== undefined) updates.enableDigitalFlowers = updates.enableDigitalFlowers === 'true';
    if (updates.isPublic !== undefined) updates.isPublic = updates.isPublic === 'true';

    // Handle additional media
    if (req.files?.additionalMedia) {
      const mediaPromises = req.files.additionalMedia.map(async (file) => {
        const result = await uploadCloudinary(file.path);
        return {
          type: file.mimetype.startsWith('image/') ? 'photo' : 'video',
          url: result.secure_url
        };
      });
      const newMedia = await Promise.all(mediaPromises);
      updates.additionalMedia = [...(memorial.additionalMedia || []), ...newMedia];
    }

    const updatedMemorial = await Memorial.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json(updatedMemorial);
  } catch (error) {
    console.error('Update memorial error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a memorial
exports.deleteMemorial = async (req, res) => {
  try {
    const memorial = await Memorial.findById(req.params.id);

    if (!memorial) {
      return res.status(404).json({ message: 'Memorial not found' });
    }

    // Check if user is the creator
    if (req.user.userId.toString() !== memorial.createdBy.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Replace memorial.remove() with deleteOne()
    await Memorial.deleteOne({ _id: req.params.id });
    res.status(204).send();
  } catch (error) {
    console.error('Delete memorial error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add a tribute to a memorial
exports.addTribute = async (req, res) => {
  try {
    const memorial = await Memorial.findById(req.params.id);

    if (!memorial) {
      return res.status(404).json({ message: 'Memorial not found' });
    }

    if (!memorial.enableDigitalFlowers) {
      return res.status(400).json({ message: 'Digital flowers are disabled for this memorial' });
    }

    const tribute = {
      message: req.body.message,
      amount: req.body.amount,
      isAnonymous: req.body.isAnonymous === 'true',
      senderId: req.user.userId,
      senderName: req.body.isAnonymous === 'true' ? 'Anonymous' : req.user.name
    };

    memorial.tributes.push(tribute);
    memorial.updateTotalTributes();
    await memorial.save();

    res.status(201).json(memorial);
  } catch (error) {
    console.error('Add tribute error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Remove media from a memorial
exports.removeMedia = async (req, res) => {
  try {
    const { id, mediaId } = req.params;
    const memorial = await Memorial.findById(id);

    if (!memorial) {
      return res.status(404).json({ message: 'Memorial not found' });
    }

    // Check if user is the creator
    if (req.user.userId.toString() !== memorial.createdBy.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    memorial.additionalMedia = memorial.additionalMedia.filter(
      media => media._id.toString() !== mediaId
    );

    await memorial.save();
    res.json(memorial);
  } catch (error) {
    console.error('Remove media error:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.getMyMemorials = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      isPublic
    } = req.query;

    // Ensure user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const query = { createdBy: req.user.userId }; // Filter by logged-in user

    // Apply additional filters
    if (search) {
      query.$or = [
        { fullName: new RegExp(search, 'i') },
        { biography: new RegExp(search, 'i') }
      ];
    }
    if (status) query.status = status;
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';

    // Get total count for pagination
    const total = await Memorial.countDocuments(query);

    // Get paginated results
    const memorials = await Memorial.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('createdBy', 'name email')
      .select('-tributes'); // Exclude tributes for list view

    res.json({
      memorials,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Get memorials error:', error);
    res.status(500).json({ message: error.message });
  }
};

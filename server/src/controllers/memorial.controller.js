const Memorial = require('../models/memorial.model');
const uploadCloudinary = require('../utils/uploadCloudinary');
const mongoose = require('mongoose');

// Create a new memorial
exports.createMemorial = async (req, res) => {
  try {
    // First, upload the main picture to Cloudinary
    const mainPictureResult = await uploadCloudinary(req.files.mainPicture[0].path);
    
    const memorialData = {
      ...req.body,
      mainPicture: mainPictureResult.secure_url,
      createdBy: req.user.userId,
      orderId: req.body.orderId
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

    // Check if memorial already exists for this order
    const existingMemorial = await Memorial.findOne({ orderId: memorialData.orderId });
    if (existingMemorial) {
      return res.status(200).json({ 
        message: 'Memorial already exists for this order',
        memorialId: existingMemorial._id,
        memorial: existingMemorial
      });
    }

    // Create the memorial
    const memorial = new Memorial(memorialData);
    await memorial.save();

    // Handle additional media if present
    if (req.files.additionalMedia) {
      const mediaPromises = req.files.additionalMedia.map(async (file) => {
        const result = await uploadCloudinary(file.path);
        return {
          type: file.mimetype.startsWith('image/') ? 'photo' : 'video',
          url: result.secure_url
        };
      });
      memorial.additionalMedia = await Promise.all(mediaPromises);
      await memorial.save();
    }

    res.status(201).json(memorial);
  } catch (error) {
    // Handle duplicate key error specifically
    if (error.code === 11000 && error.keyPattern && error.keyPattern.orderId) {
      const existingMemorial = await Memorial.findOne({ orderId: req.body.orderId });
      if (existingMemorial) {
        return res.status(200).json({ 
          message: 'Memorial already exists for this order',
          memorialId: existingMemorial._id,
          memorial: existingMemorial
        });
      }
    }
    
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
      sortBy = 'createdAt',
      sortOrder = 'desc'
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

    // Get total count for pagination
    const total = await Memorial.countDocuments(query);

    // Prepare sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get paginated results
    const memorials = await Memorial.find(query)
      .sort(sortOptions)
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

    // Sort tributes by date (newest first)
    memorial.tributes = [...memorial.tributes].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    // Paginate tributes
    const { page = 1, limit = 10 } = req.query;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTributes = memorial.tributes.slice(startIndex, endIndex);

    res.json({
      memorial: {
        ...memorial.toObject(),
        tributes: paginatedTributes
      },
      totalPages: Math.ceil(memorial.tributes.length / limit),
      currentPage: Number(page),
      totalItems: memorial.tributes.length
    });
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

      // Parse dates - No need to convert if they're already in ISO format
      // if (updates.birthDate) updates.birthDate = new Date(updates.birthDate); //Remove, date is ISOString
      // if (updates.deathDate) updates.deathDate = new Date(updates.deathDate); //Remove, date is ISOString
      // if (updates.serviceDate) updates.serviceDate = new Date(updates.serviceDate); //Remove, date is ISOString

      // Parse arrays and objects (ONLY if they exist in req.body)
      if (req.body.languagesSpoken) updates.languagesSpoken = JSON.parse(req.body.languagesSpoken);
      if (req.body.education) updates.education = JSON.parse(req.body.education);
      if (req.body.familyMembers) updates.familyMembers = JSON.parse(req.body.familyMembers);
      if (req.body.causeOfDeath) updates.causeOfDeath = JSON.parse(req.body.causeOfDeath);

      // Parse booleans (ONLY if they exist in req.body)
      if (req.body.birthdayReminder !== undefined) updates.birthdayReminder = req.body.birthdayReminder === 'true';
      if (req.body.militaryService !== undefined) updates.militaryService = req.body.militaryService === 'true';
      if (req.body.enableDigitalFlowers !== undefined) updates.enableDigitalFlowers = req.body.enableDigitalFlowers === 'true';
      if (req.body.isPublic !== undefined) updates.isPublic = req.body.isPublic === 'true';

      // Handle existing media that should be kept
      let existingMedia = [];
      if (req.body.existingMedia) {
          try {
              existingMedia = JSON.parse(req.body.existingMedia);
          } catch (err) {
              console.error('Error parsing existingMedia:', err);
          }
      }

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
            
            // Combine existing media with new media
            updates.additionalMedia = [...existingMedia, ...newMedia];
        } else {
            // If no new media is uploaded, just use the existing media
            updates.additionalMedia = existingMedia;
        }

        console.log('Final updates:', updates);

        const updatedMemorial = await Memorial.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

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

// // Remove media from a memorial
// exports.removeMedia = async (req, res) => {
//   try {
//     const { id, mediaId } = req.params;
//     const memorial = await Memorial.findById(id);

//     if (!memorial) {
//       return res.status(404).json({ message: 'Memorial not found' });
//     }

//     // Check if user is the creator
//     if (req.user.userId.toString() !== memorial.createdBy.toString() && req.user.role !== 'admin') {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     memorial.additionalMedia = memorial.additionalMedia.filter(
//       media => media._id.toString() !== mediaId
//     );

//     await memorial.save();
//     res.json(memorial);
//   } catch (error) {
//     console.error('Remove media error:', error);
//     res.status(400).json({ message: error.message });
//   }
// };

// Add media for a memorial
exports.addMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const memorial = await Memorial.findById(id);

    if (!memorial) {
      return res.status(404).json({ message: 'Memorial not found' });
    }

    if (!req.files?.additionalMedia) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Check if user is the creator
    if (req.user.userId.toString() !== memorial.createdBy.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const mediaPromises = req.files.additionalMedia.map(async (file) => {
      const result = await uploadCloudinary(file.path);
      return {
        type: file.mimetype.startsWith('image/') ? 'photo' : 'video',
        url: result.secure_url
      };
    });
    const newMedia = await Promise.all(mediaPromises);
    memorial.additionalMedia = [...(memorial.additionalMedia || []), ...newMedia];
    await memorial.save();
    res.status(200).json(memorial);
  } catch (error) {
    console.error('Add media error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get user's memorials
exports.getMyMemorials = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {
      createdBy: req.user.userId
    };

    // Apply search filter
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
    console.error('Get my memorials error:', error);
    res.status(500).json({ message: error.message });
  }
};

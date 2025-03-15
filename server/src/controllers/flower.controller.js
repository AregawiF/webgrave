// send flower tribute

const sendFlowerTribute = async (req, res) => {
  try {
    const { memorialId, amount } = req.body;
    const tribute = await Flower.create({
      memorial: memorialId,
      sender: req.user._id,
      amount
    });
    res.status(201).json(tribute);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get tributes for a memorial
const getMemorialTributes = async (req, res) => {
  try {
    const { memorialId } = req.params;
    const tributes = await Flower.find({ memorial: memorialId });
    res.status(200).json(tributes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendFlowerTribute,
  getMemorialTributes
};


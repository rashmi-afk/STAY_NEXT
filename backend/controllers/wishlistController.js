const Wishlist = require("../models/Wishlist");
const Property = require("../models/Property");

// Add property to wishlist
const addToWishlist = async (req, res) => {
  try {
    const propertyId = req.params.propertyId || req.body.propertyId;

    if (!propertyId) {
      return res.status(400).json({
        message: "Property ID is required",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        properties: [propertyId],
      });

      return res.status(201).json({
        message: "Property added to wishlist",
        properties: wishlist.properties,
      });
    }

    const alreadyExists = wishlist.properties.some(
      (item) => item.toString() === propertyId
    );

    if (alreadyExists) {
      return res.status(400).json({
        message: "Property already in wishlist",
        properties: wishlist.properties,
      });
    }

    wishlist.properties.push(propertyId);
    await wishlist.save();

    res.status(200).json({
      message: "Property added to wishlist",
      properties: wishlist.properties,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get my wishlist
const getMyWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: "properties",
      populate: {
        path: "host",
        select: "name email",
      },
    });

    if (!wishlist) {
      return res.status(200).json([]);
    }

    res.status(200).json(wishlist.properties);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Remove property from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found",
      });
    }

    wishlist.properties = wishlist.properties.filter(
      (item) => item.toString() !== propertyId
    );

    await wishlist.save();

    res.status(200).json({
      message: "Property removed from wishlist",
      properties: wishlist.properties,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
};

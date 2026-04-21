const Property = require("../models/Property");

// Add property
const addProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      pricePerNight,
      images,
      amenities,
      maxGuests,
    } = req.body;

    if (!title || !description || !location || !pricePerNight) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    const property = await Property.create({
      title,
      description,
      location,
      pricePerNight,
      images: images || [],
      amenities: amenities || [],
      maxGuests: maxGuests || 1,
      host: req.user._id,
    });

    res.status(201).json({
      message: "Property added successfully",
      property,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get all properties with search + filters
const getAllProperties = async (req, res) => {
  try {
    const { location, minPrice, maxPrice, guests } = req.query;

    let query = {};

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    if (guests) {
      query.maxGuests = { $gte: Number(guests) };
    }

    const properties = await Property.find(query).populate("host", "name email");

    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get single property
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "host",
      "name email"
    );

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update property
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    if (property.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this property",
      });
    }

    const {
      title,
      description,
      location,
      pricePerNight,
      images,
      amenities,
      maxGuests,
    } = req.body;

    property.title = title || property.title;
    property.description = description || property.description;
    property.location = location || property.location;
    property.pricePerNight = pricePerNight || property.pricePerNight;
    property.images = images || property.images;
    property.amenities = amenities || property.amenities;
    property.maxGuests = maxGuests || property.maxGuests;

    const updatedProperty = await property.save();

    res.status(200).json({
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete property
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    if (property.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this property",
      });
    }

    await property.deleteOne();

    res.status(200).json({
      message: "Property deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get logged-in host properties
const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ host: req.user._id }).populate(
      "host",
      "name email"
    );

    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getMyProperties,
};
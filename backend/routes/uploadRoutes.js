const express = require("express");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/", (req, res) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        message: error.message || "Image upload failed",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image file" });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;

    res.json({ url: imageUrl });
  });
});

module.exports = router;

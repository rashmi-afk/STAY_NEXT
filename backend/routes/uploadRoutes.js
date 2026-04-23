const express = require("express");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/", (req, res) => {
  upload.array("images", 6)(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        message: error.message || "Image upload failed",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Please upload at least one image file" });
    }

    const urls = req.files.map(
      (file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
    );

    res.json({ urls, url: urls[0] });
  });
});

module.exports = router;

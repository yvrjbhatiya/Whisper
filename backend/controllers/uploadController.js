const multer = require("multer");
const { Readable } = require("stream");
const { cloudinary, isConfigured } = require("../config/cloudinary");

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const storage = multer.memoryStorage();

exports.upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
}).single("file");

const uploadStream = (buffer, options) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
    if (error) reject(error);
    else resolve(result);
  });
  Readable.from(buffer).pipe(stream);
});

exports.uploadAttachment = async (req, res) => {
  if (!isConfigured()) {
    return res.status(503).json({ error: "File uploads are not configured yet. Add your Cloudinary credentials to the server environment." });
  }
  if (!req.file) return res.status(400).json({ error: "Choose a file to upload." });

  try {
    const isImage = req.file.mimetype.startsWith("image/");
    const isMedia = req.file.mimetype.startsWith("audio/") || req.file.mimetype.startsWith("video/");
    const resourceType = isImage ? "image" : isMedia ? "video" : "raw";
    const result = await uploadStream(req.file.buffer, {
      resource_type: resourceType,
      folder: "whisper-chat",
      use_filename: true,
      unique_filename: true,
      filename_override: req.file.originalname,
    });

    res.status(201).json({
      attachment: {
        url: result.secure_url,
        publicId: result.public_id,
        name: req.file.originalname,
        mimeType: req.file.mimetype || "application/octet-stream",
        resourceType,
        bytes: result.bytes || req.file.size,
        format: result.format,
        width: result.width,
        height: result.height,
        duration: result.duration,
      },
    });
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    res.status(502).json({ error: "The file could not be uploaded. Please try again." });
  }
};

exports.uploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "Files must be 25 MB or smaller." });
  }
  if (error) return res.status(400).json({ error: error.message || "Invalid upload." });
  next();
};

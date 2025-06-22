const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dynamic storage config for case study images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const caseId = req.params.case_id;

      if (!caseId) {
        return cb(new Error('case_id is required in params to determine folder'), null);
      }

      const uploadPath = path.join(__dirname, '..', 'uploads', caseId);

      // Ensure the folder exists
      fs.mkdirSync(uploadPath, { recursive: true });

      cb(null, uploadPath);
    } catch (err) {
      console.error('Storage error (caseimages):', err);
      cb(err, null);
    }
  },

  filename: function (req, file, cb) {
    const ref = req.params.ref || 'image';
    const sanitizedRef = ref.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
    const extension = path.extname(file.originalname);
    const filename = `${sanitizedRef}${extension}`;
    cb(null, filename);
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Export upload middleware
const uploadHomepageImage = multer({
  storage,
  fileFilter,
  limits: { files: 1 }
});

module.exports = uploadHomepageImage;

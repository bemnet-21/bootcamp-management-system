import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

let storage;
let useCloudinary = false;

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  try {
    const { CloudinaryStorage } = await import('multer-storage-cloudinary');
    const cloudinary = (await import('cloudinary')).v2;

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    storage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'bootcamp-resources',
        resource_type: 'auto', 
      },
    });
    useCloudinary = true;
    console.log('Uploads: Cloudinary configured successfully');
  } catch (e) {
    console.error('Cloudinary setup failed, falling back to local disk storage', e);
    useCloudinary = false;
  }
}

if (!useCloudinary) {
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext).replace(/\s+/g, '-');
      cb(null, `${basename}-${Date.now()}${ext}`);
    },
  });
  console.log('Uploads: Using local disk storage');
}

const fileFilter = (req, file, cb) => {
  const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png', '.zip'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${allowedExts.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, 
});

export default upload;
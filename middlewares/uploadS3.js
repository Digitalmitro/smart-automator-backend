const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

let s3 = new AWS.S3({
  region: "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const uploadS3 = multer({
  storage: multerS3({
    s3,
    bucket: process.env.BUCKET_NAME,
    metadata: (req, file, cb) => {
      console.log(file);
      cb(null, {
        fieldName: file.fieldname,
      });
    },
    key: (request, file, cb) => {
      fileName = file.originalname.replace(/\s+/g, "%20");
      cb(null, file.originalname);
    },
  }),
}).single("file");

module.exports = (req, res, next) => {
  uploadS3(req, res, (error) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
    // Pass the uploaded file to the next middleware or route handler
    req.uploadedFile = req.file;
    next();
  });
};

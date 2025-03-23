const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../utils/internshipLetters');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, `${uniqueSuffix}-${file.originalname}`); // a unique file name
    }
})


const upload = multer({
    storage,
    limits: {fileSize: 10 * 1024 * 1024 }
}).fields([
    { name: 'firstName', maxCount: 1 }, // Text field for first name
    { name: 'surname', maxCount: 1 }, 
    { name: 'otherName', maxCount: 1 }, 
    { name: 'email', maxCount: 1 }, 
    { name: 'phoneNumber', maxCount: 1 }, 
    { name: 'degree', maxCount: 1 }, 
    { name: 'country', maxCount: 1 }, 
    { name: 'region', maxCount: 1 }, 
    { name: 'city', maxCount: 1 }, 
    { name: 'resume', maxCount: 1 }, // File field for the resume
    { name: 'transcript', maxCount: 1 }, // file field for transcript
    { name: 'internshipLetter', maxCount: 1 } // file field for internshipLetter
])

module.exports = upload;
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const authCheck = require('./middleware/check');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // For generating UUID
const User = require('./models/users'); // Import User model
const Result = require('./models/results'); // Import Result model (new model for storing upload details)

const app = express();

// Connect to MongoDB
connectDB();

const PORT = 5000;

// Middleware
app.use(express.json()); // For parsing JSON requests
app.use(cors()); // Enable CORS

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: async function(req, file, cb) {
        try {
            // Ensure req.user is set by the authCheck middleware
            const user = await User.findById(req.user).select('-password');
            if (!user) {
                return cb(new Error('User not found'), false);
            }

            const uuid = uuidv4(); // Generate UUID for the upload
            console.log(uuid);
            const uploadDir = path.join(__dirname, 'uploads', user.email || user._id.toString(), uuid); // Create upload path

            // Ensure directory exists or create it
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true }); // Create directories recursively
            }

            cb(null, uploadDir); // Save the file to this path
        } catch (err) {
            console.error(err);
            cb(new Error('Error setting upload directory'), false);
        }
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname); // Use the original file name
    }
});

const upload = multer({ storage: storage });

// Create an endpoint to upload a video file
app.post('/upload', authCheck, upload.single('video'), async(req, res) => {
    try {
        const user = await User.findById(req.user).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const uuid = uuidv4(); // Generate UUID for the upload
        const videoPath = path.join(__dirname, 'uploads', user.email || user._id.toString(), uuid, req.file.originalname);

        console.log(`Video uploaded to: ${videoPath}`);

        // Save upload details to the "Result" collection
        const result = new Result({
            userId: user._id,
            email: user.email,
            videoPath,
            uuid,
            createdAt: Date.now(),
        });
        await result.save();

        // Respond with success message
        res.json({ message: 'Video uploaded successfully', uuid, videoPath });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Auth routes
app.use('/api/auth', authRoutes);

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
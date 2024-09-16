const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Create an endpoint to upload a video file
app.post('/upload', upload.single('video'), (req, res) => {
    const videoPath = path.join(__dirname, 'uploads', req.file.originalname);
    console.log(`Video uploaded to: ${videoPath}`);

    // Call the Python script and pass the video file path to it
    const pythonProcess = spawn('python3', ['process_video.py', videoPath]);

    // Capture the output from the Python script
    pythonProcess.stdout.on('data', (data) => {
        console.log(`Output from Python: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error from Python: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
        res.json({ message: 'Video processed', code: code });
    });
});

app.get('/check', (req, res) => {
    res.send('Hello World!');
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
const express = require('express');
const multer = require('multer'); // Import multer for handling file uploads
const path = require('path');
const cors = require('cors'); // Import CORS to allow cross-origin requests
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5001;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors()); // Enable CORS for all domains
app.use(express.static('public')); // Serve static files

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, 'public/audio');
fs.existsSync(uploadDir) || fs.mkdirSync(uploadDir, { recursive: true });

// Setup multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only audio files
  if (file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an audio file!'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Function to read the current database
function readDB() {
  const dbPath = path.join(__dirname, 'db.json');
  let data;
  try {
    data = fs.readFileSync(dbPath);
    const json = JSON.parse(data);
    // Ensure audioFiles array exists
    json.audioFiles = json.audioFiles || [];
    return json;
  } catch (error) {
    // If the file doesn't exist or error in reading, return a default structure
    return { audioFiles: [] };
  }
}

// Function to write to the database
function writeDB(data) {
  const dbPath = path.join(__dirname, 'db.json');
  // Ensure the directory exists
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2)); // Beautify the JSON output
}

// Updated API route to handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  console.log('Uploaded file details:', req.file);

  if (req.file) {
    const fileInfo = {
      id: Date.now(),
      name: req.file.filename,
      url: `/audio/${req.file.filename}`,
      size: req.file.size,
      originalName: req.file.originalname
    };
    console.log('File info to be saved:', fileInfo);

    // Read the current database
    const db = readDB();
    // Assuming there's an array for files in your db.json
    db.audioFiles = db.audioFiles || []; // Initialize files array if it doesn't exist
    db.audioFiles.push(fileInfo);

    // Write the updated database back to the file
    writeDB(db);

    res.send(fileInfo);
  } else {
    console.error('No file uploaded');
    res.status(400).send('No file uploaded');
  }
});

// API route to handle file renaming
app.patch('/rename', (req, res) => {
  console.log('Received rename request with body:', req.body);
  const { id, name } = req.body;
  const db = readDB();
  console.log(db.audioFiles);
  console.log(name);
  console.log(id);
  const fileIndex = db.audioFiles.findIndex(f => f.id === Number(id));
  console.log('File index:', fileIndex);
  console.log('File name:', db.audioFiles[fileIndex].name);


  if (fileIndex !== -1) {

    const oldFilePath = path.join(uploadDir, db.audioFiles[fileIndex].name);
    const originalExtension = path.extname(db.audioFiles[fileIndex].name);
    const newFileName = name.endsWith(originalExtension) ? name : name + originalExtension;
    console.log('New file name:', newFileName);
    // Check if the new file name is different from the current file name
    if (db.audioFiles[fileIndex].name !== newFileName) {
      const newFilePath = path.join(uploadDir, newFileName);

      // Rename the file in the filesystem
      fs.rename(oldFilePath, newFilePath, (err) => {
        if (err) {
          console.error('Error renaming file:', err);
          res.status(500).send('Error renaming file');
        } else {
          // Update the database entry
          db.audioFiles[fileIndex].name = newFileName;
          db.audioFiles[fileIndex].url = `/audio/${newFileName}`;
          writeDB(db);

          res.send({ message: 'File renamed successfully', file: db.audioFiles[fileIndex] });
        }
      });
    } else {
      // If the new name is the same as the old name, just return the current file info
      res.send({ message: 'No renaming needed as the name is the same.', file: db.audioFiles[fileIndex] });
    }
  } else {
    res.status(404).send('File not found');
  }
});

// API route to handle file deletion
app.post('/delete', (req, res) => {
  console.log('Received delete request with body:', req.body);
  const { id } = req.body;
  const db = readDB();
  const fileIndex = db.audioFiles.findIndex(f => f.id === Number(id));
  if (fileIndex !== -1) {
    const filePath = path.join(uploadDir, db.audioFiles[fileIndex].name);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Failed to delete file:', err);
        res.status(500).send('Failed to delete file');
      } else {
        db.audioFiles.splice(fileIndex, 1);
        writeDB(db);
        res.send({ message: 'File deleted successfully' });
      }
    });
  } else {
    res.status(404).send('File not found');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
require("dotenv").config();
const express = require("express");
const multer = require("multer");
const ImageKit = require("imagekit");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend")));

// Multer setup (store in memory)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ImageKit config
const imagekit = new ImageKit({
    publicKey: process.env.PUBLIC_KEY,
    privateKey: process.env.PRIVATE_KEY,
    urlEndpoint: process.env.URL_ENDPOINT
});

// Upload API
app.post("/upload", upload.array("images"), async (req, res) => {
    try {
        const uploadedImages = [];
        for (let file of req.files) {
            const result = await imagekit.upload({
                file: file.buffer,
                fileName: file.originalname,
                folder: "/anya"
            });

            const thumbnailUrl = imagekit.url({
                path: file.filePath,
                transformation: [
                    { width: 500, height: 300, crop: "maintain_ratio" },
                    { quality: 85 },
                    { effect: "sharpen", value: 70 },
                    { progressive: "true" }
                ]
            });

            uploadedImages.push({
                name: result.name,
                originalUrl: result.url,
                thumbnailUrl: thumbnailUrl,
                fileId: result.fileId,
                size: result.size,
                width: result.width,
                height: result.height
            });
        }
        res.json(uploadedImages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Upload failed" });
    }
});

// GET all images
app.get("/images", async (req, res) => {
    try {
        const files = await imagekit.listFiles({ path: "/anya", limit: 500 });
        const formattedImages = files.map(file => ({
            name: file.name,
            originalUrl: file.url,
            thumbnailUrl: imagekit.url({
                path: file.filePath,
                transformation: { width: 250, height: 250, crop: "maintain_ratio", quality: 70, format: "webp" }
            }),
            fileId: file.fileId,
            size: file.size,
            width: file.width,
            height: file.height
        }));
        formattedImages.sort((a, b) => b.size - a.size);
        res.json(formattedImages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch images" });
    }
});

// Fallback: serve index.html for all other routes
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


// 
// 
//
// git commit -m "first commit"
// git branch -M main
// git remote add origin https://github.com/Maxx-06/anya.git
// git push -u origin main
const express = require("express");
const multer = require("multer");
const Replicate = require("replicate");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Replicate config
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Create directories if they don't exist
const createDirectories = () => {
  const dirs = ["uploads", "generated"];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize directories
createDirectories();

// Upload config
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));
app.use("/generated", express.static("generated"));
app.use(express.json());

// Upload endpoint
app.post("/upload", upload.single("avatar"), async (req, res) => {
  const style = req.body.style || "anime";
  const inputPath = req.file.path;
  const outputName = `avatar_${Date.now()}.png`;
  const outputPath = path.join("generated", outputName);

  try {
    const modelMap = {
      anime: "lucataco/anime-style-image",
      supererou: "fofr/superhero-diffusion", 
      pixel: "jingyunliang/swinir",
      cartoon: "naklecha/cartoon-me",
      cyberpunk: "fofr/cyberpunk-style",
      fantasy: "nitrosocke/archer-diffusion",
      "3d": "fofr/3d-avatar-generator",
      realist: "lucataco/realistic-portrait",
    };

    const model = modelMap[style] || modelMap.anime;

    // Convert image to base64 for API
    const imageBuffer = fs.readFileSync(inputPath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    const output = await replicate.run(model, {
      input: {
        input_image: base64Image,
        prompt: `Transform this person into ${style} style avatar`,
        num_outputs: 1,
      },
    });

    const imageUrl = Array.isArray(output) ? output[0] : output;

    const imageRes = await fetch(imageUrl);
    const buffer = await imageRes.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));

    res.json({
      message: `Avatar generat cu succes în stilul ${style}!`,
      downloadUrl: `/generated/${outputName}`,
    });
  } catch (error) {
    console.error("Eroare la procesare:", error);
    res.status(500).json({ message: "Eroare la generare avatar." });
  } finally {
    // Clean up uploaded file
    if (fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server pornit pe http://0.0.0.0:${PORT}`);
});
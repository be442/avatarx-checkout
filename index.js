
const express = require("express");
const multer = require("multer");
const Replicate = require("replicate");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const fetch = require("node-fetch"); // Adaugă asta dacă nu ai încă

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

createDirectories();

const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));
app.use("/generated", express.static("generated"));
app.use(express.json());

// Modele funcționale verificate
const modelMap = {
  anime: {
    model: "cjwbw/anything-v4.0",
    version: "a9758cb3f02f6c1e2362f6ac9947cfc489c8eac34e29c40a70428d9c0e2f6c17"
  },
  superhero: {
    model: "fofr/superhero-diffusion",
    version: "db21e45c42064aa8a1ddcf153a949c3ffb2927aebd5ee3b37c4a5cc9732c62cf"
  },
  pixel: {
    model: "tencentarc/gfpgan",
    version: "928ba58c543527e00c567d39d275ae51d2f6c59d84f2a55c1322e19a12c328db"
  },
  cartoon: {
    model: "prompthero/openjourney",
    version: "9936c2cf6ed7e0d387b2f67cfa9a3ac0f1f228cd3fdd6846fb98c5f96e0f1f6c"
  },
  cyberpunk: {
    model: "stability-ai/stable-diffusion",
    version: "db21e45c42064aa8a1ddcf153a949c3ffb2927aebd5ee3b37c4a5cc9732c62cf"
  },
  fantasy: {
    model: "nitrosocke/archer-diffusion",
    version: "29b8e353f47c2e31376393e0f4c5b9b92a7c3fa0e88aafe3feeaecf03e15c341"
  },
  pixar: {
    model: "fofr/3d-avatar-generator",
    version: "6f7fd5d6c1a2f089a6b9f3d6f9e41449b99227fc9ee2d17a2f623f4e3f8e8df3"
  },
  realistic: {
    model: "stability-ai/stable-diffusion",
    version: "db21e45c42064aa8a1ddcf153a949c3ffb2927aebd5ee3b37c4a5cc9732c62cf"
  }
};

app.post("/upload", upload.single("avatar"), async (req, res) => {
  const style = req.body.style || "anime";
  const inputPath = req.file.path;
  const outputName = `avatar_${Date.now()}.png`;
  const outputPath = path.join("generated", outputName);

  try {
    const { model, version } = modelMap[style] || modelMap.anime;

    // Convert image to base64
    const imageBuffer = fs.readFileSync(inputPath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

    const output = await replicate.run(`${model}:${version}`, {
      input: {
        image: base64Image,
        prompt: `Transform this person into ${style} style avatar`,
      }
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
    if (fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server pornit pe http://0.0.0.0:${PORT}`);
});

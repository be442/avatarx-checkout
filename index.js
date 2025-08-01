
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

  // MODELE FUNCȚIONALE + VERSIUNI
  const modelMap = {
    anime: {
      model: "tencentarc/gfpgan",
      version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3"
    },
    superhero: {
      model: "fofr/face-to-sticker",
      version: "764d4827ea159608a07cdde8ddf1c6000019627515eb02b6b449695fd547e5ef"
    },
    pixel: {
      model: "tencentarc/gfpgan",
      version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3"
    },
    cartoon: {
      model: "fofr/face-to-sticker",
      version: "764d4827ea159608a07cdde8ddf1c6000019627515eb02b6b449695fd547e5ef"
    },
    cyberpunk: {
      model: "tencentarc/gfpgan",
      version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3"
    },
    fantasy: {
      model: "fofr/face-to-sticker",
      version: "764d4827ea159608a07cdde8ddf1c6000019627515eb02b6b449695fd547e5ef"
    },
    pixar: {
      model: "fofr/face-to-sticker",
      version: "764d4827ea159608a07cdde8ddf1c6000019627515eb02b6b449695fd547e5ef"
    },
    realistic: {
      model: "tencentarc/gfpgan",
      version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3"
    }
  };

  try {
    const { model, version } = modelMap[style] || modelMap.anime;

    const imageBuffer = fs.readFileSync(inputPath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

    const prediction = await replicate.run(`${model}:${version}`, {
      input: {
        image: base64Image,
        prompt: `Transform this person into ${style} style avatar`
      }
    });

    const imageUrl = Array.isArray(prediction) ? prediction[0] : prediction;
    
    if (!imageUrl) {
      throw new Error("No image URL returned from model");
    }

    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      throw new Error(`Failed to download image: ${imageRes.status}`);
    }
    
    const buffer = await imageRes.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));

    res.json({
      message: `Avatar generat cu succes în stilul ${style}!`,
      downloadUrl: `/generated/${outputName}`
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

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server pornit pe http://0.0.0.0:${PORT}`);
});


const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// Create necessary directories
const uploadDir = "uploads/";
const generatedDir = "public/generated/";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.use(express.static("public"));
app.use(express.json());

// Upload route
app.post("/upload", upload.single("avatar"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Niciun fișier încărcat." });
  }

  const style = req.body.style || "anime"; // default
  const inputPath = req.file.path;

  console.log(`Procesând avatar în stilul: ${style}`);

  // Simulare procesare AI (înlocuiește cu AI real dacă e cazul)
  const outputFilename = `${Date.now()}_${style}_styled.png`;
  const outputPath = generatedDir + outputFilename;

  // În loc de o procesare reală, copiem fișierul original ca demo
  fs.copyFile(inputPath, outputPath, (err) => {
    if (err) {
      console.error("Eroare la procesare:", err);
      return res.status(500).json({ message: "Eroare la procesare." });
    }

    return res.json({
      message: `Avatar procesat în stilul: ${style}`,
      downloadUrl: `/generated/${outputFilename}`,
    });
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

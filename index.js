const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware static pentru folderul "public"
app.use(express.static("public"));

// Middleware pentru a servi fișiere din "uploads"
app.use("/uploads", express.static("uploads"));

// Configurare Multer (salvează în folderul "uploads")
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath); // creează folderul dacă nu există
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = "avatar-" + Date.now() + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });

// Ruta POST pentru încărcare imagine
app.post("/upload", upload.single("avatar"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Niciun fișier încărcat." });
  }

  const downloadUrl = `/uploads/${req.file.filename}`;
  res.json({
    message: "Imaginea a fost procesată cu succes!",
    downloadUrl: downloadUrl,
  });
});

// Pornim serverul
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
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
app.post("/upload", upload.single("avatar"), async (req, res) => {
  const file = req.file;
  const style = req.body.style; // nou

  if (!file || !style) {
    return res.status(400).json({ message: "Imaginea și stilul sunt obligatorii." });
  }

  // Exemplu: logăm stilul ales (în viitor va fi folosit în procesarea AI)
  console.log("Stil ales:", style);

  // Creăm folderul processed dacă nu există
  const processedDir = "public/processed";
  if (!fs.existsSync(processedDir)) {
    fs.mkdirSync(processedDir, { recursive: true });
  }

  // Simulare: aici vei adăuga integrarea reală AI
  const processedPath = `public/processed/${Date.now()}-${style}-${file.originalname}`;
  fs.copyFileSync(file.path, processedPath); // temporar copiem imaginea

  const downloadUrl = `/processed/${processedPath.split("/").pop()}`;
  res.json({ message: `Avatar în stilul "${style}" procesat cu succes!`, downloadUrl });
});

// Pornim serverul
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
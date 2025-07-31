
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

const UPLOADS_DIR = path.join(__dirname, "uploads");
const PROCESSED_DIR = path.join(__dirname, "processed");

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(PROCESSED_DIR)) fs.mkdirSync(PROCESSED_DIR);

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.use(express.static("public")); // pentru imagini, CSS etc. dacă adaugi mai târziu

app.post("/upload", upload.single("avatar"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ message: "Nicio imagine încărcată" });

  // ✅ Simulare procesare AI
  const processedPath = path.join(PROCESSED_DIR, "ai_" + file.filename);
  fs.copyFileSync(file.path, processedPath); // în loc de AI reală

  // ✅ Simulăm verificare cont premium (aici poți conecta Coinbase în viitor)
  const isPremium = true;

  if (isPremium) {
    const downloadUrl = `/processed/ai_${file.filename}`;
    return res.json({ message: "Imagine procesată cu succes!", downloadUrl });
  } else {
    return res.json({ message: "Plătește pentru a descărca imaginea procesată!" });
  }
});

app.use("/processed", express.static(PROCESSED_DIR));

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>AvatarX - AI Avatar Generator</title>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          font-family: 'Poppins', sans-serif;
          background: linear-gradient(135deg, #1f1c2c, #928dab);
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
        }
        h1 {
          font-size: 3rem;
          margin-bottom: 10px;
        }
        p {
          font-size: 1.2rem;
          max-width: 600px;
          text-align: center;
          margin-bottom: 30px;
        }
        .button {
          padding: 14px 32px;
          background-color: #1652f0;
          color: white;
          font-size: 1.1rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.3s;
        }
        .button:hover {
          background-color: #0f3cc9;
        }
        .footer {
          margin-top: 60px;
          font-size: 0.9rem;
          opacity: 0.8;
        }
      </style>
    </head>
    <body>
      <h1>AvatarX</h1>
      <p>Generează avatare AI unice pe baza pozei tale. Urcă, procesează și obține rezultate premium în câteva secunde.</p>
      <a class="button" href="https://commerce.coinbase.com/checkout/b0883a25-dc93-4fe0-a447-e21d674f2a29" target="_blank">
        Plătește cu Crypto - 10€
      </a>

      <div class="footer">
        © ${new Date().getFullYear()} AvatarX. All rights reserved.
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ UI live on http://0.0.0.0:${PORT}`);
});

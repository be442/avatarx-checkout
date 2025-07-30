
const express = require("express");
const app = express();

const PORT = process.env.PORT || 5000;

// Servim static HTML cu buton către Coinbase
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><title>Crypto Checkout</title></head>
      <body style="font-family:sans-serif;text-align:center;margin-top:100px;">
        <h1>AvatarX Premium</h1>
        <p>Plătește cu crypto pentru acces premium</p>
        <a href="https://commerce.coinbase.com/checkout/b0883a25-dc93-4fe0-a447-e21d674f2a29" target="_blank">
          <button style="padding:12px 24px;font-size:18px;background:#1652f0;color:white;border:none;border-radius:6px;">
            Plătește cu Crypto
          </button>
        </a>
      </body>
    </html>
  `);
});

// Pagina de succes
app.get("/success", (req, res) => {
  res.send("<h1>✅ Plata a fost procesată cu succes!</h1>");
});

// Pagina de anulare
app.get("/cancel", (req, res) => {
  res.send("<h1>❌ Plata a fost anulată.</h1>");
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});


const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Root route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Paddle Checkout</title></head>
      <body>
        <h1>Paddle Checkout Integration</h1>
        <button onclick="createCheckout()">Create Checkout Session</button>
        <div id="result"></div>
        
        <script>
          async function createCheckout() {
            try {
              const response = await fetch('/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              });
              const data = await response.json();
              document.getElementById('result').innerHTML = 
                '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
              document.getElementById('result').innerHTML = 
                '<p style="color: red;">Error: ' + error.message + '</p>';
            }
          }
        </script>
      </body>
    </html>
  `);
});

// Create Paddle checkout session
app.post('/create-checkout', async (req, res) => {
  try {
    const paddleApiKey = process.env.PADDLE_API_KEY;
    const paddlePriceId = process.env.PADDLE_PRICE_ID;

    if (!paddleApiKey || !paddlePriceId) {
      return res.status(400).json({
        error: 'Missing required environment variables: PADDLE_API_KEY and/or PADDLE_PRICE_ID'
      });
    }

    const checkoutData = {
      items: [
        {
          price_id: paddlePriceId,
          quantity: 1
        }
      ],
      customer_email: req.body.customer_email || 'customer@example.com',
      success_url: `${req.protocol}://${req.get('host')}/success`
    };

    const response = await axios.post(
      'https://sandbox-api.paddle.com/checkout/sessions',
      checkoutData,
      {
        headers: {
          'Authorization': `Bearer ${paddleApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ url: response.data.data.url });

  } catch (error) {
    console.error('Paddle API Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to create checkout session',
      details: error.response?.data || error.message
    });
  }
});

// Success page
app.get('/success', (req, res) => {
  res.send(`
    <html>
      <head><title>Payment Success</title></head>
      <body>
        <h1>Payment Successful!</h1>
        <p>Thank you for your purchase.</p>
        <a href="/">Back to Home</a>
      </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log('Make sure to set PADDLE_API_KEY and PADDLE_PRICE_ID in your .env file');
});

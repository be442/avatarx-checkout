
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

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
      ]
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log('Make sure to set PADDLE_API_KEY and PADDLE_PRICE_ID in your .env file');
});

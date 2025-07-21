const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/create-ticket', async (req, res) => {
  const { sender, message } = req.body;

  if (!sender || !message) {
    return res.status(400).json({ error: 'Missing sender or message' });
  }

  try {
    const response = await axios.post(
      'https://api.hubapi.com/crm/v3/objects/tickets',
      {
        properties: {
          subject: `Instagram DM from ${sender}`,
          content: message,
          hs_pipeline: "0",         // default pipeline
          hs_pipeline_stage: "1"    // default stage
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_PRIVATE_APP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.status(200).json({
      message: 'Ticket created successfully',
      ticketId: response.data.id
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({
      message: 'Failed to create ticket',
      error: err.response?.data || err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

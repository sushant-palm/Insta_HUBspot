require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const HUBSPOT_URL = 'https://api.hubapi.com/crm/v3/objects/tickets';

app.post('/webhook', async (req, res) => {
  try {
    const messageText = req.body.message || "No message provided";
    const senderId = req.body.sender_id || "Unknown user";

    const ticketData = {
      properties: {
        subject: `Instagram DM from ${senderId}`,
        content: messageText,
        hs_pipeline: "0",
        hs_pipeline_stage: "1"
      }
    };

    const response = await axios.post(HUBSPOT_URL, ticketData, {
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Ticket created with ID:', response.data.id);
    res.status(200).send({ success: true, ticketId: response.data.id });

  } catch (error) {
    console.error('❌ Error creating ticket:', error.response?.data || error.message);
    res.status(500).send({ success: false, error: error.response?.data || error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

const http = require('http');
const axios = require('axios');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/create-ticket') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { sender, message } = data;

        if (!sender || !message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Missing sender or message' }));
        }

        console.log("Using token:", process.env.HUBSPOT_PRIVATE_APP_TOKEN);

        const hubspotResponse = await axios.post(
          'https://api.hubapi.com/crm/v3/objects/tickets',
          {
            properties: {
              subject: `Instagram DM from ${sender}`,
              content: message,
              hs_pipeline: "0",
              hs_pipeline_stage: "1"
            }
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.HUBSPOT_PRIVATE_APP_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'Ticket created successfully',
          ticketId: hubspotResponse.data.id
        }));
      } catch (err) {
        console.error(err.response?.data || err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'Failed to create ticket',
          error: err.response?.data || err.message
        }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

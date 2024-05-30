import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import { v4 as uuidv4 } from 'uuid';
import net from 'net';
import cors from 'cors';
import config from '../config/config.json' assert { type: 'json' };

const app = express();
const PORT = 3000; // Port for the HTTP proxy server
const TCP_SERVER_PORT = config.server.port;
const TCP_SERVER_HOST = config.server.host;
const maxRetries = config.server.maxRetries;
const retryDelay = config.server.retryDelay;

// Middleware to parse JSON requests
app.use(bodyParser.json());

app.use(cors({
  origin: 'http://localhost:3001', // Replace with your frontend URL
  credentials: true, // If you need to include cookies in requests
}));

// Session middleware
app.use(session({
  genid: () => uuidv4(), // Generate a unique session ID
  secret: 'your-secret-key', // Replace with your own secret
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 60 * 1000 }, // Session expires after 30 minutes of inactivity
}));

// Object to store TCP connections and response handlers
const userConnections = {};

const handleTcpConnection = async (sessionId) => {
    const tcpClient = new net.Socket();
    userConnections[sessionId].client = tcpClient;
    userConnections[sessionId].lastActive = Date.now();

    tcpClient.connect(TCP_SERVER_PORT, TCP_SERVER_HOST, () => {
      console.log(`Connected to TCP server with session ID: ${sessionId}`);
      userConnections[sessionId].retryCount = 0; // Reset retry count
    });

    tcpClient.on('data', (data) => {
      let dataBuffer = userConnections[sessionId].dataBuffer;
      dataBuffer += data.toString();
      console.log('Received data:', dataBuffer);
      const adviser_success = '{"type":"adviser_login","status":200}';
      const i = dataBuffer.indexOf(adviser_success);
      if (i !== -1) 
        dataBuffer = dataBuffer.slice(i + adviser_success.length);
      
      userConnections[sessionId].dataBuffer = dataBuffer;
      let jsonResponse;
        try {
          jsonResponse = JSON.parse(dataBuffer);
          console.log('Received:', jsonResponse);
          userConnections[sessionId].dataBuffer = ''; // Clear the buffer

          if(jsonResponse.status !== 200) 
            jsonResponse.success = false;
          else
            jsonResponse.success = true;

          } catch (error) {
            console.error('Error parsing JSON in transfer!', error);
            return;
          }
      const { type } = jsonResponse;
      
      // Retrieve the response handler for the request type
      const responseHandler = userConnections[sessionId].handlers[type];
      if (responseHandler) {
        responseHandler(jsonResponse);
        delete userConnections[sessionId].handlers[type]; // Clean up handler
      }
    });

    tcpClient.on('error', (err) => {
      console.error('TCP Connection Error: ', err);
      tcpClient.destroy();
      userConnections[sessionId].client = null;
      if(userConnections[sessionId].retryCount < maxRetries) {
        console.log(`Retry ${userConnections[sessionId].retryCount}/
        ${maxRetries} in ${retryDelay/1000} seconds...`);
        setTimeout(() => {
          userConnections[sessionId].retryCount++;
          handleTcpConnection(sessionId);
        }, retryDelay);
      } else {
        console.log('Max retries reached. Closing connection...');
        for (const handlerKey in userConnections[sessionId].handlers) {
          const handler = userConnections[sessionId].handlers[handlerKey];
          if (handler) {
            handler({ success: false, message: 'TCP connection failed.' });
          }
        }
        delete userConnections[sessionId];
      }
    });

    tcpClient.on('close', () => {
      console.log(`TCP connection closed for session ID: ${sessionId}`);
      for (const handlerKey in userConnections[sessionId].handlers) {
        const handler = userConnections[sessionId].handlers[handlerKey];
        if (handler) {
          handler({ success: false, message: 'TCP connection closed unexpectedly.' });
        }
      }
      delete userConnections[sessionId];
    });
}

const handleTcpRequest = async (sessionId, requestBody, requestType, res) => {
  if( !userConnections[sessionId])
    userConnections[sessionId] = {
      client: null,
      dataBuffer: '',
      retryCount: 0,
      handlers: {},
      lastActive: Date.now(), // Track the last active time
    };

  if (!userConnections[sessionId].client ||
     userConnections[sessionId].client.destroyed)
    await handleTcpConnection(sessionId);

  const tcpClient = userConnections[sessionId].client;
  userConnections[sessionId].handlers[requestType] = (response) => {
    res.send(response);
  };

  userConnections[sessionId].lastActive = Date.now();
  tcpClient.write(JSON.stringify(requestBody));
};

app.post('/api/login', (req, res) => {
  const sessionId = req.sessionID;
  const requestBody = req.body;
  const requestType = requestBody.type; // Use request type as the identifier

  handleTcpRequest(sessionId, requestBody, requestType, res);
});

app.post('/api/register', (req, res) => {
  const sessionId = req.sessionID;
  const requestBody = req.body;
  const requestType = requestBody.type; // Use request type as the identifier

  handleTcpRequest(sessionId, requestBody, requestType, res);
});

// Cleanup inactive sessions
setInterval(() => {
  const now = Date.now();
  const timeout = 30 * 60 * 1000; // 30 minutes

  for (const sessionId in userConnections) {
    if (now - userConnections[sessionId].lastActive > timeout) {
      console.log(`Cleaning up inactive session ID: ${sessionId}`);
      userConnections[sessionId].client.destroy();
      delete userConnections[sessionId];
    }
  }
}, 60 * 1000); // Check every minute

app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});

// Function to gracefully shut down the server
const gracefulShutdown = () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  
  // Close all TCP connections
  for (const sessionId in userConnections) {
    userConnections[sessionId].client.destroy();
    delete userConnections[sessionId];
  }
  
  // Close the Express server
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });

  // Forcefully shut down the server after a timeout if it doesn't close gracefully
  setTimeout(() => {
    console.error('Could not close all connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for SIGINT signal (Ctrl+C)
process.on('SIGINT', gracefulShutdown);
import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import { v4 as uuidv4 } from 'uuid';
import net from 'net';
import cors from 'cors';
import config from './config/config.json' assert { type: 'json' };

// using express architecture 
const app = express();
const PORT = config.proxy.port;
const TCP_SERVER_PORT = config.server.port;
const TCP_SERVER_HOST = config.server.host;
const maxRetries = config.server.maxRetries;
const retryDelay = config.server.retryDelay;

// Middleware to parse JSON requests
app.use(bodyParser.json());

app.use(cors({
  origin: config.client.url,
  credentials: true,
}));

// Session middleware
app.use(session({
  genid: () => uuidv4(), // Generate a unique session ID
  secret: 'gBridgeProxyKey',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 30 * 60 * 1000, // Session expires after 30 minutes of inactivity
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
  },
}));

// Object to store TCP connections and response handlers
const userConnections = {};

// create a tcp connection
const handleTcpConnection = async (sessionId) => {
  const tcpClient = new net.Socket();
  userConnections[sessionId].client = tcpClient;
  userConnections[sessionId].lastActive = Date.now();

  tcpClient.connect(TCP_SERVER_PORT, TCP_SERVER_HOST, () => {
    console.log(`Connected to TCP server with session ID: ${sessionId}`);
    userConnections[sessionId].retryCount = 0; // Reset retry count
  });

  tcpClient.on('data', (data) => {
    // Append the received data to the buffer
    let dataBuffer = userConnections[sessionId].dataBuffer;
    dataBuffer += data.toString();
    console.log('Received data:', dataBuffer);
    userConnections[sessionId].dataBuffer = dataBuffer;

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(dataBuffer);
      console.log('Received:', jsonResponse);
      userConnections[sessionId].dataBuffer = '';

      if (jsonResponse.status !== 200)
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
      delete userConnections[sessionId].handlers[type];
    }
  });

  // reconnect if connection is lost
  tcpClient.on('error', (err) => {
    console.error('TCP Connection Error: ', err);
    tcpClient.destroy();
    userConnections[sessionId].client = null;
    if (userConnections[sessionId].retryCount < maxRetries) {
      console.log(`Retry ${userConnections[sessionId].retryCount}/
        ${maxRetries} in ${retryDelay / 1000} seconds...`);
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

  // close the connection and remove the handler
  tcpClient.on('close', () => {
    console.log(`TCP connection closed for session ID: ${sessionId}`);
    if (userConnections[sessionId] && userConnections[sessionId].handler)
      for (const handlerKey in userConnections[sessionId].handlers) {
        const handler = userConnections[sessionId].handlers[handlerKey];
        if (handler) {
          handler({ success: false, message: 'TCP connection closed unexpectedly.' });
        }
      }
    delete userConnections[sessionId];
  });
}

// handle the tcp request
const handleTcpRequest = async (sessionId, requestBody, requestType, res) => {
  if (!userConnections[sessionId])
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

// handle the common request
app.post('/api/common', (req, res) => {
  const sessionId = req.sessionID;
  const requestBody = req.body;
  const requestType = requestBody.type; // Use request type as the identifier
  console.log(`Received request for session ID: ${sessionId} with body: ${JSON.stringify(requestBody)}`);
  handleTcpRequest(sessionId, requestBody, requestType, res);
});

// handle the logout request, delete session and cookie
app.post('/api/logout', (req, res) => {
  const sessionId = req.sessionID;
  if (userConnections[sessionId] && userConnections[sessionId].client)
    userConnections[sessionId].client.destroy();

  req.session.destroy(err => {
    if (err) {
      return res.status(500).send({ success: false, message: 'Logout failed' });
    }
    res.clearCookie('connect.sid', { path: '/' });
    return res.send({ success: true, message: 'Logged out successfully' });
  });
});

// Cleanup inactive sessions
setInterval(() => {
  const now = Date.now();
  const timeout = 30 * 60 * 1000; // 30 minutes

  for (const sessionId in userConnections) {
    console.log(`Checking session ID: ${sessionId}`, now - userConnections[sessionId].lastActive);
    if (now - userConnections[sessionId].lastActive > timeout) {
      console.log(`Cleaning up inactive session ID: ${sessionId}`);
      userConnections[sessionId].client.destroy();
      delete userConnections[sessionId];
    }
  }
}, 60 * 1000); // Check every minute

const server = app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});

// gracefully shut down the server
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
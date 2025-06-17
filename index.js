const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const {createTables}=require("./table")
const userRoute = require('./routers/user');
const contactRoute = require('./routers/contact');
const authRoute = require('./routers/auth');
const https = require('https');
const http = require('http');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/users', authorization, userRoute);
app.use('/contacts', contactRoute);
app.use('/auth', authRoute);






// Start server after creating tables
const PORT = 3000;

// SSL certificate paths
// const options = {
//   key: fs.readFileSync('/etc/letsencrypt/live/info.catchcraft.shop/privkey.pem'),
//   cert: fs.readFileSync('/etc/letsencrypt/live/info.catchcraft.shop/fullchain.pem')
// };


const httpPort = process.env.HTTP_PORT || 3000; // HTTP port
// const httpsPort = process.env.HTTPS_PORT || 3443;

// Create HTTP server
const httpServer = http.createServer(app);

// Start HTTP server
httpServer.listen(httpPort, () => {
  console.log(`HTTP Server is running on port ${httpPort}`);
});


// //Start HTTPS server
// https.createServer(options, app).listen(httpsPort, () => {
//   console.log(`Backend running on HTTPS port ${httpsPort}`);
// });

createTables();


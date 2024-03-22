const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const http = require("http");
const cors = require("cors");
require("dotenv").config();

const app = express();

const {initialize} = require("./initialization/serverinitialize")

const corsConfig = {
    origin: ["http://127.0.0.1:51264", "http://127.0.0.1:51264/", "https://creaturesmashwebsite.onrender.com","https://creaturesmashwebsite.onrender.com/", "https://creaturesmashlandingwebsite.onrender.com", "https://creaturesmashlandingwebsite.onrender.com/", "https://starlit-brigadeiros-1594b7.netlify.app/", "https://starlit-brigadeiros-1594b7.netlify.app"],
    // origin: ["http://localhost:3000/", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"], // List only` available methods
    credentials: true, // Must be set to true
    allowedHeaders: ["Origin", "Content-Type", "X-Requested-With", "Accept", "Authorization"],
    credentials: true, // Allowed Headers to be received
};

app.use(cors(corsConfig));
const server = http.createServer(app);

mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    initialize();
    console.log("MongoDB Connected");
  })
  .catch((err) => console.log(err));
  

app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false, parameterLimit: 50000 }))
app.use(cookieParser());

// Routes
require("./routes")(app);


const port = process.env.PORT || 5001; // Dynamic port for deployment
server.listen(port, () => console.log(`Server is running on port: ${port}`));
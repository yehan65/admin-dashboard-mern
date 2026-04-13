const http = require("http");
const mongoose = require("mongoose");
const app = require("./main/app");

require("dotenv").config();

const server = http.createServer(app);

const PORT = process.env.PORT;

const MONGO_URL = process.env.MONGO_URL;
mongoose.connect(MONGO_URL);
mongoose.connection.once("open", () => {
  console.log("Connected to the database");
});
mongoose.connection.on("error", (error) => {
  console.error(`Error connecting to the database: ${error}`);
});

server.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}...`);
});

// QhOkalSJKL5BnU7z

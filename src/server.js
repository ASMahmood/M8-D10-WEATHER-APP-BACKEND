const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const weatherRouter = require("./weatherApi");

const {
  badRequestHandler,
  notFoundHandler,
  genericErrorHandler,
} = require("./errorHandling");

const server = express();
const port = process.env.PORT || 3002;

const whitelist = ["http://localhost:3000", "http://localhost:6969"];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

server.use(cors(corsOptions));
server.use(express.json());

server.use("/weather", weatherRouter);

server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

mongoose
  .connect(process.env.MONGO_ATLAS, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    server.listen(port, () => {
      console.log("The server's power level is over ", port);
    })
  );

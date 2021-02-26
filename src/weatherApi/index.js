const express = require("express");
const axios = require("axios");
const { authorize } = require("../authTools");

const weatherRouter = express.Router();

weatherRouter.get("/city", authorize, async (req, res, next) => {
  try {
    await axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?q=${req.query.city}&appid=${process.env.WEATHER_API_KEY}`
      )
      .then((response) => res.send(response.data));
  } catch (error) {
    console.log(error);
    next(error);
  }
});

weatherRouter.get("/geolocation", authorize, async (req, res, next) => {
  try {
    await axios
      .get(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${req.query.lat}&lon=${req.query.lon}&appid=${process.env.WEATHER_API_KEY}`
      )
      .then((response) => res.send(response.data));
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = weatherRouter;

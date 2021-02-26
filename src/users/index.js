const express = require("express");
const { authenticate, authorize } = require("../authTools");
const passport = require("passport");
require("../oauth/google");

const UserModel = require("./schema");

const userRouter = express.Router();

userRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body);
    const { _id } = await newUser.save();
    res.send(_id);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

userRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findByCredentials(email, password);
    console.log(user);
    const token = await authenticate(user);
    console.log(token.token);
    res.send({
      name: user.name,
      favourites: user.favourites,
      token: token.token,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

userRouter.put("/favourites/add", authorize, async (req, res, next) => {
  try {
    await UserModel.findOneAndUpdate(
      { email: req.user.email },
      { $addToSet: { favourites: { ...req.body } } }
    );
    res.send({ message: "Added!" });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

userRouter.put("/favourites/remove", authorize, async (req, res, next) => {
  try {
    await UserModel.findOneAndUpdate(
      { email: req.user.email },
      { $pull: { favourites: { name: req.body.name } } }
    );
    res.send();
  } catch (error) {
    console.log(error);
    next(error);
  }
});

userRouter.get(
  "/3rdParty/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

userRouter.get(
  "/3rdParty/google/Redirect",
  passport.authenticate("google"),
  async (req, res, next) => {
    try {
      res
        .status(200)
        .redirect("http://localhost:3000/home")
        .send(req.user.token.token);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = userRouter;

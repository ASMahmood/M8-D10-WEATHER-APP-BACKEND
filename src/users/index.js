const express = require("express");
const { authenticate, authorize, verifyJWT } = require("../authTools");
const passport = require("passport");
require("../oauth/google");

const UserModel = require("./schema");

const userRouter = express.Router();

userRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body);
    const { _id } = await newUser.save();
    res.send({ userId: _id });
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
    if (user) {
      const token = await authenticate(user);

      console.log(token.token);
      res.send({
        name: user.name,
        favourites: user.favourites,
        token: token.token,
      });
    } else {
      res.status(404).send({ message: "No User Found" });
    }
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
      { $pull: { favourites: { _id: req.body.id } } }
    );
    res.send({ message: "Removed!" });
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
        .redirect(`${process.env.FE_URL}/home?token=${req.user.token.token}`);
    } catch (error) {
      next(error);
    }
  }
);

userRouter.get("/homepage/userinfo/help/me", async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = await verifyJWT(token);
    const user = await UserModel.findOne({ _id: decodedToken._id });
    res.send({ name: user.name, favourites: user.favourites });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = userRouter;

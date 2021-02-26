const jwt = require("jsonwebtoken");
const UserModel = require("./users/schema");

const authenticate = async (user) => {
  try {
    const newAccessToken = await generateJWT({ _id: user._id });
    await user.save();
    return { token: newAccessToken };
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const generateJWT = (payload) =>
  new Promise((res, rej) =>
    jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "1d" },
      (error, token) => {
        if (error) rej(error);
        res(token);
      }
    )
  );

const verifyJWT = (token) =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.JWT_ACCESS_SECRET, (error, decoded) => {
      if (error) rej(error);
      res(decoded);
    })
  );

const authorize = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const decoded = await verifyJWT(token);
    const user = await UserModel.findOne({ _id: decoded._id });
    if (!user) {
      throw new Error();
    }
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    const err = new Error("Please Authenticate");
    console.log(err);
    next(err);
  }
};

module.exports = { authenticate, verifyJWT, authorize };

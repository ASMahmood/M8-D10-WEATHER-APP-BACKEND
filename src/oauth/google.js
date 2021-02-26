const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const UserModel = require("../users/schema");
const { authenticate } = require("../authTools");

passport.use(
  "google",
  new GoogleStrategy(
    {
      //STATES THE THIRD PARTY AS GOOGLE
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        "https://shit-weather-app.herokuapp.com/users/3rdParty/google/Redirect", //SEND THE DATA FROM GOOGLE TO THIS URL, A ROUTE IN OUR BACKEND
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        const user = await UserModel.findOne({
          email: profile.emails[0].value,
        });
        if (!user) {
          const newUser = {
            name: profile.name.givenName,
            email: profile.emails[0].value,
            favourites: [],
          };
          const createdUser = new UserModel(newUser);
          await createdUser.save();
          const token = await authenticate(createdUser);
          done(null, { user: createdUser, token }); //NULL IS ERROR RESPONSE, OBJECT IS SUCCESS RESPONSE
        } else {
          const token = await authenticate(user);
          done(null, { user, token });
        }
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.serializeUser(function (user, next) {
  next(null, user);
});

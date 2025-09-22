const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Adjust path if necessary

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Find a user based on their googleId
      let currentUser = await User.findOne({ googleId: profile.id });

      if (currentUser) {
        // If user already exists, log them in
        return done(null, currentUser);
      } else {
        // If no user, check if one exists with the same email
        let existingUserByEmail = await User.findOne({ email: profile.emails[0].value });
        if (existingUserByEmail) {
            // If email exists, link the Google account to it
            existingUserByEmail.googleId = profile.id;
            await existingUserByEmail.save();
            return done(null, existingUserByEmail);
        }

        // Otherwise, create a new user in our db
        const newUser = await new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          role: 'student' // Default role for Google sign-ups
        }).save();
        return done(null, newUser);
      }
    } catch (error) {
      return done(error, null);
    }
  }
));

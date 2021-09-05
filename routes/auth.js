const authRouter = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

// Register
authRouter.post("/register", async (req, res) => {
  try {
    // generate a crypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // create a new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    // save the user and return
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
  }
});

// Login
authRouter.post("/login", async (req, res) => {
  try {
    // Find the specify user with the email
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(404).json("User not found.");

    // Compare the password between the req and finned
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    !validPassword && res.status(400).json("Password is wrong.");

    res.status(200).json("User is login success.");
  } catch (err) {
    console.log(err);
  }
});

module.exports = authRouter;

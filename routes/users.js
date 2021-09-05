const userRouter = require("express").Router();
const bcrypt = require("bcrypt");
const { findById } = require("../models/User");
const User = require("../models/User");

// Update user(personal account only)
userRouter.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        res.status(500).json(err);
      }
    }

    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Successfully updated account.");
    } catch (err) {
      res.status(500).json("Can not update your account!");
    }
  } else {
    res.status(403).json("You can only update your account!");
  }
});

// Delete user(personal account only)
userRouter.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id) {
    try {
      await User.findByIdAndDelete(req.body.userId);
      res.status(200).json("You successfully deleted your account.");
    } catch (err) {
      res.status(500).json("You can not delete your account now!");
    }
  } else {
    res.status(400).json("You can only delete your account!");
  }
});

// Get user(personal account only)
userRouter.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Follow user
userRouter.put("/:id/follow", async (req, res) => {
  if (req.body.id !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({
          $push: { followings: req.params.id },
        });
        res.status(200).json("You successfully followed the user.");
      }
    } catch (err) {
      res.status(403).json("You have already followed the user!");
    }
  } else {
    res.status(403).json("You can not follow yourself!");
  }
});

// UnFollow
userRouter.put("/:id/unfollow", async (req, res) => {
  if (req.body.id !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({
          $pull: { followings: req.params.id },
        });
        res.status(200).json("You successfully unfollowed the user.");
      }
    } catch (err) {
      res.status(403).json("You have already unfollowed the user!");
    }
  } else {
    res.status(403).json("You can not unfollow yourself!");
  }
});
module.exports = userRouter;

const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("config");
const secret = config.get("jwtSecret");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

router.post(
  "/",
  [
    check("email", "Please enter valid email").isEmail(),
    check("password", "Please enter password").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const { email, password } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    const check = await bcrypt.compare(password, user.password);
    if (!check) {
      return res.status(400).json({ msg: "Passwords don't match" });
    }
    const payload = {
      user: {
        id: user._id,
      },
    };
    jwt.sign(
      payload,
      secret,
      {
        expiresIn: 360000,
      },
      (err, token) => {
        if (err) throw err;
        res.send(token);
      }
    );
  }
);

module.exports = router;

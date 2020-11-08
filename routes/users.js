const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const secret = config.get("jwtSecret");

router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with more than 6 characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      var user = await User.findOne({
        email,
      });
      if (user) {
        return res.status(400).json({ msg: "User already registered" });
      }
      user = new User({
        name,
        email,
        password,
      });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        secret,
        {
          expiresIn: 3600000,
        },
        (err, token) => {
          if (err) {
            throw error;
          }
          res.send(token);
        }
      );
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ msg: "Server error" });
    }
  }
);

module.exports = router;

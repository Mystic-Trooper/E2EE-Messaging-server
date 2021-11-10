const router = require("express").Router();
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  registerValidation,
  loginValidation,
} = require("../validators/validation");

router.post("/register", async (req, res) => {
  // Lets Validate User before saving to DB
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error?.details[0]?.message);

  // Check if user is alredy in database
  const isEmailExist = await User.findOne({ email: req.body.email });
  if (isEmailExist) return res.status(400).send("Email Alredy Exists");

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // Create New user
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });

  // Save new user to the database
  try {
    const savedUser = await user.save();
    res.send({
      userId: user._id,
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/login", async (req, res) => {
  // Validation
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error?.details[0]?.message);

  // Check if email exist in database
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(400).send("Email Doesn't Exists, Register Instead");

  // Check if password is correct
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid Password");

  // Create and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
   res.header("auth-token", token).status(200).send({
     token: token,
     success: "user Logged in",
   });
});

module.exports = router;

const router = require("express").Router();
const verifyToken = require("./verifyToken");

router.get("/", verifyToken, (req, res) => {
  res.status(200).send(req.user);
  // you have an acess to user you can find in databse and perform various tasks
});

module.exports = router;

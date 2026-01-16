const userService = require('../services/userService');

async function getUser(req, res) {
  const userId = req.params.id;
  const user = await userService.getUserById(userId);
  res.json(user);
}

module.exports = { getUser };
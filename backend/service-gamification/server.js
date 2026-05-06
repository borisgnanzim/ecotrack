require("dotenv").config();
const app = require("./app");

const port = process.env.PORT || 3015;

app.listen(port, () => {
  console.log(`Gamification service running on port ${port}`);
});
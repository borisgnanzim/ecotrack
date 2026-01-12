require('dotenv').config();
const { connectDb } = require('./src/config/postgres');
const app = require('./app');

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDb(); // Wait DB connection before listening
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('Impossible de démarrer le serveur, la connexion à la BD a échoué.', err);
    process.exit(1);
  }
}

startServer();

// Optional: handle unhandled rejections / exceptions to avoid silent crashes
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
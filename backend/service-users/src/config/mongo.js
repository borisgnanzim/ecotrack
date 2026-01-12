const mongoose = require('mongoose');

let conn = null;

async function ConnexionDb() {
  if (conn) {
    console.log('Déjà connecté à la base de données');
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI non défini dans les variables d\'environnement');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME,
      //useNewUrlParser: true,
      //useUnifiedTopology: true
    });
    conn = mongoose.connection;
    console.log('Connexion à la base de données réussie');
  } catch (error) {
    console.error('Erreur de connexion à la base de données :', error);
    throw error; // relancer pour permettre à l'appelant de gérer l'échec
  }
}

module.exports = ConnexionDb;
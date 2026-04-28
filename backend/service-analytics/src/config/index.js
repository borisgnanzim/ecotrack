module.exports = {
  port: process.env.PORT || 3005,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Configuration de la base de données
  database: {
    url: process.env.DATABASE_URL,
  },
  
  // Configuration Kafka
  kafka: {
    clientId: 'service-analytics',
    groupId: 'analytics-group',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  },
  
  // Configuration des rapports
  reports: {
    outputDir: process.env.REPORT_OUTPUT_DIR || './reports',
    emailFrom: process.env.EMAIL_FROM || 'noreply@ecotrack.com',
  },
  
  // Configuration ML
  ml: {
    modelVersion: 'v1',
    predictionThreshold: 0.7,
  },
  
  // Configuration du cache
  cache: {
    dashboardTTL: 60, // secondes
    metricsTTL: 300,
  },
};
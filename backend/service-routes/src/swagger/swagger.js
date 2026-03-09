const swaggerJsDoc = require("swagger-jsdoc");

const options = {
 definition:{
  openapi:"3.0.0",
  info:{
   title:"Routes API",
   version:"1.0.0"
  }
 },
 apis:["./src/routes/*.js"]
}

module.exports = swaggerJsDoc(options)
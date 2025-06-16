const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TripAhead API Documentation',
      version: '1.0.0',
      description: 'API documentation for the TripAhead application',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./app.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs; 
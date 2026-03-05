const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Laundry Management System API',
      version: '1.0.0',
      description: 'REST API for the Laundry Management System',
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Local development server',
      },
      {
        url: 'https://laundry-management-wir4.onrender.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);

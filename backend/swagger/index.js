const swaggerUi = require('swagger-ui-express');
const { protect, admin } = require('../middleware/authMiddleware');
const openapiSpec = require('./openapi');

/**
 * Enterprise-style Swagger setup:
 * - UI + spec are protected by `protect` + `admin` by default.
 * - Set `SWAGGER_PUBLIC=true` to expose them without auth (useful for local dev).
 */
function setupSwagger(app) {
  const isPublic = String(process.env.SWAGGER_PUBLIC).toLowerCase() === 'true';

  if (isPublic) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, { explorer: true }));
    app.get('/api/openapi.json', (_req, res) => res.json(openapiSpec));
    return;
  }

  app.use(
    '/api-docs',
    protect,
    admin,
    swaggerUi.serve,
    swaggerUi.setup(openapiSpec, {
      explorer: true,
      swaggerOptions: {
        docExpansion: 'none',
        persistAuthorization: true,
      },
    })
  );

  app.get('/api/openapi.json', protect, admin, (_req, res) => res.json(openapiSpec));
}

module.exports = { setupSwagger };


const Joi = require('joi');
const logger = require('../utils/logger');

const schemas = {
  createOrder: Joi.object({
    userId: Joi.string().required(),
    quantity: Joi.number().integer().min(1).max(2).required(),
  }),
};

const validateRequest = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      logger.error(`Schema '${schemaName}' not found`);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const { error } = schema.validate(req.body);
    if (error) {
      logger.warn(`Validation error: ${error.details[0].message}`);
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};

module.exports = validateRequest;
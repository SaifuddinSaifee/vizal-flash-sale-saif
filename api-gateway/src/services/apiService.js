const axios = require('axios');
const logger = require('../utils/logger');

class ApiService {
  constructor(axiosInstance = axios) {
    this.client = axiosInstance;

    if (this.client.create) {
      this.client = this.client.create({
        timeout: 5000, // 5 seconds
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (this.client.interceptors) {
      // Add request interceptor for logging
      this.client.interceptors.request.use((config) => {
        logger.info(`API Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
      });

      // Add response interceptor for logging
      this.client.interceptors.response.use(
        (response) => {
          logger.info(`API Response: ${response.status} ${response.config.url}`);
          return response;
        },
        (error) => {
          logger.error(`API Error: ${error.message}`, { error });
          return Promise.reject(error);
        }
      );
    }
  }

  async get(url, config = {}) {
    return this.client.get(url, config);
  }

  async post(url, data = {}, config = {}) {
    return this.client.post(url, data, config);
  }

  async put(url, data = {}, config = {}) {
    return this.client.put(url, data, config);
  }

  async delete(url, config = {}) {
    return this.client.delete(url, config);
  }
}

module.exports = new ApiService();
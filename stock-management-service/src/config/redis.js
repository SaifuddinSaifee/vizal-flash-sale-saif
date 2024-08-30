const Redis = require("ioredis");
const logger = require("../utils/logger");

class RedisClient {
  /**
   * Initializes the Redis client with the given configuration.
   * Sets up events for connection errors, connecting, ready, and reconnecting.
   * @constructor
   */
  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB || 0,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err) {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          // Only reconnect when the error contains "READONLY"
          return true;
        }
      },
    });

    this.client.on("error", (error) => {
      logger.error("Redis connection error:", error);
    });

    this.client.on("connect", () => {
      logger.info("Connected to Redis");
    });

    this.client.on("ready", () => {
      logger.info("Redis client ready");
    });

    this.client.on("reconnecting", (delay) => {
      logger.warn(`Redis client reconnecting after ${delay}ms`);
    });
  }

  /**
   * Retrieves the value of a Redis key.
   * @param {string} key The Redis key to retrieve.
   * @returns {Promise<string|Buffer>} The value associated with the key, or null if the key does not exist.
   * @throws {Error} If there is an error connecting to Redis or executing the command.
   */
  async get(key) {
    try {
      const value = await this.client.get(key);
      return value;
    } catch (error) {
      logger.error(`Error getting key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Sets the value of a Redis key.
   * @param {string} key The Redis key to set.
   * @param {string|Buffer} value The value to associate with the key.
   * @param {Object} [options] Additional options to pass to the Redis SET command.
   * @returns {Promise<void>} A promise that resolves when the key is set.
   * @throws {Error} If there is an error connecting to Redis or executing the command.
   */
  async set(key, value, options = {}) {
    try {
      await this.client.set(key, value, options);
    } catch (error) {
      logger.error(`Error setting key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Decrements the value of a Redis key by 1.
   * @param {string} key The Redis key to decrement.
   * @returns {Promise<number>} The new value of the key.
   * @throws {Error} If there is an error connecting to Redis or executing the command.
   */
  async decr(key) {
    try {
      const result = await this.client.decr(key);
      return result;
    } catch (error) {
      logger.error(`Error decrementing key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Decrements the value of a Redis key by the given decrement value.
   * @param {string} key The Redis key to decrement.
   * @param {number} decrement The value to decrement the key by.
   * @returns {Promise<number>} The new value of the key.
   * @throws {Error} If there is an error connecting to Redis or executing the command.
   */
  async decrBy(key, decrement) {
    try {
      const result = await this.client.decrby(key, decrement);
      return result;
    } catch (error) {
      logger.error(`Error decrementing key ${key} by ${decrement}:`, error);
      throw error;
    }
  }

  async incrBy(key, increment) {
    try {
      const result = await this.client.incrby(key, increment);
      return result;
    } catch (error) {
      logger.error(`Error incrementing key ${key} by ${increment}:`, error);
      throw error;
    }
  }

  /**
   * Sets the value of a Redis key only if the key does not exist.
   * @param {string} key The Redis key to set.
   * @param {string|Buffer} value The value to associate with the key.
   * @returns {Promise<number>} 1 if the key was set, 0 if the key was not set (already exists).
   * @throws {Error} If there is an error connecting to Redis or executing the command.
   */
  async setNX(key, value) {
    try {
      const result = await this.client.setnx(key, value);
      return result;
    } catch (error) {
      logger.error(`Error setting key ${key} if not exists:`, error);
      throw error;
    }
  }

  /**
   * Sets the expiration time for a Redis key in seconds.
   * @param {string} key The Redis key to set the expiration time for.
   * @param {number} seconds The number of seconds until the key expires.
   * @returns {Promise<void>} A promise that resolves when the key expiration
   *   is set.
   * @throws {Error} If there is an error connecting to Redis or executing the
   *   command.
   */
  async expire(key, seconds) {
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      logger.error(`Error setting expiry for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Returns a Redis multi command object which can be used to batch commands
   * together and execute them atomically.
   *
   * @returns {RedisClient.Multi} A Redis multi command object.
   */
  async multi() {
    return this.client.multi();
  }
}

module.exports = new RedisClient();

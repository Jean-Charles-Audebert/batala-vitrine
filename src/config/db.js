import pkg from "pg";
import dotenv from "dotenv";
import { logger } from "../utils/logger.js";

dotenv.config();

const { Pool } = pkg;

const poolConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

logger.info(`Configuration Pool PostgreSQL AVANT création:`, JSON.stringify(poolConfig, null, 2));

export const pool = new Pool(poolConfig);

pool.on("connect", () => logger.info("PostgreSQL connecté"));
pool.on("error", (err) => logger.error("Erreur PostgreSQL", err));

export const query = (text, params) => pool.query(text, params);

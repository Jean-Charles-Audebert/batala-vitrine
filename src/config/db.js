import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.on("connect", () => console.log("✅ PostgreSQL connecté"));
pool.on("error", (err) => console.error("❌ Erreur PostgreSQL :", err));

export const query = (text, params) => pool.query(text, params);

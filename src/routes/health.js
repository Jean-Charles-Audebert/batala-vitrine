import express from "express";
import { query } from "../config/db.js";

const router = express.Router();

router.get("/health", async (req, res) => {
  try {
    const info = await query(
      "SELECT current_database() AS db, current_user AS usr, inet_server_addr() AS host, inet_server_port() AS port"
    );
    const searchPath = await query("SHOW search_path");
    const cardsExists = await query(
      "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cards') AS exists"
    );
    const blocksCount = await query("SELECT COUNT(*)::int AS count FROM blocks");
    const cardsCount = await query("SELECT COUNT(*)::int AS count FROM cards");

    res.json({
      status: "ok",
      db: {
        name: info.rows[0].db,
        user: info.rows[0].usr,
        host: info.rows[0].host,
        port: info.rows[0].port,
        searchPath: searchPath.rows[0].search_path,
        tables: {
          cards: Boolean(cardsExists.rows[0].exists),
        },
        counts: {
          blocks: blocksCount.rows[0].count,
          cards: cardsCount.rows[0].count,
        },
      },
      time: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

export default router;

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  uri: process.env.MYSQL_URI,
  connectionLimit: 10,
  waitForConnections: true,
  namedPlaceholders: true
});

export async function query(sql, params = {}) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function tx(run) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const exec = async (sql, params={}) => (await conn.execute(sql, params))[0];
    const result = await run(exec);
    await conn.commit();
    return result;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}









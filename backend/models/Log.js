import pool from '../database/db.js';

export const insertLog = async (account_id, status, message) => {
    await pool.query(`INSERT INTO logs(account_id,status,message,created_at) VALUES ($1,$2,$3,NOW())`, [account_id,status,message]
    );
};

export const getLogs = async () => {
    const res = await pool.query(`SELECT * FROM logs ORDER BY created_at DESC`);
    return res.rows;
};
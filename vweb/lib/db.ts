import mysql, { Pool } from "mysql2/promise";

// Ensure the pool is reused across hot reloads in development
declare global {
	// eslint-disable-next-line no-var
	var mysqlPool: Pool | undefined;
}

const pool: Pool =
	global.mysqlPool ??
	mysql.createPool({
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT ?? 3306),
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		waitForConnections: true,
		connectionLimit: 10,
		queueLimit: 0,
	});

if (process.env.NODE_ENV !== "production") {
	global.mysqlPool = pool;
}

export default pool;

export async function query<T = any>(
	sql: string,
	params?: any[]
): Promise<T[]> {
	const [rows] = await pool.query<T[]>(sql, params);
	return rows;
}

const mysql = require("mysql2/promise");
require("dotenv").config();

const connectDb = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

exports.checkDatabaseConnection = async () => {
  try {
    const connection = await connectDb.getConnection();
    await connection.ping();
    connection.release();
    console.log("Connected to MySQL successfully!");
  } catch (err) {
    console.error("MySQL connection failed:", err.message);
  }
};

exports.query_db = async (query, params = []) => {
  try {
    const connection = await connectDb.getConnection();
    const [rows] = await connection.query(query, params);

    connection.release();
    if (query.toLowerCase().startsWith("select")) {
      return rows;
    } else {
      if (rows && rows.affectedRows !== undefined) {
        return { affectedRows: rows.affectedRows };
      } else {
        console.error("No affected rows returned from query.");
        return { affectedRows: 0 };
      }
    }
  } catch (err) {
    console.error("Database query failed:", err.message);
  }
};

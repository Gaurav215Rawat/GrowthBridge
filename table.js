// === File: Table.js ===
const { pool } = require('./config/db'); 


//DROP TABLE IF EXISTS entries CASCADE;

const createTables = async () => {
  const client = await pool.connect();
  try {
    const createTablesQuery = ` 

              CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,                
                name VARCHAR(255) NOT NULL,          
                email VARCHAR(255) UNIQUE NOT NULL,        
                password VARCHAR(100),       
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
            );
        
              CREATE TABLE IF NOT EXISTS contact (
                id SERIAL PRIMARY KEY,
                name VARCHAR(60) NOT NULL, 
                Bussiness_Name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phon_no VARCHAR(15) UNIQUE NOT NULL,
                location TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'new'  -- new | in_progress | resolved
              );

              CREATE TABLE IF NOT EXISTS case_study_pages (
                id SERIAL PRIMARY KEY,
                slug TEXT UNIQUE NOT NULL,
                title TEXT,
                content JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              );

        `;
    await client.query(createTablesQuery);
    console.log("Tables created");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    client.release();
  }
};

module.exports={createTables};

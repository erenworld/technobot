import { Client } from 'pg';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    const sql = fs.readFileSync('c:\\dev\\Technobot\\scripts\\dev\\dump.sql', 'utf8');
    
    console.log('Executing SQL dump...');
    await client.query(sql);
    
    console.log('SQL dump executed successfully!');
  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    await client.end();
  }
}

main();

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function verificarDB() {
  // Primero conectar a la base de datos postgres para verificar si gubernamentales existe
  const adminPool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: 'postgres',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    console.log('Verificando si la base de datos "gubernamentales" existe...');
    
    const result = await adminPool.query(`
      SELECT datname FROM pg_database WHERE datname = 'gubernamentales'
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ La base de datos "gubernamentales" NO existe');
      console.log('\nCreando la base de datos...');
      await adminPool.query('CREATE DATABASE gubernamentales');
      console.log('✅ Base de datos "gubernamentales" creada exitosamente');
    } else {
      console.log('✓ La base de datos "gubernamentales" existe');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await adminPool.end();
  }
}

verificarDB();

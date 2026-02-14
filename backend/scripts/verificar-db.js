import pool from '../database.js';

async function verificarDB() {
  try {
    console.log('Verificando conexión a la base de datos...');
    
    // Verificar conexión
    const testConnection = await pool.query('SELECT NOW()');
    console.log('✓ Conexión exitosa');
    
    // Listar todas las tablas
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\nTablas en la base de datos:');
    if (tablesResult.rows.length === 0) {
      console.log('❌ No hay tablas en la base de datos');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }
    
    // Verificar si existe la tabla usuario
    const usuarioCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuario'
      );
    `);
    
    if (!usuarioCheck.rows[0].exists) {
      console.log('\n❌ La tabla "usuario" no existe');
    } else {
      console.log('\n✓ La tabla "usuario" existe');
      
      // Contar usuarios
      const countResult = await pool.query('SELECT COUNT(*) FROM usuario');
      console.log(`  Total de usuarios: ${countResult.rows[0].count}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

verificarDB();

import pool from '../database.js';

async function listarUsuarios() {
  try {
    const result = await pool.query(`
      SELECT 
        u.id_usuario,
        u.nombre_usuario,
        r.nombre as rol_nombre
      FROM usuario u
      LEFT JOIN rol r ON u.id_rol = r.id_rol
      ORDER BY u.id_usuario;
    `);
    
    console.log('Usuarios en la base de datos:\n');
    result.rows.forEach(user => {
      console.log(`  Usuario: ${user.nombre_usuario}`);
      console.log(`  Rol: ${user.rol_nombre || 'Sin rol'}`);
      console.log('  ---');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

listarUsuarios();

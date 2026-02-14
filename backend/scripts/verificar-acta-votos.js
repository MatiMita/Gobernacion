import pool from '../database.js';

async function verificarActa() {
  try {
    // Obtener el acta con id 1 (o la primera que exista)
    const result = await pool.query(`
      SELECT 
        a.id_acta,
        a.votos_totales,
        a.votos_validos,
        a.votos_nulos,
        a.votos_blancos,
        m.codigo as codigo_mesa
      FROM acta a
      INNER JOIN mesa m ON a.id_mesa = m.id_mesa
      ORDER BY a.id_acta DESC
      LIMIT 5
    `);
    
    console.log('\n=== ACTAS REGISTRADAS ===\n');
    
    for (const acta of result.rows) {
      console.log(`Acta ID: ${acta.id_acta} - Mesa: ${acta.codigo_mesa}`);
      console.log(`  Votos Totales: ${acta.votos_totales}`);
      console.log(`  Votos Válidos: ${acta.votos_validos}`);
      console.log(`  Votos Nulos: ${acta.votos_nulos}`);
      console.log(`  Votos Blancos: ${acta.votos_blancos}`);
      
      // Obtener votos por frente
      const votos = await pool.query(`
        SELECT tipo_cargo, SUM(cantidad) as total
        FROM voto
        WHERE id_acta = $1
        GROUP BY tipo_cargo
      `, [acta.id_acta]);
      
      console.log('  Votos por cargo:');
      votos.rows.forEach(v => {
        console.log(`    ${v.tipo_cargo}: ${v.total}`);
      });
      
      const totalCalculado = parseInt(acta.votos_nulos || 0) + parseInt(acta.votos_blancos || 0) + parseInt(acta.votos_validos || 0);
      console.log(`  Total calculado: ${totalCalculado}`);
      console.log(`  Diferencia: ${acta.votos_totales - totalCalculado}`);
      console.log('');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

verificarActa();

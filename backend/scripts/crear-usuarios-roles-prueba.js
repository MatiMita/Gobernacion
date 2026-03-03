/**
 * Script para crear usuarios de prueba con los nuevos roles
 * Jefe de Recinto y Delegado de Mesa
 * 
 * Uso: node backend/scripts/crear-usuarios-roles-prueba.js
 */

import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'subnacionales',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

async function crearUsuariosPrueba() {
    console.log('🔧 Iniciando creación de usuarios de prueba...\n');

    try {
        // 1. Verificar que existen los roles
        console.log('📋 Verificando roles...');
        const rolesResult = await pool.query(`
            SELECT id_rol, nombre FROM rol 
            WHERE nombre IN ('Jefe de Recinto', 'Delegado de Mesa')
        `);

        if (rolesResult.rows.length < 2) {
            console.error('❌ Error: No se encontraron los roles necesarios.');
            console.log('   Ejecuta primero: backend/sql/02_agregar_roles_recinto_mesa.sql');
            process.exit(1);
        }

        const rolJefeRecinto = rolesResult.rows.find(r => r.nombre === 'Jefe de Recinto');
        const rolDelegadoMesa = rolesResult.rows.find(r => r.nombre === 'Delegado de Mesa');
        console.log('✅ Roles encontrados:', rolesResult.rows.map(r => r.nombre).join(', '));

        // 2. Obtener primer recinto disponible
        console.log('\n📋 Buscando recintos disponibles...');
        const recintoResult = await pool.query('SELECT id_recinto, nombre FROM recinto LIMIT 1');
        
        if (recintoResult.rows.length === 0) {
            console.error('❌ Error: No hay recintos en la base de datos.');
            console.log('   Crea al menos un recinto desde la interfaz web.');
            process.exit(1);
        }

        const recinto = recintoResult.rows[0];
        console.log(`✅ Recinto encontrado: ${recinto.nombre} (ID: ${recinto.id_recinto})`);

        // 3. Obtener primera mesa disponible del recinto
        console.log('\n📋 Buscando mesas disponibles...');
        const mesaResult = await pool.query(
            'SELECT id_mesa, codigo FROM mesa WHERE id_recinto = $1 LIMIT 1',
            [recinto.id_recinto]
        );

        if (mesaResult.rows.length === 0) {
            console.error('❌ Error: No hay mesas en el recinto.');
            console.log('   Crea al menos una mesa desde la interfaz web.');
            process.exit(1);
        }

        const mesa = mesaResult.rows[0];
        console.log(`✅ Mesa encontrada: ${mesa.codigo} (ID: ${mesa.id_mesa})`);

        // 4. Hashear contraseña
        const password = '123456';
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Crear usuario Jefe de Recinto
        console.log('\n👤 Creando usuario Jefe de Recinto...');
        try {
            const jefeResult = await pool.query(`
                INSERT INTO usuario (nombre_usuario, contrasena, id_rol, id_recinto_asignado)
                VALUES ($1, $2, $3, $4)
                RETURNING id_usuario, nombre_usuario
            `, ['jeferecinto', hashedPassword, rolJefeRecinto.id_rol, recinto.id_recinto]);

            console.log('✅ Usuario creado exitosamente:');
            console.log(`   Usuario: jeferecinto`);
            console.log(`   Contraseña: ${password}`);
            console.log(`   Rol: Jefe de Recinto`);
            console.log(`   Recinto: ${recinto.nombre}`);
        } catch (err) {
            if (err.code === '23505') { // Duplicate key
                console.log('⚠️  Usuario "jeferecinto" ya existe, omitiendo...');
            } else {
                throw err;
            }
        }

        // 6. Crear usuario Delegado de Mesa
        console.log('\n👤 Creando usuario Delegado de Mesa...');
        try {
            const delegadoResult = await pool.query(`
                INSERT INTO usuario (nombre_usuario, contrasena, id_rol, id_mesa_asignada)
                VALUES ($1, $2, $3, $4)
                RETURNING id_usuario, nombre_usuario
            `, ['delegadomesa', hashedPassword, rolDelegadoMesa.id_rol, mesa.id_mesa]);

            console.log('✅ Usuario creado exitosamente:');
            console.log(`   Usuario: delegadomesa`);
            console.log(`   Contraseña: ${password}`);
            console.log(`   Rol: Delegado de Mesa`);
            console.log(`   Mesa: ${mesa.codigo}`);
        } catch (err) {
            if (err.code === '23505') { // Duplicate key
                console.log('⚠️  Usuario "delegadomesa" ya existe, omitiendo...');
            } else {
                throw err;
            }
        }

        // 7. Resumen
        console.log('\n' + '='.repeat(60));
        console.log('🎉 Proceso completado exitosamente!');
        console.log('='.repeat(60));
        console.log('\n📝 CREDENCIALES DE PRUEBA:\n');
        console.log('1️⃣  Jefe de Recinto:');
        console.log('    Usuario: jeferecinto');
        console.log(`    Contraseña: ${password}`);
        console.log(`    Recinto: ${recinto.nombre}`);
        console.log('\n2️⃣  Delegado de Mesa:');
        console.log('    Usuario: delegadomesa');
        console.log(`    Contraseña: ${password}`);
        console.log(`    Mesa: ${mesa.codigo}`);
        console.log('\n' + '='.repeat(60));
        console.log('💡 Puedes iniciar sesión con estos usuarios en el sistema.');
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('\n❌ Error durante la ejecución:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Ejecutar
crearUsuariosPrueba();

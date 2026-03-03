import jwt from 'jsonwebtoken';
import pool from '../database.js';

// Middleware para verificar JWT
export const verificarToken = (req, res, next) => {
    try {
        // Extraer token del header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Agregar información del usuario al request
        req.usuario = {
            id_usuario: decoded.id,
            nombre_usuario: decoded.nombre_usuario,
            rol: decoded.rol,
            id_recinto_asignado: decoded.id_recinto_asignado,
            id_mesa_asignada: decoded.id_mesa_asignada
        };

        next();
    } catch (error) {
        console.error('Error al verificar token:', error);
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado',
            error: error.message
        });
    }
};

// Middleware para verificar roles específicos
export const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para realizar esta acción'
            });
        }

        next();
    };
};

// Middleware para verificar permisos de acceso a una mesa específica
export const verificarPermisoMesa = async (req, res, next) => {
    try {
        // Obtener id_mesa de params o body
        const id_mesa = req.params.id_mesa || req.body.id_mesa || req.params.id;
        const usuario = req.usuario;

        if (!id_mesa) {
            return res.status(400).json({
                success: false,
                message: 'ID de mesa no proporcionado'
            });
        }

        // Administradores y Supervisores tienen acceso total
        if (usuario.rol === 'Administrador del Sistema' || usuario.rol === 'Administrador' || usuario.rol === 'Supervisor') {
            return next();
        }

        // Delegado de Mesa: solo puede acceder a su mesa asignada
        if (usuario.rol === 'Delegado de Mesa') {
            if (!usuario.id_mesa_asignada) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes una mesa asignada'
                });
            }
            if (parseInt(id_mesa) !== usuario.id_mesa_asignada) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para acceder a esta mesa'
                });
            }
            return next();
        }

        // Jefe de Recinto: puede acceder a todas las mesas de su recinto
        if (usuario.rol === 'Jefe de Recinto') {
            if (!usuario.id_recinto_asignado) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes un recinto asignado'
                });
            }

            // Verificar que la mesa pertenece al recinto del jefe
            const result = await pool.query(
                'SELECT id_recinto FROM mesa WHERE id_mesa = $1',
                [id_mesa]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Mesa no encontrada'
                });
            }

            if (result.rows[0].id_recinto !== usuario.id_recinto_asignado) {
                return res.status(403).json({
                    success: false,
                    message: 'Esta mesa no pertenece a tu recinto asignado'
                });
            }

            return next();
        }

        // Otros roles no tienen permisos por defecto
        return res.status(403).json({
            success: false,
            message: 'No tienes permisos para esta acción'
        });

    } catch (error) {
        console.error('Error al verificar permisos de mesa:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al verificar permisos',
            error: error.message
        });
    }
};

// Middleware para obtener filtros según rol del usuario
export const obtenerFiltrosUsuario = (usuario) => {
    const filtros = {
        donde: [],
        parametros: []
    };

    if (usuario.rol === 'Delegado de Mesa' && usuario.id_mesa_asignada) {
        filtros.donde.push(`m.id_mesa = $${filtros.parametros.length + 1}`);
        filtros.parametros.push(usuario.id_mesa_asignada);
    } else if (usuario.rol === 'Jefe de Recinto' && usuario.id_recinto_asignado) {
        filtros.donde.push(`m.id_recinto = $${filtros.parametros.length + 1}`);
        filtros.parametros.push(usuario.id_recinto_asignado);
    }
    // Administradores y Supervisores no tienen filtros (ven todo)

    return filtros;
};

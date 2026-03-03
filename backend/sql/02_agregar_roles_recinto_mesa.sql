-- ============================================
-- SCRIPT PARA AGREGAR ROLES DE RECINTO Y MESA
-- Sistema Electoral - Colcapirhua 2026
-- ============================================

-- ============================================
-- 1. AGREGAR NUEVOS ROLES
-- ============================================

INSERT INTO rol (nombre, descripcion) VALUES
    ('Jefe de Recinto', 'Encargado de un recinto electoral completo, puede gestionar todas las mesas de su recinto asignado'),
    ('Delegado de Mesa', 'Encargado de una mesa electoral específica, puede gestionar solo su mesa asignada')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- 2. AGREGAR CAMPOS DE ASIGNACIÓN A USUARIO
-- ============================================

-- Campo para asignar un recinto a un Jefe de Recinto
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS id_recinto_asignado INTEGER REFERENCES recinto(id_recinto) ON DELETE SET NULL;

-- Campo para asignar una mesa a un Delegado de Mesa
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS id_mesa_asignada INTEGER REFERENCES mesa(id_mesa) ON DELETE SET NULL;

-- Índices para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_usuario_recinto_asignado ON usuario(id_recinto_asignado);
CREATE INDEX IF NOT EXISTS idx_usuario_mesa_asignada ON usuario(id_mesa_asignada);

-- Comentarios
COMMENT ON COLUMN usuario.id_recinto_asignado IS 'Recinto asignado para usuarios con rol de Jefe de Recinto';
COMMENT ON COLUMN usuario.id_mesa_asignada IS 'Mesa asignada para usuarios con rol de Delegado de Mesa';

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Mostrar los roles existentes
SELECT id_rol, nombre, descripcion FROM rol ORDER BY id_rol;

-- Mostrar la estructura de la tabla usuario
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuario'
ORDER BY ordinal_position;

-- ============================================
-- RESUMEN
-- ============================================
-- Cambios realizados:
-- 1. Agregados 2 nuevos roles: 'Jefe de Recinto' y 'Delegado de Mesa'
-- 2. Agregados 2 campos a usuario: id_recinto_asignado, id_mesa_asignada
-- 3. Creados índices para optimizar consultas por asignación
--
-- Total de roles en el sistema: 5
-- - Administrador del Sistema
-- - Supervisor
-- - Operador
-- - Jefe de Recinto (nuevo)
-- - Delegado de Mesa (nuevo)
-- ============================================

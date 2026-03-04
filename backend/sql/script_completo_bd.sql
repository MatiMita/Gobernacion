-- ============================================================
-- SCRIPT COMPLETO DE BASE DE DATOS
-- Sistema Electoral Subnacional - Colcapirhua 2026
-- Generado: 2026-03-04
-- ============================================================
-- Descripción:
--   Script unificado que crea toda la estructura de la base de
--   datos desde cero, incluyendo tablas, índices, restricciones,
--   triggers, funciones y datos iniciales.
--
-- Requisitos previos:
--   1. Tener PostgreSQL instalado (versión 13+)
--   2. Crear la base de datos antes de ejecutar este script:
--        CREATE DATABASE subnacionales;
--   3. Ejecutar con:
--        psql -U postgres -d subnacionales -f script_completo_bd.sql
-- ============================================================


-- ============================================================
-- CONFIGURACIÓN INICIAL
-- ============================================================

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;


-- ============================================================
-- ELIMINAR OBJETOS EXISTENTES (orden inverso de dependencias)
-- ============================================================
-- Descomenta esta sección si deseas recrear todo desde cero.
-- ADVERTENCIA: eliminará todos los datos existentes.

-- DROP TABLE IF EXISTS voto CASCADE;
-- DROP TABLE IF EXISTS acta CASCADE;
-- DROP TABLE IF EXISTS usuario CASCADE;
-- DROP TABLE IF EXISTS mesa CASCADE;
-- DROP TABLE IF EXISTS recinto CASCADE;
-- DROP TABLE IF EXISTS frente_politico CASCADE;
-- DROP TABLE IF EXISTS tipo_eleccion CASCADE;
-- DROP TABLE IF EXISTS geografico CASCADE;
-- DROP TABLE IF EXISTS rol CASCADE;
-- DROP TABLE IF EXISTS persona CASCADE;
-- DROP FUNCTION IF EXISTS actualizar_fecha_modificacion CASCADE;


-- ============================================================
-- FUNCIONES Y TRIGGERS AUXILIARES
-- ============================================================

-- Función genérica para actualizar campos de auditoría
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION actualizar_fecha_modificacion() IS
    'Actualiza automáticamente el campo fecha_actualizacion al modificar un registro';


-- ============================================================
-- 1. TABLA: persona
-- ============================================================
-- Almacena información personal de los individuos registrados
-- en el sistema (operadores, supervisores, etc.)

CREATE TABLE IF NOT EXISTS persona (
    id_persona        SERIAL PRIMARY KEY,
    nombre            VARCHAR(100) NOT NULL,
    apellido_paterno  VARCHAR(100) NOT NULL,
    apellido_materno  VARCHAR(100),
    ci                VARCHAR(20)  UNIQUE NOT NULL,
    celular           INTEGER,
    email             VARCHAR(150)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_persona_ci
    ON persona(ci);
CREATE INDEX IF NOT EXISTS idx_persona_nombre
    ON persona(nombre, apellido_paterno);

-- Comentarios
COMMENT ON TABLE  persona                   IS 'Datos personales de los individuos registrados en el sistema';
COMMENT ON COLUMN persona.ci               IS 'Carnet de Identidad — único por persona';
COMMENT ON COLUMN persona.celular          IS 'Número de celular (sin guiones ni espacios)';
COMMENT ON COLUMN persona.email            IS 'Correo electrónico de contacto';


-- ============================================================
-- 2. TABLA: rol
-- ============================================================
-- Define los cinco roles del sistema con sus descripciones
-- de acceso y permisos.

CREATE TABLE IF NOT EXISTS rol (
    id_rol      SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) UNIQUE NOT NULL,
    descripcion VARCHAR(255)
);

COMMENT ON TABLE  rol             IS 'Roles del sistema con sus permisos';
COMMENT ON COLUMN rol.nombre      IS 'Nombre único del rol';
COMMENT ON COLUMN rol.descripcion IS 'Descripción del alcance y permisos del rol';

-- Datos iniciales — cinco roles del sistema
INSERT INTO rol (nombre, descripcion) VALUES
    ('Administrador del Sistema',
     'Acceso total al sistema: gestiona usuarios, configuraciones y todos los módulos'),
    ('Supervisor',
     'Puede supervisar y validar datos, acceso a reportes y control de calidad'),
    ('Operador',
     'Puede digitalizar actas y capturar datos electorales'),
    ('Jefe de Recinto',
     'Encargado de un recinto electoral completo; gestiona todas las mesas de su recinto asignado'),
    ('Delegado de Mesa',
     'Encargado de una mesa electoral específica; gestiona únicamente su mesa asignada')
ON CONFLICT (nombre) DO NOTHING;


-- ============================================================
-- 3. TABLA: geografico
-- ============================================================
-- Estructura jerárquica de divisiones geográficas mediante
-- auto-referencia (Departamento → Provincia → Municipio → …)

CREATE TABLE IF NOT EXISTS geografico (
    id_geografico    SERIAL PRIMARY KEY,
    nombre           VARCHAR(150) NOT NULL,
    codigo           VARCHAR(50),
    ubicacion        VARCHAR(200),
    tipo             VARCHAR(50),
    fk_id_geografico INTEGER REFERENCES geografico(id_geografico) ON DELETE CASCADE,
    CONSTRAINT chk_no_auto_referencia
        CHECK (id_geografico IS DISTINCT FROM fk_id_geografico)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_geografico_tipo
    ON geografico(tipo);
CREATE INDEX IF NOT EXISTS idx_geografico_padre
    ON geografico(fk_id_geografico);
CREATE INDEX IF NOT EXISTS idx_geografico_nombre
    ON geografico(nombre);

-- Comentarios
COMMENT ON TABLE  geografico                   IS 'Divisiones geográficas jerárquicas';
COMMENT ON COLUMN geografico.fk_id_geografico IS 'ID del nodo padre en la jerarquía (auto-referencia)';
COMMENT ON COLUMN geografico.tipo             IS 'Nivel: Departamento, Provincia, Municipio, Distrito, Zona, OTB, etc.';
COMMENT ON COLUMN geografico.codigo           IS 'Código geográfico oficial (ej. CB, CB-CER, CB-CER-COL)';

-- Datos iniciales — jerarquía base de Colcapirhua
INSERT INTO geografico (nombre, codigo, tipo, fk_id_geografico) VALUES
    ('Cochabamba',  'CB',         'Departamento', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO geografico (nombre, codigo, tipo, fk_id_geografico) VALUES
    ('Cercado',     'CB-CER',     'Provincia',
        (SELECT id_geografico FROM geografico WHERE nombre = 'Cochabamba' AND tipo = 'Departamento' LIMIT 1))
ON CONFLICT DO NOTHING;

INSERT INTO geografico (nombre, codigo, tipo, fk_id_geografico) VALUES
    ('Colcapirhua', 'CB-CER-COL', 'Municipio',
        (SELECT id_geografico FROM geografico WHERE nombre = 'Cercado' AND tipo = 'Provincia' LIMIT 1))
ON CONFLICT DO NOTHING;


-- ============================================================
-- 4. TABLA: tipo_eleccion
-- ============================================================
-- Catálogo de tipos de procesos electorales admitidos.

CREATE TABLE IF NOT EXISTS tipo_eleccion (
    id_tipo_eleccion SERIAL PRIMARY KEY,
    nombre           VARCHAR(150) NOT NULL,
    codigo           VARCHAR(50)  NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tipo_eleccion_codigo
    ON tipo_eleccion(codigo);

-- Comentarios
COMMENT ON TABLE  tipo_eleccion        IS 'Catálogo de tipos de procesos electorales';
COMMENT ON COLUMN tipo_eleccion.codigo IS 'Código abreviado del tipo de elección';

-- Datos iniciales
INSERT INTO tipo_eleccion (nombre, codigo) VALUES
    ('Elecciones Subnacionales', 'SUBNAC'),
    ('Elecciones Generales',     'GENERAL'),
    ('Referéndum',               'REFER')
ON CONFLICT DO NOTHING;


-- ============================================================
-- 5. TABLA: frente_politico
-- ============================================================
-- Partidos, agrupaciones y frentes políticos que participan
-- en los procesos electorales.

CREATE TABLE IF NOT EXISTS frente_politico (
    id_frente           SERIAL PRIMARY KEY,
    nombre              VARCHAR(200) UNIQUE NOT NULL,
    siglas              VARCHAR(50),
    color               VARCHAR(7)   DEFAULT '#E31E24',
    logo                VARCHAR(255),
    fecha_creacion      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_frente_nombre
    ON frente_politico(nombre);

-- Comentarios
COMMENT ON TABLE  frente_politico                        IS 'Partidos políticos y frentes electorales';
COMMENT ON COLUMN frente_politico.color                 IS 'Color representativo en formato hexadecimal (#RRGGBB)';
COMMENT ON COLUMN frente_politico.logo                  IS 'Nombre del archivo de logo almacenado en /uploads/logos/';
COMMENT ON COLUMN frente_politico.fecha_actualizacion   IS 'Actualizado automáticamente por trigger';

-- Trigger de auditoría
DROP TRIGGER IF EXISTS trigger_actualizar_frente ON frente_politico;
CREATE TRIGGER trigger_actualizar_frente
    BEFORE UPDATE ON frente_politico
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

-- Datos iniciales
INSERT INTO frente_politico (nombre, siglas, color) VALUES
    ('Movimiento al Socialismo', 'MAS-IPSP', '#0066CC'),
    ('Comunidad Ciudadana',      'CC',       '#FF6B00'),
    ('Creemos',                  'CREEMOS',  '#00A651')
ON CONFLICT (nombre) DO NOTHING;


-- ============================================================
-- 6. TABLA: recinto
-- ============================================================
-- Recintos electorales (colegios, centros de votación, etc.)
-- vinculados a una división geográfica.

CREATE TABLE IF NOT EXISTS recinto (
    id_recinto       SERIAL PRIMARY KEY,
    nombre           VARCHAR(200) NOT NULL,
    direccion        VARCHAR(300),
    id_geografico    INTEGER REFERENCES geografico(id_geografico) ON DELETE CASCADE,
    fecha_creacion   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_recinto_geografico
    ON recinto(id_geografico);
CREATE INDEX IF NOT EXISTS idx_recinto_nombre
    ON recinto(nombre);

-- Comentarios
COMMENT ON TABLE  recinto              IS 'Recintos electorales (colegios, centros de votación)';
COMMENT ON COLUMN recinto.id_geografico IS 'División geográfica donde se ubica el recinto';


-- ============================================================
-- 7. TABLA: mesa
-- ============================================================
-- Mesas electorales asociadas a un recinto y división geográfica.

CREATE TABLE IF NOT EXISTS mesa (
    id_mesa       SERIAL PRIMARY KEY,
    codigo        VARCHAR(50) UNIQUE NOT NULL,
    descripcion   VARCHAR(200),
    id_recinto    INTEGER REFERENCES recinto(id_recinto)     ON DELETE SET NULL,
    id_geografico INTEGER REFERENCES geografico(id_geografico) ON DELETE SET NULL,
    numero_mesa   INTEGER
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_mesa_codigo
    ON mesa(codigo);
CREATE INDEX IF NOT EXISTS idx_mesa_recinto
    ON mesa(id_recinto);
CREATE INDEX IF NOT EXISTS idx_mesa_geografico
    ON mesa(id_geografico);

-- Comentarios
COMMENT ON TABLE  mesa             IS 'Mesas electorales del sistema';
COMMENT ON COLUMN mesa.codigo      IS 'Código único de la mesa electoral';
COMMENT ON COLUMN mesa.numero_mesa IS 'Número de mesa dentro del recinto';


-- ============================================================
-- 8. TABLA: usuario
-- ============================================================
-- Usuarios del sistema con credenciales, rol asignado y,
-- opcionalmente, recinto o mesa específica de gestión.

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario           SERIAL PRIMARY KEY,
    nombre_usuario       VARCHAR(100) UNIQUE NOT NULL,
    contrasena           VARCHAR(255) NOT NULL,
    fecha_fin            DATE,
    token                VARCHAR(255),
    id_rol               INTEGER REFERENCES rol(id_rol)         ON DELETE SET NULL,
    id_persona           INTEGER REFERENCES persona(id_persona)  ON DELETE CASCADE NOT NULL,
    id_recinto_asignado  INTEGER REFERENCES recinto(id_recinto)  ON DELETE SET NULL,
    id_mesa_asignada     INTEGER REFERENCES mesa(id_mesa)        ON DELETE SET NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_usuario_nombre
    ON usuario(nombre_usuario);
CREATE INDEX IF NOT EXISTS idx_usuario_rol
    ON usuario(id_rol);
CREATE INDEX IF NOT EXISTS idx_usuario_activo
    ON usuario(fecha_fin) WHERE fecha_fin IS NULL;
CREATE INDEX IF NOT EXISTS idx_usuario_recinto_asignado
    ON usuario(id_recinto_asignado);
CREATE INDEX IF NOT EXISTS idx_usuario_mesa_asignada
    ON usuario(id_mesa_asignada);

-- Comentarios
COMMENT ON TABLE  usuario                        IS 'Usuarios del sistema con credenciales de acceso';
COMMENT ON COLUMN usuario.contrasena            IS 'Contraseña hasheada con bcrypt';
COMMENT ON COLUMN usuario.fecha_fin             IS 'NULL = usuario activo; con valor = usuario inactivo (soft delete)';
COMMENT ON COLUMN usuario.token                 IS 'Token de sesión o recuperación de contraseña';
COMMENT ON COLUMN usuario.id_recinto_asignado   IS 'Recinto asignado para usuarios con rol "Jefe de Recinto"';
COMMENT ON COLUMN usuario.id_mesa_asignada      IS 'Mesa asignada para usuarios con rol "Delegado de Mesa"';


-- ============================================================
-- 9. TABLA: acta
-- ============================================================
-- Actas electorales registradas por los operadores.
-- Cada acta contiene los totales de votos de una mesa.

CREATE TABLE IF NOT EXISTS acta (
    id_acta          SERIAL PRIMARY KEY,
    id_mesa          INTEGER REFERENCES mesa(id_mesa)               ON DELETE CASCADE    NOT NULL,
    id_tipo_eleccion INTEGER REFERENCES tipo_eleccion(id_tipo_eleccion) ON DELETE SET NULL,
    id_usuario       INTEGER REFERENCES usuario(id_usuario)          ON DELETE SET NULL,
    fecha_registro   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    votos_totales    INTEGER   DEFAULT 0,
    votos_validos    INTEGER   DEFAULT 0,
    votos_nulos      INTEGER   DEFAULT 0,
    votos_blancos    INTEGER   DEFAULT 0,
    observaciones    TEXT,
    estado           VARCHAR(50) DEFAULT 'registrada',
    CONSTRAINT chk_votos_positivos CHECK (
        votos_nulos   >= 0 AND
        votos_blancos >= 0 AND
        votos_validos >= 0 AND
        votos_totales >= 0
    )
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_acta_mesa
    ON acta(id_mesa);
CREATE INDEX IF NOT EXISTS idx_acta_usuario
    ON acta(id_usuario);
CREATE INDEX IF NOT EXISTS idx_acta_estado
    ON acta(estado);
CREATE INDEX IF NOT EXISTS idx_acta_fecha
    ON acta(fecha_registro);

-- Comentarios
COMMENT ON TABLE  acta          IS 'Actas electorales registradas';
COMMENT ON COLUMN acta.estado   IS 'Valores posibles: registrada, validada, rechazada, pendiente';


-- ============================================================
-- 10. TABLA: voto
-- ============================================================
-- Detalle de votos por frente político dentro de un acta.
-- Un acta puede tener múltiples registros de voto (uno por frente).

CREATE TABLE IF NOT EXISTS voto (
    id_voto        SERIAL PRIMARY KEY,
    id_acta        INTEGER REFERENCES acta(id_acta)                ON DELETE CASCADE  NOT NULL,
    id_frente      INTEGER REFERENCES frente_politico(id_frente)   ON DELETE SET NULL NOT NULL,
    cantidad       INTEGER DEFAULT 0 NOT NULL,
    tipo_cargo     VARCHAR(50),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_cantidad_positiva CHECK (cantidad >= 0)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_voto_acta
    ON voto(id_acta);
CREATE INDEX IF NOT EXISTS idx_voto_frente
    ON voto(id_frente);
CREATE INDEX IF NOT EXISTS idx_voto_cargo
    ON voto(tipo_cargo);

-- Comentarios
COMMENT ON TABLE  voto             IS 'Votos registrados por frente político en cada acta';
COMMENT ON COLUMN voto.tipo_cargo  IS 'Cargo: alcalde, concejal, etc.';
COMMENT ON COLUMN voto.cantidad    IS 'Número de votos obtenidos (≥ 0)';


-- ============================================================
-- VISTAS ÚTILES
-- ============================================================

-- Vista: resultados totales por frente político
CREATE OR REPLACE VIEW v_resultados_por_frente AS
SELECT
    fp.id_frente,
    fp.nombre      AS frente,
    fp.siglas,
    fp.color,
    v.tipo_cargo,
    SUM(v.cantidad) AS total_votos
FROM voto v
JOIN frente_politico fp ON fp.id_frente = v.id_frente
GROUP BY fp.id_frente, fp.nombre, fp.siglas, fp.color, v.tipo_cargo
ORDER BY total_votos DESC;

COMMENT ON VIEW v_resultados_por_frente IS
    'Suma de votos agrupada por frente político y tipo de cargo';

-- Vista: actas con información completa de mesa y recinto
CREATE OR REPLACE VIEW v_actas_detalle AS
SELECT
    a.id_acta,
    a.fecha_registro,
    a.estado,
    a.votos_totales,
    a.votos_validos,
    a.votos_nulos,
    a.votos_blancos,
    a.observaciones,
    m.codigo          AS mesa_codigo,
    m.numero_mesa,
    r.nombre          AS recinto,
    r.direccion       AS recinto_direccion,
    g.nombre          AS zona_geografica,
    te.nombre         AS tipo_eleccion,
    p.nombre          AS operador_nombre,
    p.apellido_paterno AS operador_apellido
FROM acta a
LEFT JOIN mesa             m  ON m.id_mesa          = a.id_mesa
LEFT JOIN recinto          r  ON r.id_recinto        = m.id_recinto
LEFT JOIN geografico       g  ON g.id_geografico     = r.id_geografico
LEFT JOIN tipo_eleccion    te ON te.id_tipo_eleccion = a.id_tipo_eleccion
LEFT JOIN usuario          u  ON u.id_usuario        = a.id_usuario
LEFT JOIN persona          p  ON p.id_persona        = u.id_persona;

COMMENT ON VIEW v_actas_detalle IS
    'Actas con datos completos de mesa, recinto, zona geográfica y operador';

-- Vista: usuarios activos con su rol y persona asignada
CREATE OR REPLACE VIEW v_usuarios_activos AS
SELECT
    u.id_usuario,
    u.nombre_usuario,
    u.fecha_fin,
    r.nombre          AS rol,
    p.nombre          AS persona_nombre,
    p.apellido_paterno,
    p.apellido_materno,
    p.ci,
    p.celular,
    p.email,
    rec.nombre        AS recinto_asignado,
    me.codigo         AS mesa_asignada
FROM usuario u
LEFT JOIN rol       r   ON r.id_rol        = u.id_rol
LEFT JOIN persona   p   ON p.id_persona    = u.id_persona
LEFT JOIN recinto   rec ON rec.id_recinto  = u.id_recinto_asignado
LEFT JOIN mesa      me  ON me.id_mesa      = u.id_mesa_asignada
WHERE u.fecha_fin IS NULL;

COMMENT ON VIEW v_usuarios_activos IS
    'Usuarios activos (sin fecha de baja) con su rol, persona y asignación';


-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================

-- Listar todas las tablas con su número de columnas
SELECT
    t.table_name                                                       AS tabla,
    (SELECT COUNT(*)
     FROM information_schema.columns c
     WHERE c.table_name = t.table_name
       AND c.table_schema = 'public')                                  AS columnas,
    obj_description(pc.oid, 'pg_class')                               AS descripcion
FROM information_schema.tables t
JOIN pg_class pc ON pc.relname = t.table_name
WHERE t.table_schema = 'public'
  AND t.table_type   = 'BASE TABLE'
ORDER BY t.table_name;


-- ============================================================
-- RESUMEN DE LA BASE DE DATOS
-- ============================================================
--
-- TABLAS (10):
--   1.  persona           — Datos personales de individuos
--   2.  rol               — Roles y permisos del sistema
--   3.  geografico        — Jerarquía geográfica (auto-referencia)
--   4.  tipo_eleccion     — Catálogo de tipos de elección
--   5.  frente_politico   — Partidos y frentes electorales
--   6.  recinto           — Recintos electorales
--   7.  mesa              — Mesas electorales
--   8.  usuario           — Usuarios del sistema
--   9.  acta              — Actas electorales
--  10.  voto              — Votos por frente en cada acta
--
-- VISTAS (3):
--   - v_resultados_por_frente  — Totales de votos por frente/cargo
--   - v_actas_detalle          — Actas con información completa
--   - v_usuarios_activos       — Usuarios activos con rol y asignación
--
-- TRIGGERS (1):
--   - trigger_actualizar_frente — Actualiza fecha_actualizacion en frente_politico
--
-- ROLES DEL SISTEMA (5):
--   - Administrador del Sistema
--   - Supervisor
--   - Operador
--   - Jefe de Recinto
--   - Delegado de Mesa
--
-- DATOS INICIALES:
--   - 5 roles
--   - 3 tipos de elección (Subnacionales, Generales, Referéndum)
--   - 3 frentes políticos (MAS-IPSP, CC, CREEMOS)
--   - 3 divisiones geográficas (Cochabamba → Cercado → Colcapirhua)
--
-- DIAGRAMA DE RELACIONES:
--   persona ──< usuario >── rol
--                  │
--        ┌─────────┴─────────┐
--        │                   │
--      recinto            mesa
--        │    └────────────┘
--      geografico
--
--   acta >── mesa
--   acta >── tipo_eleccion
--   acta >── usuario
--   voto >── acta
--   voto >── frente_politico
-- ============================================================

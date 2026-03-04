import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import usuariosRoutes from './routes/usuarios.js';
import geograficoRoutes from './routes/geografico.js';
import frentesRoutes from './routes/frentes.js';
import votosRoutes from './routes/votos.js';

dotenv.config();

// Configuración de __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// ─── CORS ────────────────────────────────────────────────────────────────────
// En producción el frontend se sirve desde el mismo servidor,
// por lo que no hay requests cross-origin. En desarrollo permitimos Vite.
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3001',
    `http://167.114.113.202:3001`,
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Permitir requests sin origin (Postman, server-to-server) y orígenes en lista
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS bloqueado para origin: ${origin}`));
        }
    },
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── ARCHIVOS ESTÁTICOS ───────────────────────────────────────────────────────
// Subidas (logos, actas)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// En producción sirve el build del frontend (dist/) generado por Vite
if (isProduction) {
    const distPath = path.join(__dirname, '..', 'dist');
    app.use(express.static(distPath));
}

// ─── RUTAS API ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/geografico', geograficoRoutes);
app.use('/api/frentes', frentesRoutes);
app.use('/api/votos', votosRoutes);

// Ruta de prueba / health-check
app.get('/api/ping', (req, res) => {
    res.json({ message: '🏓 Pong! Backend funcionando correctamente', env: process.env.NODE_ENV });
});

// ─── SPA FALLBACK ─────────────────────────────────────────────────────────────
// Todas las rutas no-API devuelven index.html para que React Router funcione
if (isProduction) {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
    });
}

// ─── MANEJO DE ERRORES ────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: err.message,
    });
});

// ─── INICIAR SERVIDOR ─────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
    console.log(`🌐 Modo: ${process.env.NODE_ENV || 'development'}`);
    console.log(`\n📋 Rutas disponibles:`);
    console.log(`   GET  /api/ping`);
    console.log(`   POST /api/auth/login`);
    console.log(`   GET  /api/usuarios`);
    if (isProduction) {
        console.log(`\n📦 Sirviendo frontend desde: dist/`);
    }
});

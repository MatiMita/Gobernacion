import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart3,
    Users,
    FileText,
    RefreshCw,
    Trophy,
    Medal,
    ArrowLeft,
    Award,
    Users2,
    Building2,
    AlertCircle,
    Zap,
    Star,
    Crown
} from 'lucide-react';

/* ─── Animaciones globales inyectadas una sola vez ─── */
const STYLE = `
@keyframes rise    { from { width: 0; opacity:0; } to { opacity:1; } }
@keyframes riseUp  { from { height: 0; opacity:0; } to { opacity:1; } }
@keyframes float   { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-7px); } }
@keyframes shimmer { 0%{ background-position:-200% center; } 100%{ background-position:200% center; } }
@keyframes slideInUp { from{ opacity:0; transform:translateY(24px); } to{ opacity:1; transform:translateY(0); } }
@keyframes glow-blue {
  0%,100% { box-shadow: 0 0 16px rgba(30,58,138,.2); }
  50%      { box-shadow: 0 0 32px rgba(30,58,138,.5), 0 0 56px rgba(30,58,138,.15); }
}
@keyframes glow-gold {
  0%,100% { box-shadow: 0 0 14px rgba(245,158,11,.25); }
  50%      { box-shadow: 0 0 28px rgba(245,158,11,.6), 0 0 44px rgba(245,158,11,.2); }
}
@keyframes bounce-dot { 0%,100%{ transform:translateY(0) scale(1); } 40%{ transform:translateY(-5px) scale(1.2); } }
@keyframes spin-slow  { to { transform: rotate(360deg); } }
@keyframes pop-in     { 0%{ transform:scale(0); opacity:0; } 80%{ transform:scale(1.1); } 100%{ transform:scale(1); opacity:1; } }
@keyframes pulse-bar  { 0%,100%{ opacity:1; } 50%{ opacity:.75; } }
@keyframes tada {
  0%,100% { transform:scale(1) rotate(0); }
  15%     { transform:scale(1.12) rotate(-4deg); }
  30%     { transform:scale(1.12) rotate(4deg); }
  45%     { transform:scale(1.12) rotate(-3deg); }
  60%     { transform:scale(1.12) rotate(3deg); }
  75%     { transform:scale(1.06) rotate(-1deg); }
}
.bar-animate    { animation: rise .85s cubic-bezier(.22,1,.36,1) forwards; }
.bar-up         { animation: riseUp 1.1s cubic-bezier(.22,1,.36,1) forwards; }
.float-anim     { animation: float 3s ease-in-out infinite; }
.glow-winner    { animation: glow-blue 2.5s ease-in-out infinite; }
.glow-gold-anim { animation: glow-gold 2.5s ease-in-out infinite; }
.pulse-bar-win  { animation: pulse-bar 2s ease-in-out infinite; }
.tada-anim      { animation: tada 1.2s ease .4s both; }
.shimmer-blue {
  background: linear-gradient(90deg,#1E3A8A 0%,#60a5fa 40%,#1E3A8A 60%,#60a5fa 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 3s linear infinite;
}
.bounce-dot { animation: bounce-dot 1.2s ease-in-out infinite; }
.spin-slow  { animation: spin-slow 10s linear infinite; }
.pop-in     { animation: pop-in .45s cubic-bezier(.36,1.56,.64,1) forwards; }
/* Scrollbar del gráfico de comparativa */
.chart-scroll::-webkit-scrollbar        { height: 6px; }
.chart-scroll::-webkit-scrollbar-track  { background: #f1f5f9; border-radius: 9999px; }
.chart-scroll::-webkit-scrollbar-thumb  { background: #cbd5e1; border-radius: 9999px; }
.chart-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;

const ResultadosEnVivo = () => {
    const navigate = useNavigate();
    const [resultados, setResultados] = useState([]);
    const [cargos, setCargos] = useState({
        gobernador: [],
        asambleistaTerritorio: [],
        asambleistaPoblacion: []
    });
    const [resumen, setResumen] = useState({
        totalActas: 0,
        totalVotos: 0,
        actasValidadas: 0,
        votosNulos: 0,
        votosBlancos: 0,
        totalesPorCargo: {
            gobernador: 0,
            asambleistaTerritorio: 0,
            asambleistaPoblacion: 0
        }
    });
    const [cargoActivo, setCargoActivo] = useState('gobernador');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
    const [animKey, setAnimKey] = useState(0);   // fuerza re-animación al cambiar cargo
    const [donutReady, setDonutReady] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;

    const cargarResultados = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`${API_URL}/votos/resultados-vivo`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.success && data.data) {
                // Asegurar que resultados sea un array
                const resultadosArray = Array.isArray(data.data.resultados) ? data.data.resultados : [];
                setResultados(resultadosArray);
                
                // Separar resultados por tipo de cargo con valores por defecto
                const gobernador = resultadosArray.map(frente => ({
                    ...frente,
                    id_frente: frente.id_frente || 0,
                    nombre: frente.nombre || 'Sin nombre',
                    siglas: frente.siglas || 'S/N',
                    color: frente.color || '#1E3A8A',
                    votos: Number(frente.votos_gobernador) || 0
                })).sort((a, b) => b.votos - a.votos);

                const asambleistaTerritorio = resultadosArray.map(frente => ({
                    ...frente,
                    id_frente: frente.id_frente || 0,
                    nombre: frente.nombre || 'Sin nombre',
                    siglas: frente.siglas || 'S/N',
                    color: frente.color || '#1E3A8A',
                    votos: Number(frente.votos_asambleista_territorio) || 0
                })).sort((a, b) => b.votos - a.votos);

                const asambleistaPoblacion = resultadosArray.map(frente => ({
                    ...frente,
                    id_frente: frente.id_frente || 0,
                    nombre: frente.nombre || 'Sin nombre',
                    siglas: frente.siglas || 'S/N',
                    color: frente.color || '#1E3A8A',
                    votos: Number(frente.votos_asambleista_poblacion) || 0
                })).sort((a, b) => b.votos - a.votos);

                setCargos({
                    gobernador,
                    asambleistaTerritorio,
                    asambleistaPoblacion
                });
                
                // Establecer resumen con valores por defecto
                const resumenData = data.data.resumen || {};
                setResumen({
                    totalActas: Number(resumenData.totalActas) || 0,
                    totalVotos: Number(resumenData.totalVotos) || 0,
                    actasValidadas: Number(resumenData.actasValidadas) || 0,
                    votosNulos: Number(resumenData.votosNulos) || 0,
                    votosBlancos: Number(resumenData.votosBlancos) || 0,
                    totalesPorCargo: {
                        gobernador: Number(resumenData.totalesPorCargo?.gobernador) || 0,
                        asambleistaTerritorio: Number(resumenData.totalesPorCargo?.asambleistaTerritorio) || 0,
                        asambleistaPoblacion: Number(resumenData.totalesPorCargo?.asambleistaPoblacion) || 0
                    }
                });
                
                setUltimaActualizacion(new Date());
            } else {
                throw new Error('Estructura de datos incorrecta');
            }
        } catch (error) {
            console.error('Error al cargar resultados:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarResultados();
        const interval = setInterval(cargarResultados, 30000);
        return () => clearInterval(interval);
    }, []);

    /* Fuerza re-animación de barras y donut cuando cambia el cargo */
    const cambiarCargo = (cargo) => {
        setCargoActivo(cargo);
        setDonutReady(false);
        setAnimKey(k => k + 1);
    };

    useEffect(() => {
        setDonutReady(false);
        const t = setTimeout(() => setDonutReady(true), 180);
        return () => clearTimeout(t);
    }, [animKey]);

    const calcularPorcentaje = (votos, total) => {
        if (!total || total === 0) return '0.00';
        return ((votos / total) * 100).toFixed(2);
    };

    const getResultadosActivos = () => {
        if (!cargos || !cargos[cargoActivo]) return [];
        return cargos[cargoActivo].filter(frente => frente && frente.votos > 0);
    };

    const getTotalVotosActivos = () => {
        const resultadosActivos = getResultadosActivos();
        return resultadosActivos.reduce((sum, r) => sum + (r.votos || 0), 0);
    };

    const getMaxVotosActivos = () => {
        const resultadosActivos = getResultadosActivos();
        return Math.max(...resultadosActivos.map(r => r.votos || 0), 1);
    };

    const getTituloCargo = () => {
        switch(cargoActivo) {
            case 'gobernador':
                return 'Votos para Gobernador(a)';
            case 'asambleistaTerritorio':
                return 'Votos para Asambleista por Territorio';
            case 'asambleistaPoblacion':
                return 'Votos para Asambleista por Población';
            default:
                return '';
        }
    };

    const getColorCargo = () => {
        switch(cargoActivo) {
            case 'gobernador':
                return '#1E3A8A';
            case 'asambleistaTerritorio':
                return '#F59E0B';
            case 'asambleistaPoblacion':
                return '#10B981';
            default:
                return '#1E3A8A';
        }
    };

    /* ─── Helpers de medallas ─── */
    const getMedalla = (i) => {
        if (i === 0) return { icon: <Crown  className="w-5 h-5" />, color: '#F59E0B', label: '1°' };
        if (i === 1) return { icon: <Medal  className="w-5 h-5" />, color: '#94A3B8', label: '2°' };
        if (i === 2) return { icon: <Trophy className="w-5 h-5" />, color: '#CD7F32', label: '3°' };
        return { icon: null, color: '#6B7280', label: `${i + 1}°` };
    };

    const CARGO_CONFIG = {
        gobernador:            { label: 'Gobernador(a)',              icon: <Award     className="w-5 h-5" />, accent: '#1E3A8A', grad: 'from-[#1E3A8A] to-[#3b5fc0]' },
        asambleistaTerritorio: { label: 'Asambleísta por Territorio', icon: <Building2 className="w-5 h-5" />, accent: '#F59E0B', grad: 'from-[#d97706] to-[#F59E0B]' },
        asambleistaPoblacion:  { label: 'Asambleísta por Población',  icon: <Users2    className="w-5 h-5" />, accent: '#10B981', grad: 'from-[#059669] to-[#34d399]' },
    };

    /* ─── Error state ─── */
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
                <div className="bg-white border border-red-200 rounded-3xl p-10 text-center max-w-lg shadow-xl">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-black text-red-700 mb-2">Error al cargar los datos</h2>
                    <p className="text-red-500 mb-6">{error}</p>
                    <button onClick={cargarResultados}
                        className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg">
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    /* ─── Main render ─── */
    const activos       = getResultadosActivos();
    const totalActivo   = getTotalVotosActivos();
    const maxVotos      = getMaxVotosActivos();
    const cfg           = CARGO_CONFIG[cargoActivo];

    return (
        <>
            {/* Inyectar animaciones globales */}
            <style>{STYLE}</style>

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100" style={{ fontFamily: 'system-ui, sans-serif' }}>

                {/* ══════════════ HERO HEADER ══════════════ */}
                <div className="bg-gradient-to-r from-[#1E3A8A] to-[#1d4ed8] relative overflow-hidden">
                    {/* Círculos decorativos animados */}
                    <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 spin-slow" />
                    <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5 float-anim" />
                    <div className="absolute top-4 right-1/3 w-3 h-3 rounded-full bg-[#F59E0B]/60 bounce-dot" style={{ animationDelay: '0s' }} />
                    <div className="absolute top-8 right-1/4 w-2 h-2 rounded-full bg-white/40 bounce-dot" style={{ animationDelay: '.3s' }} />
                    <div className="absolute bottom-4 right-1/2 w-2 h-2 rounded-full bg-[#F59E0B]/50 bounce-dot" style={{ animationDelay: '.6s' }} />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            {/* Izquierda */}
                            <div className="flex items-center gap-4">
                                <button onClick={() => navigate('/')}
                                    className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition backdrop-blur">
                                    <ArrowLeft className="w-5 h-5 text-white" />
                                </button>

                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur float-anim">
                                    <BarChart3 className="w-10 h-10 text-white" />
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        {/* Indicador LIVE */}
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400" />
                                        </span>
                                        <span className="text-white/80 text-xs font-bold uppercase tracking-widest">En Vivo</span>
                                    </div>
                                <h1 className="text-2xl md:text-4xl font-black leading-tight shimmer-blue">
                                        Resultados en Vivo
                                    </h1>
                                    <p className="text-white/80 text-sm mt-1">
                                        Elecciones Subnacionales 2026 · Cochabamba
                                    </p>
                                </div>
                            </div>

                            {/* Stats rápidos */}
                            <div className="flex gap-4 flex-wrap">
                                {[
                                    { label: 'Actas',  value: resumen.totalActas,                  icon: <FileText className="w-4 h-4" /> },
                                    { label: 'Votos',  value: resumen.totalVotos.toLocaleString(),  icon: <Users    className="w-4 h-4" /> },
                                ].map(s => (
                                    <div key={s.label} className="bg-white/15 backdrop-blur rounded-2xl px-5 py-3 text-center border border-white/20">
                                        <div className="flex items-center justify-center gap-1 text-white/70 text-xs mb-1">
                                            {s.icon} {s.label}
                                        </div>
                                        <p className="text-2xl font-black text-white">{s.value}</p>
                                    </div>
                                ))}

                                <button onClick={cargarResultados} disabled={loading}
                                    className="flex items-center gap-2 bg-[#F59E0B] hover:bg-[#e08c08] text-white px-5 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg">
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    Actualizar
                                </button>
                            </div>
                        </div>

                        {ultimaActualizacion && (
                            <p className="mt-4 text-white/60 text-xs flex items-center gap-2">
                                <Zap className="w-3 h-3 text-green-400" />
                                Actualizado: {ultimaActualizacion.toLocaleTimeString()} · se actualiza cada 30 s
                            </p>
                        )}
                    </div>
                </div>

                {/* ══════════════ SELECTOR DE CARGOS ══════════════ */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 sm:mt-8">
                    <div className="bg-white rounded-2xl shadow-md border border-blue-100 p-4">
                        <div className="flex flex-wrap gap-3 justify-center">
                            {Object.entries(CARGO_CONFIG).map(([key, c]) => {
                                const isActive = cargoActivo === key;
                                return (
                                    <button key={key}
                                        onClick={() => cambiarCargo(key)}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300
                                            ${isActive
                                                ? 'text-white shadow-lg scale-105'
                                                : 'bg-slate-100 text-gray-600 hover:bg-blue-50 hover:text-[#1E3A8A]'
                                            }`}
                                        style={isActive ? { background: `linear-gradient(135deg, ${c.accent}, ${c.accent}cc)` } : {}}
                                    >
                                        {c.icon}
                                        {c.label}
                                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                                            isActive ? 'bg-white/25 text-white' : 'bg-white text-gray-500'
                                        }`}>
                                            {resumen.totalesPorCargo[key]?.toLocaleString() ?? 0}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ══════════════ CONTENIDO PRINCIPAL ══════════════ */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <RefreshCw className="w-14 h-14 animate-spin text-[#1E3A8A]" />
                            <p className="text-gray-500 text-lg">Cargando resultados...</p>
                        </div>
                    ) : activos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <FileText className="w-16 h-16 text-gray-300" />
                            <p className="text-gray-500 text-lg">Sin datos para este cargo</p>
                            <p className="text-gray-400 text-sm">Los resultados aparecerán al procesar las primeras actas</p>
                        </div>
                    ) : (
                        <>
                            {/* ── TÍTULO CARGO ── */}
                            <div className="text-center" style={{ animation: 'slideInUp .4s ease both' }}>
                                <h2 className="text-2xl md:text-3xl font-black text-[#1E3A8A] mb-1 flex items-center justify-center gap-3">
                                    <Trophy className="w-7 h-7 text-[#F59E0B] tada-anim" />
                                    {cfg.label}
                                    <Trophy className="w-7 h-7 text-[#F59E0B] tada-anim" style={{ animationDelay: '.6s' }} />
                                </h2>
                                <p className="text-gray-400 text-sm">{totalActivo.toLocaleString()} votos computados</p>
                            </div>

                            {/* ── GRÁFICO DE COLUMNAS VERTICALES — todos los partidos ── */}
                            <div className="bg-white rounded-3xl shadow-lg border border-blue-100 p-6 md:p-8"
                                key={`cols-${animKey}`}>
                                <h3 className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest mb-8 flex items-center justify-center gap-3">
                                    <span className="h-px flex-1 bg-blue-100" />
                                    <span className="flex items-center gap-1.5">
                                        <BarChart3 className="w-4 h-4 text-[#1E3A8A]" /> Comparativa de Partidos
                                    </span>
                                    <span className="h-px flex-1 bg-blue-100" />
                                </h3>

                                {/* Área del gráfico con scroll horizontal cuando hay muchos partidos */}
                                <div
                                    className="overflow-x-auto pb-2 chart-scroll"
                                    style={{ WebkitOverflowScrolling: 'touch' }}
                                >
                                    {/* Indicador de scroll: solo visible cuando desborda */}
                                    {activos.length > 8 && (
                                        <p className="text-[10px] text-gray-400 text-right mb-1 flex items-center justify-end gap-1 select-none">
                                            <span>←</span> desliza para ver todos <span>→</span>
                                        </p>
                                    )}

                                    {/* Contenedor interno con ancho mínimo garantizado */}
                                    <div
                                        className="relative"
                                        style={{
                                            paddingLeft: '36px',
                                            paddingBottom: '88px',
                                            /* 64px por columna + 14px gap + margen izquierdo */
                                            minWidth: `${activos.length * 82 + 60}px`,
                                        }}
                                    >
                                        {/* Grid lines absolutas — se extienden al ancho completo */}
                                        <div className="absolute left-9 right-0 top-0" style={{ height: '200px' }}>
                                            {[0, 25, 50, 75, 100].map(v => (
                                                <div key={v} className="absolute w-full flex items-center"
                                                    style={{ bottom: `${v * 2}px` }}>
                                                    <span className="absolute -left-9 text-[9px] text-gray-300 font-semibold w-8 text-right">{v}%</span>
                                                    <div className="w-full border-t border-dashed border-slate-100" />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Columnas — ancho fijo, centradas; scroll toma el control cuando desbordan */}
                                        <div className="flex items-end justify-center gap-3.5" style={{ height: '200px' }}>
                                            {activos.map((frente, index) => {
                                                const votos   = frente.votos || 0;
                                                const pct     = parseFloat(calcularPorcentaje(votos, totalActivo));
                                                const barH    = maxVotos > 0 ? (votos / maxVotos) * 200 : 0;
                                                const color   = frente.color || cfg.accent;
                                                const isFirst = index === 0;
                                                const med     = getMedalla(index);
                                                const colW    = 64; /* ancho fijo — el scroll se encarga del resto */

                                                return (
                                                    <div key={frente.id_frente}
                                                        className="relative flex flex-col items-center justify-end h-full flex-shrink-0"
                                                        style={{ width: `${colW}px`, animation: `slideInUp .35s ease ${index * .06}s both` }}
                                                    >
                                                        {/* Porcentaje encima */}
                                                        <div className="absolute whitespace-nowrap text-center"
                                                            style={{ bottom: `${barH + 6}px`, animation: `slideInUp .4s ease ${index * .07 + .15}s both`, opacity: 0 }}>
                                                            <span className="text-[10px] font-black" style={{ color }}>{pct}%</span>
                                                        </div>

                                                        {/* Columna animada */}
                                                        <div className="relative w-full rounded-t-xl overflow-hidden"
                                                            style={{
                                                                height: `${barH}px`,
                                                                minHeight: votos > 0 ? '4px' : '0',
                                                                background: `linear-gradient(to top, ${color}, ${color}aa)`,
                                                                animation: `riseUp ${0.75 + index * 0.07}s cubic-bezier(.22,1,.36,1) ${index * 0.06}s both`,
                                                                boxShadow: isFirst ? `0 -4px 18px ${color}55` : 'none',
                                                            }}
                                                        >
                                                            {isFirst && <div className="absolute inset-0 rounded-t-xl glow-winner opacity-50" />}
                                                        </div>

                                                        {/* Etiqueta inferior */}
                                                        <div className="absolute flex flex-col items-center gap-1"
                                                            style={{ bottom: '-84px', left: '50%', transform: 'translateX(-50%)', width: `${colW + 12}px` }}>
                                                            {index < 3 && (
                                                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white font-black pop-in flex-shrink-0 shadow-md"
                                                                    style={{ fontSize: '8px', backgroundColor: med.color, animationDelay: `${index * .08}s` }}>
                                                                    {med.label}
                                                                </div>
                                                            )}
                                                            {/* Badge con color del partido */}
                                                            <div
                                                                className="px-1.5 py-0.5 rounded-lg text-center w-full"
                                                                style={{
                                                                    backgroundColor: `${color}18`,
                                                                    border: `1.5px solid ${color}55`,
                                                                }}
                                                            >
                                                                <span
                                                                    className="text-[11px] font-black leading-tight block"
                                                                    style={{ color, overflowWrap: 'break-word', wordBreak: 'break-all' }}
                                                                >{frente.siglas}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── BARRAS HORIZONTALES — arriba, grosor adaptable ── */}
                            <div className="bg-white rounded-3xl shadow-lg border border-blue-100 p-6 md:p-8"
                                key={`bars-${animKey}`}>
                                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-5 flex items-center gap-2">
                                    <span className="h-px flex-1 bg-blue-100" />
                                    Distribución de Votos
                                    <span className="h-px flex-1 bg-blue-100" />
                                </h3>
                                <div className="space-y-2.5">
                                    {activos.map((frente, index) => {
                                        const votos   = frente.votos || 0;
                                        const pct     = parseFloat(calcularPorcentaje(votos, totalActivo));
                                        const barW    = maxVotos > 0 ? (votos / maxVotos) * 100 : 0;
                                        const med     = getMedalla(index);
                                        const color   = frente.color || cfg.accent;
                                        const isFirst = index === 0;
                                        /* Grosor adaptable: más partidos → barra más delgada */
                                        const barH    = Math.max(22, Math.min(50, Math.floor(260 / Math.max(activos.length, 1))));

                                        return (
                                            <div key={frente.id_frente}
                                                style={{ animation: `slideInUp .35s ease ${index * .06}s both` }}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-white flex-shrink-0 pop-in"
                                                            style={{ backgroundColor: med.color, animationDelay: `${index * .07}s` }}>
                                                            {med.label}
                                                        </div>
                                                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                                                        <span className={`font-bold text-sm truncate max-w-[120px] md:max-w-none ${isFirst ? 'text-[#1E3A8A]' : 'text-gray-600'}`}>
                                                            {frente.siglas}
                                                        </span>
                                                        <span className="text-gray-300 text-xs hidden md:inline truncate max-w-[160px]">{frente.nombre}</span>
                                                        {isFirst && (
                                                            <span className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white flex-shrink-0"
                                                                style={{ background: '#F59E0B' }}>
                                                                <Crown className="w-2.5 h-2.5" /> LÍDER
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-right flex-shrink-0 ml-3">
                                                        <span className="font-black text-base" style={{ color }}>{pct}%</span>
                                                        <span className="text-gray-400 text-xs ml-1.5">{votos.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="relative bg-slate-100 rounded-full overflow-hidden border border-slate-200"
                                                    style={{ height: `${barH}px` }}>
                                                    <div className={`bar-animate absolute left-0 top-0 bottom-0 rounded-full flex items-center justify-end pr-3 ${isFirst ? 'pulse-bar-win' : ''}`}
                                                        style={{
                                                            width: `${barW}%`,
                                                            background: isFirst
                                                                ? `linear-gradient(90deg, ${color}99, ${color})`
                                                                : `linear-gradient(90deg, ${color}55, ${color}bb)`,
                                                            animationDuration: `${0.75 + index * 0.07}s`,
                                                            animationDelay: `${index * 0.07}s`,
                                                            boxShadow: isFirst ? `0 0 14px ${color}55` : 'none',
                                                            minWidth: votos > 0 ? '28px' : '0'
                                                        }}>
                                                        {barW > 14 && (
                                                            <span className="text-white text-xs font-bold drop-shadow">{votos.toLocaleString()}</span>
                                                        )}
                                                    </div>
                                                    {barW > 0 && barW <= 14 && (
                                                        <span className="absolute top-1/2 -translate-y-1/2 text-gray-500 text-xs"
                                                            style={{ left: `calc(${barW}% + 6px)` }}>
                                                            {votos.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ── TORTA SVG + TARJETAS en dos columnas ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {/* Donut chart */}
                                <div className="bg-white rounded-3xl shadow-lg border border-blue-100 p-6 flex flex-col items-center"
                                    key={`donut-${animKey}`}>
                                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 w-full">
                                        <span className="h-px flex-1 bg-blue-100" />
                                        Gráfico de Torta
                                        <span className="h-px flex-1 bg-blue-100" />
                                    </h3>
                                    {(() => {
                                        const R = 80;
                                        const C = 2 * Math.PI * R;
                                        let cum = 0;
                                        return (
                                            <div className="relative">
                                                <svg viewBox="0 0 220 220" width="220" height="220"
                                                    style={{ transform: 'rotate(-90deg)' }}>
                                                    {/* Track gris */}
                                                    <circle cx="110" cy="110" r={R}
                                                        fill="none" stroke="#f1f5f9" strokeWidth="38" />
                                                    {activos.map((frente, i) => {
                                                        const votos = frente.votos || 0;
                                                        const frac  = totalActivo > 0 ? votos / totalActivo : 0;
                                                        const dash  = donutReady ? frac * C : 0;
                                                        const offset = -(cum * C);
                                                        cum += frac;
                                                        const color = frente.color || cfg.accent;
                                                        return (
                                                            <circle key={i}
                                                                cx="110" cy="110" r={R}
                                                                fill="none"
                                                                stroke={color}
                                                                strokeWidth="38"
                                                                strokeDasharray={`${dash} ${C}`}
                                                                strokeDashoffset={offset}
                                                                style={{ transition: `stroke-dasharray ${0.7 + i * 0.12}s cubic-bezier(.22,1,.36,1) ${i * 0.07}s`, filter: i === 0 ? `drop-shadow(0 0 6px ${color}88)` : 'none' }}
                                                            />
                                                        );
                                                    })}
                                                </svg>
                                                {/* Texto central */}
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <p className="text-xs text-gray-400 font-semibold">Total</p>
                                                    <p className="text-lg font-black text-[#1E3A8A]">{totalActivo.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-400">votos</p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                    {/* Leyenda */}
                                    <div className="mt-4 w-full grid grid-cols-2 gap-x-4 gap-y-1.5">
                                        {activos.map((frente, i) => {
                                            const votos = frente.votos || 0;
                                            const pct   = calcularPorcentaje(votos, totalActivo);
                                            const color = frente.color || cfg.accent;
                                            return (
                                                <div key={i} className="flex items-center gap-1.5"
                                                    style={{ animation: `slideInUp .3s ease ${i * .05}s both` }}>
                                                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                                                    <span className="font-bold text-gray-600 text-xs truncate flex-1">{frente.siglas}</span>
                                                    <span className="font-black text-xs flex-shrink-0" style={{ color }}>{pct}%</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Tarjetas */}
                                <div className="grid grid-cols-2 gap-3 content-start">
                                    {activos.map((frente, index) => {
                                        const votos   = frente.votos || 0;
                                        const pct     = calcularPorcentaje(votos, totalActivo);
                                        const med     = getMedalla(index);
                                        const color   = frente.color || cfg.accent;
                                        const isFirst = index === 0;
                                        return (
                                            <div key={frente.id_frente}
                                                className="relative bg-white rounded-2xl border shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300 overflow-hidden"
                                                style={{
                                                    borderColor: isFirst ? `${color}55` : '#e2e8f0',
                                                    boxShadow: isFirst ? `0 6px 24px ${color}20` : undefined,
                                                    animation: `slideInUp .4s ease ${index * .06}s both`
                                                }}>
                                                {/* Franja top */}
                                                <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }} />
                                                <div className="p-3">
                                                    <div className="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow-lg font-black text-xs text-white pop-in"
                                                        style={{ background: med.color, animationDelay: `${index * .08}s` }}>
                                                        {med.label}
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-md"
                                                            style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
                                                            {frente.siglas?.slice(0,2) || index + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-black text-[#1E3A8A] text-xs truncate">{frente.siglas}</p>
                                                            <p className="text-gray-400 text-[10px] truncate">{frente.nombre}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-end justify-between">
                                                        <div>
                                                            <p className="text-xl font-black leading-none" style={{ color }}>{pct}%</p>
                                                            <p className="text-gray-400 text-[10px] mt-0.5">{votos.toLocaleString()} votos</p>
                                                        </div>
                                                        {isFirst && <Crown className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B] float-anim" />}
                                                    </div>
                                                    <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                                        <div className="h-full rounded-full bar-animate"
                                                            style={{
                                                                width: `${(votos / maxVotos) * 100}%`,
                                                                background: `linear-gradient(90deg, ${color}88, ${color})`,
                                                                animationDuration: `${0.7 + index * 0.1}s`
                                                            }} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ── PODIO TOP 3 — al final ── */}
                            {activos.length >= 2 && (
                                <div className="bg-white rounded-3xl shadow-lg border border-blue-100 p-8">
                                    <h3 className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest mb-8 flex items-center justify-center gap-3">
                                        <span className="h-px flex-1 bg-blue-100" />
                                        <span className="flex items-center gap-1.5">
                                            <Trophy className="w-4 h-4 text-[#F59E0B]" /> Podio de Líderes <Trophy className="w-4 h-4 text-[#F59E0B]" />
                                        </span>
                                        <span className="h-px flex-1 bg-blue-100" />
                                    </h3>
                                    <div className="flex items-end justify-center gap-4 md:gap-10">
                                        {[activos[1], activos[0], activos[2]].filter(Boolean).map((frente, vi) => {
                                            const realIdx = activos.indexOf(frente);
                                            const med     = getMedalla(realIdx);
                                            const heights = ['155px','205px','125px'];
                                            const votos   = frente.votos || 0;
                                            const pct     = calcularPorcentaje(votos, totalActivo);
                                            const color   = frente.color || cfg.accent;
                                            return (
                                                <div key={frente.id_frente}
                                                    className="flex flex-col items-center gap-2 flex-1 max-w-[190px]"
                                                    style={{ animation: `slideInUp .55s ease ${vi * .15}s both` }}>
                                                    {realIdx === 0 && (
                                                        <div className="float-anim"><Star className="w-9 h-9 text-[#F59E0B] fill-[#F59E0B]" /></div>
                                                    )}
                                                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shadow-xl text-white pop-in"
                                                        style={{ backgroundColor: med.color, animationDelay: `${vi * .2}s` }}>
                                                        {med.label}
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-black text-[#1E3A8A] text-sm">{frente.siglas}</p>
                                                        <p className="text-gray-400 text-xs line-clamp-1">{frente.nombre}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-2xl font-black" style={{ color }}>{pct}%</p>
                                                        <p className="text-gray-400 text-xs">{votos.toLocaleString()} votos</p>
                                                    </div>
                                                    <div className="w-full rounded-t-2xl relative overflow-hidden"
                                                        style={{ height: heights[vi], background: '#f1f5f9', border: `2px solid ${color}33` }}>
                                                        <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl"
                                                            style={{
                                                                background: `linear-gradient(to top, ${color}, ${color}99)`,
                                                                height: '100%',
                                                                animation: `riseUp 1.1s cubic-bezier(.22,1,.36,1) ${vi * .18}s both`
                                                            }} />
                                                        {realIdx === 0 && <div className="absolute inset-0 rounded-t-2xl glow-winner" />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ── VOTOS NULOS Y BLANCOS ── */}
                            {(resumen.votosNulos > 0 || resumen.votosBlancos > 0) && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
                                        <p className="text-red-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-red-500 rounded-full bounce-dot" /> Votos Nulos
                                        </p>
                                        <p className="text-3xl font-black text-red-600">{resumen.votosNulos.toLocaleString()}</p>
                                        <p className="text-red-400 text-xs mt-1">{calcularPorcentaje(resumen.votosNulos, resumen.totalVotos)}% del total</p>
                                    </div>
                                    <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
                                        <p className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-[#F59E0B] rounded-full bounce-dot" style={{ animationDelay: '.3s' }} /> Votos Blancos
                                        </p>
                                        <p className="text-3xl font-black text-amber-600">{resumen.votosBlancos.toLocaleString()}</p>
                                        <p className="text-amber-400 text-xs mt-1">{calcularPorcentaje(resumen.votosBlancos, resumen.totalVotos)}% del total</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center py-6 text-gray-400 text-xs border-t border-blue-100">
                    Sistema de Cómputo Electoral · Gobernación de Cochabamba · {new Date().getFullYear()}
                </div>
            </div>
        </>
    );
};

export default ResultadosEnVivo;
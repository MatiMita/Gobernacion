import React, { useEffect, useState } from 'react';
import { BarChart3, Grid3x3, FileText, MapPin, TrendingUp, Activity, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const DashboardRecinto = () => {
  const [loading, setLoading] = useState(true);
  const [loadingMesas, setLoadingMesas] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    total_mesas: 0,
    mesas_con_actas: 0,
    total_votos: 0,
    actas_pendientes: 0,
    porcentaje_avance: 0
  });
  const [recintoInfo, setRecintoInfo] = useState(null);
  const [mesaInfo, setMesaInfo] = useState(null);
  const [mesasDetalle, setMesasDetalle] = useState([]);
  const [mesaExpandida, setMesaExpandida] = useState(null);

  const user = JSON.parse(localStorage.getItem('usuario')) || {};
  const esJefeRecinto = user.rol === 'Jefe de Recinto';
  const esDelegadoMesa = user.rol === 'Delegado de Mesa';

  useEffect(() => {
    cargarEstadisticas();
    if (esJefeRecinto) {
      cargarMesasDetalle();
    }
  }, []);

  const cargarMesasDetalle = async () => {
    try {
      setLoadingMesas(true);
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/votos/mesas-detalle`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setMesasDetalle(data.data);
      }
    } catch (error) {
      console.error('Error al cargar detalle de mesas:', error);
    } finally {
      setLoadingMesas(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');

      // Cargar mesas según el rol
      const mesasResponse = await fetch(`${API_URL}/votos/mesas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const mesasData = await mesasResponse.json();

      // Cargar actas (votos)
      const votosResponse = await fetch(`${API_URL}/votos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const votosData = await votosResponse.json();

      if (mesasData.success && votosData.success) {
        const mesas = mesasData.data;
        const actas = votosData.data;

        const totalMesas = mesas.length;
        const mesasConActas = mesas.filter(m => m.actas_registradas > 0).length;
        const totalVotos = actas.reduce((sum, a) => sum + (a.votos_totales || 0), 0);
        const actasPendientes = totalMesas - mesasConActas;
        const porcentajeAvance = totalMesas > 0 ? Math.round((mesasConActas / totalMesas) * 100) : 0;

        setEstadisticas({
          total_mesas: totalMesas,
          mesas_con_actas: mesasConActas,
          total_votos: totalVotos,
          actas_pendientes: actasPendientes,
          porcentaje_avance: porcentajeAvance
        });

        // Guardar info del recinto/mesa
        if (esJefeRecinto && mesas.length > 0) {
          setRecintoInfo({
            nombre: mesas[0].nombre_recinto,
            total_mesas: totalMesas
          });
        } else if (esDelegadoMesa && mesas.length > 0) {
          setMesaInfo({
            codigo: mesas[0].codigo,
            recinto: mesas[0].nombre_recinto
          });
        }
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#1E3A8A] to-[#152a63] rounded-2xl flex items-center justify-center shadow-lg">
            {esJefeRecinto ? <MapPin className="w-8 h-8 text-white" /> : <Grid3x3 className="w-8 h-8 text-white" />}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              {esJefeRecinto ? 'Panel de Recinto' : 'Panel de Mesa'}
            </h1>
            <p className="text-gray-600 mt-1">
              {esJefeRecinto 
                ? `Gestión y seguimiento del recinto asignado`
                : `Gestión de tu mesa electoral`
              }
            </p>
          </div>
        </div>

        {/* Información del Recinto o Mesa */}
        {esJefeRecinto && recintoInfo && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-2">📍 RECINTO ASIGNADO</p>
                <h2 className="text-xl sm:text-2xl font-black mb-1">{recintoInfo.nombre}</h2>
                <p className="text-blue-100 text-sm">{recintoInfo.total_mesas} mesas electorales bajo tu supervisión</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 sm:px-6 sm:py-4 text-center">
                <p className="text-blue-100 text-xs uppercase tracking-wide mb-1">Avance</p>
                <p className="text-3xl sm:text-4xl font-black">{estadisticas.porcentaje_avance}%</p>
              </div>
            </div>
          </div>
        )}

        {esDelegadoMesa && mesaInfo && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-2">🗳️ MESA ASIGNADA</p>
                <h2 className="text-2xl font-black mb-1">{mesaInfo.codigo}</h2>
                <p className="text-green-100 text-sm">{mesaInfo.recinto}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
                <p className="text-green-100 text-xs uppercase tracking-wide mb-1">Estado</p>
                <p className="text-2xl font-black">{estadisticas.mesas_con_actas > 0 ? 'Completada' : 'Pendiente'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Mesas Totales"
          value={estadisticas.total_mesas}
          icon={<Grid3x3 className="w-8 h-8" />}
          bgColor="from-blue-500 to-blue-600"
          subtitle={esJefeRecinto ? "En tu recinto" : "Asignada"}
        />
        
        <StatCard
          title="Actas Registradas"
          value={estadisticas.mesas_con_actas}
          icon={<CheckCircle className="w-8 h-8" />}
          bgColor="from-green-500 to-green-600"
          subtitle={`${estadisticas.porcentaje_avance}% completado`}
        />
        
        <StatCard
          title="Total de Votos"
          value={estadisticas.total_votos.toLocaleString()}
          icon={<BarChart3 className="w-8 h-8" />}
          bgColor="from-purple-500 to-purple-600"
          subtitle="Votos registrados"
        />
        
        <StatCard
          title="Actas Pendientes"
          value={estadisticas.actas_pendientes}
          icon={<AlertCircle className="w-8 h-8" />}
          bgColor="from-orange-500 to-orange-600"
          subtitle="Por registrar"
        />
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-[#1E3A8A]" />
          Acciones Disponibles
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionCard
            title="Digitalizar Acta"
            description="Registrar nuevos votos"
            icon={<FileText className="w-6 h-6" />}
            color="blue"
            link="/dashboard/transcripcion"
          />
          
          <ActionCard
            title="Ver Resultados"
            description="Consultar resultados en vivo"
            icon={<BarChart3 className="w-6 h-6" />}
            color="green"
            link="/dashboard/resultados"
          />
          
          <ActionCard
            title="Historial"
            description="Ver actas registradas"
            icon={<Activity className="w-6 h-6" />}
            color="purple"
            link="/dashboard/historial"
          />
        </div>
      </div>

      {/* Detalle de Votos por Mesa - Solo para Jefe de Recinto */}
      {esJefeRecinto && (
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Grid3x3 className="w-6 h-6 text-[#1E3A8A]" />
            Votos por Mesa
          </h2>

          {loadingMesas ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : mesasDetalle.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Grid3x3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No hay mesas registradas en tu recinto</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mesasDetalle.map((mesa) => (
                <div key={mesa.id_mesa} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Header de la mesa */}
                  <div 
                    className="bg-gradient-to-r from-gray-50 to-white p-4 cursor-pointer hover:from-blue-50 hover:to-blue-50 transition-all"
                    onClick={() => setMesaExpandida(mesaExpandida === mesa.id_mesa ? null : mesa.id_mesa)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          mesa.estado === 'Registrada' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          <Grid3x3 className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-gray-900">{mesa.codigo_mesa}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              mesa.estado === 'Registrada' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {mesa.estado}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Número de Mesa: {mesa.numero_mesa}
                            {mesa.descripcion_mesa && ` • ${mesa.descripcion_mesa}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total Votos</p>
                          <p className="text-2xl font-black text-[#1E3A8A]">{parseInt(mesa.total_votos).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Actas</p>
                          <p className="text-2xl font-black text-green-600">{mesa.total_actas}</p>
                        </div>
                        <div>
                          {mesaExpandida === mesa.id_mesa ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detalle expandido */}
                  {mesaExpandida === mesa.id_mesa && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      {/* Estadísticas generales */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Votos Válidos</p>
                          <p className="text-xl font-bold text-green-600">
                            {(parseInt(mesa.total_votos) - parseInt(mesa.votos_nulos) - parseInt(mesa.votos_blancos)).toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Votos Nulos</p>
                          <p className="text-xl font-bold text-orange-600">{parseInt(mesa.votos_nulos).toLocaleString()}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Votos Blancos</p>
                          <p className="text-xl font-bold text-gray-600">{parseInt(mesa.votos_blancos).toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Votos por frente */}
                      {mesa.votos_por_frente && mesa.votos_por_frente.length > 0 ? (
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-3">Votos por Frente Político</h4>
                          <div className="space-y-2">
                            {/* Agrupar votos por frente */}
                            {Object.values(
                              mesa.votos_por_frente.reduce((acc, voto) => {
                                if (!acc[voto.frente_siglas]) {
                                  acc[voto.frente_siglas] = {
                                    siglas: voto.frente_siglas,
                                    nombre: voto.frente_nombre,
                                    color: voto.frente_color,
                                    gobernador: 0,
                                    asambleista_territorio: 0,
                                    asambleista_poblacion: 0,
                                    total: 0
                                  };
                                }
                                acc[voto.frente_siglas][voto.tipo_cargo] = parseInt(voto.total_votos);
                                acc[voto.frente_siglas].total += parseInt(voto.total_votos);
                                return acc;
                              }, {})
                            ).sort((a, b) => b.total - a.total).map((frente) => (
                              <div key={frente.siglas} className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-4 h-4 rounded"
                                      style={{ backgroundColor: frente.color }}
                                    />
                                    <div>
                                      <p className="font-bold text-gray-900">{frente.siglas}</p>
                                      <p className="text-xs text-gray-500">{frente.nombre}</p>
                                    </div>
                                  </div>
                                  <p className="text-xl font-black text-[#1E3A8A]">{frente.total.toLocaleString()}</p>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div className="bg-blue-50 rounded px-2 py-1">
                                    <p className="text-gray-600">Gobernador</p>
                                    <p className="font-semibold text-blue-700">{frente.gobernador.toLocaleString()}</p>
                                  </div>
                                  <div className="bg-green-50 rounded px-2 py-1">
                                    <p className="text-gray-600">Asam. Territorio</p>
                                    <p className="font-semibold text-green-700">{frente.asambleista_territorio.toLocaleString()}</p>
                                  </div>
                                  <div className="bg-purple-50 rounded px-2 py-1">
                                    <p className="text-gray-600">Asam. Población</p>
                                    <p className="font-semibold text-purple-700">{frente.asambleista_poblacion.toLocaleString()}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-white rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-500">No hay votos registrados para esta mesa</p>
                        </div>
                      )}

                      {/* Última actualización */}
                      {mesa.ultima_actualizacion && (
                        <div className="mt-3 text-xs text-gray-500 text-right">
                          Última actualización: {new Date(mesa.ultima_actualizacion).toLocaleString('es-ES')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nota informativa */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-900">
          <strong>📋 Nota:</strong> {esJefeRecinto 
            ? 'Como Jefe de Recinto, puedes ver y registrar actas de todas las mesas de tu recinto asignado. No tienes permisos para editar configuraciones del sistema.'
            : 'Como Delegado de Mesa, solo puedes ver y registrar actas de tu mesa asignada. No tienes permisos para editar configuraciones del sistema.'
          }
        </p>
      </div>
    </div>
  );
};

// Componente de tarjeta de estadística
const StatCard = ({ title, value, icon, bgColor, subtitle }) => (
  <div className={`bg-gradient-to-r ${bgColor} rounded-2xl p-6 shadow-lg text-white transform hover:scale-105 transition-all`}>
    <div className="flex items-center justify-between mb-4">
      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
        {icon}
      </div>
    </div>
    <h3 className="text-sm font-medium text-white/80 uppercase tracking-wide mb-2">{title}</h3>
    <p className="text-4xl font-black mb-1">{value}</p>
    <p className="text-sm text-white/70">{subtitle}</p>
  </div>
);

// Componente de tarjeta de acción
const ActionCard = ({ title, description, icon, color, link }) => {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
    green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
    purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
  };

  return (
    <a
      href={link}
      className={`${colors[color]} border-2 rounded-xl p-6 transition-all hover:shadow-lg cursor-pointer group`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="transform group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      <p className="text-sm opacity-75">{description}</p>
    </a>
  );
};

export default DashboardRecinto;

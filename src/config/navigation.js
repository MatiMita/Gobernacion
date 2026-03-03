import { 
    LayoutDashboard, 
    Users, 
    FileText, 
    ShieldAlert, 
    Map, 
    Flag,
    BarChart3,
    Grid3x3,
    History
} from 'lucide-react';

export const MENU_ITEMS = [
    { 
      id: 'dashboard', 
      label: 'Dashboard General', 
      icon: LayoutDashboard, 
      path: '/dashboard',
      roles: ['Administrador del Sistema', 'Administrador', 'Supervisor'] 
    },
    { 
      id: 'usuarios', 
      label: 'Usuarios y Roles', 
      icon: Users, 
      path: '/dashboard/usuarios',
      roles: ['Administrador del Sistema', 'Administrador'] 
    },
    { 
      id: 'geografia', 
      label: 'Parámetros Geográficos', 
      icon: Map, 
      path: '/dashboard/geografia',
      roles: ['Administrador del Sistema', 'Administrador'] 
    },
    { 
      id: 'mesas', 
      label: 'Recintos y Mesas', 
      icon: Grid3x3, 
      path: '/dashboard/mesas',
      roles: ['Administrador del Sistema', 'Administrador'] 
    },
    { 
      id: 'partidos', 
      label: 'Frentes Políticos', 
      icon: Flag, 
      path: '/dashboard/partidos',
      roles: ['Administrador del Sistema', 'Administrador'] 
    },
    { 
      id: 'resultados', 
      label: 'Resultados en Vivo', 
      icon: BarChart3, 
      path: '/dashboard/resultados',
      roles: ['Administrador del Sistema', 'Administrador', 'Supervisor', 'Jefe de Recinto', 'Delegado de Mesa'] 
    },
    
    { 
      id: 'transcripcion', 
      label: 'Digitalización de Actas', 
      icon: FileText, 
      path: '/dashboard/transcripcion',
      roles: ['Administrador del Sistema', 'Administrador', 'Operador', 'Supervisor', 'Jefe de Recinto', 'Delegado de Mesa'] 
    },
    { 
      id: 'historial', 
      label: 'Historial de Actas', 
      icon: History, 
      path: '/dashboard/historial',
      roles: ['Administrador del Sistema', 'Administrador', 'Operador', 'Supervisor', 'Jefe de Recinto', 'Delegado de Mesa'] 
    }
];
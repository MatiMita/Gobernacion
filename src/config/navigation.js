import { 
    LayoutDashboard, 
    Users, 
    FileText, 
    ShieldAlert, 
    Map, 
    Flag,
    BarChart3 
} from 'lucide-react';

export const MENU_ITEMS = [
    { 
      id: 'dashboard', 
      label: 'Dashboard General', 
      icon: LayoutDashboard, 
      path: '/dashboard',
      roles: ['Administrador', 'Supervisor'] 
    },
    { 
      id: 'usuarios', 
      label: 'Usuarios y Roles', 
      icon: Users, 
      path: '/dashboard/usuarios',
      roles: ['Administrador'] 
    },
    { 
      id: 'geografia', 
      label: 'Parámetros Geográficos', 
      icon: Map, 
      path: '/dashboard/geografia',
      roles: ['Administrador'] 
    },
    { 
      id: 'partidos', 
      label: 'Frentes Políticos', 
      icon: Flag, 
      path: '/dashboard/partidos',
      roles: ['Administrador'] 
    },
    { 
      id: 'supervision', 
      label: 'Control y Validación', 
      icon: ShieldAlert, 
      path: '/dashboard/supervision',
      roles: ['Administrador', 'Supervisor'] 
    },
    { 
      id: 'transcripcion', 
      label: 'Digitalización de Actas', 
      icon: FileText, 
      path: '/dashboard/transcripcion',
      roles: ['Operador', 'Supervisor'] 
    }
];
import { useNavigate, useLocation } from 'react-router-dom';
import {
  IconChartInfographic,
  IconLayoutDashboard,
  IconMap,
  IconChartBar,
  IconPresentation
} from '@tabler/icons-react';

interface NavItem {
  icon: React.ComponentType<{ size?: number; stroke?: number; color?: string }>;
  path: string;
  label: string;
}

const navItems: NavItem[] = [
  {
    icon: IconChartInfographic,
    path: '/infograph',
    label: 'Info Graph'
  },
  {
    icon: IconLayoutDashboard,
    path: '/dashboard',
    label: 'Dashboard'
  },
  {
    icon: IconPresentation,
    path: '/presentation-builder',
    label: 'Presentation Builder'
  },
  {
    icon: IconMap,
    path: '/deckgl-map',
    label: 'DeckGL Map'
  },
  {
    icon: IconChartBar,
    path: '/analyse',
    label: 'Analyse'
  }
];

export default function FloatingNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{
      position: 'fixed',
      left: '24px',
      bottom: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      zIndex: 1000,
      background: 'rgba(26, 27, 30, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: '16px',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            title={item.label}
            style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isActive 
                ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                : 'transparent',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
              }
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Icon
              size={24}
              stroke={2}
              color={isActive ? '#FFFFFF' : '#888'}
            />
          </button>
        );
      })}
    </div>
  );
}

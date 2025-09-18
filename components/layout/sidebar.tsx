'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Role, ROLE_PERMISSIONS } from '@/lib/roles';
import {
  Music,
  Calendar,
  Users,
  LogOut,
  Menu,
  X,
  List,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles: Role[];
}

const navigation: NavItem[] = [
  {
    name: 'Hinos',
    href: '/app/hinos',
    icon: Music,
    roles: [Role.ADMIN, Role.USUARIO],
  },
  {
    name: 'Playlists',
    href: '/app/playlists',
    icon: List,
    roles: [Role.ADMIN, Role.USUARIO],
  },
  {
    name: 'Ensaios',
    href: '/app/ensaios',
    icon: Calendar,
    roles: [Role.ADMIN, Role.USUARIO],
  },
  {
    name: 'Admin',
    href: '/admin/users',
    icon: Users,
    roles: [Role.ADMIN],
  },
];

const acessoNavigation: NavItem[] = [
  {
    name: 'Hinos',
    href: '/acesso/hinos',
    icon: Music,
    roles: [Role.ADOLESCENTE],
  },
  {
    name: 'Playlists',
    href: '/acesso/playlists',
    icon: List,
    roles: [Role.ADOLESCENTE],
  },
  {
    name: 'Ensaios',
    href: '/acesso/ensaios',
    icon: Calendar,
    roles: [Role.ADOLESCENTE],
  },
];

interface SidebarProps {
  children: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!session?.user) {
    return <>{children}</>;
  }

  const userRole = session.user.role;
  const permissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
  
  const isAcessoArea = pathname.startsWith('/acesso');
  const navItems = isAcessoArea ? acessoNavigation : navigation.filter(item => 
    item.roles.includes(userRole as Role)
  );

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-100 via-indigo-50 to-pink-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent 
            navItems={navItems}
            pathname={pathname}
            session={session}
            onSignOut={handleSignOut}
            isAcessoArea={isAcessoArea}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <SidebarContent 
          navItems={navItems}
          pathname={pathname}
          session={session}
          onSignOut={handleSignOut}
          isAcessoArea={isAcessoArea}
        />
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        <div className="sticky top-0 z-10 lg:hidden px-4 py-3 bg-white/90 backdrop-blur-md border-b border-white/20 shadow-lg">
          <button
            type="button"
            className="inline-flex items-center justify-center h-10 w-10 rounded-md text-purple-500 hover:text-purple-700 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24">
          {children}
        </main>
      </div>
    </div>
  );
}

interface SidebarContentProps {
  navItems: NavItem[];
  pathname: string;
  session: any;
  onSignOut: () => void;
  isAcessoArea: boolean;
}

function SidebarContent({ navItems, pathname, session, onSignOut, isAcessoArea }: SidebarContentProps) {
  return (
    <div className="flex flex-col flex-grow relative">
      {/* Background Musical */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=800&fit=crop&crop=center')] bg-cover bg-center opacity-20"></div>
      <div className="absolute inset-0 backdrop-blur-sm"></div>
      
      <div className="relative z-10 flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-2">
          <Music className="h-8 w-8 text-pink-400" />
          <span className="ml-2 text-lg sm:text-xl font-semibold text-white drop-shadow-lg">
            Ensaios Igreja
          </span>
        </div>
        
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? 'bg-white/20 text-white border-l-4 border-pink-400'
                      : 'text-gray-200 hover:bg-white/10 hover:text-white'
                  } group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all touch-manipulation backdrop-blur-sm`}
                >
                  <Icon
                    className={`${
                      isActive ? 'text-pink-400' : 'text-gray-300 group-hover:text-white'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="flex-shrink-0 px-2">
            <div className="border-t border-white/20 pt-4">
              <div className="px-2 space-y-1">
                <div className="text-sm text-white font-medium truncate drop-shadow">
                  {session.user.name}
                </div>
                <div className="text-xs text-gray-200 mb-3">
                  {session.user.role === Role.ADMIN ? 'Administrador' : 
                   session.user.role === Role.USUARIO ? 'Usuário' : 'Adolescente'}
                </div>
                
                {!isAcessoArea && session.user.role !== Role.ADOLESCENTE && (
                  <Link
                    href="/acesso/hinos"
                    className="text-gray-200 hover:bg-white/10 hover:text-white group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all touch-manipulation backdrop-blur-sm"
                  >
                    <Music className="text-gray-300 group-hover:text-white mr-3 flex-shrink-0 h-6 w-6" />
                    <span className="truncate">Área de Acesso</span>
                  </Link>
                )}
                
                {isAcessoArea && (session.user.role === Role.ADMIN || session.user.role === Role.USUARIO) && (
                  <Link
                    href="/app/hinos"
                    className="text-gray-200 hover:bg-white/10 hover:text-white group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all touch-manipulation backdrop-blur-sm"
                  >
                    <Users className="text-gray-300 group-hover:text-white mr-3 flex-shrink-0 h-6 w-6" />
                    <span className="truncate">Área Admin</span>
                  </Link>
                )}
                
                <Button
                  className="w-full justify-start text-gray-200 hover:bg-white/10 hover:text-white bg-transparent border-none px-3 py-3 h-auto transition-all touch-manipulation backdrop-blur-sm"
                  onClick={onSignOut}
                >
                  <LogOut className="mr-3 h-6 w-6 flex-shrink-0" />
                  <span className="truncate">Sair</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
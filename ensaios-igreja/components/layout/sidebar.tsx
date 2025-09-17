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
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
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
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <SidebarContent 
          navItems={navItems}
          pathname={pathname}
          session={session}
          onSignOut={handleSignOut}
          isAcessoArea={isAcessoArea}
        />
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-200">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 overflow-y-auto p-4">
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
    <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
      <div className="flex items-center flex-shrink-0 px-4">
        <Music className="h-8 w-8 text-indigo-600" />
        <span className="ml-2 text-xl font-semibold text-gray-900">
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
                    ? 'bg-indigo-100 text-indigo-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                <Icon
                  className={`${
                    isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 flex-shrink-0 h-6 w-6`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="flex-shrink-0 px-2">
          <div className="border-t border-gray-200 pt-4">
            <div className="px-2 space-y-1">
              <div className="text-sm text-gray-500">
                {session.user.name}
              </div>
              <div className="text-xs text-gray-400">
                {session.user.role === Role.ADMIN ? 'Administrador' : 
                 session.user.role === Role.USUARIO ? 'Usuário' : 'Adolescente'}
              </div>
              
              {!isAcessoArea && session.user.role !== Role.ADOLESCENTE && (
                <Link
                  href="/acesso/hinos"
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                >
                  <Music className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6" />
                  Área de Acesso
                </Link>
              )}
              
              {isAcessoArea && (session.user.role === Role.ADMIN || session.user.role === Role.USUARIO) && (
                <Link
                  href="/app/hinos"
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                >
                  <Users className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6" />
                  Área Admin
                </Link>
              )}
              
              <Button
                className="w-full justify-start text-gray-600 hover:bg-gray-50 hover:text-gray-900 bg-transparent border-none"
                onClick={onSignOut}
              >
                <LogOut className="mr-3 h-6 w-6" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
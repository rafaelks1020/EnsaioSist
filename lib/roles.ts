export const Role = {
  ADMIN: 'ADMIN' as const,
  USUARIO: 'USUARIO' as const,
  ADOLESCENTE: 'ADOLESCENTE' as const,
} as const;

export const Weekday = {
  SUNDAY: 'SUNDAY' as const,
  MONDAY: 'MONDAY' as const,
  TUESDAY: 'TUESDAY' as const,
  WEDNESDAY: 'WEDNESDAY' as const,
  THURSDAY: 'THURSDAY' as const,
  FRIDAY: 'FRIDAY' as const,
  SATURDAY: 'SATURDAY' as const,
} as const;

export type Role = typeof Role[keyof typeof Role];
export type Weekday = typeof Weekday[keyof typeof Weekday];

export const ROLE_PERMISSIONS = {
  [Role.ADMIN]: {
    canAccessAdmin: true,
    canAccessApp: true,
    canAccessAcesso: true,
    canEdit: true,
  },
  [Role.USUARIO]: {
    canAccessAdmin: false,
    canAccessApp: true,
    canAccessAcesso: true,
    canEdit: true,
  },
  [Role.ADOLESCENTE]: {
    canAccessAdmin: false,
    canAccessApp: false,
    canAccessAcesso: true,
    canEdit: false,
  },
};

export const WEEKDAY_LABELS = {
  [Weekday.SUNDAY]: 'Domingo',
  [Weekday.MONDAY]: 'Segunda-feira',
  [Weekday.TUESDAY]: 'Terça-feira',
  [Weekday.WEDNESDAY]: 'Quarta-feira',
  [Weekday.THURSDAY]: 'Quinta-feira',
  [Weekday.FRIDAY]: 'Sexta-feira',
  [Weekday.SATURDAY]: 'Sábado',
};

export function canAccessRoute(userRole: Role, route: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  
  if (route.startsWith('/admin')) {
    return permissions.canAccessAdmin;
  }
  
  if (route.startsWith('/app')) {
    return permissions.canAccessApp;
  }
  
  if (route.startsWith('/acesso')) {
    return permissions.canAccessAcesso;
  }
  
  return false;
}

export function getDefaultRedirect(role: Role): string {
  switch (role) {
    case Role.ADMIN:
      return '/admin/users';
    case Role.USUARIO:
      return '/app/hinos';
    case Role.ADOLESCENTE:
      return '/acesso/hinos';
    default:
      return '/';
  }
}
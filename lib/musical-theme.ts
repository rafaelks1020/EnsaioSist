// Tema musical consistente para o sistema
export const MUSICAL_THEME = {
  // Cores primárias do tema musical
  primary: {
    purple: 'bg-purple-600 hover:bg-purple-700 text-white',
    pink: 'bg-pink-600 hover:bg-pink-700 text-white', 
    indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  },
  
  // Cores secundárias
  secondary: {
    purple: 'bg-purple-100 hover:bg-purple-200 text-purple-800',
    pink: 'bg-pink-100 hover:bg-pink-200 text-pink-800',
    indigo: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800',
  },
  
  // Variações dos botões
  buttons: {
    // Botão primário musical
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg transform hover:scale-105 transition-all',
    
    // Botão secundário
    secondary: 'bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all',
    
    // Botão voltar padrão
    back: 'bg-purple-600 hover:bg-purple-700 text-white',
    
    // Botão de ação (play, edit, etc)
    action: 'bg-pink-600 hover:bg-pink-700 text-white',
    
    // Botão informativo (view)
    info: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    
    // Botão de perigo (delete)
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    
    // Botão desabilitado
    disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed',
  },
  
  // Cores de texto
  text: {
    primary: 'text-white',
    secondary: 'text-gray-200', 
    muted: 'text-gray-300',
    heading: 'text-white font-semibold',
    gradient: 'bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent',
  },
  
  // Cards e containers
  card: {
    primary: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-xl',
    hover: 'hover:bg-white/15 transition-all',
    header: 'bg-white/5 backdrop-blur-sm',
  },
  
  // Player e audio
  player: {
    primary: 'bg-purple-600 hover:bg-purple-700',
    secondary: 'bg-pink-600 hover:bg-pink-700',
    background: 'bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900',
  },
} as const;

// Função para combinar classes do tema musical
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Helpers para aplicar tema consistente
export const musicalButton = (variant: keyof typeof MUSICAL_THEME.buttons = 'primary') => 
  MUSICAL_THEME.buttons[variant];

export const musicalCard = (withHover = true) => 
  cn(MUSICAL_THEME.card.primary, withHover && MUSICAL_THEME.card.hover);

export const musicalText = (variant: keyof typeof MUSICAL_THEME.text = 'primary') =>
  MUSICAL_THEME.text[variant];
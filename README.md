# Ensaios Igreja

Sistema de gerenciamento de ensaios para conjunto da igreja, desenvolvido com Next.js 14, TypeScript, Prisma e Vercel.

## 🚀 Funcionalidades

### Autenticação e Papéis
- **ADMIN**: Gerencia usuários e tem acesso completo ao sistema
- **USUARIO**: Gerencia hinos e agenda de ensaios
- **ADOLESCENTE**: Somente leitura (visualiza hinos com player e agenda)

### Gestão de Hinos
- CRUD completo de hinos
- Upload de arquivos MP3 para Vercel Blob
- Editor de texto rico para letras (TipTap)
- Player de áudio integrado
- Busca por título
- Paginação

### Agenda de Ensaios
- Configuração de horários recorrentes por dia da semana
- Visualização das próximas 6 semanas
- Notas adicionais por slot de ensaio

### Área Administrativa
- Gerenciamento de usuários
- Controle de roles/permissões
- Reset de senhas

## 🛠️ Stack Técnica

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Editor**: TipTap (rich text editor)
- **Autenticação**: NextAuth.js com Credentials Provider
- **Banco de Dados**: Vercel Postgres + Prisma ORM
- **Storage**: Vercel Blob (arquivos MP3)
- **Validação**: Zod
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📁 Estrutura do Projeto

```
ensaios-igreja/
├── app/                          # App Router do Next.js
│   ├── (protected)/             # Rotas protegidas
│   │   ├── app/                 # Área administrativa
│   │   │   ├── hinos/           # CRUD de hinos
│   │   │   └── ensaios/         # Gestão de ensaios
│   │   ├── acesso/              # Área read-only
│   │   │   ├── hinos/           # Visualização de hinos
│   │   │   └── ensaios/         # Visualização de agenda
│   │   └── admin/               # Administração
│   │       └── users/           # Gestão de usuários
│   ├── api/                     # API Routes
│   │   ├── auth/                # NextAuth
│   │   ├── hinos/               # API de hinos
│   │   ├── upload/              # Upload de arquivos
│   │   └── ensaios/             # API de ensaios
│   ├── auth/                    # Páginas de autenticação
│   │   └── login/               # Página de login
│   ├── globals.css              # Estilos globais
│   ├── layout.tsx               # Layout raiz
│   ├── page.tsx                 # Página inicial
│   └── providers.tsx            # Providers (Session, Toast)
├── components/                   # Componentes reutilizáveis
│   ├── ui/                      # Componentes shadcn/ui
│   ├── forms/                   # Formulários
│   └── layout/                  # Componentes de layout
├── lib/                         # Utilitários
│   ├── auth.ts                  # Configuração NextAuth
│   ├── db.ts                    # Cliente Prisma
│   ├── blob.ts                  # Utilitários Vercel Blob
│   ├── validators.ts            # Schemas Zod
│   ├── roles.ts                 # Sistema de permissões
│   └── utils.ts                 # Utilitários gerais
├── prisma/                      # Banco de dados
│   ├── schema.prisma           # Schema do banco
│   └── seed.ts                 # Dados iniciais
└── middleware.ts               # Middleware de autenticação
```

## 🚀 Setup Local

### 1. Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta na Vercel (para Postgres e Blob)

### 2. Clonagem e Instalação
```bash
git clone <url-do-repositorio>
cd ensaios-igreja
npm install
```

### 3. Configuração do Ambiente

Copie o arquivo de exemplo:
```bash
cp .env.example .env.local
```

Configure as variáveis em `.env.local`:

```env
# Vercel Postgres
DATABASE_URL="postgres://username:password@host:port/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

### 4. Configuração do Banco de Dados

```bash
# Gerar o cliente Prisma
npx prisma generate

# Aplicar o schema ao banco
npx prisma db push

# Executar o seed (dados iniciais)
npm run db:seed
```

### 5. Execução Local

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

Acesse: http://localhost:3000

## 🔐 Contas de Teste

Após executar o seed, você terá acesso às seguintes contas:

| Papel | Email | Senha | Acesso |
|-------|-------|-------|--------|
| Admin | admin@demo.com | Admin@123 | Administração completa |
| Usuário | usuario@demo.com | Usuario@123 | Gestão de hinos/ensaios |
| Adolescente | adolescente1@demo.com | Adolescente@123 | Somente leitura |

## 🚀 Deploy na Vercel

### 1. Criar Projeto na Vercel
```bash
# Instalar CLI da Vercel
npm i -g vercel

# Deploy inicial
vercel
```

### 2. Configurar Vercel Postgres

1. Acesse o dashboard da Vercel
2. Vá para seu projeto → Storage → Create Database
3. Escolha "Postgres"
4. Anote a `DATABASE_URL` gerada

### 3. Configurar Vercel Blob

1. No dashboard da Vercel, vá para Storage → Create Database
2. Escolha "Blob"
3. Anote o `BLOB_READ_WRITE_TOKEN` gerado

### 4. Configurar Variáveis de Ambiente

No dashboard da Vercel:
1. Vá para Settings → Environment Variables
2. Adicione as variáveis:

```
DATABASE_URL=<sua-database-url>
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<gerar-secret-aleatório>
BLOB_READ_WRITE_TOKEN=<seu-blob-token>
```

### 5. Deploy e Configuração Final

```bash
# Deploy com variáveis configuradas
vercel --prod

# Aplicar schema ao banco de produção
npx prisma db push

# Executar seed em produção
npm run db:seed
```

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento
npm run build           # Build para produção
npm run start           # Servidor de produção
npm run lint            # Verificar código
npm run format          # Formatar código

# Banco de dados
npm run db:push         # Aplicar schema
npm run db:seed         # Executar seed
npm run db:migrate      # Executar migrações
npm run db:generate     # Gerar cliente Prisma
```

## 🔒 Segurança

- Autenticação com JWT via NextAuth
- Senhas hasheadas com bcrypt
- Middleware de proteção de rotas
- Validação de dados com Zod
- Rate limiting básico
- Sanitização de HTML no editor

## 📱 Responsividade

O sistema é totalmente responsivo:
- Desktop: Sidebar fixa
- Mobile: Menu hambúrguer
- Componentes adaptáveis
- Touch-friendly

## 🧪 Validações

### Upload de Arquivos
- Tipos permitidos: audio/mpeg, audio/mp3
- Tamanho máximo: 20MB
- Validação no frontend e backend

### Dados
- Título do hino: mínimo 2 caracteres
- Email: formato válido
- Senha: mínimo 8 caracteres
- Horário de ensaio: formato HH:mm

## 🎯 Próximos Passos

- [ ] Implementar notificações por email
- [ ] Adicionar sistema de comentários nos hinos
- [ ] Criar relatórios de frequência
- [ ] Implementar backup automático
- [ ] Adicionar modo escuro
- [ ] Implementar PWA

## 🐛 Troubleshooting

### Erro de Conexão com Banco
```bash
# Verificar se a DATABASE_URL está correta
echo $DATABASE_URL

# Testar conexão
npx prisma db push
```

### Erro de Upload
- Verificar se BLOB_READ_WRITE_TOKEN está configurado
- Confirmar tamanho e tipo do arquivo
- Verificar conexão com internet

### Erro de Autenticação
- Verificar se NEXTAUTH_SECRET está configurado
- Limpar cookies do navegador
- Verificar se o usuário existe no banco

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação acima
2. Consulte os logs do console
3. Verifique as variáveis de ambiente
4. Teste em modo desenvolvimento local

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
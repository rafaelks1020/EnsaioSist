import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create users
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const usuarioPassword = await bcrypt.hash('Usuario@123', 12);
  const adolescentePassword = await bcrypt.hash('Adolescente@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@demo.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  const usuario = await prisma.user.upsert({
    where: { email: 'usuario@demo.com' },
    update: {},
    create: {
      name: 'Usuário Líder',
      email: 'usuario@demo.com',
      passwordHash: usuarioPassword,
      role: 'USUARIO',
    },
  });

  const adolescente1 = await prisma.user.upsert({
    where: { email: 'adolescente1@demo.com' },
    update: {},
    create: {
      name: 'João Silva',
      email: 'adolescente1@demo.com',
      passwordHash: adolescentePassword,
      role: 'ADOLESCENTE',
    },
  });

  const adolescente2 = await prisma.user.upsert({
    where: { email: 'adolescente2@demo.com' },
    update: {},
    create: {
      name: 'Maria Santos',
      email: 'adolescente2@demo.com',
      passwordHash: adolescentePassword,
      role: 'ADOLESCENTE',
    },
  });

  // Create sample hymns
  const hymn1 = await prisma.hymn.upsert({
    where: { id: 'sample-hymn-1' },
    update: {},
    create: {
      id: 'sample-hymn-1',
      title: 'Amazing Grace',
      lyrics: `
        <p><strong>Verso 1:</strong></p>
        <p>Amazing grace, how sweet the sound<br>
        That saved a wretch like me<br>
        I once was lost, but now am found<br>
        Was blind, but now I see</p>
        
        <p><strong>Verso 2:</strong></p>
        <p>'Twas grace that taught my heart to fear<br>
        And grace my fears relieved<br>
        How precious did that grace appear<br>
        The hour I first believed</p>
      `,
      createdById: usuario.id,
    },
  });

  const hymn2 = await prisma.hymn.upsert({
    where: { id: 'sample-hymn-2' },
    update: {},
    create: {
      id: 'sample-hymn-2',
      title: 'How Great Thou Art',
      lyrics: `
        <p><strong>Verso 1:</strong></p>
        <p>O Lord my God, when I in awesome wonder<br>
        Consider all the worlds Thy hands have made<br>
        I see the stars, I hear the rolling thunder<br>
        Thy power throughout the universe displayed</p>
        
        <p><strong>Refrão:</strong></p>
        <p>Then sings my soul, my Savior God, to Thee<br>
        How great Thou art, how great Thou art<br>
        Then sings my soul, my Savior God, to Thee<br>
        How great Thou art, how great Thou art</p>
      `,
      createdById: admin.id,
    },
  });

  // Create sample rehearsal slots
  const slot1 = await prisma.rehearsalSlot.upsert({
    where: { id: 'sample-slot-1' },
    update: {},
    create: {
      id: 'sample-slot-1',
      weekday: 'WEDNESDAY',
      startTime: '19:30',
      endTime: '21:00',
      description: 'Ensaio principal do conjunto',
    },
  });

  const slot2 = await prisma.rehearsalSlot.upsert({
    where: { id: 'sample-slot-2' },
    update: {},
    create: {
      id: 'sample-slot-2',
      weekday: 'SATURDAY',
      startTime: '15:00',
      endTime: '17:00',
      description: 'Ensaio preparatório para o culto de domingo',
    },
  });

  const slot3 = await prisma.rehearsalSlot.upsert({
    where: { id: 'sample-slot-3' },
    update: {},
    create: {
      id: 'sample-slot-3',
      weekday: 'SUNDAY',
      startTime: '08:00',
      endTime: '08:30',
      description: 'Ensaio rápido antes do culto matinal',
    },
  });

  console.log('Seed completed successfully!');
  console.log('Created users:');
  console.log('- Admin:', admin.email);
  console.log('- Usuario:', usuario.email);
  console.log('- Adolescente 1:', adolescente1.email);
  console.log('- Adolescente 2:', adolescente2.email);
  console.log('Created hymns:');
  console.log('- Hymn 1:', hymn1.title);
  console.log('- Hymn 2:', hymn2.title);
  console.log('Created rehearsal slots:');
  console.log('- Slot 1:', slot1.weekday, slot1.startTime + '-' + slot1.endTime);
  console.log('- Slot 2:', slot2.weekday, slot2.startTime + '-' + slot2.endTime);
  console.log('- Slot 3:', slot3.weekday, slot3.startTime + '-' + slot3.endTime);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
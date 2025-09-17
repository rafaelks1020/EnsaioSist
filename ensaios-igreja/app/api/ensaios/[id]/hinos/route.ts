import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@/lib/roles';

// GET - Listar hinos de um ensaio
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Todos os usuários autenticados podem ver os hinos dos ensaios
    const rehearsalHymns = await prisma.rehearsalHymn.findMany({
      where: { rehearsalId: params.id },
      include: {
        hymn: {
          include: {
            createdBy: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(rehearsalHymns);
  } catch (error) {
    console.error('Error fetching rehearsal hymns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hymns' },
      { status: 500 }
    );
  }
}

// POST - Adicionar hino ao ensaio
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== Role.ADMIN && session.user.role !== Role.USUARIO)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hymnId } = await request.json();

    if (!hymnId) {
      return NextResponse.json({ error: 'Hymn ID is required' }, { status: 400 });
    }

    // Verificar se o hino já está no ensaio
    const existingLink = await prisma.rehearsalHymn.findUnique({
      where: {
        rehearsalId_hymnId: {
          rehearsalId: params.id,
          hymnId: hymnId
        }
      }
    });

    if (existingLink) {
      return NextResponse.json(
        { error: 'Hymn already added to rehearsal' },
        { status: 400 }
      );
    }

    // Obter a próxima ordem
    const lastHymn = await prisma.rehearsalHymn.findFirst({
      where: { rehearsalId: params.id },
      orderBy: { order: 'desc' }
    });

    const nextOrder = (lastHymn?.order || 0) + 1;

    const rehearsalHymn = await prisma.rehearsalHymn.create({
      data: {
        rehearsalId: params.id,
        hymnId: hymnId,
        order: nextOrder
      },
      include: {
        hymn: {
          include: {
            createdBy: {
              select: { name: true }
            }
          }
        }
      }
    });

    return NextResponse.json(rehearsalHymn);
  } catch (error) {
    console.error('Error adding hymn to rehearsal:', error);
    return NextResponse.json(
      { error: 'Failed to add hymn' },
      { status: 500 }
    );
  }
}
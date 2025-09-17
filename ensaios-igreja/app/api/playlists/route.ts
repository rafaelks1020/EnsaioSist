import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@/lib/roles';

// GET - Listar playlists do usuário + playlists públicas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'personal', 'public', ou null para ambas

    let where: any = {};

    if (type === 'personal') {
      where = { createdById: session.user.id };
    } else if (type === 'public') {
      where = { isPublic: true };
    } else {
      // Buscar playlists pessoais do usuário + públicas
      where = {
        OR: [
          { createdById: session.user.id },
          { isPublic: true }
        ]
      };
    }

    const playlists = await prisma.playlist.findMany({
      where,
      include: {
        createdBy: {
          select: { name: true }
        },
        items: {
          include: {
            hymn: {
              select: {
                id: true,
                title: true,
                mp3Url: true,
                createdBy: {
                  select: { name: true }
                }
              }
            }
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { items: true }
        }
      },
      orderBy: [
        { isPublic: 'desc' }, // Públicas primeiro
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
}

// POST - Criar nova playlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, isPublic = false } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Apenas admins podem criar playlists públicas
    if (isPublic && session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Only admins can create public playlists' },
        { status: 403 }
      );
    }

    const playlist = await prisma.playlist.create({
      data: {
        name,
        description,
        isPublic,
        createdById: session.user.id
      },
      include: {
        createdBy: {
          select: { name: true }
        },
        items: {
          include: {
            hymn: {
              select: {
                id: true,
                title: true,
                mp3Url: true,
                createdBy: {
                  select: { name: true }
                }
              }
            }
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { items: true }
        }
      }
    });

    return NextResponse.json(playlist);
  } catch (error) {
    console.error('Error creating playlist:', error);
    return NextResponse.json(
      { error: 'Failed to create playlist' },
      { status: 500 }
    );
  }
}
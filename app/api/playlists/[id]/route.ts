import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@/lib/roles';

// GET - Obter detalhes de uma playlist
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const playlist = await prisma.playlist.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: { name: true }
        },
        items: {
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
        }
      }
    });

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    // Verificar permissões: o próprio usuário ou playlist pública
    if (!playlist.isPublic && playlist.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(playlist);
  } catch (error) {
    console.error('Error fetching playlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlist' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar playlist
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, isPublic } = await request.json();

    const existingPlaylist = await prisma.playlist.findUnique({
      where: { id: params.id }
    });

    if (!existingPlaylist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    // Verificar permissões
    if (existingPlaylist.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Apenas admins podem criar/editar playlists públicas
    if (isPublic && session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Only admins can create public playlists' },
        { status: 403 }
      );
    }

    const playlist = await prisma.playlist.update({
      where: { id: params.id },
      data: {
        name,
        description,
        isPublic
      },
      include: {
        createdBy: {
          select: { name: true }
        },
        items: {
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
        }
      }
    });

    return NextResponse.json(playlist);
  } catch (error) {
    console.error('Error updating playlist:', error);
    return NextResponse.json(
      { error: 'Failed to update playlist' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar playlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const playlist = await prisma.playlist.findUnique({
      where: { id: params.id }
    });

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    // Verificar permissões
    if (playlist.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await prisma.playlist.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return NextResponse.json(
      { error: 'Failed to delete playlist' },
      { status: 500 }
    );
  }
}
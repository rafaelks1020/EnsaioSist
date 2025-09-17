import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Adicionar hino à playlist
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hymnId } = await request.json();

    if (!hymnId) {
      return NextResponse.json({ error: 'Hymn ID is required' }, { status: 400 });
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

    // Verificar se o hino já está na playlist
    const existingItem = await prisma.playlistItem.findUnique({
      where: {
        playlistId_hymnId: {
          playlistId: params.id,
          hymnId: hymnId
        }
      }
    });

    if (existingItem) {
      return NextResponse.json(
        { error: 'Hymn already in playlist' },
        { status: 400 }
      );
    }

    // Obter a próxima ordem
    const lastItem = await prisma.playlistItem.findFirst({
      where: { playlistId: params.id },
      orderBy: { order: 'desc' }
    });

    const nextOrder = (lastItem?.order || 0) + 1;

    const playlistItem = await prisma.playlistItem.create({
      data: {
        playlistId: params.id,
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

    return NextResponse.json(playlistItem);
  } catch (error) {
    console.error('Error adding hymn to playlist:', error);
    return NextResponse.json(
      { error: 'Failed to add hymn to playlist' },
      { status: 500 }
    );
  }
}

// DELETE - Remover hino da playlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const hymnId = searchParams.get('hymnId');

    if (!hymnId) {
      return NextResponse.json({ error: 'Hymn ID is required' }, { status: 400 });
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

    await prisma.playlistItem.delete({
      where: {
        playlistId_hymnId: {
          playlistId: params.id,
          hymnId: hymnId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing hymn from playlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove hymn from playlist' },
      { status: 500 }
    );
  }
}
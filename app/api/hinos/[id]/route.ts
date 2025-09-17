import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { hymnUpdateSchema } from '@/lib/validators';
import { Role } from '@/lib/roles';
import { deleteFile } from '@/lib/blob';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hymn = await db.hymn.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!hymn) {
      return NextResponse.json({ error: 'Hymn not found' }, { status: 404 });
    }

    return NextResponse.json(hymn);
  } catch (error) {
    console.error('Hymn fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hymn' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== Role.ADMIN && session.user.role !== Role.USUARIO)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = hymnUpdateSchema.parse(body);

    const hymn = await db.hymn.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(hymn);
  } catch (error) {
    console.error('Hymn update error:', error);
    return NextResponse.json(
      { error: 'Failed to update hymn' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== Role.ADMIN && session.user.role !== Role.USUARIO)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the hymn to delete the MP3 file
    const hymn = await db.hymn.findUnique({
      where: { id: params.id },
    });

    if (!hymn) {
      return NextResponse.json({ error: 'Hymn not found' }, { status: 404 });
    }

    // Delete the hymn from database
    await db.hymn.delete({
      where: { id: params.id },
    });

    // Try to delete the MP3 file from blob storage
    if (hymn.mp3Url) {
      try {
        await deleteFile(hymn.mp3Url);
      } catch (error) {
        console.error('Failed to delete MP3 file:', error);
        // Don't fail the whole operation if file deletion fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Hymn deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete hymn' },
      { status: 500 }
    );
  }
}
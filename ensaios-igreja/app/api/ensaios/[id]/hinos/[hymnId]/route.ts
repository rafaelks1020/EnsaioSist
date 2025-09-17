import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@/lib/roles';

// DELETE - Remover hino do ensaio
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; hymnId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== Role.ADMIN && session.user.role !== Role.USUARIO)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.rehearsalHymn.delete({
      where: {
        rehearsalId_hymnId: {
          rehearsalId: params.id,
          hymnId: params.hymnId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing hymn from rehearsal:', error);
    return NextResponse.json(
      { error: 'Failed to remove hymn' },
      { status: 500 }
    );
  }
}
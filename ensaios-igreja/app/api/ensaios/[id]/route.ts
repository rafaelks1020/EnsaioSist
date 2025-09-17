import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Role } from '@/lib/roles';
import { z } from 'zod';

const rehearsalSlotUpdateSchema = z.object({
  weekday: z.enum(['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']).optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)').optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)').optional(),
  description: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rehearsalSlot = await db.rehearsalSlot.findUnique({
      where: { id: params.id },
    });

    if (!rehearsalSlot) {
      return NextResponse.json({ error: 'Ensaio não encontrado' }, { status: 404 });
    }

    return NextResponse.json(rehearsalSlot);
  } catch (error) {
    console.error('Error fetching rehearsal slot:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const validatedData = rehearsalSlotUpdateSchema.parse(body);

    // Get current slot to validate changes
    const currentSlot = await db.rehearsalSlot.findUnique({
      where: { id: params.id },
    });

    if (!currentSlot) {
      return NextResponse.json({ error: 'Ensaio não encontrado' }, { status: 404 });
    }

    // Use current values if not provided in update
    const weekday = validatedData.weekday || currentSlot.weekday;
    const startTime = validatedData.startTime || currentSlot.startTime;
    const endTime = validatedData.endTime || currentSlot.endTime;

    // Validate time range
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'Horário de início deve ser anterior ao horário de fim' },
        { status: 400 }
      );
    }

    // Check for conflicts (excluding current slot)
    const existingSlot = await db.rehearsalSlot.findFirst({
      where: {
        id: { not: params.id },
        weekday: weekday,
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } }
            ]
          }
        ]
      }
    });

    if (existingSlot) {
      return NextResponse.json(
        { error: 'Já existe um ensaio agendado neste horário' },
        { status: 409 }
      );
    }

    const updatedSlot = await db.rehearsalSlot.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedSlot);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating rehearsal slot:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const rehearsalSlot = await db.rehearsalSlot.findUnique({
      where: { id: params.id },
    });

    if (!rehearsalSlot) {
      return NextResponse.json({ error: 'Ensaio não encontrado' }, { status: 404 });
    }

    await db.rehearsalSlot.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Ensaio excluído com sucesso' });
  } catch (error) {
    console.error('Error deleting rehearsal slot:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
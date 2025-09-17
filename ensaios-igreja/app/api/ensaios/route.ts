import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Role } from '@/lib/roles';
import { z } from 'zod';

const rehearsalSlotSchema = z.object({
  weekday: z.enum(['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  description: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rehearsalSlots = await db.rehearsalSlot.findMany({
      orderBy: [
        { weekday: 'asc' },
        { startTime: 'asc' }
      ],
    });

    return NextResponse.json(rehearsalSlots);
  } catch (error) {
    console.error('Error fetching rehearsal slots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== Role.ADMIN && session.user.role !== Role.USUARIO)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = rehearsalSlotSchema.parse(body);

    // Validate time range
    const startTime = validatedData.startTime;
    const endTime = validatedData.endTime;
    
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'Horário de início deve ser anterior ao horário de fim' },
        { status: 400 }
      );
    }

    // Check for conflicts
    const existingSlot = await db.rehearsalSlot.findFirst({
      where: {
        weekday: validatedData.weekday,
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

    const rehearsalSlot = await db.rehearsalSlot.create({
      data: validatedData,
    });

    return NextResponse.json(rehearsalSlot, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating rehearsal slot:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
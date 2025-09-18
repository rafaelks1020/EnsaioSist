import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schema de validação para timestamps
const timestampSchema = z.object({
  text: z.string(),
  startTime: z.number().min(0),
  endTime: z.number().min(0),
  confidence: z.number().min(0).max(1),
  lineIndex: z.number().min(0)
});

const syncRequestSchema = z.object({
  timestamps: z.array(timestampSchema),
  syncMethod: z.enum(['automatic', 'manual', 'hybrid']).default('manual'),
  confidence: z.number().min(0).max(1).default(0.8)
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const hymnId = params.id;
    const body = await request.json();
    
    // Validar dados
    const validatedData = syncRequestSchema.parse(body);

    // Verificar se o hino existe
    const hymn = await db.hymn.findUnique({
      where: { id: hymnId },
      select: { id: true, title: true }
    });

    if (!hymn) {
      return NextResponse.json(
        { error: 'Hino não encontrado' },
        { status: 404 }
      );
    }

    // Calcular confiança média dos timestamps
    const avgConfidence = validatedData.timestamps.reduce(
      (sum, t) => sum + t.confidence, 0
    ) / validatedData.timestamps.length;

    // Salvar sincronização (upsert - atualiza se já existe)
    const savedSync = await db.lyricsSync.upsert({
      where: { hymnId },
      update: {
        timestamps: validatedData.timestamps,
        syncMethod: validatedData.syncMethod,
        confidence: Math.max(avgConfidence, validatedData.confidence),
        updatedAt: new Date()
      },
      create: {
        hymnId,
        timestamps: validatedData.timestamps,
        syncMethod: validatedData.syncMethod,
        confidence: Math.max(avgConfidence, validatedData.confidence),
        createdById: session.user.id
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: savedSync.id,
        confidence: savedSync.confidence,
        syncMethod: savedSync.syncMethod,
        timestampsCount: validatedData.timestamps.length,
        updatedAt: savedSync.updatedAt
      }
    });

  } catch (error) {
    console.error('Erro ao salvar sincronização:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hymnId = params.id;

    // Buscar sincronização existente
    const lyricsSync = await db.lyricsSync.findUnique({
      where: { hymnId },
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        hymn: {
          select: { id: true, title: true }
        }
      }
    });

    if (!lyricsSync) {
      return NextResponse.json(
        { error: 'Sincronização não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: lyricsSync.id,
        timestamps: lyricsSync.timestamps,
        syncMethod: lyricsSync.syncMethod,
        confidence: lyricsSync.confidence,
        createdBy: lyricsSync.createdBy,
        hymn: lyricsSync.hymn,
        createdAt: lyricsSync.createdAt,
        updatedAt: lyricsSync.updatedAt
      }
    });

  } catch (error) {
    console.error('Erro ao buscar sincronização:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
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
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const hymnId = params.id;

    // Deletar sincronização
    await db.lyricsSync.delete({
      where: { hymnId }
    });

    return NextResponse.json({
      success: true,
      message: 'Sincronização removida com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar sincronização:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
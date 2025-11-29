import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { groupId, name } = await request.json();

    if (!groupId || !name?.trim()) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Adiciona o participante
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .insert({ group_id: groupId, name: name.trim() })
      .select()
      .single();

    if (participantError || !participant) {
      console.error('Erro ao adicionar participante:', participantError);
      return NextResponse.json(
        { error: 'Falha ao adicionar participante' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, participant });
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro inesperado' },
      { status: 500 }
    );
  }
}

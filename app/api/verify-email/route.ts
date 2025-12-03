import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { participantId, email } = await request.json();

    if (!participantId || !email?.trim()) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    const { data: participant, error } = await supabase
      .from('participants')
      .select('email')
      .eq('id', participantId)
      .single();

    if (error || !participant) {
      return NextResponse.json(
        { error: 'Participante não encontrado' },
        { status: 404 }
      );
    }

    // If participant has no email (old groups), allow access
    if (!participant.email) {
      return NextResponse.json({ success: true });
    }

    if (participant.email.toLowerCase() !== email.trim().toLowerCase()) {
      return NextResponse.json(
        { error: 'Email incorreto' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro inesperado' },
      { status: 500 }
    );
  }
}

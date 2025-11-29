import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function DELETE(request: NextRequest) {
  try {
    const { participantId, groupId } = await request.json();

    if (!participantId || !groupId) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Busca o par onde este participante é o "giver" (quem ele tira)
    const { data: giverPair } = await supabase
      .from('pairs')
      .select('id, receiver_id')
      .eq('group_id', groupId)
      .eq('giver_id', participantId)
      .single();

    // Busca o par onde este participante é o "receiver" (quem tira ele)
    const { data: receiverPair } = await supabase
      .from('pairs')
      .select('id, giver_id')
      .eq('group_id', groupId)
      .eq('receiver_id', participantId)
      .single();

    // Se existe ambos, reconecta: quem tirava ele agora tira quem ele tirava
    // A -> Participante -> B  vira  A -> B
    if (giverPair && receiverPair) {
      await supabase
        .from('pairs')
        .update({ receiver_id: giverPair.receiver_id })
        .eq('id', receiverPair.id);
    }

    // Remove o par onde ele é giver
    if (giverPair) {
      await supabase
        .from('pairs')
        .delete()
        .eq('id', giverPair.id);
    }

    // Remove o participante (cascade vai remover pairs restantes)
    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('id', participantId);

    if (error) {
      console.error('Erro ao remover participante:', error);
      return NextResponse.json(
        { error: 'Falha ao remover participante' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro inesperado' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const { groupId, name, email, unit } = await request.json();

    if (!groupId || !name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Adiciona o participante
    const { data: newParticipant, error: participantError } = await supabase
      .from('participants')
      .insert({
        group_id: groupId,
        name: name.trim(),
        email: trimmedEmail,
        unit: unit?.trim() || null,
      })
      .select()
      .single();

    if (participantError || !newParticipant) {
      console.error('Erro ao adicionar participante:', participantError);
      return NextResponse.json(
        { error: 'Falha ao adicionar participante' },
        { status: 500 }
      );
    }

    // Busca um par existente que ainda não foi visualizado para "quebrar"
    // Novo participante entra no meio: A -> B vira A -> Novo -> B
    const { data: existingPair } = await supabase
      .from('pairs')
      .select('id, giver_id, receiver_id')
      .eq('group_id', groupId)
      .is('viewed_at', null)
      .limit(1)
      .single();

    if (existingPair) {
      // Atualiza o par existente: A agora tira o Novo
      await supabase
        .from('pairs')
        .update({ receiver_id: newParticipant.id })
        .eq('id', existingPair.id);

      // Novo participante tira quem A tirava antes (B)
      await supabase
        .from('pairs')
        .insert({
          group_id: groupId,
          giver_id: newParticipant.id,
          receiver_id: existingPair.receiver_id,
        });
    } else {
      // Todos já viram, pega qualquer par e faz o mesmo
      const { data: anyPair } = await supabase
        .from('pairs')
        .select('id, giver_id, receiver_id')
        .eq('group_id', groupId)
        .limit(1)
        .single();

      if (anyPair) {
        await supabase
          .from('pairs')
          .update({ receiver_id: newParticipant.id })
          .eq('id', anyPair.id);

        await supabase
          .from('pairs')
          .insert({
            group_id: groupId,
            giver_id: newParticipant.id,
            receiver_id: anyPair.receiver_id,
          });
      }
    }

    return NextResponse.json({ success: true, participant: newParticipant });
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro inesperado' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

function generateCode(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generatePairs(participantIds: number[]): { giverId: number; receiverId: number }[] {
  if (participantIds.length < 2) {
    throw new Error('Need at least 2 participants');
  }

  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const shuffled = shuffleArray(participantIds);
    const pairs: { giverId: number; receiverId: number }[] = [];
    let valid = true;

    for (let i = 0; i < shuffled.length; i++) {
      const giverId = participantIds[i];
      const receiverId = shuffled[i];

      if (giverId === receiverId) {
        valid = false;
        break;
      }

      pairs.push({ giverId, receiverId });
    }

    if (valid) {
      return pairs;
    }

    attempts++;
  }

  throw new Error('Could not generate valid pairs');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const groupName = formData.get('groupName')?.toString().trim();
    const participantsText = formData.get('participants')?.toString() || '';

    if (!groupName) {
      return NextResponse.json(
        { error: 'Por favor, insira um nome para o grupo' },
        { status: 400 }
      );
    }

    const participantNames = participantsText
      .split('\n')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (participantNames.length < 2) {
      return NextResponse.json(
        { error: 'Por favor, insira pelo menos 2 participantes' },
        { status: 400 }
      );
    }

    const code = generateCode();

    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({ name: groupName, code })
      .select()
      .single();

    if (groupError || !group) {
      console.error('Error creating group:', groupError);
      return NextResponse.json(
        { error: 'Falha ao criar o grupo' },
        { status: 500 }
      );
    }

    const participantRows = participantNames.map((name) => ({
      group_id: group.id,
      name,
    }));

    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .insert(participantRows)
      .select();

    if (participantsError || !participants) {
      console.error('Error creating participants:', participantsError);
      return NextResponse.json(
        { error: 'Falha ao adicionar participantes' },
        { status: 500 }
      );
    }

    const participantIds = participants.map((p) => p.id);
    const pairs = generatePairs(participantIds);

    const pairRows = pairs.map((pair) => ({
      group_id: group.id,
      giver_id: pair.giverId,
      receiver_id: pair.receiverId,
    }));

    const { error: pairsError } = await supabase.from('pairs').insert(pairRows);

    if (pairsError) {
      console.error('Error creating pairs:', pairsError);
      return NextResponse.json(
        { error: 'Falha ao gerar os pares do Amigo Secreto' },
        { status: 500 }
      );
    }

    return NextResponse.json({ code });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro inesperado' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { groupCode, groupId, visitorId } = await request.json();

    if (!groupCode || !visitorId || !groupId) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Marca como visualizado no banco
    await supabase
      .from('pairs')
      .update({ viewed_at: new Date().toISOString() })
      .eq('giver_id', visitorId)
      .eq('group_id', groupId);

    // Salva cookie
    const cookieStore = cookies();
    cookieStore.set(`amigo_${groupCode}`, String(visitorId), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro inesperado' },
      { status: 500 }
    );
  }
}

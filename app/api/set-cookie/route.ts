import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { groupCode, visitorId } = await request.json();

    if (!groupCode || !visitorId) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();

    // Cookie expira em 1 ano
    cookieStore.set(`amigo_${groupCode}`, String(visitorId), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 ano
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar cookie:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro inesperado' },
      { status: 500 }
    );
  }
}

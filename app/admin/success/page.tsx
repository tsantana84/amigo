import { supabase } from '@/lib/supabaseClient';
import { headers } from 'next/headers';
import Link from 'next/link';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  const code = searchParams.code;

  if (!code) {
    return (
      <main className="container" style={{ paddingTop: '40px' }}>
        <div className="error">Código do grupo não fornecido</div>
        <Link href="/admin" className="back-link">
          ← Voltar
        </Link>
      </main>
    );
  }

  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('code', code)
    .single();

  if (!group) {
    return (
      <main className="container" style={{ paddingTop: '40px' }}>
        <div className="error">Grupo não encontrado</div>
        <Link href="/admin" className="back-link">
          ← Voltar
        </Link>
      </main>
    );
  }

  const headersList = headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const shareUrl = `${protocol}://${host}/g/${code}`;

  return (
    <main className="container" style={{ paddingTop: '40px' }}>
      <div className="icon">✅</div>
      <h1>Grupo Criado!</h1>

      <div className="success-box">
        <p style={{ marginBottom: 0 }}>
          <strong>{group.name}</strong> foi criado com sucesso.
        </p>
      </div>

      <div className="link-box">
        <label htmlFor="shareLink" style={{ display: 'block', marginBottom: '8px' }}>
          Compartilhe este link com os participantes:
        </label>
        <input
          type="text"
          id="shareLink"
          defaultValue={shareUrl}
          readOnly
          style={{ cursor: 'pointer' }}
        />
      </div>

      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        Toque no link acima para selecionar e copiar.
      </p>

      <Link href="/admin" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
        Criar Outro Grupo
      </Link>
    </main>
  );
}

import { supabase } from '@/lib/supabaseClient';
import { headers } from 'next/headers';
import Link from 'next/link';
import CopyLink from './CopyLink';

export default async function AdminGroupPage({
  params,
}: {
  params: { code: string };
}) {
  const { code } = params;

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

  const { data: participants } = await supabase
    .from('participants')
    .select('id, name')
    .eq('group_id', group.id)
    .order('name');

  const headersList = headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const shareUrl = `${protocol}://${host}/g/${code}`;

  return (
    <main className="container" style={{ paddingTop: '40px' }}>
      <div className="icon">🎅</div>
      <h1>{group.name}</h1>

      <div className="link-box">
        <label style={{ display: 'block', marginBottom: '8px' }}>
          Link para compartilhar:
        </label>
        <CopyLink url={shareUrl} />
      </div>

      <h2 style={{ marginTop: '2rem' }}>Participantes ({participants?.length || 0})</h2>

      <div style={{
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '2rem'
      }}>
        {participants?.map((p, index) => (
          <div
            key={p.id}
            style={{
              padding: '12px 16px',
              borderBottom: index < (participants?.length || 0) - 1 ? '1px solid #eee' : 'none'
            }}
          >
            {p.name}
          </div>
        ))}
      </div>

      <Link href="/admin" className="back-link">
        ← Voltar para admin
      </Link>
    </main>
  );
}

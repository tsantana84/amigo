import { supabase } from '@/lib/supabaseClient';
import { headers } from 'next/headers';
import Link from 'next/link';
import CopyLink from './CopyLink';
import DeleteButton from './DeleteButton';

export const dynamic = 'force-dynamic';

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

  const { data: pairs } = await supabase
    .from('pairs')
    .select('giver_id, viewed_at')
    .eq('group_id', group.id);

  const viewedMap: Record<number, boolean> = {};
  pairs?.forEach((pair) => {
    viewedMap[pair.giver_id] = !!pair.viewed_at;
  });

  const participantsWithStatus = participants?.map((p) => ({
    ...p,
    viewed: viewedMap[p.id] || false,
  })) || [];

  const pendingCount = participantsWithStatus.filter((p) => !p.viewed).length;

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

      <h2 style={{ marginTop: '2rem' }}>
        Participantes ({participants?.length || 0})
        {pendingCount > 0 && (
          <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#666' }}>
            {' '}— {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
          </span>
        )}
      </h2>

      <div style={{
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '2rem'
      }}>
        {participantsWithStatus.map((p, index) => (
          <div
            key={p.id}
            style={{
              padding: '12px 16px',
              borderBottom: index < participantsWithStatus.length - 1 ? '1px solid #eee' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{p.name}</span>
            <span style={{
              fontSize: '0.8rem',
              padding: '2px 8px',
              borderRadius: '12px',
              background: p.viewed ? '#e8f5e9' : '#fff3e0',
              color: p.viewed ? '#2e7d32' : '#e65100',
            }}>
              {p.viewed ? '✓ Viu' : 'Pendente'}
            </span>
          </div>
        ))}
      </div>

      <DeleteButton groupId={group.id} />

      <Link href="/admin" className="back-link">
        ← Voltar para admin
      </Link>
    </main>
  );
}

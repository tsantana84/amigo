import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default async function ResultPage({
  params,
}: {
  params: { code: string; participantId: string };
}) {
  const { code, participantId } = params;

  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('code', code)
    .single();

  if (!group) {
    return (
      <main className="container" style={{ paddingTop: '40px' }}>
        <div className="icon">❌</div>
        <h1>Grupo Não Encontrado</h1>
        <p>Este grupo de Amigo Secreto não existe.</p>
      </main>
    );
  }

  const { data: giver } = await supabase
    .from('participants')
    .select('*')
    .eq('id', participantId)
    .eq('group_id', group.id)
    .single();

  if (!giver) {
    return (
      <main className="container" style={{ paddingTop: '40px' }}>
        <div className="icon">❌</div>
        <h1>Participante Não Encontrado</h1>
        <p>Este participante não existe neste grupo.</p>
        <Link href={`/g/${code}`} className="back-link">
          ← Voltar ao grupo
        </Link>
      </main>
    );
  }

  const { data: pair } = await supabase
    .from('pairs')
    .select('receiver_id')
    .eq('group_id', group.id)
    .eq('giver_id', participantId)
    .single();

  if (!pair) {
    return (
      <main className="container" style={{ paddingTop: '40px' }}>
        <div className="icon">❌</div>
        <h1>Sorteio Não Encontrado</h1>
        <p>Não foi encontrado um sorteio para {giver.name}.</p>
        <Link href={`/g/${code}`} className="back-link">
          ← Voltar ao grupo
        </Link>
      </main>
    );
  }

  const { data: receiver } = await supabase
    .from('participants')
    .select('*')
    .eq('id', pair.receiver_id)
    .single();

  if (!receiver) {
    return (
      <main className="container" style={{ paddingTop: '40px' }}>
        <div className="icon">❌</div>
        <h1>Erro</h1>
        <p>Não foi possível encontrar a pessoa sorteada.</p>
        <Link href={`/g/${code}`} className="back-link">
          ← Voltar ao grupo
        </Link>
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: '40px' }}>
      <div className="icon">🎁</div>
      <h1>{group.name}</h1>
      <p><strong>{giver.name}</strong>, você é o Amigo Secreto de:</p>

      <div className="result-box">
        <div className="label">Você tirou:</div>
        <div className="name">{receiver.name}</div>
      </div>

      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        Lembre-se de manter segredo! 🤫
      </p>

      <Link href={`/g/${code}`} className="back-link">
        ← Voltar ao grupo
      </Link>
    </main>
  );
}

import { supabase } from '@/lib/supabaseClient';
import { cookies } from 'next/headers';
import GroupClient from './GroupClient';

export const dynamic = 'force-dynamic';

export default async function GroupPage({
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
        <div className="icon">❌</div>
        <h1>Grupo Não Encontrado</h1>
        <p>Este grupo de Amigo Secreto não existe ou o link é inválido.</p>
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
    .select('giver_id, receiver_id, viewed_at')
    .eq('group_id', group.id);

  const pairsMap: Record<number, { receiverId: number; viewedAt: string | null }> = {};
  pairs?.forEach((pair) => {
    pairsMap[pair.giver_id] = {
      receiverId: pair.receiver_id,
      viewedAt: pair.viewed_at,
    };
  });

  const participantsWithReceiver = participants?.map((p) => ({
    id: p.id,
    name: p.name,
    receiverId: pairsMap[p.id]?.receiverId,
    viewedAt: pairsMap[p.id]?.viewedAt,
  })) || [];

  const participantsMap: Record<number, string> = {};
  participants?.forEach((p) => {
    participantsMap[p.id] = p.name;
  });

  // Verifica se já viu alguém neste grupo (cookie)
  const cookieStore = cookies();
  const viewedCookie = cookieStore.get(`amigo_${code}`);
  const viewedParticipantId = viewedCookie ? parseInt(viewedCookie.value, 10) : null;

  // Se já viu, encontra o participante
  let alreadyViewed = null;
  if (viewedParticipantId) {
    alreadyViewed = participantsWithReceiver.find((p) => p.id === viewedParticipantId) || null;
  }

  return (
    <GroupClient
      groupId={group.id}
      groupCode={code}
      groupName={group.name}
      participants={participantsWithReceiver}
      participantsMap={participantsMap}
      alreadyViewed={alreadyViewed}
    />
  );
}

'use client';

import { useState } from 'react';

interface Participant {
  id: number;
  name: string;
  receiverId: number;
  viewedAt: string | null;
}

interface Props {
  groupId: number;
  groupCode: string;
  groupName: string;
  participants: Participant[];
  participantsMap: Record<number, string>;
  alreadyViewed: Participant | null;
}

export default function GroupClient({ groupId, groupCode, groupName, participants, participantsMap, alreadyViewed }: Props) {
  const [selected, setSelected] = useState<Participant | null>(alreadyViewed);

  async function handleSelect(participant: Participant) {
    // Salva cookie e marca no banco
    try {
      await fetch('/api/set-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupCode,
          groupId,
          visitorId: participant.id,
        }),
      });
    } catch (err) {
      console.error('Erro ao salvar:', err);
    }

    setSelected(participant);

    // Substitui o histórico para impedir voltar
    window.history.replaceState(null, '', window.location.href);
  }

  if (selected) {
    const receiverName = participantsMap[selected.receiverId];

    return (
      <main className="container" style={{ paddingTop: '40px' }}>
        <div className="icon">🎁</div>
        <h1>{groupName}</h1>
        <p><strong>{selected.name}</strong>, seu Amigo Secreto é:</p>

        <div className="result-box">
          <div className="label">Você tirou:</div>
          <div className="name">{receiverName}</div>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          Lembre-se de manter segredo! 🤫
        </p>
      </main>
    );
  }

  // Filtra participantes que ainda não viram
  const availableParticipants = participants.filter((p) => !p.viewedAt);

  if (availableParticipants.length === 0) {
    return (
      <main className="container" style={{ paddingTop: '40px' }}>
        <div className="icon">✅</div>
        <h1>{groupName}</h1>
        <p>Todos os participantes já descobriram seus amigos secretos!</p>
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: '40px' }}>
      <div className="icon">🎅</div>
      <h1>Amigo Secreto</h1>
      <h2>{groupName}</h2>
      <p>Toque no seu nome para descobrir quem você tirou:</p>

      <div className="participant-list">
        {availableParticipants.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSelect(p)}
            className="participant-button"
            style={{ border: 'none', cursor: 'pointer' }}
          >
            {p.name}
          </button>
        ))}
      </div>
    </main>
  );
}

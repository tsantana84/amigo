'use client';

import { useState } from 'react';

interface Participant {
  id: number;
  name: string;
  receiverId: number;
}

interface Props {
  groupCode: string;
  groupName: string;
  participants: Participant[];
  participantsMap: Record<number, string>;
  alreadyViewed: Participant | null;
}

export default function GroupClient({ groupCode, groupName, participants, participantsMap, alreadyViewed }: Props) {
  const [selected, setSelected] = useState<Participant | null>(alreadyViewed);

  async function handleSelect(participant: Participant) {
    // Salva cookie via API
    try {
      await fetch('/api/set-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupCode,
          visitorId: participant.id,
        }),
      });
    } catch (err) {
      console.error('Erro ao salvar cookie:', err);
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
        <p><strong>{selected.name}</strong>, você é o Amigo Secreto de:</p>

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

  return (
    <main className="container" style={{ paddingTop: '40px' }}>
      <div className="icon">🎅</div>
      <h1>Amigo Secreto</h1>
      <h2>{groupName}</h2>
      <p>Toque no seu nome para descobrir quem você tirou:</p>

      <div className="participant-list">
        {participants.map((p) => (
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

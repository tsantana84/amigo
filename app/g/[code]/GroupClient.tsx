'use client';

import { useState } from 'react';

interface Participant {
  id: number;
  name: string;
  hasEmail: boolean;
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
  const [pendingParticipant, setPendingParticipant] = useState<Participant | null>(null);
  const [email, setEmail] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleNameClick(participant: Participant) {
    // If participant has no email (old groups), skip verification
    if (!participant.hasEmail) {
      await confirmParticipant(participant);
      return;
    }
    setPendingParticipant(participant);
    setEmail('');
    setError(null);
  }

  async function confirmParticipant(participant: Participant) {
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
    setPendingParticipant(null);
    window.history.replaceState(null, '', window.location.href);
  }

  async function handleVerifyEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingParticipant || !email.trim()) return;

    setVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: pendingParticipant.id,
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Email incorreto');
        setVerifying(false);
        return;
      }

      // Email verified, now confirm participant
      await confirmParticipant(pendingParticipant);
    } catch (err) {
      setError('Erro ao verificar email');
    } finally {
      setVerifying(false);
    }
  }

  function handleCancelVerification() {
    setPendingParticipant(null);
    setEmail('');
    setError(null);
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

  // Filtra participantes que ainda não viram E que têm par no sorteio
  const availableParticipants = participants.filter((p) => !p.viewedAt && p.receiverId);

  if (availableParticipants.length === 0) {
    return (
      <main className="container" style={{ paddingTop: '40px' }}>
        <div className="icon">✅</div>
        <h1>{groupName}</h1>
        <p>Todos os participantes já descobriram seus amigos secretos!</p>
      </main>
    );
  }

  // Email verification modal
  if (pendingParticipant) {
    return (
      <main className="container" style={{ paddingTop: '40px' }}>
        <div className="icon">🔐</div>
        <h1>Confirme sua identidade</h1>
        <p><strong>{pendingParticipant.name}</strong>, digite seu email para continuar:</p>

        <form onSubmit={handleVerifyEmail} style={{ marginTop: '1rem' }}>
          {error && <div className="error" style={{ marginBottom: '1rem' }}>{error}</div>}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu email"
            autoFocus
            required
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '1rem',
              border: '2px solid #ddd',
              borderRadius: '8px',
              marginBottom: '1rem',
            }}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleCancelVerification}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '1rem',
                background: '#ccc',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={verifying || !email.trim()}
              className="btn"
              style={{
                flex: 1,
                opacity: verifying || !email.trim() ? 0.6 : 1,
              }}
            >
              {verifying ? 'Verificando...' : 'Confirmar'}
            </button>
          </div>
        </form>
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
            onClick={() => handleNameClick(p)}
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

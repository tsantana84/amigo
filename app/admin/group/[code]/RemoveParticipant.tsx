'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RemoveParticipant({
  participantId,
  participantName,
  groupId
}: {
  participantId: number;
  participantName: string;
  groupId: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    if (!confirm(`Remover ${participantName} do grupo?`)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/remove-participant', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, groupId }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('Erro ao remover participante');
      }
    } catch (err) {
      alert('Erro ao remover participante');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      style={{
        padding: '4px 8px',
        fontSize: '0.75rem',
        color: '#c41e3a',
        background: 'transparent',
        border: '1px solid #c41e3a',
        borderRadius: '4px',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.5 : 1,
      }}
    >
      {loading ? '...' : 'Remover'}
    </button>
  );
}

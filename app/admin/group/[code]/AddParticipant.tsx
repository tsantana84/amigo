'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddParticipant({ groupId }: { groupId: number }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/add-participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, name: name.trim() }),
      });

      if (response.ok) {
        setName('');
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao adicionar');
      }
    } catch (err) {
      setError('Erro ao adicionar participante');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
      {error && <div className="error" style={{ marginBottom: '0.5rem' }}>{error}</div>}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do participante"
          style={{
            flex: 1,
            padding: '10px 12px',
            fontSize: '1rem',
            border: '2px solid #ddd',
            borderRadius: '8px',
          }}
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          style={{
            padding: '10px 16px',
            fontSize: '1rem',
            fontWeight: 600,
            color: 'white',
            background: '#c41e3a',
            border: 'none',
            borderRadius: '8px',
            cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !name.trim() ? 0.6 : 1,
          }}
        >
          {loading ? '...' : 'Adicionar'}
        </button>
      </div>
      <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>
        Nota: Novo participante não terá par até refazer o sorteio.
      </p>
    </form>
  );
}

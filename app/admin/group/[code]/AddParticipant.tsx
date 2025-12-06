'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddParticipant({ groupId }: { groupId: number }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [unit, setUnit] = useState('');
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
        body: JSON.stringify({ groupId, name: name.trim(), email: email.trim() || null, unit: unit.trim() || null }),
      });

      if (response.ok) {
        setName('');
        setEmail('');
        setUnit('');
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

  const isValid = name.trim();

  return (
    <form onSubmit={handleSubmit} className="participant-card" style={{ marginTop: '1rem' }}>
      {error && <div className="error" style={{ marginBottom: '0.5rem' }}>{error}</div>}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email (opcional)"
      />
      <input
        type="text"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        placeholder="Unidade (opcional)"
      />
      <button
        type="submit"
        disabled={loading || !isValid}
        className="btn"
        style={{
          marginTop: '0.5rem',
          opacity: loading || !isValid ? 0.6 : 1,
        }}
      >
        {loading ? 'Adicionando...' : 'Adicionar Participante'}
      </button>
    </form>
  );
}

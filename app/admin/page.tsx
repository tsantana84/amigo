'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Group {
  id: number;
  code: string;
  name: string;
  created_at: string;
}

interface Participant {
  name: string;
  email: string;
  unit: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [groupName, setGroupName] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([
    { name: '', email: '', unit: '' },
    { name: '', email: '', unit: '' },
  ]);

  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await fetch('/api/groups');
        if (response.ok) {
          const data = await response.json();
          setGroups(data.groups);
        }
      } catch (err) {
        console.error('Erro ao carregar grupos:', err);
      } finally {
        setLoadingGroups(false);
      }
    }
    fetchGroups();
  }, []);

  function updateParticipant(index: number, field: 'name' | 'email' | 'unit', value: string) {
    const updated = [...participants];
    updated[index][field] = value;
    setParticipants(updated);
  }

  function addParticipant() {
    setParticipants([...participants, { name: '', email: '', unit: '' }]);
  }

  function removeParticipant(index: number) {
    if (participants.length <= 2) return;
    setParticipants(participants.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const validParticipants = participants.filter(
      (p) => p.name.trim()
    );

    if (validParticipants.length < 2) {
      setError('Por favor, insira pelo menos 2 participantes com nome');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/create-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupName,
          participants: validParticipants,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Algo deu errado');
        setLoading(false);
        return;
      }

      router.push(`/admin/group/${data.code}`);
    } catch (err) {
      setError('Ocorreu um erro inesperado');
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ paddingTop: '40px' }}>
      <div className="icon">🎁</div>
      <h1>Criar Grupo de Amigo Secreto</h1>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="groupName">Nome do Grupo</label>
          <input
            type="text"
            id="groupName"
            name="groupName"
            placeholder="Ex: Natal da Família 2024"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Participantes</label>
          {participants.map((participant, index) => (
            <div key={index} className="participant-card">
              <div className="participant-card-header">
                <span className="participant-card-number">
                  Participante {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeParticipant(index)}
                  disabled={participants.length <= 2}
                  className="participant-card-remove"
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                placeholder="Nome"
                value={participant.name}
                onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email (opcional)"
                value={participant.email}
                onChange={(e) => updateParticipant(index, 'email', e.target.value)}
              />
              <input
                type="text"
                placeholder="Unidade (opcional)"
                value={participant.unit}
                onChange={(e) => updateParticipant(index, 'unit', e.target.value)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addParticipant}
            className="btn-secondary-outline"
          >
            + Adicionar Participante
          </button>
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Criando...' : 'Criar Grupo'}
        </button>
      </form>

      <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #ddd' }} />

      <h2>Grupos Criados</h2>

      {loadingGroups ? (
        <p style={{ textAlign: 'center', color: '#666' }}>Carregando...</p>
      ) : groups.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>Nenhum grupo criado ainda.</p>
      ) : (
        <div className="participant-list">
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/admin/group/${group.code}`}
              className="participant-button"
              style={{ fontSize: '1rem' }}
            >
              {group.name}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

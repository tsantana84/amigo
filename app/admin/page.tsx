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

export default function AdminPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('/api/create-group', {
        method: 'POST',
        body: formData,
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
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="participants">Participantes (um nome por linha)</label>
          <textarea
            id="participants"
            name="participants"
            placeholder={'Maria\nJoão\nAna\nPedro'}
            required
          />
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

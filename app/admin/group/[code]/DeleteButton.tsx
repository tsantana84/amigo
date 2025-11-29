'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteButton({ groupId }: { groupId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja deletar este grupo? Esta ação não pode ser desfeita.')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/delete-group', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId }),
      });

      if (response.ok) {
        router.push('/admin');
      } else {
        alert('Erro ao deletar grupo');
        setLoading(false);
      }
    } catch (err) {
      alert('Erro ao deletar grupo');
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      style={{
        width: '100%',
        padding: '14px 24px',
        fontSize: '1rem',
        fontWeight: 600,
        color: '#c41e3a',
        background: 'white',
        border: '2px solid #c41e3a',
        borderRadius: '8px',
        cursor: loading ? 'not-allowed' : 'pointer',
        marginTop: '1rem',
      }}
    >
      {loading ? 'Deletando...' : 'Deletar Grupo'}
    </button>
  );
}

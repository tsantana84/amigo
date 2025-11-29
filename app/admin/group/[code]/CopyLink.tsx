'use client';

import { useState } from 'react';

export default function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        width: '100%',
        padding: '12px',
        fontSize: '0.9rem',
        border: '2px solid #ddd',
        borderRadius: '8px',
        background: copied ? '#e8f5e9' : '#f5f5f5',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'background 0.2s',
        wordBreak: 'break-all',
      }}
    >
      {copied ? '✅ Link copiado!' : url}
    </button>
  );
}

import Link from 'next/link';

export default function Home() {
  return (
    <main className="container" style={{ paddingTop: '80px' }}>
      <div className="icon">🎅</div>
      <h1>Amigo Secreto</h1>
      <p>Crie um grupo de Amigo Secreto e compartilhe o link com seus amigos!</p>
      <Link href="/admin" className="btn">
        Criar Grupo
      </Link>
    </main>
  );
}

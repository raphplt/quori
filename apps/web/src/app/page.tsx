export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Bienvenue sur Quori
        </h1>
        <p className="text-center text-gray-600">
          Convertit automatiquement vos commits & PR GitHub/GitLab en posts
          LinkedIn prêts à publier
        </p>
      </div>
    </main>
  );
}

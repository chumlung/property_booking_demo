export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-14">
      <div className="flex items-center gap-3 rounded-xl border border-stone-800 bg-stone-950/60 px-5 py-4 text-stone-200">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-stone-500 border-t-orange-400" />
        <span className="text-sm">Waking up the services...</span>
      </div>
    </main>
  );
}

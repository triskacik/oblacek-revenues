/** Shown instead of the app when Supabase env variables are missing (local setup only). */
const SetupMissing = () => (
  <div className='mx-auto max-w-xl p-8'>
    <h1 className='mb-4 text-xl font-semibold'>Chybí konfigurace Supabase</h1>
    <p className='text-muted-foreground'>
      Zkopírujte <code>.env.example</code> do <code>.env.local</code>, doplňte{' '}
      <code>VITE_SUPABASE_URL</code> a <code>VITE_SUPABASE_ANON_KEY</code> a restartujte dev server.
    </p>
  </div>
)

export default SetupMissing

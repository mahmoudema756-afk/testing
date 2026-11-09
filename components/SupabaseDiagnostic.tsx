export function SupabaseDiagnostic({ action = "use this feature" }: { action?: string }) {
  return <div className="diagnostic" role="alert"><span className="diagnostic-icon">!</span><div><b>Supabase connection is not configured.</b><p>To {action}, add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> in your deployment environment, then redeploy. No service-role key is needed here.</p></div></div>;
}

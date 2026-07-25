// Configurações do Supabase (Integração com Backend Real)

window.SUPABASE_URL = "https://rukbaxmosplokhngxrqk.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1a2JheG1vc3Bsb2tobmd4cnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NDAwMDYsImV4cCI6MjEwMDQxNjAwNn0.vZ3otO_3PRVVacqYc5TbgA4RwkUiARPqu_0qTe5Aqlc";

// Retorna as credenciais ativas (preferindo localStorage se as chaves em código estiverem vazias)
window.getSupabaseCreds = function() {
    const url = window.SUPABASE_URL || localStorage.getItem('supabase_url') || "";
    const key = window.SUPABASE_ANON_KEY || localStorage.getItem('supabase_anon_key') || "";
    return { url: url.trim(), key: key.trim() };
};

// Verifica se a conexão com o Supabase está configurada e pronta para uso
window.isSupabaseConfigured = function() {
    const creds = window.getSupabaseCreds();
    return creds.url !== "" && creds.key !== "";
};

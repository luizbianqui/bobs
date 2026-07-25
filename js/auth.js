// Módulo de Autenticação - Supabase Auth

window.getAuthClient = function() {
    const creds = window.getSupabaseCreds();
    if (!creds.url || !creds.key) return null;
    return supabase.createClient(creds.url, creds.key);
};

// Verifica se há sessão ativa. Retorna o objeto session ou null.
window.checkAuth = async function() {
    const client = window.getAuthClient();
    if (!client) return null;
    try {
        const { data: { session } } = await client.auth.getSession();
        return session;
    } catch (e) {
        return null;
    }
};

// Faz login com email e senha via Supabase Auth
window.loginUser = async function(email, password) {
    const client = window.getAuthClient();
    if (!client) throw new Error("Supabase não configurado.");
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
};

// Faz logout da sessão ativa
window.logoutUser = async function() {
    const client = window.getAuthClient();
    if (!client) return;
    await client.auth.signOut();
    localStorage.removeItem('checkrest_user');
};

// Retorna dados do usuário gestor logado a partir da tabela usuarios
window.getLoggedUser = async function() {
    // Tenta do localStorage (cache)
    const cached = localStorage.getItem('checkrest_user');
    if (cached) return JSON.parse(cached);

    const client = window.getAuthClient();
    if (!client) return null;

    const { data: { session } } = await client.auth.getSession();
    if (!session) return null;

    const email = session.user.email;
    const db = window.getDb();
    const usuario = db.usuarios.find(u => u.email === email);
    if (usuario) {
        localStorage.setItem('checkrest_user', JSON.stringify(usuario));
        return usuario;
    }
    return null;
};

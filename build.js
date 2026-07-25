const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'js', 'config.js');

if (fs.existsSync(configPath)) {
    let content = fs.readFileSync(configPath, 'utf8');
    let modified = false;
    
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    
    if (url) {
        // Regex para encontrar window.SUPABASE_URL = "..." ou '...' ou `...`
        content = content.replace(
            /window\.SUPABASE_URL\s*=\s*['"`](.*?)['"`];/g,
            `window.SUPABASE_URL = "${url}";`
        );
        console.log('✅ SUPABASE_URL substituída com sucesso pelas variáveis de ambiente da Vercel.');
        modified = true;
    } else {
        console.log('ℹ️ SUPABASE_URL não informada no ambiente, mantendo o valor padrão.');
    }
    
    if (key) {
        // Regex para encontrar window.SUPABASE_ANON_KEY = "..." ou '...' ou `...`
        content = content.replace(
            /window\.SUPABASE_ANON_KEY\s*=\s*['"`](.*?)['"`];/g,
            `window.SUPABASE_ANON_KEY = "${key}";`
        );
        console.log('✅ SUPABASE_ANON_KEY substituída com sucesso pelas variáveis de ambiente da Vercel.');
        modified = true;
    } else {
        console.log('ℹ️ SUPABASE_ANON_KEY não informada no ambiente, mantendo o valor padrão.');
    }
    
    if (modified) {
        fs.writeFileSync(configPath, content, 'utf8');
        console.log('📁 js/config.js atualizado com sucesso.');
    }
} else {
    console.error('❌ Erro: js/config.js não foi encontrado em: ' + configPath);
    process.exit(1);
}

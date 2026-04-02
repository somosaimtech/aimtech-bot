const { Client, LocalAuth, Buttons, List, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// ── CLIENTE ──
const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'aimtech-bot' }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// ── MENÚ PRINCIPAL ──
const MENU_TEXTO = `👋 *¡Bienvenido a AIMTECH!*

Somos especialistas en *Inteligencia Artificial* para negocios dominicanos. 🤖

━━━━━━━━━━━━━━━━━━━━━
🔷 *¿En qué te puedo ayudar?*
━━━━━━━━━━━━━━━━━━━━━

1️⃣  ¿Qué es AIMTECH?
2️⃣  ¿Cómo funciona el bot?
3️⃣  Precios y planes
4️⃣  Tiempo de entrega
5️⃣  Garantía y pago
6️⃣  Hablar con un asesor

_Escribe el número de tu opción_ 👇`;

const MENU_BOTONES = new Buttons(
  '👋 *¡Bienvenido a AIMTECH!*\nSomos especialistas en *Inteligencia Artificial* para negocios dominicanos. 🤖\n\n¿En qué te puedo ayudar?',
  [
    { id: '1', body: '🏢 ¿Qué es AIMTECH?' },
    { id: '2', body: '⚙️ ¿Cómo funciona?' },
    { id: '3', body: '💰 Precios y planes' },
  ],
  'AIMTECH',
  'Inteligencia Artificial para negocios'
);

const MENU_BOTONES2 = new Buttons(
  '¿Necesitas algo más?',
  [
    { id: '4', body: '⏱️ Tiempo de entrega' },
    { id: '5', body: '🛡️ Garantía y pago' },
    { id: '6', body: '👨‍💼 Hablar con asesor' },
  ],
  'AIMTECH',
  'Selecciona una opción'
);

// ── RESPUESTAS ──
const R = {
  '1': `🏢 *¿Qué es AIMTECH?*

Somos una empresa dominicana especializada en soluciones de *Inteligencia Artificial* para negocios.

✅ Chatbots WhatsApp 24/7
✅ IA de voz para llamadas
✅ Automatización de procesos
✅ Consultoría IA

🌐 *aimtech.com.do*
📱 *(809) 519-2814*
📸 *@somos.aimtech*`,

  '2': `⚙️ *¿Cómo funciona el bot?*

Conectamos un asistente inteligente a tu WhatsApp Business que:

🔹 Responde mensajes *al instante* las 24 horas
🔹 Agenda citas automáticamente
🔹 Informa precios y servicios
🔹 Reserva productos o consultas
🔹 Notifica a tu equipo en tiempo real

Todo sin que nadie del equipo tenga que hacer nada. 💪`,

  '3': `💰 *Planes AIMTECH*

━━━━━━━━━━━━━━━━━━
⚡ *Plan Básico — $500 USD*
Bot con menús · Sin mensualidad

🧠 *Plan Intermedio — $700 USD*
IA conversacional · +$50/mes

👑 *Plan Premium — $1,000 USD*
Chat + llamadas con voz · +$70/mes
━━━━━━━━━━━━━━━━━━

✅ Pago *50/50*
✅ Sistema *100% tuyo*
✅ Entrega máx. *15 días*`,

  '4': `⏱️ *Tiempo de entrega*

Máximo *15 días hábiles*. Típico: 10-12 días.

▪️ Días 1-3 → Levantamiento
▪️ Días 4-7 → Desarrollo
▪️ Días 8-10 → Pruebas
▪️ Días 11-13 → Ajustes
▪️ Días 14-15 → Lanzamiento 🚀`,

  '5': `🛡️ *Garantía AIMTECH*

💳 Pagas *50% al iniciar*
💳 El otro 50% *solo cuando apruebes*

✅ Ajustes gratis si algo no quedó bien
✅ Sistema *100% tuyo* para siempre
✅ *Cero riesgo* para ti`,

  '6': `👨‍💼 *Hablar con un asesor*

📱 *WhatsApp:* (809) 519-2814
✉️ somos.aimtech@gmail.com
🌐 aimtech.com.do
📸 @somos.aimtech

⏰ *Disponibles 24/7* — ¡Escríbenos ahora! 🚀`,
};

// ── NORMALIZAR ──
function norm(t) {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[¿?!¡.,;:]/g,'').trim();
}

// ── DETECTAR INTENCIÓN ──
function getKey(text) {
  const t = text.trim();
  const n = norm(t);

  if (['1','2','3','4','5','6'].includes(t)) return t;

  const greetings = ['hola','buenas','buenos','hey','alo','hi','buen dia','buen tarde','buen noche','saludos'];
  if (greetings.some(g => n.includes(g))) return 'menu';

  if (n.includes('precio') || n.includes('costo') || n.includes('cuanto') || n.includes('plan')) return '3';
  if (n.includes('tiempo') || n.includes('entrega') || n.includes('dias') || n.includes('cuando')) return '4';
  if (n.includes('garantia') || n.includes('pago') || n.includes('riesgo') || n.includes('seguro')) return '5';
  if (n.includes('asesor') || n.includes('contacto') || n.includes('hablar') || n.includes('persona')) return '6';
  if (n.includes('que es') || n.includes('quienes') || n.includes('empresa') || n.includes('aimtech')) return '1';
  if (n.includes('como') || n.includes('funciona') || n.includes('bot') || n.includes('sistema')) return '2';

  return 'menu';
}

// ── QR ──
client.on('qr', (qr) => {
  console.log('\n──────────────────────────────────');
  console.log('  ESCANEA ESTE QR CON WHATSAPP');
  console.log('  WhatsApp → Dispositivos vinculados');
  console.log('──────────────────────────────────\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('\n✅ AIMTECH Bot conectado a WhatsApp Business\n');
});

client.on('auth_failure', () => {
  console.log('❌ Error de autenticación. Borra la carpeta .wwebjs_auth y reinicia.');
});

// ── MENSAJES ──
const cooldowns = new Map();
const COOLDOWN_MS = 3000;

client.on('message', async (msg) => {
  // Ignorar grupos
  if (msg.from.endsWith('@g.us')) return;
  // Cooldown
  const last = cooldowns.get(msg.from) || 0;
  if (Date.now() - last < COOLDOWN_MS) return;

  const text = msg.body || '';
  if (!text) return;

  console.log(`📨 Mensaje de ${msg.from}: "${text}"`);
  const key = getKey(text);
  await new Promise(r => setTimeout(r, 700 + Math.random() * 500));

  try {
    if (key === 'menu') {
      // Intentar botones — si falla, enviar texto
      try {
        await client.sendMessage(msg.from, MENU_BOTONES);
        await new Promise(r => setTimeout(r, 600));
        await client.sendMessage(msg.from, MENU_BOTONES2);
      } catch {
        await msg.reply(MENU_TEXTO);
      }
    } else {
      await msg.reply(R[key]);
      // Mostrar segundo menú de botones después de responder
      await new Promise(r => setTimeout(r, 800));
      try {
        await client.sendMessage(msg.from, MENU_BOTONES2);
      } catch {
        await client.sendMessage(msg.from, { body: '¿Necesitas algo más? Escribe un número del 1 al 6 👆' });
      }
    }
    cooldowns.set(msg.from, Date.now());
    console.log(`✅ Respondido a ${msg.from}`);
  } catch (err) {
    console.error(`❌ Error:`, err.message);
    try { await msg.reply(key === 'menu' ? MENU_TEXTO : R[key]); } catch {}
  }
});

// ── ARRANCAR ──
console.log('🚀 Iniciando AIMTECH Bot con whatsapp-web.js...');
console.log('   Espera mientras carga el navegador...\n');
client.initialize();
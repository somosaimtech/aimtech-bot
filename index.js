const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const P = require('pino');
const qrcode = require('qrcode-terminal');

const AUTH_FOLDER = './auth_info';
const cooldowns = new Map();
const COOLDOWN_MS = 3000;

// ── MENÚ PRINCIPAL ──
const MENU = `👋 *¡Bienvenido a AIMTECH!*

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

const MENU2 = `━━━━━━━━━━━━━━━━━━━━━
¿Necesitas algo más? 😊
━━━━━━━━━━━━━━━━━━━━━

1️⃣  ¿Qué es AIMTECH?
2️⃣  ¿Cómo funciona el bot?
3️⃣  Precios y planes
4️⃣  Tiempo de entrega
5️⃣  Garantía y pago
6️⃣  Hablar con un asesor
0️⃣  Ver menú completo

_Escribe el número_ 👇`;

// ── RESPUESTAS ──
const R = {
  '1': `🏢 *¿Qué es AIMTECH?*

Somos una empresa dominicana especializada en soluciones de *Inteligencia Artificial* para negocios.

✅ Chatbots WhatsApp 24/7
✅ IA de voz para llamadas
✅ Automatización de procesos
✅ Consultoría IA
✅ Análisis con IA

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

Todo sin que nadie del equipo tenga que hacer nada. El bot trabaja solo. 💪

¿Quieres una *demo gratuita* para tu negocio?`,

  '3': `💰 *Planes AIMTECH*

━━━━━━━━━━━━━━━━━━
⚡ *Plan Básico — $500 USD*
Bot con menús y botones
Sin mensualidad · Tuyo para siempre

🧠 *Plan Intermedio — $700 USD*
IA que entiende cualquier pregunta
+$50/mes para mantener la IA activa

👑 *Plan Premium — $1,000 USD*
Chat + contesta llamadas con voz
+$70/mes para IA y voz activas
━━━━━━━━━━━━━━━━━━

✅ *Pago 50/50* — mitad al inicio, mitad al aprobar
✅ El sistema queda *100% tuyo* para siempre
✅ Entrega máximo *15 días*

¿Cuál plan te interesa?`,

  '4': `⏱️ *Tiempo de entrega*

El sistema está activo en máximo *15 días hábiles*.
El plazo típico es *10-12 días*.

📅 *Cronograma:*
▪️ Días 1-3 → Levantamiento de información
▪️ Días 4-7 → Desarrollo del sistema
▪️ Días 8-10 → Pruebas con escenarios reales
▪️ Días 11-13 → Ajustes y capacitación
▪️ Días 14-15 → Lanzamiento oficial 🚀

¿Quieres empezar esta semana?`,

  '5': `🛡️ *Garantía AIMTECH*

Así funciona el pago:

💳 Pagas *50% al iniciar* el proyecto
💳 El otro 50% *SOLO cuando apruebes* el resultado final

Si algo no quedó exactamente como acordamos, lo ajustamos *sin costo adicional*.

✅ El sistema queda *100% tuyo*
✅ Sin contratos ni mensualidades del sistema
✅ *Cero riesgo* para ti`,

  '6': `👨‍💼 *Hablar con un asesor AIMTECH*

Con gusto te atendemos personalmente:

📱 *WhatsApp:* (809) 519-2814
✉️ *Email:* somos.aimtech@gmail.com
🌐 *Web:* aimtech.com.do
📸 *Instagram:* @somos.aimtech

⏰ *Disponibles 24/7*

¡Escríbenos y te respondemos al instante! 🚀`,
};

// ── NORMALIZAR ──
function normalize(t) {
  return t.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?!¡.,;:]/g, '')
    .trim();
}

// ── DETECTAR RESPUESTA ──
function getResponse(text) {
  const t = text.trim();
  const n = normalize(t);

  // Número exacto del menú
  if (['1','2','3','4','5','6'].includes(t)) return { type: 'option', key: t };
  if (t === '0' || n === 'menu' || n === 'inicio') return { type: 'menu' };

  // Saludos → menú principal
  const greetings = ['hola','buenas','buenos','hey','alo','hi','buen dia','buen tarde','buen noche','saludos','que hay','como estas'];
  if (greetings.some(g => n.includes(g))) return { type: 'menu' };

  // Por palabras clave
  if (n.includes('precio') || n.includes('costo') || n.includes('cuanto') || n.includes('plan') || n.includes('vale'))
    return { type: 'option', key: '3' };
  if (n.includes('tiempo') || n.includes('entrega') || n.includes('dias') || n.includes('rapido') || n.includes('cuando'))
    return { type: 'option', key: '4' };
  if (n.includes('garantia') || n.includes('pago') || n.includes('riesgo') || n.includes('seguro') || n.includes('50'))
    return { type: 'option', key: '5' };
  if (n.includes('asesor') || n.includes('contacto') || n.includes('hablar') || n.includes('persona') || n.includes('humano') || n.includes('llamar'))
    return { type: 'option', key: '6' };
  if (n.includes('que es') || n.includes('quienes') || n.includes('empresa') || n.includes('aimtech') || n.includes('son'))
    return { type: 'option', key: '1' };
  if (n.includes('como') || n.includes('funciona') || n.includes('bot') || n.includes('sistema') || n.includes('trabaja'))
    return { type: 'option', key: '2' };

  // Default → menú
  return { type: 'menu' };
}

// ── BOT ──
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['AIMTECH Bot', 'Chrome', '1.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log('\n──────────────────────────────────');
      console.log('  ESCANEA ESTE QR CON WHATSAPP');
      console.log('  WhatsApp → Dispositivos vinculados');
      console.log('──────────────────────────────────\n');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut
        : true;
      console.log('Conexión cerrada. Reconectando:', shouldReconnect);
      if (shouldReconnect) setTimeout(startBot, 3000);
      else console.log('Sesión cerrada. Borra auth_info y reinicia.');
    }
    if (connection === 'open') {
      console.log('\n✅ AIMTECH Bot conectado a WhatsApp Business\n');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (msg.key.fromMe) continue;
      if (msg.key.remoteJid.endsWith('@g.us')) continue;
      if (!msg.message) continue;

      const jid = msg.key.remoteJid;
      const lastReply = cooldowns.get(jid) || 0;
      if (Date.now() - lastReply < COOLDOWN_MS) continue;

      const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.buttonsResponseMessage?.selectedButtonId ||
        msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
        '';

      if (!text) continue;

      console.log(`📨 Mensaje de ${jid}: "${text}"`);
      const response = getResponse(text);
      await new Promise(r => setTimeout(r, 700 + Math.random() * 500));

      try {
        if (response.type === 'menu') {
          await sock.sendMessage(jid, { text: MENU });
        } else if (response.type === 'option') {
          await sock.sendMessage(jid, { text: R[response.key] });
          await new Promise(r => setTimeout(r, 800));
          await sock.sendMessage(jid, { text: MENU2 });
        }
        cooldowns.set(jid, Date.now());
        console.log(`✅ Respondido a ${jid}`);
      } catch (err) {
        console.error(`❌ Error:`, err.message);
      }
    }
  });

  return sock;
}

startBot().catch(console.error);
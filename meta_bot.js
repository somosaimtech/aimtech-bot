// ============================================================
// AIMTECH WhatsApp Bot — Meta Cloud API
// Botones reales, webhook, Node.js
// ============================================================

const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// ── CONFIGURACIÓN ──
const TOKEN = process.env.WHATSAPP_TOKEN || 'EAAbuAwlRYZAABRPNVOV4OO5qSK9ZC8d3Y3Tg6GZBCGi30CZBe4pVnu3RCG8tHcG5zmapg28OUW25BuTOSx9KPmNfr2ZC0UdEVVqBEONIc07VyIZBDCLu4D582V9tGcJZBJqVhqbkmU53fqKSletMJn0USYRCkksD9jpXwtlNjDH5L2vaSqPhyu6uqE723K3ZBop3zZCKP8kH3t417pottZBg7W596GPfXKYnUFZA2sHZAWLKFiyAgZB2zApyZBqp2aC3DT9csZAVDD6F7hyWZB6N01cUmFjo';
const PHONE_ID = process.env.PHONE_NUMBER_ID || '1076606662199359';
const VERIFY_TOKEN = 'aimtech2025';
const API_URL = `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`;

// ── RESPUESTAS ──
const R = {
  quienes: `🏢 *¿Qué es AIMTECH?*

Somos una empresa dominicana especializada en soluciones de *Inteligencia Artificial* para negocios.

✅ Chatbots WhatsApp 24/7
✅ IA de voz para llamadas
✅ Automatización de procesos
✅ Consultoría IA

🌐 aimtech.com.do
📱 (809) 519-2814
📸 @somos.aimtech`,

  como: `⚙️ *¿Cómo funciona el bot?*

Conectamos un asistente inteligente a tu WhatsApp Business que:

🔹 Responde mensajes *al instante* 24/7
🔹 Agenda citas automáticamente
🔹 Informa precios y servicios
🔹 Reserva productos o consultas
🔹 Notifica a tu equipo

Todo sin que nadie del equipo haga nada. 💪`,

  precios: `💰 *Planes AIMTECH*

⚡ *Básico — $500 USD*
Bot con menús · Sin mensualidad

🧠 *Intermedio — $700 USD*
IA conversacional · +$50/mes

👑 *Premium — $1,000 USD*
Chat + llamadas con voz · +$70/mes

✅ Pago *50/50*
✅ Sistema *100% tuyo*
✅ Entrega máx. *15 días*`,

  entrega: `⏱️ *Tiempo de entrega*

Máximo *15 días hábiles*. Típico: 10-12 días.

▪️ Días 1-3 → Levantamiento
▪️ Días 4-7 → Desarrollo
▪️ Días 8-10 → Pruebas
▪️ Días 11-13 → Ajustes
▪️ Días 14-15 → Lanzamiento 🚀`,

  garantia: `🛡️ *Garantía AIMTECH*

💳 Pagas *50% al iniciar*
💳 Resto *solo cuando apruebes*

✅ Ajustes gratis si algo no quedó bien
✅ Sistema *100% tuyo* para siempre
✅ *Cero riesgo*`,

  asesor: `👨‍💼 *Hablar con un asesor*

📱 WhatsApp: *(809) 519-2814*
✉️ somos.aimtech@gmail.com
🌐 aimtech.com.do
📸 @somos.aimtech

⏰ *Disponibles 24/7* 🚀`,
};

// ── ENVIAR MENSAJE DE TEXTO ──
async function sendText(to, text) {
  await axios.post(API_URL, {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text, preview_url: false }
  }, { headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' } });
}

// ── ENVIAR MENÚ CON BOTONES REALES ──
async function sendMenu(to) {
  await axios.post(API_URL, {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      header: { type: 'text', text: '👋 ¡Bienvenido a AIMTECH!' },
      body: { text: 'Somos especialistas en *Inteligencia Artificial* para negocios dominicanos. 🤖\n\n¿En qué te puedo ayudar?' },
      footer: { text: 'aimtech.com.do · (809) 519-2814' },
      action: {
        buttons: [
          { type: 'reply', reply: { id: 'quienes', title: '🏢 ¿Qué es AIMTECH?' } },
          { type: 'reply', reply: { id: 'precios', title: '💰 Precios y planes' } },
          { type: 'reply', reply: { id: 'asesor', title: '👨‍💼 Hablar con asesor' } },
        ]
      }
    }
  }, { headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' } });
}

// ── ENVIAR SEGUNDO MENÚ CON BOTONES ──
async function sendMenu2(to) {
  await axios.post(API_URL, {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: '¿Necesitas algo más? 😊' },
      footer: { text: 'AIMTECH · Inteligencia Artificial' },
      action: {
        buttons: [
          { type: 'reply', reply: { id: 'como',     title: '⚙️ ¿Cómo funciona?' } },
          { type: 'reply', reply: { id: 'entrega',  title: '⏱️ Tiempo de entrega' } },
          { type: 'reply', reply: { id: 'garantia', title: '🛡️ Garantía y pago' } },
        ]
      }
    }
  }, { headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' } });
}

// ── NORMALIZAR TEXTO ──
function norm(t) {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[¿?!¡.,;:]/g,'').trim();
}

// ── DETECTAR INTENCIÓN ──
function getKey(text) {
  const n = norm(text);
  const id = text.trim().toLowerCase();

  // IDs de botones
  if (id === 'quienes')  return 'quienes';
  if (id === 'como')     return 'como';
  if (id === 'precios')  return 'precios';
  if (id === 'entrega')  return 'entrega';
  if (id === 'garantia') return 'garantia';
  if (id === 'asesor')   return 'asesor';

  // Saludos
  const greetings = ['hola','buenas','buenos','hey','alo','hi','buen dia','buen tarde','buen noche','saludos'];
  if (greetings.some(g => n.includes(g))) return 'menu';

  // Palabras clave
  if (n.includes('precio') || n.includes('costo') || n.includes('cuanto') || n.includes('plan')) return 'precios';
  if (n.includes('tiempo') || n.includes('entrega') || n.includes('dias') || n.includes('cuando')) return 'entrega';
  if (n.includes('garantia') || n.includes('pago') || n.includes('riesgo')) return 'garantia';
  if (n.includes('asesor') || n.includes('contacto') || n.includes('hablar') || n.includes('persona')) return 'asesor';
  if (n.includes('que es') || n.includes('quienes') || n.includes('empresa') || n.includes('aimtech')) return 'quienes';
  if (n.includes('como') || n.includes('funciona') || n.includes('bot') || n.includes('sistema')) return 'como';

  return 'menu';
}

// ── COOLDOWNS ──
const cooldowns = new Map();
const COOLDOWN_MS = 3000;

// ── WEBHOOK VERIFICACIÓN ──
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ── WEBHOOK MENSAJES ──
app.post('/webhook', async (req, res) => {
  res.sendStatus(200);
  try {
    const entry = req.body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;
    if (!messages || messages.length === 0) return;

    const msg = messages[0];
    const from = msg.from;
    const type = msg.type;

    // Cooldown
    const last = cooldowns.get(from) || 0;
    if (Date.now() - last < COOLDOWN_MS) return;

    let text = '';
    if (type === 'text') {
      text = msg.text?.body || '';
    } else if (type === 'interactive') {
      const iType = msg.interactive?.type;
      if (iType === 'button_reply') {
        text = msg.interactive.button_reply?.id || '';
      } else if (iType === 'list_reply') {
        text = msg.interactive.list_reply?.id || '';
      }
    }

    if (!text) return;
    console.log(`📨 Mensaje de ${from}: "${text}"`);

    const key = getKey(text);
    await new Promise(r => setTimeout(r, 700));

    if (key === 'menu') {
      await sendMenu(from);
    } else if (key === 'asesor') {
      await sendText(from, R.asesor);
    } else {
      await sendText(from, R[key]);
      await new Promise(r => setTimeout(r, 800));
      await sendMenu2(from);
    }

    cooldowns.set(from, Date.now());
    console.log(`✅ Respondido a ${from}`);
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
  }
});

// ── HEALTH CHECK ──
app.get('/', (req, res) => res.send('✅ AIMTECH Bot activo'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`\n✅ AIMTECH Bot corriendo en puerto ${PORT}\n`));
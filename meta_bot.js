// ============================================================
// AIMTECH WhatsApp Bot — Meta Cloud API v2.0
// Bot avanzado con IA, captura de leads y flujos inteligentes
// ============================================================

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// ── CONFIGURACIÓN ──
const TOKEN = process.env.ACCESS_TOKEN;
const PHONE_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'aimtech2025';
const API_URL = `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`;

// ── BASE DE DATOS EN MEMORIA (leads capturados) ──
const leads = new Map();
const cooldowns = new Map();
const userState = new Map(); // Estado de la conversación por usuario
const COOLDOWN_MS = 2000;

// ── FUNCIÓN PARA GUARDAR LEAD ──
function saveLead(phone, data) {
  const existing = leads.get(phone) || {};
  leads.set(phone, { ...existing, ...data, phone, updatedAt: new Date().toISOString() });
  console.log(`💾 Lead guardado: ${phone}`, leads.get(phone));
}

// ── CONTENIDO DEL BOT ──
const CONTENT = {
  bienvenida: {
    header: '👋 ¡Bienvenido a AIMTECH!',
    body: `Somos la empresa líder en *Inteligencia Artificial* para negocios dominicanos 🇩🇴

🤖 Automatizamos tu negocio con IA
📈 Aumentamos tus ventas 24/7
⚡ Resultados desde el primer mes

¿En qué te puedo ayudar hoy?`,
    footer: 'aimtech.com.do · (809) 519-2814'
  },

  servicios: `🚀 *Servicios AIMTECH*

*🤖 Bot WhatsApp con IA*
Responde clientes automáticamente 24/7, agenda citas, captura leads y cierra ventas mientras duermes.

*📞 IA de Voz para Llamadas*
Un asistente que atiende llamadas, filtra clientes y agenda reuniones automáticamente.

*⚙️ Automatización de Procesos*
Conectamos tus herramientas (WhatsApp, email, CRM, facturación) para que todo funcione solo.

*🧠 Consultoría en IA*
Te guiamos para implementar IA en tu negocio de forma estratégica y rentable.

¿Cuál te interesa más?`,

  planes: `💰 *Planes AIMTECH 2025*

━━━━━━━━━━━━━━━━━
⚡ *BÁSICO — $500 USD*
• Bot WhatsApp completo
• Menús interactivos
• Respuestas automáticas 24/7
• Sin mensualidad
━━━━━━━━━━━━━━━━━
🧠 *INTERMEDIO — $700 USD*
• Todo lo del Básico
• IA conversacional (ChatGPT)
• Captura automática de leads
• Reportes mensuales
• Mantenimiento: +$50/mes
━━━━━━━━━━━━━━━━━
👑 *PREMIUM — $1,000 USD*
• Todo lo del Intermedio
• Bot de voz para llamadas
• Integración CRM/facturación
• Soporte prioritario 24/7
• Mantenimiento: +$70/mes
━━━━━━━━━━━━━━━━━

✅ Pago *50% al iniciar / 50% al entregar*
✅ Entrega en máximo *15 días*
✅ El sistema es *100% tuyo*`,

  comoFunciona: `⚙️ *¿Cómo funciona el proceso?*

*Paso 1 — Reunión inicial (Gratis)*
Conversamos sobre tu negocio, tus clientes y tus objetivos. Sin compromiso.

*Paso 2 — Propuesta personalizada*
En 24 horas te enviamos una propuesta con el plan ideal para tu negocio.

*Paso 3 — Desarrollo (10-15 días)*
Construimos tu bot con todas las funcionalidades acordadas.

*Paso 4 — Pruebas y ajustes*
Probamos todo contigo antes del lanzamiento. Sin costo adicional.

*Paso 5 — Lanzamiento 🚀*
Conectamos el bot a tu número oficial de WhatsApp y ¡listo!

*Paso 6 — Soporte continuo*
Estamos disponibles para cualquier ajuste o mejora.`,

  casos: `🏆 *Casos de Éxito AIMTECH*

*🏥 Clínica Dental en Santo Domingo*
Bot que agenda citas, recuerda pacientes y responde dudas. Resultado: *40% menos llamadas, 60% más citas agendadas.*

*🏠 Inmobiliaria en Santiago*
Bot que filtra prospectos, muestra propiedades y agenda visitas. Resultado: *3x más leads calificados.*

*🛍️ Tienda de Ropa Online*
Bot que atiende pedidos, hace seguimiento y procesa devoluciones. Resultado: *85% de satisfacción del cliente.*

*💊 Farmacia con 5 sucursales*
Bot que verifica disponibilidad y toma pedidos. Resultado: *70% de consultas automatizadas.*

_Estos son resultados reales de clientes dominicanos._`,

  garantia: `🛡️ *Garantía AIMTECH — Cero Riesgo*

Entendemos que invertir en tecnología es una decisión importante. Por eso:

✅ *Pagas 50% para iniciar*
✅ *El otro 50% solo cuando apruebes el resultado*
✅ *Ajustes gratis si algo no quedó perfecto*
✅ *El sistema es 100% tuyo para siempre*
✅ *Sin contratos de permanencia*

Si el bot no cumple lo prometido, *no pagas el resto.* Así de simple.

_En AIMTECH tu satisfacción no es opcional, es nuestra garantía._`,

  contacto: `📞 *Contacta a AIMTECH*

Estamos listos para ayudarte a llevar tu negocio al siguiente nivel.

📱 *WhatsApp:* (809) 519-2814
✉️ *Email:* somos.aimtech@gmail.com  
🌐 *Web:* aimtech.com.do
📸 *Instagram:* @somos.aimtech

⏰ Respondemos en menos de *2 horas* en días hábiles.
🌙 El bot responde *24/7* siempre.

_¿Prefieres que nosotros te contactemos? Escribe "LLAMAME" y te llamamos hoy._`,

  faq: `❓ *Preguntas Frecuentes*

*¿Necesito saber programar?*
No. Nosotros hacemos todo. Tú solo apruebas el resultado.

*¿Funciona con mi número actual de WhatsApp?*
Sí, podemos conectar tu número actual o uno nuevo.

*¿Qué pasa si quiero cambiar algo después?*
Los primeros 30 días de ajustes son gratis. Después, según el plan de mantenimiento.

*¿Cuántos clientes puede atender el bot?*
Ilimitados simultáneamente. No importa si son 10 o 10,000.

*¿El bot suena robótico?*
No. Lo configuramos para sonar natural y profesional, igual que un agente humano.

*¿Qué información necesitan de mi negocio?*
Solo necesitamos conocer tus servicios, precios y flujo de atención. El resto lo hacemos nosotros.`,
};

// ── FUNCIONES DE ENVÍO ──
async function sendText(to, text) {
  try {
    await axios.post(API_URL, {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text, preview_url: false }
    }, { headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('❌ Error sendText:', err.response?.data || err.message);
  }
}

async function sendButtons(to, header, body, footer, buttons) {
  try {
    await axios.post(API_URL, {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        header: { type: 'text', text: header },
        body: { text: body },
        footer: { text: footer },
        action: { buttons }
      }
    }, { headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('❌ Error sendButtons:', err.response?.data || err.message);
  }
}

async function sendList(to, header, body, footer, buttonText, sections) {
  try {
    await axios.post(API_URL, {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: { type: 'text', text: header },
        body: { text: body },
        footer: { text: footer },
        action: { button: buttonText, sections }
      }
    }, { headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('❌ Error sendList:', err.response?.data || err.message);
  }
}

// ── MENÚ PRINCIPAL ──
async function sendMenuPrincipal(to) {
  await sendList(
    to,
    '🤖 AIMTECH — IA para Negocios',
    CONTENT.bienvenida.body,
    'aimtech.com.do · (809) 519-2814',
    '📋 Ver opciones',
    [
      {
        title: '🚀 Servicios',
        rows: [
          { id: 'servicios', title: '🤖 Nuestros servicios', description: 'Bot WhatsApp, IA de voz, automatización' },
          { id: 'planes', title: '💰 Planes y precios', description: 'Desde $500 USD, pago 50/50' },
          { id: 'casos', title: '🏆 Casos de éxito', description: 'Resultados reales de clientes' },
        ]
      },
      {
        title: '📞 Información',
        rows: [
          { id: 'como_funciona', title: '⚙️ ¿Cómo funciona?', description: 'El proceso paso a paso' },
          { id: 'garantia', title: '🛡️ Garantía', description: 'Cero riesgo, pago al aprobar' },
          { id: 'faq', title: '❓ Preguntas frecuentes', description: 'Dudas comunes resueltas' },
        ]
      },
      {
        title: '💬 Contacto',
        rows: [
          { id: 'asesor', title: '👨‍💼 Hablar con asesor', description: 'Te contactamos hoy mismo' },
          { id: 'cotizacion', title: '📋 Quiero una cotización', description: 'Cotización gratis en 24 horas' },
          { id: 'contacto', title: '📞 Información de contacto', description: 'Todos nuestros canales' },
        ]
      }
    ]
  );
}

// ── MENÚ SECUNDARIO ──
async function sendMenuSecundario(to) {
  await sendButtons(
    to,
    '¿Necesitas algo más? 😊',
    '¿Te puedo ayudar con algo más?',
    'AIMTECH · Inteligencia Artificial para Negocios',
    [
      { type: 'reply', reply: { id: 'planes', title: '💰 Ver precios' } },
      { type: 'reply', reply: { id: 'asesor', title: '👨‍💼 Hablar con asesor' } },
      { type: 'reply', reply: { id: 'menu', title: '🏠 Menú principal' } },
    ]
  );
}

// ── FLUJO DE COTIZACIÓN ──
async function iniciarCotizacion(to) {
  userState.set(to, { step: 'cotizacion_nombre' });
  await sendText(to, `📋 *Cotización Gratis*

¡Perfecto! En menos de 24 horas te enviamos una propuesta personalizada.

Para preparar tu cotización necesito algunos datos:

*¿Cuál es tu nombre?*`);
}

async function procesarCotizacion(to, text, state) {
  switch (state.step) {
    case 'cotizacion_nombre':
      saveLead(to, { nombre: text });
      userState.set(to, { step: 'cotizacion_negocio', nombre: text });
      await sendText(to, `Perfecto, *${text}* 👋

*¿Cuál es el nombre de tu negocio o empresa?*`);
      break;

    case 'cotizacion_negocio':
      saveLead(to, { negocio: text });
      userState.set(to, { ...state, step: 'cotizacion_tipo', negocio: text });
      await sendButtons(
        to,
        '¿Qué tipo de negocio tienes?',
        `Necesito saber el tipo de negocio de *${text}* para preparar la mejor propuesta:`,
        'Selecciona la opción más cercana',
        [
          { type: 'reply', reply: { id: 'tipo_servicio', title: '🏢 Servicios' } },
          { type: 'reply', reply: { id: 'tipo_comercio', title: '🛍️ Comercio/Tienda' } },
          { type: 'reply', reply: { id: 'tipo_salud', title: '🏥 Salud/Bienestar' } },
        ]
      );
      break;

    case 'cotizacion_tipo':
      const tipos = {
        'tipo_servicio': 'Servicios profesionales',
        'tipo_comercio': 'Comercio/Tienda',
        'tipo_salud': 'Salud/Bienestar',
      };
      const tipo = tipos[text] || text;
      saveLead(to, { tipo });
      userState.set(to, { ...state, step: 'cotizacion_objetivo', tipo });
      await sendButtons(
        to,
        '¿Cuál es tu objetivo principal?',
        '¿Qué quieres lograr con el bot de WhatsApp?',
        'Elige la que mejor describe tu objetivo',
        [
          { type: 'reply', reply: { id: 'obj_ventas', title: '💰 Aumentar ventas' } },
          { type: 'reply', reply: { id: 'obj_atencion', title: '📞 Mejorar atención' } },
          { type: 'reply', reply: { id: 'obj_automatizar', title: '⚡ Automatizar procesos' } },
        ]
      );
      break;

    case 'cotizacion_objetivo':
      const objetivos = {
        'obj_ventas': 'Aumentar ventas',
        'obj_atencion': 'Mejorar atención al cliente',
        'obj_automatizar': 'Automatizar procesos',
      };
      const objetivo = objetivos[text] || text;
      saveLead(to, { objetivo, completado: true });
      userState.delete(to);

      console.log(`🎯 NUEVO LEAD COMPLETO:`, leads.get(to));

      await sendText(to, `✅ *¡Perfecto! Cotización registrada.*

📋 *Resumen:*
• Nombre: ${state.nombre || 'No indicado'}
• Negocio: ${state.negocio || 'No indicado'}
• Objetivo: ${objetivo}

🚀 En las próximas *24 horas* un asesor de AIMTECH te contactará con una propuesta personalizada.

📱 Si prefieres hablar ahora mismo, escríbenos al *(809) 519-2814* o llámanos directamente.

_¡Gracias por confiar en AIMTECH!_ 🙏`);
      break;

    default:
      userState.delete(to);
      await sendMenuPrincipal(to);
  }
}

// ── NORMALIZAR TEXTO ──
function norm(t) {
  return t.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?!¡.,;:]/g, '')
    .trim();
}

// ── DETECTAR INTENCIÓN ──
function getKey(text) {
  const n = norm(text);
  const id = text.trim().toLowerCase();

  // IDs de botones y lista
  const ids = {
    'servicios': 'servicios',
    'planes': 'planes',
    'casos': 'casos',
    'como_funciona': 'como_funciona',
    'garantia': 'garantia',
    'faq': 'faq',
    'asesor': 'asesor',
    'cotizacion': 'cotizacion',
    'contacto': 'contacto',
    'menu': 'menu',
    'tipo_servicio': 'cotizacion_tipo',
    'tipo_comercio': 'cotizacion_tipo',
    'tipo_salud': 'cotizacion_tipo',
    'obj_ventas': 'cotizacion_objetivo',
    'obj_atencion': 'cotizacion_objetivo',
    'obj_automatizar': 'cotizacion_objetivo',
  };
  if (ids[id]) return ids[id];

  // Saludos
  const greetings = ['hola', 'buenas', 'buenos', 'hey', 'alo', 'hi', 'buen dia', 'buen tarde', 'buen noche', 'saludos', 'inicio', 'empezar', 'start'];
  if (greetings.some(g => n.includes(g))) return 'menu';

  // Llamada urgente
  if (n.includes('llamame') || n.includes('llamame') || n.includes('llamen') || n.includes('llamar')) return 'llamame';

  // Palabras clave
  if (n.includes('precio') || n.includes('costo') || n.includes('cuanto') || n.includes('plan') || n.includes('tarifa')) return 'planes';
  if (n.includes('servicio') || n.includes('que hacen') || n.includes('que ofrecen') || n.includes('que venden')) return 'servicios';
  if (n.includes('como funciona') || n.includes('proceso') || n.includes('pasos') || n.includes('tiempo')) return 'como_funciona';
  if (n.includes('garantia') || n.includes('pago') || n.includes('riesgo') || n.includes('seguro')) return 'garantia';
  if (n.includes('caso') || n.includes('ejemplo') || n.includes('cliente') || n.includes('resultado')) return 'casos';
  if (n.includes('pregunta') || n.includes('duda') || n.includes('faq') || n.includes('ayuda')) return 'faq';
  if (n.includes('asesor') || n.includes('hablar') || n.includes('persona') || n.includes('agente') || n.includes('humano')) return 'asesor';
  if (n.includes('cotiz') || n.includes('propuesta') || n.includes('quiero') || n.includes('interesa') || n.includes('empezar')) return 'cotizacion';
  if (n.includes('contacto') || n.includes('telefono') || n.includes('email') || n.includes('correo') || n.includes('instagram')) return 'contacto';

  return 'menu';
}

// ── WEBHOOK VERIFICACIÓN ──
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  console.log(`🔍 Verificación: mode=${mode} token=${token}`);
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Token incorrecto');
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

    // Cooldown anti-spam
    const last = cooldowns.get(from) || 0;
    if (Date.now() - last < COOLDOWN_MS) return;
    cooldowns.set(from, Date.now());

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

    // Verificar si está en un flujo de cotización
    const state = userState.get(from);
    if (state && state.step && state.step.startsWith('cotizacion_')) {
      // Procesar texto libre o botones del flujo
      const id = text.trim().toLowerCase();
      const cotizacionIds = ['tipo_servicio', 'tipo_comercio', 'tipo_salud', 'obj_ventas', 'obj_atencion', 'obj_automatizar'];
      
      if (cotizacionIds.includes(id)) {
        await procesarCotizacion(from, id, state);
      } else if (state.step === 'cotizacion_tipo') {
        await procesarCotizacion(from, text, state);
      } else {
        await procesarCotizacion(from, text, state);
      }
      return;
    }

    const key = getKey(text);
    await new Promise(r => setTimeout(r, 600));

    switch (key) {
      case 'menu':
        await sendMenuPrincipal(from);
        break;

      case 'servicios':
        await sendText(from, CONTENT.servicios);
        await new Promise(r => setTimeout(r, 800));
        await sendMenuSecundario(from);
        break;

      case 'planes':
        await sendText(from, CONTENT.planes);
        await new Promise(r => setTimeout(r, 800));
        await sendButtons(
          from,
          '¿Te interesa algún plan? 🚀',
          '¿Listo para automatizar tu negocio?',
          'Pago 50/50 · Entrega en 15 días',
          [
            { type: 'reply', reply: { id: 'cotizacion', title: '📋 Quiero cotización' } },
            { type: 'reply', reply: { id: 'asesor', title: '👨‍💼 Hablar con asesor' } },
            { type: 'reply', reply: { id: 'menu', title: '🏠 Menú principal' } },
          ]
        );
        break;

      case 'casos':
        await sendText(from, CONTENT.casos);
        await new Promise(r => setTimeout(r, 800));
        await sendMenuSecundario(from);
        break;

      case 'como_funciona':
        await sendText(from, CONTENT.comoFunciona);
        await new Promise(r => setTimeout(r, 800));
        await sendButtons(
          from,
          '¿Empezamos? 🚀',
          '¿Listo para dar el primer paso?',
          'Reunión inicial completamente gratis',
          [
            { type: 'reply', reply: { id: 'cotizacion', title: '📋 Pedir cotización' } },
            { type: 'reply', reply: { id: 'asesor', title: '👨‍💼 Hablar con asesor' } },
            { type: 'reply', reply: { id: 'menu', title: '🏠 Menú principal' } },
          ]
        );
        break;

      case 'garantia':
        await sendText(from, CONTENT.garantia);
        await new Promise(r => setTimeout(r, 800));
        await sendMenuSecundario(from);
        break;

      case 'faq':
        await sendText(from, CONTENT.faq);
        await new Promise(r => setTimeout(r, 800));
        await sendMenuSecundario(from);
        break;

      case 'asesor':
        await sendText(from, `👨‍💼 *Conectando con un asesor...*

Un asesor de AIMTECH te contactará en los próximos *15 minutos* (en horario hábil).

Mientras tanto, puedes:
📱 Escribirnos directamente al *(809) 519-2814*
✉️ Enviarnos un email a *somos.aimtech@gmail.com*
🌐 Visitar *aimtech.com.do*

_Tu consulta es completamente gratis y sin compromiso._ 🙏`);
        saveLead(from, { wantsAdvisor: true, requestedAt: new Date().toISOString() });
        console.log(`🔔 ALERTA: Cliente ${from} solicita asesor`);
        break;

      case 'cotizacion':
        await iniciarCotizacion(from);
        break;

      case 'contacto':
        await sendText(from, CONTENT.contacto);
        break;

      case 'llamame':
        await sendText(from, `📞 *¡Anotado! Te llamamos ahora.*

Un asesor de AIMTECH te llamará en los próximos *15 minutos*.

Si no recibes la llamada, escríbenos al:
📱 *(809) 519-2814*

_¡Gracias por tu interés en AIMTECH!_ 🙏`);
        saveLead(from, { wantsCall: true, requestedAt: new Date().toISOString() });
        console.log(`📞 ALERTA: Cliente ${from} solicita llamada`);
        break;

      // IDs de cotización que llegan como key directa
      case 'cotizacion_tipo':
      case 'cotizacion_objetivo':
        const currentState = userState.get(from);
        if (currentState) {
          await procesarCotizacion(from, text.trim().toLowerCase(), currentState);
        } else {
          await sendMenuPrincipal(from);
        }
        break;

      default:
        await sendMenuPrincipal(from);
    }

    console.log(`✅ Respondido a ${from}`);
  } catch (err) {
    console.error('❌ Error general:', err.response?.data || err.message);
  }
});

// ── ENDPOINT PARA VER LEADS ──
app.get('/leads', (req, res) => {
  const allLeads = Array.from(leads.values());
  res.json({
    total: allLeads.length,
    leads: allLeads
  });
});

// ── HEALTH CHECK ──
app.get('/', (req, res) => res.send('✅ AIMTECH Bot v2.0 activo'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ AIMTECH Bot v2.0 corriendo en puerto ${PORT}`);
  console.log(`📊 Ver leads: http://localhost:${PORT}/leads\n`);
});
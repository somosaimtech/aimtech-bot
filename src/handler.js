const { sendText, sendMenu, sendButtons } = require('./utils');
const { saveLead, saveAppointment } = require('./sheets');
const sessions = {}; // estado por usuario

async function handleMessage(sock, msg) {
  const jid = msg.key.remoteJid;
  const body = (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.buttonsResponseMessage?.selectedDisplayText ||
    msg.message?.listResponseMessage?.title ||
    ''
  ).trim().toLowerCase();

  if (!sessions[jid]) sessions[jid] = { step: 'inicio', data: {} };
  const session = sessions[jid];

  // ── RESET siempre que digan "menu", "inicio", "hola", "start"
  if (['menu', 'inicio', 'hola', 'hi', 'hello', 'start', '0'].includes(body)) {
    sessions[jid] = { step: 'inicio', data: {} };
    return await menuPrincipal(sock, jid);
  }

  switch (session.step) {
    case 'inicio':       return await menuPrincipal(sock, jid);
    case 'menu':         return await procesarMenu(sock, jid, body, session);
    case 'lead_nombre':  return await capturarNombre(sock, jid, body, session);
    case 'lead_empresa': return await capturarEmpresa(sock, jid, body, session);
    case 'lead_necesidad': return await capturarNecesidad(sock, jid, body, session);
    case 'cita_nombre':  return await citaNombre(sock, jid, body, session);
    case 'cita_fecha':   return await citaFecha(sock, jid, body, session);
    case 'cita_hora':    return await citaHora(sock, jid, body, session);
    default:             return await menuPrincipal(sock, jid);
  }
}

// ══ MENU PRINCIPAL ══
async function menuPrincipal(sock, jid) {
  sessions[jid].step = 'menu';
  const txt =
    `*Bienvenido a AIMTECH* 🤖\n` +
    `_Soluciones de Inteligencia Artificial para negocios_\n\n` +
    `¿En qué te puedo ayudar hoy?\n\n` +
    `*1* — Conocer nuestros servicios\n` +
    `*2* — Precios y planes\n` +
    `*3* — Agendar una cita / demo\n` +
    `*4* — Casos de éxito\n` +
    `*5* — Contactar a un asesor\n` +
    `*6* — Dejar mis datos (te llamamos)\n` +
    `*7* — Preguntas frecuentes\n\n` +
    `_Escribe el número de tu opción_`;
  await sendText(sock, jid, txt);
}

// ══ PROCESAR OPCION ══
async function procesarMenu(sock, jid, body, session) {
  switch (body) {
    case '1': return await servicios(sock, jid);
    case '2': return await precios(sock, jid);
    case '3': return await iniciarCita(sock, jid, session);
    case '4': return await casosExito(sock, jid);
    case '5': return await contactarAsesor(sock, jid);
    case '6': return await iniciarLead(sock, jid, session);
    case '7': return await faq(sock, jid);
    default:
      await sendText(sock, jid, '⚠️ Opción no válida. Escribe un número del *1 al 7* o escribe *menu* para volver.');
  }
}

// ══ 1. SERVICIOS ══
async function servicios(sock, jid) {
  const txt =
    `*Nuestros Servicios* 🚀\n\n` +
    `🤖 *Chatbots con IA*\n` +
    `WhatsApp, Instagram, web. Responden solos 24/7, agendan citas y capturan leads.\n\n` +
    `⚙️ *Automatización de Procesos*\n` +
    `Eliminamos tareas repetitivas. Tu equipo se enfoca en vender.\n\n` +
    `📞 *IA de Voz*\n` +
    `Asistente que contesta llamadas con voz natural. No suena a robot.\n\n` +
    `📊 *Análisis con IA*\n` +
    `Dashboards inteligentes con predicciones para tomar mejores decisiones.\n\n` +
    `🔗 *Integraciones*\n` +
    `Conectamos WhatsApp, CRM, Google Calendar, email y más.\n\n` +
    `¿Te interesa alguno en específico?\n_Responde con el nombre del servicio o escribe *menu*_`;
  await sendText(sock, jid, txt);
  sessions[jid].step = 'menu';
}

// ══ 2. PRECIOS ══
async function precios(sock, jid) {
  const txt =
    `*Planes AIMTECH* 💰\n\n` +
    `⚡ *Plan Básico — $500 USD*\n` +
    `Pago único · Sin mensualidad · Bot con menús y botones · 30 días soporte\n\n` +
    `🧠 *Plan Intermedio — $700 USD*\n` +
    `Instalación única + $50/mes IA · Lenguaje natural · Entiende cualquier pregunta · 45 días soporte\n\n` +
    `👑 *Plan Premium — $1,000 USD*\n` +
    `Instalación única + $70/mes · Chat + llamadas con voz · Transcripciones · 60 días soporte\n\n` +
    `✅ *Garantía:* Pago 50/50. La segunda mitad solo cuando apruebes el resultado.\n` +
    `✅ El sistema queda *100% tuyo* para siempre.\n` +
    `✅ Entrega en máximo *15 días*.\n\n` +
    `¿Quieres agendar una demo gratuita?\nEscribe *3* para reservar tu cita o *menu* para volver.`;
  await sendText(sock, jid, txt);
  sessions[jid].step = 'menu';
}

// ══ 3. AGENDAR CITA ══
async function iniciarCita(sock, jid, session) {
  session.step = 'cita_nombre';
  session.data = {};
  await sendText(sock, jid,
    `*Agendar Demo Gratuita* 📅\n\n` +
    `Genial, vamos a reservar tu espacio.\n\n` +
    `¿Cuál es tu nombre completo?`
  );
}
async function citaNombre(sock, jid, body, session) {
  session.data.nombre = body;
  session.step = 'cita_fecha';
  await sendText(sock, jid,
    `Perfecto, *${body}*. 👋\n\n` +
    `¿Qué día prefieres para la demo?\n` +
    `_(Ejemplo: martes 15 de abril o esta semana)_`
  );
}
async function citaFecha(sock, jid, body, session) {
  session.data.fecha = body;
  session.step = 'cita_hora';
  await sendText(sock, jid,
    `Anotado: *${body}*\n\n` +
    `¿A qué hora te viene bien?\n` +
    `_(Ejemplo: 10 AM, 3 PM)_\n\n` +
    `Horario disponible: Lunes–Viernes 9 AM – 7 PM`
  );
}
async function citaHora(sock, jid, body, session) {
  session.data.hora = body;
  session.data.tel = jid.replace('@s.whatsapp.net', '');
  session.step = 'menu';

  // Guardar en Google Sheets
  try {
    await saveAppointment(session.data);
  } catch(e) {
    console.error('Sheets error:', e.message);
  }

  await sendText(sock, jid,
    `✅ *Cita reservada!*\n\n` +
    `*Nombre:* ${session.data.nombre}\n` +
    `*Día:* ${session.data.fecha}\n` +
    `*Hora:* ${body}\n\n` +
    `Te contactaremos para confirmar. También puedes escribirnos directo:\n` +
    `📱 *+1 (809) 519-2814*\n` +
    `🌐 *www.aimtech.com.do*\n\n` +
    `_Escribe *menu* para volver al inicio_`
  );
}

// ══ 4. CASOS DE EXITO ══
async function casosExito(sock, jid) {
  const txt =
    `*Casos de Éxito AIMTECH* 🏆\n\n` +
    `🏥 *Clínica / Consultorio médico*\n` +
    `Bot agenda citas 24/7, reduce no-shows 60% con recordatorios automáticos.\n\n` +
    `🔧 *Auto Parts / Repuestos*\n` +
    `Responde disponibilidad y precios de piezas al instante. Reservas automáticas.\n\n` +
    `💆 *Spa / Salón de Belleza*\n` +
    `Agenda servicios, recuerda citas, ofrece promociones automáticamente.\n\n` +
    `🏢 *Empresa / Corporativo*\n` +
    `Clasifica leads, responde FAQs y deriva al asesor correcto en segundos.\n\n` +
    `🎓 *Cursos y Capacitación*\n` +
    `Cotiza cursos, inscribe estudiantes y envía materiales automáticamente.\n\n` +
    `_¿Tu negocio es de otro tipo? Escribe *5* para hablar con un asesor._`;
  await sendText(sock, jid, txt);
  sessions[jid].step = 'menu';
}

// ══ 5. CONTACTAR ASESOR ══
async function contactarAsesor(sock, jid) {
  await sendText(sock, jid,
    `*Contactar a un Asesor AIMTECH* 👨‍💼\n\n` +
    `Nuestro equipo está disponible para ayudarte:\n\n` +
    `📱 *WhatsApp:* +1 (809) 519-2814\n` +
    `✉️ *Email:* contacto@aimtech.do\n` +
    `📸 *Instagram:* @somos.aimtech\n` +
    `🌐 *Web:* www.aimtech.com.do\n\n` +
    `⏰ Lunes – Viernes: 9 AM – 7 PM\n` +
    `🤖 Este bot responde 24/7\n\n` +
    `_Escribe *menu* para volver al inicio_`
  );
  sessions[jid].step = 'menu';
}

// ══ 6. CAPTURAR LEAD ══
async function iniciarLead(sock, jid, session) {
  session.step = 'lead_nombre';
  session.data = {};
  await sendText(sock, jid,
    `*Dejanos tus datos* 📋\n\n` +
    `Un asesor te contactará en menos de 24 horas.\n\n` +
    `¿Cuál es tu nombre?`
  );
}
async function capturarNombre(sock, jid, body, session) {
  session.data.nombre = body;
  session.step = 'lead_empresa';
  await sendText(sock, jid, `Hola *${body}*! 👋\n\n¿Cuál es el nombre de tu empresa o negocio?`);
}
async function capturarEmpresa(sock, jid, body, session) {
  session.data.empresa = body;
  session.step = 'lead_necesidad';
  await sendText(sock, jid,
    `*${body}*, perfecto.\n\n` +
    `¿Qué quieres automatizar o mejorar en tu negocio?\n` +
    `_(Ejemplo: atención por WhatsApp, llamadas, agenda de citas, ventas...)_`
  );
}
async function capturarNecesidad(sock, jid, body, session) {
  session.data.necesidad = body;
  session.data.tel = jid.replace('@s.whatsapp.net', '');
  session.step = 'menu';

  try {
    await saveLead(session.data);
  } catch(e) {
    console.error('Sheets error:', e.message);
  }

  await sendText(sock, jid,
    `✅ *¡Listo, ${session.data.nombre}!*\n\n` +
    `Recibimos tus datos:\n` +
    `🏢 Empresa: *${session.data.empresa}*\n` +
    `🎯 Necesidad: *${body}*\n\n` +
    `Un asesor de AIMTECH te contactará en *menos de 24 horas* para darte una solución personalizada.\n\n` +
    `_Escribe *menu* para volver al inicio_`
  );
}

// ══ 7. FAQ ══
async function faq(sock, jid) {
  const txt =
    `*Preguntas Frecuentes* ❓\n\n` +
    `*¿Tengo que cambiar mi número de WhatsApp?*\n` +
    `No. El bot se conecta a tu número actual sin interrupciones.\n\n` +
    `*¿El sistema queda mío para siempre?*\n` +
    `Sí. Es tuyo desde el primer día. AIMTECH no retiene ningún derecho.\n\n` +
    `*¿Cuánto tiempo tarda en estar listo?*\n` +
    `Máximo 15 días hábiles. En promedio 10-12 días.\n\n` +
    `*¿Cómo funciona el pago?*\n` +
    `50% al iniciar. El otro 50% solo cuando apruebes el resultado.\n\n` +
    `*¿Qué pasa si no me gusta el resultado?*\n` +
    `Hacemos todos los ajustes necesarios sin costo adicional.\n\n` +
    `*¿Necesito saber programar?*\n` +
    `No. Nosotros hacemos todo. Tú solo apruebas.\n\n` +
    `*¿El bot puede hablar por teléfono también?*\n` +
    `Sí, con el Plan Premium el bot contesta llamadas con voz natural.\n\n` +
    `_¿Otra pregunta? Escribe *5* para hablar con un asesor._`;
  await sendText(sock, jid, txt);
  sessions[jid].step = 'menu';
}

module.exports = { handleMessage };

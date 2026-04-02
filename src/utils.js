async function sendText(sock, jid, text) {
  await sock.sendMessage(jid, { text });
}

async function sendMenu(sock, jid, text, options) {
  // Fallback a texto plano (compatible con todos los dispositivos)
  const formatted = text + '\n\n' + options.map((o, i) => `*${i+1}* — ${o}`).join('\n');
  await sock.sendMessage(jid, { text: formatted });
}

async function sendButtons(sock, jid, text, buttons) {
  // Nota: botones interactivos requieren WhatsApp Business API oficial
  // Usamos texto plano para máxima compatibilidad con Baileys
  const formatted = text + '\n\n' + buttons.map(b => `▶ ${b}`).join('\n');
  await sock.sendMessage(jid, { text: formatted });
}

module.exports = { sendText, sendMenu, sendButtons };

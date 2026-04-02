const { google } = require('googleapis');

function getAuth() {
  const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON || '{}');
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
}

async function appendRow(sheetName, values) {
  if (!process.env.GOOGLE_SHEET_ID) {
    console.log('[Sheets] No configurado — datos:', values);
    return;
  }
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [values] }
  });
}

async function saveLead({ nombre, empresa, necesidad, tel }) {
  const fecha = new Date().toLocaleString('es-DO', { timeZone: 'America/Santo_Domingo' });
  await appendRow('Leads', [fecha, nombre, empresa, necesidad, tel, 'Nuevo']);
  console.log(`[Lead guardado] ${nombre} — ${empresa}`);
}

async function saveAppointment({ nombre, fecha, hora, tel }) {
  const created = new Date().toLocaleString('es-DO', { timeZone: 'America/Santo_Domingo' });
  await appendRow('Citas', [created, nombre, fecha, hora, tel, 'Pendiente']);
  console.log(`[Cita guardada] ${nombre} — ${fecha} ${hora}`);
}

module.exports = { saveLead, saveAppointment };

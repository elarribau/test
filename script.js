// script.js — logique inchangée mais intégrée aux éléments stylés.
// Charge data.json et compare SHA-256 du mot de passe saisi.

const btn = document.getElementById('btn');
const pidInput = document.getElementById('pid');
const pwInput = document.getElementById('pw');
const feedback = document.getElementById('feedback');

let data = null;

// charge data.json
async function loadData() {
  try {
    const r = await fetch('data.json', {cache: "no-store"});
    if(!r.ok) throw new Error('Impossible de charger data.json : ' + r.status);
    data = await r.json();
  } catch (e) {
    showError('Erreur de chargement des données : ' + e.message);
  }
}

// calcule SHA-256 et retourne hex string
async function sha256hex(message) {
  const enc = new TextEncoder();
  const msgUint8 = enc.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
  return hashHex;
}

function showError(msg){
  feedback.innerHTML = `<div class="error">${msg}</div>`;
  feedback.scrollIntoView({behavior:'smooth', block:'nearest'});
}

// trouve participant par identifiant (case-insensitive)
function findParticipant(id){
  if(!data || !Array.isArray(data.participants)) return null;
  const key = id.trim().toLowerCase();
  return data.participants.find(p => (p.id && p.id.toLowerCase()===key) || (p.displayName && p.displayName.toLowerCase()===key) ) || null;
}

function showResult(match, participant){
  const note = match.note ? escapeHtml(match.note) : '—';
  const html = `<div class="result">
    <strong>Bravo — tu as pioché :</strong>
    <div style="margin-top:10px;font-size:20px;color:#fff;padding:8px 10px;border-radius:8px;background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));border:1px solid rgba(255,255,255,0.03)">${escapeHtml(match.displayName)}</div>
    <div style="margin-top:8px;font-size:13px;color:var(--muted)">Petit mot : ${note}</div>
    <div style="margin-top:10px;font-size:12px;color:var(--muted)">Rappelle-toi : respecte le budget et envoie ton cadeau à l'adresse fournie à l'organisatrice.</div>
  </div>`;
  feedback.innerHTML = html;
  feedback.scrollIntoView({behavior:'smooth', block:'nearest'});
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; });
}

// main
btn.addEventListener('click', async () => {
  feedback.innerHTML = ''; // reset
  const pid = pidInput.value.trim();
  const pw = pwInput.value;
  if(!pid) { showError('Merci de saisir ton identifiant.'); return; }
  if(!pw) { showError('Merci de saisir ton mot de passe.'); return; }
  if(!data) { showError('Données non chargées. Recharge la page.'); return; }

  const part = findParticipant(pid);
  if(!part) { showError("Identifiant inconnu. Vérifie l'orthographe ou contacte l'organisatrice."); return; }

  try {
    const h = await sha256hex(pw);
    if(h !== part.pwHash) { showError("Mot de passe incorrect."); return; }
    // ok, trouve la personne tirée
    const matchId = part.matchId;
    const match = data.participants.find(p => p.id === matchId);
    if(!match) {
      showError("Résultat non trouvé (erreur d'organisation). Contacte l'organisatrice.");
      return;
    }
    showResult(match, part);
  } catch (e) {
    showError('Erreur lors du traitement : ' + e.message);
  }
});

// charge au démarrage
loadData();

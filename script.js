// script.js

// Ouvrir la carte au clic
const card = document.getElementById('loginCard');
const openCardBtn = document.getElementById('openCardBtn');
const loginForm = document.getElementById('loginForm');
const resultBox = document.getElementById('resultBox');
const resultText = document.getElementById('resultText');

openCardBtn.addEventListener('click', () => {
  card.classList.add('open');
});

// Simule la base de données en chargeant participants.json
let participants = [];

fetch('participants.json')
  .then((res) => res.json())
  .then((data) => {
    participants = data;
  })
  .catch((err) => {
    console.error('Erreur de chargement du fichier participants.json', err);
  });

// Gestion du formulaire
loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const prenom = document.getElementById('prenom').value.trim().toLowerCase();
  const password = document.getElementById('password').value;

  if (!prenom || !password) {
    alert('Merci de remplir ton prénom et ton mot de passe.');
    return;
  }

  // Recherche dans la "base de données"
  const user = participants.find(
    (p) =>
      p.prenom.toLowerCase() === prenom &&
      p.password === password
  );

  if (!user) {
    resultText.textContent =
      'Impossible de te trouver… Vérifie ton prénom et ton mot de passe, ou contacte l’organisateur.';
    resultBox.hidden = false;
    return;
  }

  // Affiche le destinataire
  resultText.innerHTML =
    'Tu as tiré&nbsp;<strong>' +
    user.cible +
    '</strong>&nbsp;! Joyeux Noël 🎄';

  resultBox.hidden = false;
});

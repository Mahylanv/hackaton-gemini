document.getElementById('startScraping').addEventListener('click', async () => {
  const status = document.getElementById('status');
  const apiKey = document.getElementById('apiKey').value;
  
  status.innerText = "Recherche des profils...";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.url.includes("linkedin.com/school")) {
    status.innerText = "Erreur : Allez sur la page Alumni de LinkedIn.";
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: scrapeLinkedInAlumni,
    args: [apiKey]
  }, (results) => {
    if (chrome.runtime.lastError) {
      status.innerText = "Erreur : " + chrome.runtime.lastError.message;
    } else if (results && results[0].result) {
      const res = results[0].result;
      if (res.error) {
        status.innerText = "Erreur : " + res.error;
      } else {
        status.innerText = "Succès ! " + res.count + " alumni synchronisés.";
      }
    }
  });
});

// Cette fonction est injectée dans la page LinkedIn
async function scrapeLinkedInAlumni(apiKey) {
  const cards = document.querySelectorAll('.org-people-profile-card');
  const alumniData = [];

  cards.forEach(card => {
    const name = card.querySelector('.lt-line-clamp--single-line')?.innerText?.trim();
    const linkedinUrl = card.querySelector('a[data-test-app-is-alumni-card]')?.href;
    const profileImageUrl = card.querySelector('img')?.src;
    const degreeInfo = card.querySelector('.lt-line-clamp--multi-line')?.innerText?.trim();

    if (name && linkedinUrl) {
      alumniData.push({
        fullName: name,
        linkedinUrl: linkedinUrl.split('?')[0],
        profileImageUrl: profileImageUrl,
        degree: degreeInfo || "Alumni MyDigitalSchool",
        gradYear: 2024
      });
    }
  });

  if (alumniData.length === 0) return { error: "Aucun profil trouvé." };

  try {
    const response = await fetch('http://localhost:3000/api/alumni/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ data: alumniData })
    });

    return await response.json();
  } catch (err) {
    return { error: "Serveur local injoignable (CORS ou Next.js arrêté)." };
  }
}

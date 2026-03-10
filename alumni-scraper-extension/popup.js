document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey');
  const status = document.getElementById('status');
  const progressSection = document.getElementById('progressSection');
  const progressBar = document.getElementById('progressBar');
  const pageCountText = document.getElementById('pageCount');
  const timeRemainingText = document.getElementById('timeRemaining');
  
  const saved = await chrome.storage.local.get(['alumni_api_key']);
  if (saved.alumni_api_key) apiKeyInput.value = saved.alumni_api_key;

  document.getElementById('startScraping').addEventListener('click', () => startScan(1));
  document.getElementById('startAutoScraping').addEventListener('click', () => startScan(999)); // 999 = illimité

  async function startScan(maxPages) {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      status.innerText = "Erreur : Entrez votre clé.";
      return;
    }
    await chrome.storage.local.set({ alumni_api_key: apiKey });
    
    // Reset UI
    progressSection.style.display = 'block';
    progressBar.style.width = '0%';
    status.innerText = "Initialisation du scan...";

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // On utilise un port de communication pour recevoir les updates en temps réel
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scrapeLinkedInInfinite,
      args: [apiKey, maxPages]
    });
  }

  // Ecouteur pour les messages venant du script injecté
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'PROGRESS') {
      const { page, totalEstimated, alumniFound } = msg;
      const progress = Math.min((page / totalEstimated) * 100, 100);
      
      progressBar.style.width = `${progress}%`;
      pageCountText.innerText = `Page: ${page} (${alumniFound} profils)`;
      
      // Calcul du temps restant (environ 12s par page)
      const remainingPages = Math.max(totalEstimated - page, 0);
      const seconds = remainingPages * 12;
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      timeRemainingText.innerText = `Temps estimé: ${mins}:${secs.toString().padStart(2, '0')}`;
      
      status.innerHTML = `Scan en cours... <span class="timer">${mins}:${secs.toString().padStart(2, '0')}</span> restant`;
    }
    if (msg.type === 'FINISHED') {
      progressBar.style.width = '100%';
      status.innerText = "Scan terminé avec succès !";
      timeRemainingText.innerText = "Temps estimé: 0:00";
    }
  });
});

async function scrapeLinkedInInfinite(apiKey, maxPages) {
  const log = (msg) => {
    fetch('http://localhost:3000/api/alumni/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'DEBUG', message: msg })
    }).catch(() => {});
  };

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  
  // Estimation du total (LinkedIn affiche souvent "X résultats", on divise par 10)
  const totalResultsText = document.querySelector('.search-results-container h2, .pb-2')?.innerText || "100";
  const totalEstimatedPages = Math.min(Math.ceil(parseInt(totalResultsText.replace(/\D/g, '')) / 10) || 10, maxPages);

  let totalAlumniFound = 0;
  let lastFirstProfileUrl = "";

  for (let page = 1; page <= maxPages; page++) {
    log(`>>> SCAN PAGE ${page} SUR ${totalEstimatedPages} (Restant: ~${(totalEstimatedPages - page) * 12}s) <<<`);
    
    // 1. Scroll progressif
    for (let i = 1; i <= 3; i++) {
      window.scrollTo(0, (document.body.scrollHeight / 3) * i);
      await sleep(1000);
    }

    const alumniData = [];
    const processedUrls = new Set();
    const profileLinks = document.querySelectorAll('a[href*="/in/"]');

    profileLinks.forEach((link) => {
      const url = link.href.split('?')[0];
      if (processedUrls.has(url) || url.includes('/company/')) return;

      const container = link.closest('li, .reusable-search__result-container, .flex') || link.parentElement;
      const avatarUrl = container?.querySelector('img')?.src;
      const isRealPhoto = avatarUrl && !avatarUrl.includes('ghost-person') && !avatarUrl.includes('data:image/gif');

      if (!isRealPhoto) return;

      let name = link.innerText.split('\n')[0].trim();
      if (name.length > 2 && !name.includes('LinkedIn') && !name.includes('relation')) {
        const job = container?.innerText?.split('\n').find(t => t.trim().length > 5 && !t.includes(name) && !t.includes('Se connecter')) || "Alumni MyDigitalSchool";
        alumniData.push({ fullName: name, linkedinUrl: url, profileImageUrl: avatarUrl, degree: job.trim().substring(0, 150), gradYear: 2024 });
        processedUrls.add(url);
      }
    });

    if (alumniData.length > 0) {
      const currentFirstUrl = alumniData[0].linkedinUrl;
      if (currentFirstUrl !== lastFirstProfileUrl) {
        lastFirstProfileUrl = currentFirstUrl;
        totalAlumniFound += alumniData.length;
        
        // Envoi des données
        await fetch('http://localhost:3000/api/alumni/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
          body: JSON.stringify({ data: alumniData })
        });

        // Envoi de la progression à la popup
        chrome.runtime.sendMessage({ type: 'PROGRESS', page, totalEstimated: totalEstimatedPages, alumniFound: totalAlumniFound });
      }
    }

    // Navigation
    const nextBtn = document.querySelector('[data-testid="pagination-controls-next-button-visible"]') || 
                     document.querySelector('button[aria-label="Suivant"], button[aria-label="Next"]');

    if (nextBtn && !nextBtn.disabled && page < maxPages) {
      nextBtn.click();
      
      let attempts = 0;
      let pageChanged = false;
      while (attempts < 15) {
        await sleep(1000);
        const firstLink = document.querySelector('a[href*="/in/"]');
        if (firstLink && firstLink.href.split('?')[0] !== lastFirstProfileUrl) {
          pageChanged = true;
          break;
        }
        attempts++;
      }
      if (!pageChanged) break;
    } else {
      break;
    }
  }

  chrome.runtime.sendMessage({ type: 'FINISHED' });
  log(`>>> SCAN TERMINÉ : ${totalAlumniFound} PROFILS RÉCUPÉRÉS EN TOTALITÉ <<<`);
}

// Ce script s'exécute sur les pages LinkedIn
console.log("[AlumniScraper] Extension activée sur LinkedIn");

function extractProfileData() {
  const name = document.querySelector('h1')?.innerText || "";
  const headline = document.querySelector('.text-body-medium')?.innerText || "";
  
  // Extraction de l'entreprise (souvent dans la section experience)
  const experienceSection = document.querySelector('#experience');
  let company = "";
  if (experienceSection) {
    const latestExp = experienceSection.nextElementSibling?.querySelector('.display-flex.flex-column.full-width');
    company = latestExp?.querySelector('span[aria-hidden="true"]')?.innerText || "";
  }

  const avatar = document.querySelector('.pv-top-card-profile-picture__image')?.src || "";

  return {
    linkedin_url: window.location.href.split('?')[0],
    current_job_title: headline,
    current_company: company,
    avatar_url: avatar
  };
}

// Envoyer les données quand on clique sur le bouton de la popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "get_profile_data") {
    const data = extractProfileData();
    sendResponse(data);
  }
});

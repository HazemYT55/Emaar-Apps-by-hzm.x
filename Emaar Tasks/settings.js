document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('emaar_theme') || 'theme-blue';
  const savedLang = localStorage.getItem('emaar_lang') || 'ar';
  const savedFont = localStorage.getItem('emaar_font') || '16px';

  applyTheme(savedTheme);
  applyLanguage(savedLang);
  applyFont(savedFont);
  
  if (document.querySelectorAll('.theme-btn').length > 0) {
    updateActiveButtons(savedTheme, savedLang, savedFont);
  }
});

function updateActiveButtons(theme, lang, font) {
  // 1. Theme Buttons
  document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
  const activeThemeBtn = document.getElementById(theme);
  if (activeThemeBtn) activeThemeBtn.classList.add('active');

  // 2. Language Buttons
  const btnLangAr = document.getElementById('btnLangAr');
  const btnLangEn = document.getElementById('btnLangEn');
  if (btnLangAr && btnLangEn) {
    btnLangAr.style.opacity = (lang === 'ar') ? '1' : '0.5';
    btnLangEn.style.opacity = (lang === 'en') ? '1' : '0.5';
  }

  // 3. Font Buttons
  document.querySelectorAll('.font-btn').forEach(btn => btn.classList.remove('active'));
  if (font === '14px') {
    const el = document.getElementById('font-small');
    if (el) el.classList.add('active');
  }
  if (font === '16px') {
    const el = document.getElementById('font-normal');
    if (el) el.classList.add('active');
  }
  if (font === '18px') {
    const el = document.getElementById('font-large');
    if (el) el.classList.add('active');
  }
}

function setTheme(themeName) {
  localStorage.setItem('emaar_theme', themeName);
  applyTheme(themeName);
  updateActiveButtons(themeName, localStorage.getItem('emaar_lang') || 'ar', localStorage.getItem('emaar_font') || '16px');
  if (typeof Sounds !== 'undefined') Sounds.playClick();
}

function applyTheme(themeName) {
  document.body.classList.remove('theme-blue', 'theme-dark', 'theme-gold');
  if (themeName !== 'theme-blue') {
    document.body.classList.add(themeName);
  }
}

function setLanguage(lang) {
  localStorage.setItem('emaar_lang', lang);
  window.location.reload(); 
}

function applyLanguage(lang) {
  const html = document.getElementById('htmlRoot') || document.documentElement;
  if (lang === 'ar') {
    html.setAttribute('dir', 'rtl');
    html.setAttribute('lang', 'ar');
  } else {
    html.setAttribute('dir', 'ltr');
    html.setAttribute('lang', 'en');
  }
}

function setFontSize(size) {
  localStorage.setItem('emaar_font', size);
  applyFont(size);
  updateActiveButtons(localStorage.getItem('emaar_theme') || 'theme-blue', localStorage.getItem('emaar_lang') || 'ar', size);
  if (typeof Sounds !== 'undefined') Sounds.playClick();
}

function applyFont(size) {
  document.documentElement.style.setProperty('--font-size-base', size);
}
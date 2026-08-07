const translations={
  en:{
    "nav.projects":"Projects","nav.about":"About",
    "hero.role":"3D Artist · Technical Artist",
    "hero.intro":"I create animation, interactive experiences<br>and technical visualization.",
    "hero.location":"● Nürnberg, Germany","hero.showreel":"Showreel","hero.comingSoon":"coming soon",
    "projects.label":"Selected work","projects.countTwo":"2 projects",
    "projects.interactive.title":"Interactive<br>Experiences","projects.interactive.text":"Interactive 3D solutions, WebAR, configurators and real-time applications.",
    "projects.animation.title":"Animation","projects.animation.text":"2D and 3D animation, motion design, character animation and storytelling.",
    "projects.game.title":"Game<br>Development","projects.game.text":"Game design, artwork, animation and development for engaging experiences.",
    "about.title":"About me",
    "about.p1":"I’m a 3D Artist and Technical Artist with experience in 3D graphics, animation, interactive applications and game development. In my work, I combine an artistic approach with technical thinking—creating visual content, real-time solutions, technical visualizations and interactive projects.",
    "about.p2":"I enjoy exploring complex challenges, seeing the project as a whole, finding the right balance between visual quality and technical constraints, and turning ideas into clear, working solutions.",
    "about.locationText":"Nürnberg, Germany","about.languages":"German · English · Ukrainian · Russian","about.cvSoon":"CV coming soon",
    "footer.rights":"All rights reserved","showreel.alert":"Showreel placeholder — the real video will be connected here."
  },
  de:{
    "nav.projects":"Projekte","nav.about":"Über mich",
    "hero.role":"3D Artist · Technical Artist",
    "hero.intro":"Ich entwickle Animationen, interaktive Erlebnisse<br>und technische Visualisierungen.",
    "hero.location":"● Nürnberg, Deutschland","hero.showreel":"Showreel","hero.comingSoon":"demnächst",
    "projects.label":"Ausgewählte Arbeiten","projects.countTwo":"2 Projekte",
    "projects.interactive.title":"Interaktive<br>Erlebnisse","projects.interactive.text":"Interaktive 3D-Lösungen, WebAR, Konfiguratoren und Echtzeitanwendungen.",
    "projects.animation.title":"Animation","projects.animation.text":"2D- und 3D-Animation, Motion Design, Character Animation und visuelles Storytelling.",
    "projects.game.title":"Game<br>Development","projects.game.text":"Game Design, Grafik, Animation und Entwicklung für überzeugende Spielerlebnisse.",
    "about.title":"Über mich",
    "about.p1":"Ich bin 3D Artist und Technical Artist mit Erfahrung in 3D-Grafik, Animation, interaktiven Anwendungen und Game Development. In meiner Arbeit verbinde ich gestalterisches Denken mit einem technischen Ansatz und entwickle visuellen Content, Echtzeitlösungen, technische Visualisierungen und interaktive Projekte.",
    "about.p2":"Ich arbeite mich gerne in komplexe Aufgaben ein, behalte das Gesamtbild eines Projekts im Blick, finde die passende Balance zwischen visueller Qualität und technischen Rahmenbedingungen und verwandle Ideen in klare, funktionierende Lösungen.",
    "about.locationText":"Nürnberg, Deutschland","about.languages":"Deutsch · Englisch · Ukrainisch · Russisch","about.cvSoon":"CV folgt in Kürze",
    "footer.rights":"Alle Rechte vorbehalten","showreel.alert":"Showreel-Platzhalter — hier wird später das echte Video eingebunden."
  },
  uk:{
    "nav.projects":"Проєкти","nav.about":"Про мене",
    "hero.role":"3D Artist · Technical Artist",
    "hero.intro":"Я створюю анімацію, інтерактивні проєкти<br>та технічну візуалізацію.",
    "hero.location":"● Нюрнберг, Німеччина","hero.showreel":"Шоуріл","hero.comingSoon":"незабаром",
    "projects.label":"Вибрані роботи","projects.countTwo":"2 проєкти",
    "projects.interactive.title":"Інтерактивні<br>проєкти","projects.interactive.text":"Інтерактивні 3D-рішення, WebAR, конфігуратори та застосунки реального часу.",
    "projects.animation.title":"Анімація","projects.animation.text":"2D- і 3D-анімація, motion design, анімація персонажів та візуальний сторітелінг.",
    "projects.game.title":"Розробка<br>ігор","projects.game.text":"Геймдизайн, графіка, анімація та розробка захопливих ігрових проєктів.",
    "about.title":"Про мене",
    "about.p1":"Я 3D Artist і Technical Artist із досвідом у 3D-графіці, анімації, інтерактивних застосунках і розробці ігор. У своїй роботі я поєдную художній підхід із технічним мисленням — створюю візуальний контент, рішення реального часу, технічні візуалізації та інтерактивні проєкти.",
    "about.p2":"Мені подобається розбиратися у складних завданнях, бачити проєкт цілісно, знаходити баланс між візуальною якістю й технічними обмеженнями та перетворювати ідеї на зрозумілі, робочі рішення.",
    "about.locationText":"Нюрнберг, Німеччина","about.languages":"Німецька · Англійська · Українська · Російська","about.cvSoon":"CV незабаром",
    "footer.rights":"Усі права захищено","showreel.alert":"Це місце для шоурілу — пізніше тут буде підключено справжнє відео."
  }
};

const languageButtons=[...document.querySelectorAll('[data-lang]')];
let currentLanguage='en';

function setLanguage(language){
  const lang=translations[language]?language:'en';
  currentLanguage=lang;
  document.documentElement.lang=lang;
  document.querySelectorAll('[data-i18n]').forEach(element=>{
    const value=translations[lang][element.dataset.i18n];
    if(value) element.textContent=value;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(element=>{
    const value=translations[lang][element.dataset.i18nHtml];
    if(value) element.innerHTML=value;
  });
  languageButtons.forEach(button=>{
    const active=button.dataset.lang===lang;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  localStorage.setItem('portfolio-language',lang);
}

languageButtons.forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.lang)));

const savedLanguage=localStorage.getItem('portfolio-language');
const browserLanguage=(navigator.language||'en').slice(0,2);
setLanguage(savedLanguage||(['en','de','uk'].includes(browserLanguage)?browserLanguage:'en'));

const portraitImage=document.querySelector('.portrait img');
if(portraitImage) portraitImage.src='assets/portrait-final.webp?v=2';

document.getElementById('year').textContent=new Date().getFullYear();
document.querySelector('.play').addEventListener('click',()=>alert(translations[currentLanguage]['showreel.alert']));

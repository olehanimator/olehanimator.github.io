const translations={
  en:{
    "nav.projects":"Projects","nav.about":"About",
    "hero.role":"3D Artist · Technical Artist",
    "hero.intro":"I create animation, interactive experiences<br>and technical visualization.",
    "hero.location":"● Nürnberg, Germany","hero.showreel":"Showreel","hero.comingSoon":"coming soon",
    "projects.label":"Selected work",
    "projects.interactive.title":"Interactive<br>Experiences","projects.interactive.text":"Interactive 3D solutions, WebAR, configurators and real-time applications.",
    "projects.animation.title":"Animation","projects.animation.text":"2D and 3D animation, motion design, character animation and storytelling.",
    "projects.game.title":"Game<br>Development","projects.game.text":"Game design, artwork, animation and development for engaging experiences.",
    "about.portrait":"Portrait","about.title":"About me",
    "about.p1":"I’m a 3D Artist and Technical Artist with a background in animation, interactive media and game development. I combine artistic vision with technical expertise to create engaging visual experiences.",
    "about.p2":"I enjoy solving complex challenges and bringing ideas to life through animation, real-time technologies and interactive design.",
    "about.location":"● Nürnberg, Germany","about.languages":"◎ English · Ukrainian · Russian","about.cv":"⇩ Download CV",
    "footer.rights":"All rights reserved","showreel.alert":"Showreel placeholder — the real video will be connected here."
  },
  de:{
    "nav.projects":"Projekte","nav.about":"Über mich",
    "hero.role":"3D Artist · Technical Artist",
    "hero.intro":"Ich entwickle Animationen, interaktive Erlebnisse<br>und technische Visualisierungen.",
    "hero.location":"● Nürnberg, Deutschland","hero.showreel":"Showreel","hero.comingSoon":"demnächst",
    "projects.label":"Ausgewählte Arbeiten",
    "projects.interactive.title":"Interaktive<br>Erlebnisse","projects.interactive.text":"Interaktive 3D-Lösungen, WebAR, Konfiguratoren und Echtzeitanwendungen.",
    "projects.animation.title":"Animation","projects.animation.text":"2D- und 3D-Animation, Motion Design, Character Animation und visuelles Storytelling.",
    "projects.game.title":"Game<br>Development","projects.game.text":"Game Design, Grafik, Animation und Entwicklung für überzeugende Spielerlebnisse.",
    "about.portrait":"Porträt","about.title":"Über mich",
    "about.p1":"Ich bin 3D Artist und Technical Artist mit Erfahrung in Animation, interaktiven Medien und Game Development. Ich verbinde gestalterische Vision mit technischem Know-how, um überzeugende visuelle Erlebnisse zu entwickeln.",
    "about.p2":"Ich löse gerne komplexe Aufgaben und setze Ideen mit Animation, Echtzeittechnologien und interaktivem Design um.",
    "about.location":"● Nürnberg, Deutschland","about.languages":"◎ Englisch · Ukrainisch · Russisch","about.cv":"⇩ CV herunterladen",
    "footer.rights":"Alle Rechte vorbehalten","showreel.alert":"Showreel-Platzhalter — hier wird später das echte Video eingebunden."
  },
  uk:{
    "nav.projects":"Проєкти","nav.about":"Про мене",
    "hero.role":"3D Artist · Technical Artist",
    "hero.intro":"Я створюю анімацію, інтерактивні проєкти<br>та технічну візуалізацію.",
    "hero.location":"● Нюрнберг, Німеччина","hero.showreel":"Шоуріл","hero.comingSoon":"незабаром",
    "projects.label":"Вибрані роботи",
    "projects.interactive.title":"Інтерактивні<br>проєкти","projects.interactive.text":"Інтерактивні 3D-рішення, WebAR, конфігуратори та застосунки реального часу.",
    "projects.animation.title":"Анімація","projects.animation.text":"2D- і 3D-анімація, motion design, анімація персонажів та візуальний сторітелінг.",
    "projects.game.title":"Розробка<br>ігор","projects.game.text":"Геймдизайн, графіка, анімація та розробка захопливих ігрових проєктів.",
    "about.portrait":"Портрет","about.title":"Про мене",
    "about.p1":"Я 3D Artist і Technical Artist із досвідом в анімації, інтерактивних медіа та розробці ігор. Я поєдную художнє бачення з технічною експертизою, щоб створювати виразні візуальні проєкти.",
    "about.p2":"Мені подобається розв’язувати складні завдання та втілювати ідеї за допомогою анімації, технологій реального часу й інтерактивного дизайну.",
    "about.location":"● Нюрнберг, Німеччина","about.languages":"◎ Англійська · Українська · Російська","about.cv":"⇩ Завантажити CV",
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

document.getElementById('year').textContent=new Date().getFullYear();
document.querySelector('.play').addEventListener('click',()=>alert(translations[currentLanguage]['showreel.alert']));

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
    "about.p1":"I’m a 3D Artist and Technical Artist focused on animation, interactive applications and real-time graphics. I develop prototypes, WebAR experiences and technical visualizations, combining creative direction with practical production workflows.",
    "about.p2":"Independent work on new topics and the development of practical solutions are part of my everyday work.",
    "about.location":"● Nürnberg, Germany","about.languages":"◎ German · English · Ukrainian · Russian","about.cv":"⇩ Download CV",
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
    "about.p1":"Ich bin 3D Artist und Technical Artist mit Schwerpunkt Animation sowie Erfahrung in interaktiven Anwendungen und Echtzeitgrafik. Ich entwickle Prototypen, WebAR-Erlebnisse und technische Visualisierungen und verbinde dabei kreative Gestaltung mit praxistauglichen Produktions-Workflows.",
    "about.p2":"Eigenständige Einarbeitung in neue Themen und die Entwicklung praxistauglicher Lösungen gehören zu meinem Arbeitsalltag.",
    "about.location":"● Nürnberg, Deutschland","about.languages":"◎ Deutsch · Englisch · Ukrainisch · Russisch","about.cv":"⇩ CV herunterladen",
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
    "about.p1":"Я 3D Artist і Technical Artist зі спеціалізацією в анімації та досвідом у інтерактивних застосунках і графіці реального часу. Я створюю прототипи, WebAR-рішення та технічні візуалізації, поєднуючи творче бачення з практичними виробничими процесами.",
    "about.p2":"Самостійне опанування нових тем і розробка практичних рішень є частиною моєї щоденної роботи.",
    "about.location":"● Нюрнберг, Німеччина","about.languages":"◎ Німецька · Англійська · Українська · Російська","about.cv":"⇩ Завантажити CV",
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

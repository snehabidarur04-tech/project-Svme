const year = document.querySelector('[data-year]');
if (year) year.textContent = new Date().getFullYear();

const hamburger = document.querySelector('.hamb');
const menu = document.querySelector('.menu');
if (hamburger && menu) {
  hamburger.addEventListener('click', () => {
    menu.classList.toggle('open');
    hamburger.closest('.header')?.classList.toggle('menu-open', menu.classList.contains('open'));
    hamburger.setAttribute('aria-expanded', menu.classList.contains('open'));
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.classList.remove('open'); hamburger.closest('.header')?.classList.remove('menu-open'); }));
}

// Scroll-reveal: fades sections up into view as the page is scrolled.
// The CSS only hides these elements once html.js-anim is present (set
// by an inline script in <head> that can't fail the way loading this
// external file can), so a broken/blocked script here just means the
// animation doesn't run — it never leaves content invisible.
// Give the sticky header a bit more presence once the page has scrolled,
// so it reads as "floating" navigation rather than just a static bar.
const siteHeader = document.querySelector('.header');
if (siteHeader) {
  const setScrolled = () => siteHeader.classList.toggle('is-scrolled', window.scrollY > 12);
  setScrolled();
  window.addEventListener('scroll', setScrolled, { passive: true });
}

const reveals = document.querySelectorAll('.reveal');
if (reveals.length) {
  // Anything already on screen at load reveals immediately — no one
  // should see a blank hero while waiting for a scroll event.
  const inView = el => el.getBoundingClientRect().top < window.innerHeight * 0.92;
  reveals.forEach(el => { if (inView(el)) el.classList.add('is-visible'); });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => { if (!el.classList.contains('is-visible')) observer.observe(el); });
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  // Safety net: whatever happens with the observer, nothing stays
  // hidden for more than a beat.
  setTimeout(() => reveals.forEach(el => el.classList.add('is-visible')), 1600);
}

document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const notice = form.querySelector('.notice');
    if (notice) notice.classList.add('show');
    form.reset();
  });
});

const modal = document.querySelector('#applyModal');
const roleInput = document.querySelector('#applyRole');
if (modal) {
  document.querySelectorAll('[data-apply]').forEach(button => {
    button.addEventListener('click', () => {
      if (roleInput) roleInput.value = button.dataset.apply || '';
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
  const closeModal = () => { modal.classList.remove('open'); document.body.style.overflow = ''; };
  modal.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', closeModal));
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

// Hero carousel inspired by modern staffing-site sliders.
const slider = document.querySelector('[data-slider]');
if (slider) {
  const slides = [...slider.querySelectorAll('.slide-copy')];
  const dots = [...slider.querySelectorAll('.dot')];
  let current = 0;
  let timer;
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
  };
  const restart = () => { clearInterval(timer); timer = setInterval(() => show(current + 1), 5600); };
  slider.querySelector('[data-prev]')?.addEventListener('click', () => { show(current - 1); restart(); });
  slider.querySelector('[data-next]')?.addEventListener('click', () => { show(current + 1); restart(); });
  dots.forEach(dot => dot.addEventListener('click', () => { show(Number(dot.dataset.slide)); restart(); }));
  slider.addEventListener('mouseenter', () => clearInterval(timer));
  slider.addEventListener('mouseleave', restart);
  show(0); restart();
}


// Keep in-page navigation reliable with the sticky header.
document.querySelectorAll('a[href*="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const href = link.getAttribute('href') || '';
    const hash = href.split('#')[1];
    if (!hash) return;
    const targetPage = href.split('#')[0];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const samePage = href.startsWith('#') || targetPage === '' || targetPage === currentPage;
    if (!samePage) return;
    const target = document.getElementById(hash);
    if (!target) return;
    event.preventDefault();
    const offset = document.querySelector('.header')?.offsetHeight || 80;
    const y = target.getBoundingClientRect().top + window.scrollY - offset - 18;
    window.scrollTo({ top: y, behavior: 'smooth' });
    history.replaceState(null, '', '#' + hash);
  });
});

// Service tabs: highlight the service currently in view and make each tab a reliable jump target.
const serviceTabs = [...document.querySelectorAll('.service-tab')];
const serviceDetails = [...document.querySelectorAll('.service-detail[id]')];
if (serviceTabs.length && serviceDetails.length && 'IntersectionObserver' in window) {
  const serviceObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      serviceTabs.forEach(tab => tab.classList.toggle('active', tab.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-25% 0px -55% 0px', threshold: 0 });
  serviceDetails.forEach(item => serviceObserver.observe(item));
}

// Interactive industry cards on the home page.
const industryButtons = [...document.querySelectorAll('[data-industry]')];
const industryPanel = document.querySelector('.industry-detail-panel');
if (industryButtons.length && industryPanel) {
  const title = industryPanel.querySelector('strong');
  const text = industryPanel.querySelector('p');
  const label = industryPanel.querySelector('span');
  const activateIndustry = button => {
    industryButtons.forEach(item => item.classList.toggle('active', item === button));
    if (title) title.textContent = button.dataset.industry || '';
    if (text) text.textContent = button.dataset.detail || '';
    if (label) label.textContent = 'SVME INDUSTRY FOCUS';
    industryPanel.classList.add('show');
  };
  industryButtons.forEach(button => button.addEventListener('click', () => activateIndustry(button)));
}

// Give the story section a subtle active state as it enters the viewport.
const stage = document.querySelector('.scroll-stage');
if (stage && 'IntersectionObserver' in window) {
  const stageObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('is-active', entry.isIntersecting));
  }, { threshold: .45 });
  stageObserver.observe(stage);
}

// Home page service flow: interactive editorial selector instead of cards.
const serviceFlow = document.querySelector('[data-service-flow]');
if (serviceFlow) {
  const tabs = [...serviceFlow.querySelectorAll('.service-flow-tab')];
  const copies = [...serviceFlow.querySelectorAll('.service-flow-copy')];
  const stage = serviceFlow.querySelector('.service-flow-stage');
  const progress = serviceFlow.querySelector('.service-flow-progress span');
  const activate = index => {
    tabs.forEach((tab, i) => tab.classList.toggle('active', i === index));
    copies.forEach((copy, i) => copy.classList.toggle('active', i === index));
    if (stage) stage.dataset.active = String(index);
    if (progress) progress.style.width = `${(index + 1) * 25}%`;
  };
  tabs.forEach((tab, index) => tab.addEventListener('click', () => activate(index)));
  activate(0);
}

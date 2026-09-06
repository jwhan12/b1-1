const GITHUB_USERNAME = 'jwhan12';

// 화면에 필요한 값만 한곳에서 관리합니다.
const state = {
  theme: localStorage.getItem('theme') || 'light',
  projects: { status: 'loading', data: [] },
  formErrors: { name: '', email: '', message: '' },
};

const elements = {
  header: document.querySelector('#site-header'),
  menuButton: document.querySelector('#menu-button'),
  navMenu: document.querySelector('#nav-menu'),
  themeButton: document.querySelector('#theme-button'),
  scrollTopButton: document.querySelector('#scroll-top-button'),
  projectsContainer: document.querySelector('#projects-container'),
  contactForm: document.querySelector('#contact-form'),
  formSuccess: document.querySelector('#form-success'),
  inputs: {
    name: document.querySelector('#name'),
    email: document.querySelector('#email'),
    message: document.querySelector('#message'),
  },
  errors: {
    name: document.querySelector('#name-error'),
    email: document.querySelector('#email-error'),
    message: document.querySelector('#message-error'),
  },
};

const applyTheme = () => {
  document.documentElement.dataset.theme = state.theme;

  const isDark = state.theme === 'dark';
  elements.themeButton.textContent = isDark ? '☀️' : '🌙';
  elements.themeButton.setAttribute(
    'aria-label',
    isDark ? '라이트 모드로 전환' : '다크 모드로 전환',
  );
};

const toggleTheme = () => {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', state.theme);
  applyTheme();
};

const renderProjects = () => {
  const { status, data } = state.projects;

  if (status === 'loading') {
    elements.projectsContainer.innerHTML = `
      <div class="project-card state-card">
        <div class="spinner"></div>
        <p>프로젝트를 불러오는 중입니다...</p>
      </div>`;
    return;
  }

  if (status === 'error') {
    elements.projectsContainer.innerHTML = `
      <div class="project-card state-card">
        <p>프로젝트를 불러올 수 없습니다.</p>
        <button class="button primary retry-button" type="button">다시 시도</button>
      </div>`;
    document.querySelector('.retry-button').addEventListener('click', fetchProjects);
    return;
  }

  if (status === 'empty') {
    elements.projectsContainer.innerHTML = `
      <div class="project-card state-card"><p>표시할 프로젝트가 없습니다.</p></div>`;
    return;
  }

  elements.projectsContainer.innerHTML = data.map((repo) => {
    const { name, description, language, stargazers_count: stars, html_url: url } = repo;

    return `
      <article class="project-card">
        <h3>${name}</h3>
        <p>${description || '저장소 설명이 없습니다.'}</p>
        <div class="project-meta">
          <span>${language || '언어 정보 없음'}</span>
          <span>★ ${stars}</span>
        </div>
        <a class="project-link" href="${url}" target="_blank" rel="noreferrer">저장소 보기 →</a>
      </article>`;
  }).join('');
};

const fetchProjects = async () => {
  state.projects.status = 'loading';
  renderProjects();

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`,
    );

    if (!response.ok) {
      throw new Error(`GitHub API 오류: ${response.status}`);
    }

    const repositories = await response.json();
    state.projects.data = repositories;
    state.projects.status = repositories.length === 0 ? 'empty' : 'success';
  } catch (error) {
    state.projects.status = 'error';
  }

  renderProjects();
};

const validateField = (fieldName) => {
  const input = elements.inputs[fieldName];
  const value = input.value.trim();
  let message = '';

  if (!value) {
    message = '필수 입력 항목입니다.';
  } else if (fieldName === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    message = '올바른 이메일 형식이 아닙니다.';
  }

  state.formErrors[fieldName] = message;
  elements.errors[fieldName].textContent = message;
  input.classList.toggle('invalid', Boolean(message));
  return !message;
};

const handleSubmit = (event) => {
  event.preventDefault();
  const isValid = Object.keys(elements.inputs).map(validateField).every(Boolean);

  if (!isValid) {
    elements.formSuccess.textContent = '';
    return;
  }

  elements.formSuccess.textContent = '메시지가 성공적으로 전송된 것으로 처리했습니다.';
  elements.contactForm.reset();
};

const updateScrollUi = () => {
  elements.header.classList.toggle('scrolled', window.scrollY > 60);
  elements.scrollTopButton.classList.toggle('show', window.scrollY > 300);
};

const closeMenu = () => {
  elements.navMenu.classList.remove('active');
  elements.menuButton.setAttribute('aria-expanded', 'false');
};

const initRevealAnimation = () => {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.reveal').forEach((section) => observer.observe(section));
};

const init = () => {
  applyTheme();
  fetchProjects();
  initRevealAnimation();
  updateScrollUi();

  elements.themeButton.addEventListener('click', toggleTheme);
  elements.menuButton.addEventListener('click', () => {
    const isOpen = elements.navMenu.classList.toggle('active');
    elements.menuButton.setAttribute('aria-expanded', String(isOpen));
  });
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      document.querySelector(link.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
      closeMenu();
    });
  });
  elements.scrollTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  window.addEventListener('scroll', updateScrollUi);
  Object.keys(elements.inputs).forEach((fieldName) => {
    elements.inputs[fieldName].addEventListener('input', () => validateField(fieldName));
  });
  elements.contactForm.addEventListener('submit', handleSubmit);
};

init();

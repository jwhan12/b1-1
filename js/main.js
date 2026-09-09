const GITHUB_USERNAME = 'jwhan12';
const PROJECTS_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`;
const FIELD_NAMES = ['name', 'email', 'message'];

const elements = {
  header: document.querySelector('#site-header'), // #: html에서 site-header id를 찾겠다
  menuButton: document.querySelector('#menu-button'),
  navMenu: document.querySelector('#nav-menu'),
  themeButton: document.querySelector('#theme-button'),  // html에서 id가 theme-button인거 찾기
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

const applyTheme = (theme) => {
  const isDark = theme === 'dark';

  document.documentElement.dataset.theme = theme;
  elements.themeButton.textContent = isDark ? '☀️' : '🌙';
  elements.themeButton.setAttribute(
    'aria-label',
    isDark ? '라이트 모드로 전환' : '다크 모드로 전환',
  );
};

const toggleTheme = () => {
  const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';

  localStorage.setItem('theme', nextTheme);
  applyTheme(nextTheme);
};

const createStateCard = (message) => {
  const card = document.createElement('div');
  const description = document.createElement('p');

  card.className = 'project-card state-card';
  description.textContent = message;
  card.append(description);

  return card;
};

const createLoadingCard = () => {
  const card = createStateCard('프로젝트를 불러오는 중입니다...');
  const spinner = document.createElement('div');

  spinner.className = 'spinner';
  card.prepend(spinner);

  return card;
};

const createErrorCard = () => {
  const card = createStateCard('프로젝트를 불러올 수 없습니다.');
  const retryButton = document.createElement('button');

  retryButton.className = 'button button--primary retry-button';
  retryButton.type = 'button';
  retryButton.textContent = '다시 시도';
  retryButton.addEventListener('click', fetchProjects);
  card.append(retryButton);

  return card;
};

const createProjectCard = (repository) => {
  const {
    name,
    description,
    language,
    stargazers_count: stars,
    html_url: url,
  } = repository;
  const card = document.createElement('article');
  const title = document.createElement('h3');
  const summary = document.createElement('p');
  const metadata = document.createElement('div');
  const languageLabel = document.createElement('span');
  const starsLabel = document.createElement('span');
  const link = document.createElement('a');

  card.className = 'project-card';
  title.textContent = name;
  summary.textContent = description || '저장소 설명이 없습니다.';
  metadata.className = 'project-meta';
  languageLabel.textContent = language || '언어 정보 없음';
  starsLabel.textContent = `★ ${stars}`;
  link.className = 'project-link';
  link.href = url;
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.textContent = '저장소 보기 →';

  metadata.append(languageLabel, starsLabel);
  card.append(title, summary, metadata, link);

  return card;
};

const renderProjects = (status, repositories = []) => {
  if (status === 'loading') {
    elements.projectsContainer.replaceChildren(createLoadingCard());
    return;
  }

  if (status === 'error') {
    elements.projectsContainer.replaceChildren(createErrorCard());
    return;
  }

  if (status === 'empty') {
    elements.projectsContainer.replaceChildren(createStateCard('표시할 프로젝트가 없습니다.'));
    return;
  }

  const projectCards = document.createDocumentFragment();
  repositories.forEach((repository) => projectCards.append(createProjectCard(repository)));
  elements.projectsContainer.replaceChildren(projectCards);
};

async function fetchProjects() {
  renderProjects('loading');

  try {
    const response = await fetch(PROJECTS_API_URL);

    if (!response.ok) {
      throw new Error(`GitHub API 오류: ${response.status}`);
    }

    const repositories = await response.json();
    const status = repositories.length === 0 ? 'empty' : 'success';
    renderProjects(status, repositories);
  } catch {
    renderProjects('error');
  }
}

const validateField = (fieldName) => {
  const input = elements.inputs[fieldName];
  const value = input.value.trim();
  let message = '';

  if (!value) {
    message = '필수 입력 항목입니다.';
  } else if (fieldName === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    message = '올바른 이메일 형식이 아닙니다.';
  }

  elements.errors[fieldName].textContent = message;
  input.classList.toggle('is-invalid', Boolean(message));

  return !message;
};

const handleFieldInput = (event) => {
  validateField(event.currentTarget.name);
};

const handleSubmit = (event) => {
  event.preventDefault();

  const isValid = FIELD_NAMES.map(validateField).every(Boolean);

  if (!isValid) {
    elements.formSuccess.textContent = '';
    return;
  }

  elements.formSuccess.textContent = '메시지가 성공적으로 전송된 것으로 처리했습니다.';
  elements.contactForm.reset();
};

const updateScrollUi = () => {
  elements.header.classList.toggle('is-scrolled', window.scrollY > 60);  //사용자가 페이지를 아래로 60px보다 많이 스크롤할 경우: is-scrolled class 추가
  elements.scrollTopButton.classList.toggle('is-visible', window.scrollY > 300);
};

const closeMenu = () => {
  elements.navMenu.classList.remove('is-open');
  elements.menuButton.setAttribute('aria-expanded', 'false');
};

const toggleMenu = () => {
  const isOpen = elements.navMenu.classList.toggle('is-open');
  elements.menuButton.setAttribute('aria-expanded', String(isOpen));
};

const handleAnchorClick = (event) => {
  const target = document.querySelector(event.currentTarget.getAttribute('href'));

  if (!target) {
    return;
  }

  event.preventDefault();  //<a> 태그가 원래 하려고 했던 기본 행동은 하지 마
  target.scrollIntoView({ behavior: 'smooth' });  //target이 보이는 위치까지 화면을 부드럽게 스크롤
  closeMenu();
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const initRevealAnimation = () => {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.reveal').forEach((section) => observer.observe(section));  //reveal 클래스 모두 찾아 is-visible 추가
};

const bindEvents = () => {
  elements.themeButton.addEventListener('click', toggleTheme);
  elements.menuButton.addEventListener('click', toggleMenu);
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', handleAnchorClick);
  });
  elements.scrollTopButton.addEventListener('click', scrollToTop);
  window.addEventListener('scroll', updateScrollUi);
  FIELD_NAMES.forEach((fieldName) => {
    elements.inputs[fieldName].addEventListener('input', handleFieldInput);
  });
  elements.contactForm.addEventListener('submit', handleSubmit);
};

const init = () => {
  applyTheme(localStorage.getItem('theme') || 'light');
  fetchProjects();
  initRevealAnimation();
  updateScrollUi();
  bindEvents();
};

init();  // 저장된 테마 적용, Github 프로젝트 요청, 등장 애니메이션 준비, 스크롤 UI 계산, 이벤트 연결 시작

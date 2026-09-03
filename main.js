/**
 * 1. 설정 및 상태 관리 (State Management)
 */
const GITHUB_USERNAME = 'octocat'; // 본인의 GitHub 아이디로 변경하세요.

const state = {
  theme: localStorage.getItem('theme') || 'light',
  projects: {
    status: 'loading', // 'loading' | 'success' | 'error' | 'empty'
    data: [],
    error: null,
  },
};

/**
 * 2. DOM 요소 선택
 */
const elements = {
  header: document.querySelector('#header'),
  hamburgerBtn: document.querySelector('#hamburger'),
  navLinks: document.querySelector('#nav-links'),
  themeToggleBtn: document.querySelector('#theme-toggle'),
  scrollTopBtn: document.querySelector('#scroll-top-btn'),
  projectsContainer: document.querySelector('#projects-container'),
  contactForm: document.querySelector('#contact-form'),
  formInputs: {
    name: document.querySelector('#name'),
    email: document.querySelector('#email'),
    message: document.querySelector('#message'),
  },
  formErrors: {
    name: document.querySelector('#name-error'),
    email: document.querySelector('#email-error'),
    message: document.querySelector('#message-error'),
  },
  formSuccess: document.querySelector('#form-success'),
  animatedElements: document.querySelectorAll('.fade-in'),
};

/**
 * 3. 다크 모드 핸들러 (상태 변경 -> 화면 업데이트)
 */
const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  elements.themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
};

const toggleTheme = () => {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', state.theme);
  applyTheme(state.theme);
};

/**
 * 4. GitHub API 비동기 연동 및 프로젝트 섹션 렌더링
 */
const renderProjects = () => {
  const { status, data } = state.projects;

  if (status === 'loading') {
    elements.projectsContainer.innerHTML = `
      <div class="state-container">
        <div class="spinner"></div>
        <p>프로젝트를 불러오는 중입니다...</p>
      </div>
    `;
    return;
  }

  if (status === 'error') {
    elements.projectsContainer.innerHTML = `
      <div class="state-container">
        <p>프로젝트를 불러올 수 없습니다.</p>
        <button id="retry-btn" class="btn btn-primary" style="margin-top: 1rem;">다시 시도</button>
      </div>
    `;
    document.querySelector('#retry-btn').addEventListener('click', fetchGitHubProjects);
    return;
  }

  if (status === 'empty') {
    elements.projectsContainer.innerHTML = `
      <div class="state-container">
        <p>표시할 프로젝트가 없습니다.</p>
      </div>
    `;
    return;
  }

  if (status === 'success') {
    const cardsHtml = data.map((repo) => {
      const { name, description, html_url, stargazers_count, language } = repo;
      return `
        <article class="project-card">
          <div>
            <h3 class="project-title">${name}</h3>
            <p class="project-desc">${description || '설명이 없습니다.'}</p>
          </div>
          <div>
            <div class="project-meta">
              <span>언어: ${language || 'N/A'}</span>
              <span>★ ${stargazers_count}</span>
            </div>
            <a href="${html_url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">저장소 보기</a>
          </div>
        </article>
      `;
    }).join('');

    elements.projectsContainer.innerHTML = cardsHtml;
  }
};

const fetchGitHubProjects = async () => {
  state.projects.status = 'loading';
  renderProjects();

  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`);
    
    if (!response.ok) {
      throw new Error(`HTTP 에러! 상태 코드: ${response.status}`);
    }

    const repos = await response.json();

    if (repos.length === 0) {
      state.projects.status = 'empty';
    } else {
      state.projects.status = 'success';
      state.projects.data = repos;
    }
  } catch (error) {
    state.projects.status = 'error';
    state.projects.error = error.message;
  } finally {
    renderProjects();
  }
};

/**
 * 5. Contact 폼 유효성 검사 및 핸들러
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateField = (fieldKey) => {
  const input = elements.formInputs[fieldKey];
  const errorEl = elements.formErrors[fieldKey];
  const value = input.value.trim();
  let isValid = true;

  if (value === '') {
    errorEl.textContent = '필수 입력 항목입니다.';
    input.classList.add('invalid');
    isValid = false;
  } else if (fieldKey === 'email' && !validateEmail(value)) {
    errorEl.textContent = '올바른 이메일 형식이 아닙니다.';
    input.classList.add('invalid');
    isValid = false;
  } else {
    errorEl.textContent = '';
    input.classList.remove('invalid');
  }

  return isValid;
};

const handleFormSubmit = (event) => {
  event.preventDefault();

  const isNameValid = validateField('name');
  const isEmailValid = validateField('email');
  const isMessageValid = validateField('message');

  if (isNameValid && isEmailValid && isMessageValid) {
    elements.formSuccess.textContent = '메시지가 성공적으로 전송되었습니다!';
    elements.contactForm.reset();
    
    setTimeout(() => {
      elements.formSuccess.textContent = '';
    }, 4000);
  } else {
    elements.formSuccess.textContent = '';
  }
};

/**
 * 6. 스크롤 인터랙션 및 애니메이션 (Intersection Observer)
 */
const handleScroll = () => {
  const scrollY = window.scrollY;

  // 네비게이션 스타일 변경 (기준: 60px)
  if (scrollY > 60) {
    elements.header.classList.add('scrolled');
  } else {
    elements.header.classList.remove('scrolled');
  }

  // 스크롤 탑 버튼 표시 (기준: 300px)
  if (scrollY > 300) {
    elements.scrollTopBtn.classList.add('show');
  } else {
    elements.scrollTopBtn.classList.remove('show');
  }
};

const initIntersectionObserver = () => {
  const observerOptions = {
    root: null,
    threshold: 0.2, // 임계값 0.2 설정
  };

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observerInstance.unobserve(entry.target);
      }
    });
  }, observerOptions);

  elements.animatedElements.forEach((el) => observer.observe(el));
};

/**
 * 7. 이벤트 리스너 바인딩 및 초기화
 */
const init = () => {
  // 테마 초기화
  applyTheme(state.theme);
  elements.themeToggleBtn.addEventListener('click', toggleTheme);

  // 햄버거 메뉴 토글
  elements.hamburgerBtn.addEventListener('click', () => {
    elements.navLinks.classList.toggle('active');
  });

  // 네비게이션 링크 클릭 시 부드러운 스크롤 & 햄버거 메뉴 닫기
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
        elements.navLinks.classList.remove('active');
      }
    });
  });

  // 스크롤 탑 버튼 동작
  elements.scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 스크롤 이벤트 연결
  window.addEventListener('scroll', handleScroll);

  // 폼 이벤트 연결 (실시간 검증 및 제출 handling)
  Object.keys(elements.formInputs).forEach((key) => {
    elements.formInputs[key].addEventListener('input', () => validateField(key));
  });
  elements.contactForm.addEventListener('submit', handleFormSubmit);

  // 스크롤 애니메이션 초기화
  initIntersectionObserver();

  // GitHub 프로젝트 API 데이터 수신
  fetchGitHubProjects();
};

// DOM 로드 완료 후 실행 (defer 속성으로 안전함)
document.addEventListener('DOMContentLoaded', init);
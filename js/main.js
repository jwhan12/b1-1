// github 사용자 이름 저장
const GITHUB_USERNAME = 'jwhan12';

// github api 주소 만들기
// jwhan12 사용자의 GitHub 저장소를 최근 업데이트 순으로 6개 가져올 주소(sort=updated: 최근 업데이트 순, per-page=6: 최대 6개)
const PROJECTS_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`;

// contact form에 있는 세 입력칸의 이름. 각각의 이름을 반복적으로 검사해서 처리
const FIELD_NAMES = ['name', 'email', 'message'];

// html에 필요한 요소들을 한곳에 모아둔 상자 >> 나중에 elements.어쩌구로 찾으면 편해서 사용
const elements = {
  // document == html문서에서, queryselector == 하나 찾아줘, #site-header == id="site-header"이것을 >> header: 에 저장
  header: document.querySelector('#site-header'), // html의 헤더
  menuButton: document.querySelector('#menu-button'), // 햄버거 버튼
  navMenu: document.querySelector('#nav-menu'), // 메뉴
  themeButton: document.querySelector('#theme-button'), // 다크모드 버튼
  scrollTopButton: document.querySelector('#scroll-top-button'), // 맨 위로 스크롤하는 버튼
  projectsContainer: document.querySelector('#projects-container'), // projects 영역
  contactForm: document.querySelector('#contact-form'), // contact 영역
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

// dark, light 중 전달받은 테마를 매개변수 theme으로 받아 실제 화면에 적용
const applyTheme = (theme) => {
  const isDark = theme === 'dark'; // theme값이 dark인가? 맞으면 true값 반환

  // document.documentElement == <html> 태그라고 이해하면 됨
  // 매개변수 theme='dark'라면 <html data-theme="dark">. 이걸 보고 css가 다크모드 색상 적용
  // html에서 data-theme은 사용자 정의 데이터. js에서는 이것을 dataset.theme으로 접근
  document.documentElement.dataset.theme = theme;
  // elements.themeButton == html의 테마 변경 
  // textContent == 요소 안에 들어있는 글자를 바꿈. 
  // <button>🌙</button>에서 button.textContent = '☀️'; 적용하면 <button>☀️</button>로 변경
  // isDark ? '☀️' : '🌙'; >> 삼항연산자. isDark가 true면 ☀️, 아니면 🌙
  // 다크모드인데 ☀️인 이유 >> ☀️ 누르면 라이트모드 갈 수 있다는 의미 
  elements.themeButton.textContent = isDark ? '☀️' : '🌙';
  elements.themeButton.setAttribute( // setAttribute() =  html 속성 바꾸는 기능
    'aria-label', // button.setAttribute('aria-label', '라이트 모드로 전환');일 경우 html에서 <button aria-label="라이트 모드로 전환">로 적용
    isDark ? '라이트 모드로 전환' : '다크 모드로 전환', // isDark == true >> '라이트 모드로 전환' 
  );
};

// 현재 테마 확인 / 다음에 적용할 반대 테마 결정 / 저장
const toggleTheme = () => { // 매개변수x >> 직접 현재 테마 확인하는 함수
  // 조건 ? 'dark' : 'light' >> 현재 테마가 light인가? true면 다음테마 dark, false면 light
  const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';

  // theme이라는 이름으로 nextTheme 값 저장(새로고침했을때 현재 모드가 원상복구되면 불편하므로)
  localStorage.setItem('theme', nextTheme);
  applyTheme(nextTheme);
};

// project 영역 기본 카드 틀 디자인
const createStateCard = (message) => {
  const card = document.createElement('div'); // createElement(): html 요소 새로 생성 >> <div>태그
  const description = document.createElement('p'); // <p>태그

  card.className = 'project-card state-card'; // className: class 생성 >> <div class="project-card state-card"><div>
  description.textContent = message; // message로 받은 문장 <p>태그로 생성
  card.append(description); // <p>태그를 <div> 태그에 넣어(맨 뒤에 넣기) 부모·자식 관계 생성 (부모: <div>card, 자식: <p>description)

  return card; // 다른 함수에서 사용할 수 있도록 반환
};

// 로딩 중일 때 보여주는 카드(기본 카드에 spinner 추가)
const createLoadingCard = () => {
  const card = createStateCard('프로젝트를 불러오는 중입니다...'); // message 매개변수로 받는 값
  const spinner = document.createElement('div'); // 새 <div>태그 생성

  spinner.className = 'spinner'; // class 생성 >> <div class="spinner"></div>
  card.prepend(spinner); // prepend(): 맨 앞에 받는 값. <div>project-card state-card, <div>spinner, <p>프로젝트를 불러오.. 

  return card;
};

// api 요청 실패 시 보여주는 카드('다시 시도' 버튼 클릭(click 발생) > fetchProject 실행 > github 프로젝트 다시 요청)
const createErrorCard = () => {
  const card = createStateCard('프로젝트를 불러올 수 없습니다.'); // message 매개변수로 받는 값
  const retryButton = document.createElement('button'); //<button>태그 생성

  // class 생성 >> <button class="button button--primary retry-button"><button>
  retryButton.className = 'button button--primary retry-button';
  retryButton.type = 'button'; // <button type="button"> >> 버튼 종류 지정_클릭용 버튼
  retryButton.textContent = '다시 시도'; // 버튼 글자 생성
  retryButton.addEventListener('click', fetchProjects); // retryButton에서 click 발생 시 fetchProject 함수 처음부터 실행
  card.append(retryButton); // <div>project-card state-card, <p>프로젝트를 불러올 수.., <button>button button--primary retr.., 다시 시도

  return card;
};

// github 저장소 데이터 한 개(객체)를 받아 프로젝트 카드 하나 만들어 반환
const createProjectCard = (repository) => { // repository: github api에서 가져온 객체 형태의 저장소 정보를 이 변수로 받음
  const {
    name,
    description,
    language,
    stargazers_count: stars, // 이름이 길어서 짧게 변경(stargazers_count 값을 꺼내서 stars로 부름)
    html_url: url,
  } = repository; // repository 변수에서 필요한 값만 꺼내 각각의 변수에 저장
  const card = document.createElement('article'); // <article>태그 생성_카드 전체
  const title = document.createElement('h3'); // 저장소 이름
  const summary = document.createElement('p'); // 설명
  const metadata = document.createElement('div'); // 언어 + 별 개수
  const languageLabel = document.createElement('span');
  const starsLabel = document.createElement('span');
  const link = document.createElement('a'); // 저장소 보기 링크

  card.className = 'project-card'; // <article class="project-card">
  title.textContent = name; //name= 'b1-1'일 경우 <h3>b1-1</h3>
  summary.textContent = description || '저장소 설명이 없습니다.'; // github에 설명이 있으면 description, null값이면 '저장소 설명이 없습니다.'
  metadata.className = 'project-meta'; // <div class="project-meta">
  languageLabel.textContent = language || '언어 정보 없음'; // 언어 정보 있으면 language, null값이면 '언어 정보 없음'
  starsLabel.textContent = `★ ${stars}`;
  link.className = 'project-link'; // <a class="project-link">
  link.href = url; // href="url" >> 클릭 시 github 저장소로 이동
  link.target = '_blank'; // <a target="_blank"> >> 링크에서 새 탭을 열어라
  link.rel = 'noreferrer'; // <a rel="noreferrer"> >> 새 탭으로 외부 사이트 열 때 보안·개인정보 측면에서 함께 사용하는 속성
  link.textContent = '저장소 보기 →'; // 링크 글자

  metadata.append(languageLabel, starsLabel); // 따로 있던 두 요소 합침_<div>자식 요소
  card.append(title, summary, metadata, link); // card안에 4개 요소 추가

  return card;
};

// project 영역에 무엇을 보여줄지 결정하는 함수. renderProjects = (현재 상태, github에서 받아온 저장소 배열 [{ 저장소1 }, ...])
// 매개변수 status종류: loading, error, empty, success. 만약 repositories값을 안줬을 경우 자동으로 빈 배열 생성
const renderProjects = (status, repositories = []) => {
  if (status === 'loading') { // 현재 상태가 "loading"인지 확인 후 createLoadingCard() 함수 실행
    elements.projectsContainer.replaceChildren(createLoadingCard()); // replaceChildren: 현재 안에 있는 자식 전부 지우고, 내가 준 것으로 교체
    return; // 로딩 화면을 보여줬으면 error, null일 경우의 코드 실행할 필요 없으므로 함수를 여기서 끝냄
  }

  if (status === 'error') {
    elements.projectsContainer.replaceChildren(createErrorCard());
    return;
  }

  // 요청은 성공했지만 저장소가 하나도 없는 경우
  if (status === 'empty') {
    elements.projectsContainer.replaceChildren(createStateCard('표시할 프로젝트가 없습니다.'));
    return;
  }

  // loading, error, empty가 아닌 경우 >> success(프로젝트 카드 생성)
  const projectCards = document.createDocumentFragment(); // createDocumentFragment(): 불러온 저장소를 담아둘 바구니 >> 카드를 모음
  repositories.forEach((repository) => // forEach(): 배열 안의 객체를 하나씩 꺼냄
    projectCards.append( // 생성한 카드를 바구니에 append
      createProjectCard(repository) // createProjectCard(): 저장소 A,B,C를 각각 카드 A,B,C로 생성
    )
  );
  // html의 프로젝트 카드들이 들어가는 영역에(projectsContainer) 기존 프로젝트 영역을 전부 비우고 카드 A,B,C를 한번에 넣음
  elements.projectsContainer.replaceChildren(projectCards);
};

// github 서버에 요청 보내는 함수
async function fetchProjects() { // async: 해당 함수 안에서 await 사용할 수 있게 해줌
  renderProjects('loading'); // 요청 시 시간이 걸릴 수 있으므로 로딩 카드 화면에 표시

  // 일단 코드를 실행하지만, 문제가 생길 수도 있는 코드
  try {
    const response = // fetch(PROJECTS_API_URL): 해당 주소에 데이터 요청
      await fetch(PROJECTS_API_URL); // await: 해당 작업 결과가 올 때까지 기다렸다가 다음으로 가

    if (!response.ok) { // response.ok: 요청 정상 작동 >> ! 붙어서 http 요청이 성공하지 않았을 경우
      throw new Error(`GitHub API 오류: ${response.status}`); // throw: 오류 났다고 처리
    } // try문 중단하고 catch문으로 이동

    // http 요청이 성공했을 경우
    const repositories = // GitHub 저장소 객체들이 들어있는 배열
      await response.json(); // github에서 받아온 json형태의 데이터를 js에서 사용할 수 있는 데이터로 변환
    const status = 
      repositories.length === 0 ? 'empty' : 'success'; // length: 배열 개수 세기. 0개면 true, 아니면 false
    renderProjects(status, repositories); // 저장소 6개일 경우 status가 success, 프로젝트 카드 6개 생성
  } catch { // 문제가 생겼을 때 실행할 코드
    renderProjects('error');
  }
}

// contact form의 이름/이메일/메세지 중 입력칸 하나 검사하는 함수
const validateField = (fieldName) => { // FIELD_NAMES 중 하나 매개변수로 받음
  // fieldName변수에 따라 input id값이 달라지고, input변수의 저장값이 달라짐
  // []사용하여 같은 함수 하나로 세 입력칸 모두 처리 가능. []에는 name, email, message가 들어감
  const input = elements.inputs[fieldName];
  // input.value: 사용자가 작성한 값 원본 그대로 가져옴
  // trim(): 문자열 양쪽 불필요한 공백 제거 >> 스페이스바만 여러번 눌렀을 경우 입력했다는 착각 여부 제거 
  // value: 검사할 최종 값
  const value = input.value.trim();
  let message = ''; // let을 사용하면 변수값 변경 가능_처음에 빈값이었다가 문제가 발견되면 message = '필수 입력 항목입니다.'

  if (!value) { 
    message = '필수 입력 항목입니다.';
  } else if ( // 검사하는 칸이 이메일이고, 이메일 형식이 이상할 경우
      fieldName === 'email' &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
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
  elements.scrollTopButton.classList.toggle('is-visible', window.scrollY > 300); // window.scrollY: 현재 브라우저 창이 세로로 얼마나 스크롤되었는지
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
  elements.themeButton.addEventListener('click', toggleTheme); // 대상.addEventListener('이벤트이름', 실행할함수);
  elements.menuButton.addEventListener('click', toggleMenu);
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', handleAnchorClick);
  });
  elements.scrollTopButton.addEventListener('click', scrollToTop);
  window.addEventListener('scroll', updateScrollUi); // 현재 브라우저 창에서 스크롤이 발생하면 updateScrollUi 함수 실행
  FIELD_NAMES.forEach((fieldName) => {
    elements.inputs[fieldName].addEventListener('input', handleFieldInput);
  });
  elements.contactForm.addEventListener('submit', handleSubmit); // contact-form에서 submit 사건 발생 시 handleSubmit 함수 실행
};

const init = () => {
  applyTheme(localStorage.getItem('theme') || 'light');
  fetchProjects();
  initRevealAnimation();
  updateScrollUi();
  bindEvents();
};

init();  // 저장된 테마 적용, Github 프로젝트 요청, 등장 애니메이션 준비, 스크롤 UI 계산, 이벤트 연결 시작 >> 진짜 사이트 기능 시작

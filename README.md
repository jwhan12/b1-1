# 나를 소개하는 웹사이트 처음부터 만들기

순수 HTML, CSS, JavaScript로 만든 반응형 포트폴리오 웹사이트입니다.  
사용자 이벤트 → 상태 변경 → 화면 업데이트 흐름을 쉽게 확인할 수 있게 작성했습니다.

## 배포 URL

PR 병합 후 GitHub Pages를 `main` 브랜치의 `/ (root)`로 설정하면 아래 주소에서 확인할 수 있습니다.

- https://jwhan12.github.io/b1-1/

> GitHub Pages 설정 방법은 [GitHub 공식 문서](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) 참고

## 사용 기술과 기능

- HTML: 시맨틱 태그와 접근 가능한 폼 레이블
- CSS: 변수, Flexbox, Grid, 768px·1024px 반응형 미디어 쿼리
- JavaScript: DOM 선택, 이벤트, 상태, `fetch`, `async/await`
- 햄버거 메뉴, 부드러운 스크롤, 다크 모드, 스크롤 탑 버튼
- 스크롤 60px에서 헤더 변경, 300px에서 탑 버튼 표시
- GitHub API 프로젝트 목록 및 로딩·성공·에러·빈 상태
- `IntersectionObserver` threshold 0.2 기반 섹션 애니메이션

## 실행 방법

```bash
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000`을 엽니다.

## 폴더 구조

```text
b1-1/
├── css/style.css
├── images/profile.svg
├── images/screenshots/
├── js/main.js
└── index.html
```

## 화면

### 데스크톱

![데스크톱 화면](images/screenshots/desktop.png)

### 모바일

![모바일 화면](images/screenshots/mobile.png)

### 다크 모드

![다크 모드 화면](images/screenshots/dark-mode.png)

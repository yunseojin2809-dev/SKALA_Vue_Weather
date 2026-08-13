

# 🚨 불물조심 - 실시간 기상 · 산불/침수 위험도 대시보드

> 전국 주요 관측소의 실시간 기상 데이터를 수집 및 분석하여 산불 및 침수 위험도를 직관적으로 제공하고, Navigation Guard 및 Pinia 기반 관제자 인증까지 지원하는 지능형 재해 예보 웹 플랫폼입니다.

--------------------------------------------------------------------------------------

## 📌 주요 기능

* **실시간 기상 및 위험도 모니터링**: 전국 관측소별 기온, 습도, 풍속, 강수량 기반 실시간 재해(산불/침수) 위험지수 산출 및 알고리즘 적용
* **관제자 보안 인증 및 접근 제어**: Pinia 기반 `authStore` 상태 관리 및 Vue Router Navigation Guard를 통한 대시보드 접근 권한 통제
* **인터랙티브 오픈소스 지도**: Leaflet.js 기반 다크 테마/위성 지도 스위칭 및 실시간 기상 오버레이(바람, 강수량, 구름) 매핑
* **실시간 날씨 API 연동 및 관측소 추가**: Axios 및 OpenWeather API를 연동하여 전국/해외 도시 검색 시 실시간 데이터 자동 등록
* **다양한 단위 변환 기능**: Pinia 전역 상태 관리 기반 섭씨(°C) / 화씨(°F) 즉각 변환
* **반응형 UX/UI**: 모던 다크 모드 기반의 고대비 스타일링, 스위치 토글, 위험도 가우시안 게이지 및 모달 팝업 제공

-------------------------------------------------------------------------------------

## 📁 프로젝트 폴더 및 파일 구조

```text
WEATHER-APP2/
├── public/                       # 정적 리소스 폴더
│   ├── hero-bg.mp4               # 인트로 배경 비디오 영상
│   └── logo.png                  # 프로젝트 상단 로고 이미지
│
├── .env                          # 환경 변수 관리 파일 (API Key 등)
│
└── src/                          # 소스 코드 메인 폴더
    ├── main.js                   # Vue 앱 생성, Router/Pinia 주입 엔트리 포인트
    ├── App.vue                   # 최상위 루트 컴포넌트 (Navigation & RouterView)
    │
    ├── router/                   # 페이지 라우터 및 보안 설정
    │   └── index.js              # 동적 라우트 매칭, Navigation Guard(로그인 접근 제어) 및 Catch-all 라우트
    │
    ├── stores/                   # Pinia 전역 상태 관리
    │   ├── authStore.js          # 관제자 로그인 토큰, 유저 프로필 및 인증 상태 관리
    │   ├── configStore.js        # 온도 단위(섭씨/화씨) 전역 상태 및 변환 로직
    │   └── searchHistoryStore.js # 최근 검색어 기록 저장 및 관리
    │
    ├── services/                 # 외부 데이터 통신
    │   └── weatherApi.js         # Axios 기반 OpenWeatherMap API 호출 및 데이터 처리
    │
    ├── composables/              # 재사용 로직 함수
    │   └── useRisk.js            # 기상 지표 기반 산불/침수 위험도 점수 계산 알고리즘
    │
    ├── data/                     # 목업 및 기본 데이터
    │   └── weatherData.js        # 기본 관측소 기상 정보 및 카테고리 라벨 데이터
    │
    ├── styles/                   # 프로젝트 공통 CSS
    │   └── theme.css             # 전체 다크/라이트 테마 색상 변수 및 글로벌 스타일 정의
    │
    ├── components/               # 재사용 UI 부품 컴포넌트
    │   ├── AlertBanner.vue       # 심각 위험 경보 건수 실시간 알림 배너
    │   ├── CategoryFilter.vue    # 관측소 카테고리(전체/산간/해안/일반) 필터 버튼
    │   ├── IntroHero.vue         # 인트로 랜딩 페이지 히어로 비디오 & Leaflet 멀티레이어 지도 컴포넌트
    │   ├── SearchBox.vue         # 관측소/지역 이름 실시간 검색창
    │   ├── StatusBar.vue         # 하단 선택 상태 및 가이드 메시지 바
    │   ├── UnitToggler.vue       # 섭씨(°C) / 화씨(°F) 단위 전환 토글 버튼
    │   ├── WeatherCard.vue       # 관측소 기상 지표 및 위험도 가우시안 게이지 카드
    │   └── WeatherDetailCard.vue # 상세 페이지용 확장 기상 리포트 카드
    │
    └── views/                    # 페이지 단위 화면 컴포넌트
        ├── LoginView.vue         # 관제자 접근 권한 인증 및 이용약관 동의 로그인 화면 (`/login`)
        ├── NotFoundView.vue     # 404 예외 처리 페이지 (`/:pathMatch(.*)*`)
        ├── WeatherAboutView.vue  # 서비스 소개 및 시스템 알고리즘 아키텍처 페이지 (`/about`)
        ├── WeatherDetailView.vue # 관측소별 상세 기상 정보 동적 페이지 (`/weather/:cityId`)
        ├── WeatherHomeView.vue   # 🔒 관측소 목록 및 위험도 종합 관제 대시보드 화면 (`/dashboard`)
        └── WeatherIntroView.vue  # 서비스 소개 및 기상 개요 인트로 메인 화면 (`/intro`)

```

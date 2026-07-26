# 🐕 멍경로 (MungGyeongRo)

> **우리 강아지 성향에 딱 맞는 문경 여행 코스를 만들어주는 반려동물 동반 여행 플래너**

한국관광공사 TourAPI(반려동물 동반여행 정보)를 활용해, 반려견 프로필(크기·활동량·성향)에
맞춘 문경시 여행 코스를 자동으로 생성합니다. 코스는 카카오맵 위에 타임라인과 함께
표시되며, 여행 중 응급상황을 대비한 동물병원 오버레이를 제공합니다.

## 왜 문경인가?

문경시는 대표적인 인구감소 지역이지만, 문경새재·진남교반 등 반려동물과 함께 걷기 좋은
자연·문화 자원이 풍부합니다. 급성장하는 반려동물 동반 여행 수요와 문경의 자원을
공공데이터로 연결해 지역 활력에 기여하는 것이 이 서비스의 목표입니다.

## 주요 기능

- 🐶 **반려동물 프로필** — 크기, 활동량, 사회성, 실내/실외 선호 등록
- ✨ **AI 코스 추천** — 프로필 × 테마 × 가용시간 기반 점수화로 하루 코스 자동 구성
- 🗺 **지도 + 타임라인** — 카카오맵 위 경로 시각화, 시간대별 일정표
- 🏥 **응급 동물병원 오버레이** — 코스 주변 동물병원 즉시 확인
- 📝 **학습 루프** — 방문 후 만족도 피드백이 다음 추천에 반영

## 기술 스택

Next.js (App Router) · React · TypeScript · Tailwind CSS · **Firebase (Auth + Firestore)** · Leaflet/OpenStreetMap (카카오맵 선택) · Vitest

## 시작하기

로컬 개발은 **Firebase 에뮬레이터**로 동작해서 Firebase 프로젝트나 API 키가 필요 없습니다.
(요구사항: Node.js 20+, Java 17+ — Firestore 에뮬레이터가 사용)

```bash
npm install
npm run dev:all      # Firebase 에뮬레이터 + Next.js 동시 실행
npm run seed:demo    # (다른 터미널에서 1회) 시설 103곳 + 데모 계정 시드
```

- 접속: http://localhost:3000 · 데모 로그인: **demo@mung.kr / demo1234** (직접 가입도 가능)
- 에뮬레이터 UI: http://127.0.0.1:4000 (Firestore/Auth 데이터 확인)
- 에뮬레이터 데이터는 `.firebase-data/`에 저장돼 재시작해도 유지됩니다. 리셋하려면 폴더 삭제.

### 실제 Firebase 프로젝트로 배포

1. Firebase 콘솔에서 프로젝트 생성 → Auth(이메일/구글) 활성화, Firestore 생성
2. `.env`에 `NEXT_PUBLIC_FIREBASE_*`와 `FIREBASE_SERVICE_ACCOUNT`(서비스 계정 JSON) 설정, `NEXT_PUBLIC_FIREBASE_EMULATOR=0`
3. `npm run seed:demo`(데모 데이터) 또는 TourAPI 키 준비 후 `npm run seed:tourapi`(실데이터)

### 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev:all` | 에뮬레이터 + 개발 서버 동시 실행 |
| `npm run dev` | 개발 서버만 (에뮬레이터 별도 실행 필요) |
| `npm run emulators` | Firebase 에뮬레이터만 |
| `npm run seed:demo` | 시설 시드 + 데모 계정 생성 |
| `npm run seed:tourapi` | TourAPI에서 문경시 실데이터 적재 (키 필요) |
| `npm run build` / `npm test` | 프로덕션 빌드 / 단위 테스트 |

## 데이터 출처

- [한국관광공사 TourAPI 4.0](https://api.visitkorea.or.kr/) — 반려동물 동반여행 정보 서비스
- 공공데이터포털 동물병원 데이터

---

공모전 출품작 · 자세한 기획/진행 상황은 [PROJECT.md](./PROJECT.md) 참고

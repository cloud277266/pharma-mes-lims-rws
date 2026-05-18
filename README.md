# 제약 스마트팩토리 IT 포트폴리오

> **MES · LIMS · RWS** 시스템 구현 및 **GMP CSV(컴퓨터 시스템 밸리데이션)** 문서 작성 포트폴리오

제약 업계 MES/LIMS/RWS 시스템 유지보수 직무를 대비하여, 실제 GMP 규정(21 CFR Part 11, GAMP 5) 요구사항을 반영한 3개의 IT 시스템을 직접 설계·구현하고 IQ/OQ/PQ 적격성 평가 문서를 작성했습니다.

---

## 프로젝트 구성

| # | 프로젝트 | 기술 스택 | 핵심 GMP 기능 |
|---|---|---|---|
| 1 | [Mini LIMS](#1-mini-lims) | Next.js · TypeScript · MySQL · Prisma | Audit Trail · Maker-Checker 워크플로우 |
| 2 | [RWS Simulator](#2-rws-simulator-raw-material-weighing-system) | C# · WPF · .NET 10 · MVVM | Hard-lock 허용 오차 · 바코드 이중 검증 |
| 3 | [MES Dashboard](#3-mes-dashboard) | Next.js · TypeScript · Recharts | 실시간 OEE · 설비 상태 모니터링 |
| - | [CSV 문서](#csv-문서) | Markdown | IQ · OQ · PQ 적격성 평가 결과서 |

---

## 1. Mini LIMS

> **Laboratory Information Management System** — 시험 결과 관리 및 품질 데이터 무결성 보장

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?logo=mysql)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)

### 구현 기능

#### REQ-LIMS-001 · Audit Trail (감사 추적)
- 품질 데이터 수정 시 **변경 사유(changeReason) 강제 입력** — 누락 시 HTTP 400으로 차단
- 모든 변경 이력(수정 전·후 값, 수정자, 일시, 사유)을 `AuditLog` 테이블에 자동 기록
- 감사 추적 전용 화면에서 JSON diff 형태로 변경 전·후 확인 가능

#### REQ-LIMS-002 · Maker-Checker 워크플로우
- **MAKER** 역할: 시험 결과 입력 전용 (본인 데이터 승인 불가)
- **CHECKER** 역할: 타인이 입력한 데이터에 한해 APPROVE / REJECT 처리
- 역할 위반 시 HTTP 403 반환, JWT 기반 세션으로 역할 검증

### 시스템 아키텍처

```
브라우저 → Next.js App Router (API Routes) → Prisma ORM → MySQL 8.0 (Docker)
         ← JWT (httpOnly Cookie, 8h)
```

### 실행 방법

```bash
# 1. Docker MySQL 시작
docker-compose up -d

# 2. 의존성 설치 및 DB 마이그레이션
cd 01_mini_lims
npm install
cp .env.example .env      # DB 연결 정보 입력
npx prisma migrate deploy

# 3. 시드 데이터 삽입 (브라우저에서)
# GET http://localhost:3000/api/seed

# 4. 개발 서버 실행
npm run dev
```

**테스트 계정**

| 계정 | 비밀번호 | 역할 |
|---|---|---|
| maker01 | maker1234 | MAKER |
| checker01 | checker1234 | CHECKER |
| admin | admin1234 | ADMIN |

---

## 2. RWS Simulator (Raw Material Weighing System)

> **원료 칭량 시스템 시뮬레이터** — GMP Hard-lock 및 바코드 이중 검증 구현

![C#](https://img.shields.io/badge/C%23-12-purple?logo=csharp)
![WPF](https://img.shields.io/badge/WPF-.NET_10-512BD4?logo=dotnet)
![MVVM](https://img.shields.io/badge/Pattern-MVVM-gray)

### 구현 기능

#### REQ-RWS-001 · Hard-lock 허용 오차 차단
- 실측값이 목표 중량 ±허용 오차 범위를 벗어나면 **'칭량 완료' 버튼 자동 비활성화**
- `CanComplete = IsBarcodeVerified AND IsWithinTolerance` — WPF Command CanExecute에 바인딩
- 적합 범위 내 완료 시 **칭량 완료 라벨 자동 발행** (작업 지시 번호, 원료명, 목표/실측 중량, 작업자, 일시)

#### REQ-RWS-002 · 바코드 이중 검증
- 작업 지시서에 등록된 바코드 외 입력 시 칭량 단계 진입 차단
- 미등록 바코드 입력 시 오류 메시지 표시, 모든 입력 비활성화

### 실행 방법

```
Visual Studio 2022 또는 Rider에서
02_rws_simulator/RwsSimulator.sln 열기 → 빌드 및 실행 (.NET 10 필요)
```

---

## 3. MES Dashboard

> **Manufacturing Execution System 생산 현황 대시보드** — 실시간 OEE·설비·알람 모니터링

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Recharts](https://img.shields.io/badge/Recharts-2-22b5bf)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)

### 구현 기능

#### REQ-MES-001 · KPI 실시간 모니터링
- **OEE(설비 종합 효율)**, 총 생산량, 불량률, 알람 건수 — 5초 주기 자동 갱신
- `useLiveMockData` 커스텀 훅으로 jitter 기반 실시간 시뮬레이션

#### REQ-MES-002 · 설비 상태 시각화
- Running(녹색) / Stopped(회색) / Alarm(적색 펄스 애니메이션) 3단계 색상 코드
- LINE별 설비 그룹핑, OEE 프로그레스 바 실시간 변동

#### REQ-MES-003 · 작업지시 현황
- 진행중 WO 진행률 바 실시간 증가, 100% 달성 시 '완료' 상태 자동 전환
- Recharts ComposedChart — 시간별 목표/실적 바 + 불량 꺾은선 복합 차트

#### REQ-MES-004 · 알람 관리
- Critical / Warning / Info 3단계 심각도 구분
- 미확인 알람 건수 배지 + 펄스 애니메이션으로 즉시 인지 유도

### 실행 방법

```bash
cd 03_mes_dashboard
npm install
npm run dev
# → http://localhost:3000
```

---

## CSV 문서

> **Computer System Validation** — IQ/OQ/PQ 적격성 평가 결과서

`CSV_Documentation/IQ_OQ_PQ.md`

| 문서 ID | 시스템 | 검증 항목 | 판정 |
|---|---|---|---|
| OQ-LIMS-001 | Mini LIMS | Audit Trail 변경 사유 강제화 | PASS ✅ |
| OQ-LIMS-002 | Mini LIMS | Maker-Checker 워크플로우 | PASS ✅ |
| OQ-RWS-001 | RWS Simulator | Hard-lock 허용 오차 차단 | PASS ✅ |
| OQ-RWS-002 | RWS Simulator | 바코드 검증 차단 | PASS ✅ |
| OQ-MES-001 | MES Dashboard | KPI 실시간 업데이트 | PASS ✅ |
| OQ-MES-002 | MES Dashboard | 설비 상태 표시 및 알람 강조 | PASS ✅ |
| OQ-MES-003 | MES Dashboard | 작업지시 진행률 및 상태 전환 | PASS ✅ |

---

## 기술 스택 요약

**Frontend / Full-stack**
- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- Recharts (생산 실적 차트)

**Backend / Database**
- Next.js API Routes, Prisma ORM v5, MySQL 8.0 (Docker)
- JWT 인증 (jose 라이브러리, httpOnly Cookie)

**Desktop Application**
- C# 12, WPF (.NET 10), MVVM 패턴 (INotifyPropertyChanged, RelayCommand, IMultiValueConverter)

**GMP / CSV**
- 21 CFR Part 11 (전자 기록·서명), GAMP 5 카테고리 4
- IQ / OQ / PQ 적격성 평가, Audit Trail, Maker-Checker, Hard-lock

**Infrastructure**
- Docker, docker-compose (MySQL 8.0)
- Git / GitHub

---

## 디렉터리 구조

```
pharma-mes-lims-rws/
├── 01_mini_lims/          # Next.js LIMS 웹 애플리케이션
│   ├── app/               # App Router (pages, API routes)
│   ├── prisma/            # DB 스키마 및 마이그레이션
│   └── src/lib/           # auth, db 유틸리티
├── 02_rws_simulator/      # C# WPF 칭량 시스템 시뮬레이터
│   └── RwsSimulator/
│       ├── ViewModels/    # MVVM ViewModel
│       └── *.xaml         # WPF View
├── 03_mes_dashboard/      # Next.js MES 대시보드
│   └── app/
│       ├── components/    # KpiCard, EquipmentStatus, ProductionChart 등
│       ├── hooks/         # useLiveMockData (실시간 시뮬레이션)
│       └── lib/           # mockData, calcKpis
├── CSV_Documentation/     # IQ/OQ/PQ 적격성 평가 문서
└── docker-compose.yml     # MySQL 8.0 컨테이너
```

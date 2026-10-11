# Diffshot

[English](README.md) · [한국어](README.ko.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [Español](README.es.md)

**두 URL, 세 가지 화면 크기. HTML 하나로 전달하는 변경 보고서.**

[샘플 보고서 열기](https://jeffrog-256k1.github.io/diffshot/?lang=ko)

[![Diffshot](assets/preview.png)](https://jeffrog-256k1.github.io/diffshot/?lang=ko)

Diffshot은 웹페이지의 두 버전을 비교하고 시각적 차이를 표시해 오프라인 HTML 파일로 만듭니다. 별도 시각 회귀 서비스 설정 없이 UI 변경을 설명할 수 있습니다. 공개 데모는 가상 페이지의 결과이며 방문자가 입력한 URL을 대신 가져오지 않습니다.

## 로컬 실행

Node.js 22.12 이상과 npm이 필요합니다. 계정·서버·유료 API는 필요하지 않습니다. npm 패키지는 아직 배포하지 않았으므로 복제한 저장소에서 명령을 실행합니다.

```sh
git clone https://github.com/jeffrog-256k1/diffshot.git
cd diffshot
npm ci
npx playwright install chromium
```

## 페이지 비교

```sh
npm run compare -- http://127.0.0.1:3000 http://127.0.0.1:4000 --out reports/review-01 --lang ko
```

아래 루프백 URL을 직접 실행한 페이지나 신뢰하는 공개 사이트로 바꾸세요. 생성된 `reports/review-01/index.html`을 브라우저로 열고 파일 하나만 전달하면 됩니다. 이미지·스타일·조작 기능이 모두 포함됩니다. 별도 PNG와 이미지 없는 메타데이터 `report.json`도 저장합니다. 기존 출력 폴더는 덮어쓰지 않으므로 실행마다 새 `--out` 경로를 쓰세요.

## 주요 기능

- 데스크톱 1440×900, 태블릿 834×1112, 모바일 390×844. 새로운 Chromium 컨텍스트에서 배율 1·UTC·en-US·밝은 테마로 캡처합니다.
- 화면 너비 기준으로 페이지 높이 최대 8000px까지 캡처합니다. 가로 넘침을 표시하며 화면 밖의 가로 영역은 이미지에 담지 않습니다.
- 나란히 보기, 드래그 슬라이더, 주황색 차이 강조, PNG 저장. 추가·제거된 영역은 흰 배경이어도 차이에 포함합니다.
- 입력 오류·HTTP/접속 실패·마스크 대상 누락을 정상 비교와 구분합니다. 일부 캡처 실패도 보고서에 표시합니다.
- 보고서와 README는 영어·한국어·중국어 간체·일본어·스페인어를 제공합니다. `--lang`으로 CLI 상태·오류도 번역합니다. 옵션 이름과 상세 도움말은 영어입니다.

## 옵션

| 옵션        | 의미                                                      |
| ----------- | --------------------------------------------------------- |
| `--out`     | 새 출력 폴더. 이미 있으면 중단합니다.                     |
| `--path`    | 최대 5개 경로를 반복 지정합니다.                          |
| `--mask`    | CSS 선택자 최대 10개. 각 페이지에서 모두 일치해야 합니다. |
| `--ready`   | 해당 요소가 보이고 글꼴이 준비될 때까지 기다립니다.       |
| `--timeout` | 캡처 작업별 1000~60000ms, 기본 15000ms.                   |
| `--delay`   | 준비 후 0~5000ms 대기, 기본 200ms.                        |
| `--lang`    | en, ko, zh-CN, ja, es. 기본 en.                           |

`--path`는 두 URL의 경로를 지정한 값으로 교체합니다. 생략하면 입력한 URL 그대로 비교합니다. 쿼리 문자열은 캡처에 사용할 수 있지만 보고서 메타데이터에서는 가리고, 프래그먼트는 제외합니다. 경로와 스크린샷 내용은 익명화하지 않습니다.

```sh
npm run compare -- http://127.0.0.1:3000 http://127.0.0.1:4000 --path / --path /about --mask .clock --ready main --out reports/review-02 --lang ko
```

## 결과 해석

종료 코드 0은 변경 여부와 관계없이 정상 캡처·보고서 저장, 1은 일부 캡처 실패, 2는 입력·준비·쓰기 오류입니다. 자동 CI 합격 판정기가 아닌 검토 도구입니다. 변경 비율은 픽셀 차이이며 버그의 심각도가 아닙니다. 안티앨리어싱 차이를 제외하며 pixelmatch 색상 임계값은 0.1입니다.

## 제약과 개인정보

캡처 시 애니메이션·커서를 끄고 모션 감소를 요청합니다. 날짜·동적 콘텐츠·영상·비동기 데이터·운영체제 글꼴은 여전히 달라질 수 있습니다. 동적 영역은 `--mask`, 앱 준비 조건은 `--ready`로 지정하세요. 완전한 재현성을 보장하지는 않습니다. 로그인 세션 가져오기·크롤링·AI 설명·자동 PR 댓글은 제공하지 않습니다. 대상 페이지의 JavaScript를 실행하므로 신뢰하는 페이지만 사용하세요. 스크린샷에 비공개 내용이 담길 수 있어 공유 전 확인해야 합니다. 자동 업로드는 하지 않습니다.

## 개발·검증

```sh
npm test
npm run build
npm run test:browser
npm run dev
```

가상 예제는 `npm run demo:capture`와 `npm run build`로 갱신합니다. 설치된 Chrome을 쓰려면 `DIFFSHOT_BROWSER_CHANNEL=chrome`을 설정합니다. Linux에서 시스템 의존성은 `npx playwright install --with-deps chromium`으로 설치합니다. 동일 화면·CSS 및 높이 변경·마스크·HTTP 실패·CLI 종료 코드·덮어쓰기 방지·HTML 삽입·오프라인 다운로드·다국어·모바일을 검증합니다.

[CONTRIBUTING](CONTRIBUTING.md) · [SECURITY](SECURITY.md) · [CHANGELOG](CHANGELOG.md)

## 라이선스

MIT. 출력 보고서는 자유롭게 활용할 수 있지만 캡처한 콘텐츠의 권리는 원 소유자에게 있습니다.

[LICENSE](LICENSE) · [Third-party notices](THIRD_PARTY_NOTICES.md)

[jeffrog-256k1](https://github.com/jeffrog-256k1) · [leejungjae.app](https://leejungjae.app)

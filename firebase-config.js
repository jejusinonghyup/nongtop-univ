/* ===== 농(農)탑 공통 설정 =====
   index.html(게임)과 admin.html(관리자)이 이 파일 하나를 함께 읽어요.
   Firebase 콘솔 > 프로젝트 설정 > 내 앱(웹)의 firebaseConfig 값을 아래에 붙여넣으세요. */
window.NT_CONFIG = {
  firebase: {
    apiKey: "AIzaSyChuTxljtKQHgsvR5UFSl7-4Q89Zl8Picw",
    authDomain: "nongtop-univ.firebaseapp.com",
    projectId: "nongtop-univ",
    storageBucket: "nongtop-univ.firebasestorage.app",
    messagingSenderId: "1022601806877",
    appId: "1:1022601806877:web:4b9dc9793bd3e3461072f4"
  },

  // (참고) 메인 화면 제목 문구는 index.html 안에 직접 들어 있어요. 아래 3줄은 더 이상 쓰이지 않아요.
  eventTitle: "2026 AX농업포럼 X 제주시농협",
  gameTitle: "농탑 무한 수확 챌린지",
  audienceNotice: "농협대학교 학생 한정 스페셜 이벤트",

  // 관리자 페이지 최초 비밀번호 (Firestore에 config/admin 문서가 없을 때 이 값으로 자동 생성)
  // 배포 후 관리자 페이지에서 반드시 변경하세요.
  defaultAdminPassword: "nong1234",

  // 배경 워터마크로 쓸 CI 이미지 (같은 폴더에 올린 파일명, 예: "logo.png"). 비워두면 표시하지 않아요.
  logoUrl: ""
};

/**
 * 예식 일시(단일 Date)로부터 각 섹션이 필요로 하는 표기를 파생한다.
 * 하드코딩된 날짜 문자열 중복을 제거하기 위한 헬퍼.
 */

const KO_WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const EN_WEEKDAYS = [
  'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY',
];

const EN_MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

/** 오전/오후 */
export function anteMeridiem(d: Date): string {
  return d.getHours() < 12 ? '오전' : '오후';
}

/** 12시간제 시 */
function hour12(d: Date): number {
  const h = d.getHours() % 12;
  return h === 0 ? 12 : h;
}

/** "일" 처럼 요일 한 글자 */
export function koreanWeekday(d: Date): string {
  return KO_WEEKDAYS[d.getDay()];
}

/** "2024년 4월 11일" */
export function koreanDate(d: Date): string {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/** "오전 11시 30분" */
export function koreanTime(d: Date): string {
  const m = d.getMinutes();
  const mm = m > 0 ? ` ${m}분` : '';
  return `${anteMeridiem(d)} ${hour12(d)}시${mm}`;
}

/** "2024년 4월 11일 일요일 오전 11시 30분" */
export function koreanDateTimeFull(d: Date): string {
  return `${koreanDate(d)} ${koreanWeekday(d)}요일 ${koreanTime(d)}`;
}

/** 영문 서수: 1 -> 1ST, 2 -> 2ND, 3 -> 3RD, 9 -> 9TH */
function ordinal(n: number): string {
  const s = ['TH', 'ST', 'ND', 'RD'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** "SATURDAY, MARCH 9TH, 2024" */
export function englishDate(d: Date): string {
  return `${EN_WEEKDAYS[d.getDay()]}, ${EN_MONTHS[d.getMonth()]} ${ordinal(d.getDate())}, ${d.getFullYear()}`;
}

/** "AT 11:30 IN THE MORNING" */
export function englishTime(d: Date): string {
  const mm = d.getMinutes().toString().padStart(2, '0');
  const period = d.getHours() < 12 ? 'IN THE MORNING' : 'IN THE AFTERNOON';
  return `AT ${hour12(d)}:${mm} ${period}`;
}

/** "2024.03.09 (토) 오전 11:30" — 공유 설명 등에 사용 */
export function shortDateTime(d: Date): string {
  const p = (n: number) => n.toString().padStart(2, '0');
  const mm = p(d.getMinutes());
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} (${koreanWeekday(d)}) ${anteMeridiem(d)} ${hour12(d)}:${mm}`;
}

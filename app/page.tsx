'use client';

import { useEffect, useState } from 'react';

const icons = {
  아침: '🍽️',
  점심: '🍽️',
  저녁: '🍽️',
  식사: '🍽️',
  항공: '✈️',
  이동: '🚐',
  호텔: '🏨',
  쇼핑: '🛍️',
  지하철: '🚇',
  전시: '🎨',
  헤어: '💇',
  관광: '📍',
  사우나: '♨️',
  바: '🍸',
};

type Category = keyof typeof icons;
type Booking = '' | 'confirmed' | 'unbooked';
type Tone = 'vivid' | 'pastel';
type Item = {
  category: Category;
  time: string;
  name: string;
  place: string;
  url: string;
  booking: Booking;
  bookingTime: string;
};
type Day = { date: string; title: string; items: Item[] };
type Pick = { color: number; pastel: boolean };
type Hunt = { names: string[]; picks: Pick[]; tone?: Tone };
type Hunts = Record<string, Hunt>;

const tripKey = 'tokyo-trip-nextjs-v1';
const huntKey = 'tokyo-color-hunt-v1';
const meals = new Set<Category>(['아침', '점심', '저녁']);
const categories = (Object.keys(icons) as Category[]).filter(
  (category) => !meals.has(category)
);
const emptyHunt: Hunt = { names: ['', '', ''], picks: [] };

const palette = [
  { name: '블루', vivid: ['#2160ce'], pastel: ['#b9d9ff'] },
  { name: '옐로우', vivid: ['#f6c900'], pastel: ['#fff0ad'] },
  { name: '핑크', vivid: ['#ed3783'], pastel: ['#fbc4dc'] },
  { name: '라벤더 / 퍼플', vivid: ['#803dc6'], pastel: ['#dcc8f5'] },
  { name: '오렌지', vivid: ['#f37521'], pastel: ['#ffd2b3'] },
  { name: '그린', vivid: ['#238a48'], pastel: ['#bde5c5'] },
  { name: '레드', vivid: ['#d92f40'], pastel: ['#f5b8be'] },
  { name: '실버', vivid: ['#a5adb8'], pastel: ['#dbdfe7'] },
  {
    name: '베이지 / 브라운',
    vivid: ['#c39261', '#70452f'],
    pastel: ['#f1dfc8', '#c9a891'],
  },
  {
    name: '화이트 / 블랙',
    vivid: ['#ffffff', '#191919'],
    pastel: ['#fffcf5', '#68646e'],
  },
];

function item(
  category: Category,
  time = '',
  name = '',
  place = '',
  url = '',
  bookingTime = ''
): Item {
  return {
    category,
    time,
    name,
    place,
    url,
    bookingTime,
    booking: bookingTime ? 'confirmed' : '',
  };
}

const initial: Day[] = [
  {
    date: '11/26 목',
    title: '나리타 · 긴자',
    items: [
      item('아침'),
      item('항공', '07:30', '출발'),
      item('항공', '09:55', '나리타 도착', 'Narita International Airport'),
      item('이동', '', '긴자 이동', 'Ginza, Tokyo'),
      item('점심'),
      item('쇼핑', '', '몽벨 신바시점부터 긴자 쇼핑', 'mont-bell Shimbashi'),
      item('호텔', '', '모에기 츠키지 호텔에 짐 두기', 'Tsukiji Hotel Moegi'),
      item('저녁'),
      item('바', '', '불가리 바', 'The Bulgari Bar, Bulgari Hotel Tokyo'),
    ],
  },
  {
    date: '11/27 금',
    title: '아자부 · 롯폰기 · 신주쿠',
    items: [
      item('아침'),
      item('지하철', '', '도쿄 메트로 3일권 시작'),
      item('전시', '10:00', '팀랩 보더리스', 'teamLab Borderless Tokyo'),
      item('점심', '12:30', '아자부 스시', '', '', '12:30'),
      item('관광', '', '롯폰기 · 신주쿠'),
      item('저녁'),
      item('식사', '', '게딱지 · 이자카야 후보'),
      item('바', '', '재즈바 후보'),
    ],
  },
  {
    date: '11/28 토',
    title: '하라주쿠 · 시부야 · 다이칸야마',
    items: [
      item('아침'),
      item('관광', '', '오전 시장 방문 후보'),
      item(
        '헤어',
        '10:30',
        '하라주쿠 헤어메이크 3명',
        '',
        'https://beauty.hotpepper.jp/slnH000764026/style/',
        '10:30'
      ),
      item('점심'),
      item('관광', '', '시부야 · 다이칸야마'),
      item('저녁', '20:30', 'AURELIO', 'AURELIO Shibuya', '', '20:30'),
    ],
  },
  {
    date: '11/29 일',
    title: '긴자 · 귀국',
    items: [
      item('아침'),
      item('호텔', '10:00', '체크아웃'),
      item('사우나', '', '긴자 사우나 · 선택'),
      item('바', '', '에비수 바 · 선택'),
      item('쇼핑', '', '마지막 쇼핑 · 선택'),
      item('점심'),
      item('이동', '17:00', '공항 샌딩'),
      item('항공', '20:25', '출발'),
      item('저녁'),
    ],
  },
];

function drawColors(count: number, tone: Tone): Pick[] {
  const picks: Pick[] = [];
  while (picks.length < count) {
    const pool = palette.map((_, index) => index);
    for (let index = pool.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [pool[index], pool[other]] = [pool[other], pool[index]];
    }
    picks.push(
      ...pool.slice(0, count - picks.length).map((color) => ({
        color,
        pastel: tone === 'pastel',
      }))
    );
  }
  return picks;
}

function webUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.href
      : '';
  } catch {
    return '';
  }
}

function directions(stops: Item[], walking = false) {
  const places = stops.map((row) => row.place.trim());
  const params = new URLSearchParams({
    api: '1',
    origin: places[0],
    destination: places[places.length - 1],
  });
  if (places.length > 2) params.set('waypoints', places.slice(1, -1).join('|'));
  if (walking) params.set('travelmode', 'walking');
  return 'https://www.google.com/maps/dir/?' + params.toString();
}

function DayOneRoute({ items }: { items: Item[] }) {
  const airport = items.find(
    (row) => row.category === '항공' && row.place.trim()
  );
  const cityIndex = items.findIndex(
    (row) => row.category === '이동' && row.place.trim()
  );
  const stops = items
    .slice(Math.max(0, cityIndex))
    .filter((row) => row.category !== '항공' && row.place.trim());
  const legs: Item[][] = [];
  for (let i = 0; i < stops.length - 1; i += 4) {
    legs.push(stops.slice(i, i + 5));
  }

  return (
    <aside className="map-note">
      <h3>📍 Day 1 동선</h3>
      {stops.length > 1 && (
        <p>{stops.map((row) => row.name.trim() || row.place).join(' → ')}</p>
      )}
      <div className="flex">
        {airport && cityIndex >= 0 && (
          <a
            href={directions([airport, items[cityIndex]])}
            target="_blank"
            rel="noreferrer"
          >
            공항에서 긴자까지
          </a>
        )}
        {legs.map((leg, index) => (
          <a
            key={index}
            href={directions(leg, true)}
            target="_blank"
            rel="noreferrer"
          >
            {legs.length === 1
              ? '구글 지도 도보 경로'
              : `도보 경로 ${index + 1}`}
          </a>
        ))}
        <a
          href="https://maps.app.goo.gl/sJdef6AKNTztFDjQ6"
          target="_blank"
          rel="noreferrer"
        >
          친구들이 태그한 장소
        </a>
      </div>
    </aside>
  );
}

function ColorHunt({
  hunt,
  onChange,
}: {
  hunt: Hunt;
  onChange: (next: Hunt) => void;
}) {
  const tone = hunt.tone;

  return (
    <section className="hunt paper" aria-labelledby="hunt-title">
      <h2 id="hunt-title">🎨 아침 컬러 헌트</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (tone)
            onChange({ ...hunt, picks: drawColors(hunt.names.length, tone) });
        }}
      >
        <div className="flex hunt-controls">
          <label>
            오늘의 톤
            <select
              required
              value={tone ?? ''}
              onChange={(event) => {
                const value = event.target.value;
                const nextTone =
                  value === 'vivid' || value === 'pastel' ? value : undefined;
                onChange({ ...hunt, tone: nextTone, picks: [] });
              }}
            >
              <option value="">톤을 골라주세요</option>
              <option value="vivid">원색</option>
              <option value="pastel">파스텔</option>
            </select>
          </label>
          <label>
            인원
            <select
              value={hunt.names.length}
              onChange={(event) => {
                const count = Number(event.target.value);
                onChange({
                  ...hunt,
                  names: Array.from(
                    { length: count },
                    (_, i) => hunt.names[i] ?? ''
                  ),
                  picks: [],
                });
              }}
            >
              {Array.from({ length: 20 }, (_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}명
                </option>
              ))}
            </select>
          </label>
          <button className="pink" type="submit" disabled={!tone}>
            {tone && hunt.picks.length
              ? '다시 랜덤으로 뽑기'
              : '랜덤으로 컬러 뽑기'}
          </button>
        </div>
        <ul className="friends">
          {hunt.names.map((name, i) => {
            const pick = hunt.picks[i];
            const color = tone && pick ? palette[pick.color] : undefined;
            return (
              <li key={i}>
                <input
                  aria-label={`친구 ${i + 1} 이름`}
                  placeholder={`친구 ${i + 1} 이름`}
                  maxLength={24}
                  value={name}
                  onChange={(event) => {
                    const nextName = event.target.value;
                    onChange({
                      ...hunt,
                      names: hunt.names.map((value, j) =>
                        j === i ? nextName : value
                      ),
                    });
                  }}
                />
                <span aria-live="polite">
                  {tone && color && (
                    <span className="result">
                      {color[tone].map((shade) => (
                        <span
                          key={shade}
                          className="swatch"
                          aria-hidden="true"
                          style={{ background: shade }}
                        />
                      ))}
                      {color.name}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </form>
    </section>
  );
}

function ItemEditor({
  row,
  change,
  up,
  down,
  remove,
}: {
  row: Item;
  change: (patch: Partial<Item>) => void;
  up?: () => void;
  down?: () => void;
  remove: () => void;
}) {
  const isMeal = meals.has(row.category);
  return (
    <>
      <div className="fields">
        <label>
          카테고리
          <select
            disabled={isMeal}
            value={row.category}
            onChange={(e) => change({ category: e.target.value as Category })}
          >
            {(isMeal ? [row.category] : categories).map((category) => (
              <option key={category} value={category}>
                {icons[category]} {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          일정 시간
          <input
            type="time"
            value={row.time}
            onChange={(e) => change({ time: e.target.value })}
          />
        </label>
        <label>
          장소 또는 일정
          <input
            value={row.name}
            onChange={(e) => change({ name: e.target.value })}
          />
        </label>
        <label>
          구글 지도 검색어
          <input
            value={row.place}
            onChange={(e) => change({ place: e.target.value })}
          />
        </label>
        <label>
          {row.category === '쇼핑' ? '구글 드라이브 링크' : '관련 링크'}
          <input
            type="url"
            value={row.url}
            onChange={(e) => change({ url: e.target.value })}
          />
        </label>
        <label>
          예약 상태
          <select
            value={row.booking}
            onChange={(e) => {
              const booking = e.target.value as Booking;
              change({
                booking,
                bookingTime:
                  booking === 'confirmed' ? row.bookingTime || row.time : '',
              });
            }}
          >
            <option value="">표시 안 함</option>
            <option value="confirmed">예약함</option>
            <option value="unbooked">예약 안 함</option>
          </select>
        </label>
        {row.booking === 'confirmed' && (
          <label>
            예약 시간
            <input
              type="time"
              value={row.bookingTime}
              onChange={(e) => change({ bookingTime: e.target.value })}
            />
          </label>
        )}
      </div>
      <div className="flex entry-links">
        <button type="button" disabled={!up} onClick={up}>
          위로
        </button>
        <button type="button" disabled={!down} onClick={down}>
          아래로
        </button>
        {!isMeal && (
          <button type="button" onClick={remove}>
            삭제
          </button>
        )}
      </div>
    </>
  );
}

function ItemView({ row }: { row: Item }) {
  const place = row.place.trim();
  const url = webUrl(row.url);
  return (
    <>
      <div className="flex">
        <span className="chip">
          {icons[row.category]} {row.category}
        </span>
        {row.time &&
          !(row.booking === 'confirmed' && row.time === row.bookingTime) && (
            <time>{row.time}</time>
          )}
        {row.name.trim() ? (
          <strong>{row.name}</strong>
        ) : (
          meals.has(row.category) && (
            <span className="blank" aria-label="식당 미정" />
          )
        )}
        {row.booking === 'confirmed' && (
          <span className="flex booking">
            <span className="chip booked">예약</span>
            {row.bookingTime && (
              <time className="chip booking-time">{row.bookingTime}</time>
            )}
          </span>
        )}
        {row.booking === 'unbooked' && (
          <span className="chip muted">예약 안 함</span>
        )}
      </div>
      {(place || url) && (
        <div className="flex entry-links">
          {place && (
            <a
              href={
                'https://www.google.com/maps/search/?api=1&query=' +
                encodeURIComponent(place)
              }
              target="_blank"
              rel="noreferrer"
            >
              구글 지도
            </a>
          )}
          {url && (
            <a href={url} target="_blank" rel="noreferrer">
              {row.category === '쇼핑' ? '유명템·살 것 보기' : '관련 링크'}
            </a>
          )}
        </div>
      )}
    </>
  );
}

export default function Page() {
  const [days, setDays] = useState(initial);
  const [draft, setDraft] = useState<Day[] | null>(null);
  const [selected, setSelected] = useState(0);
  const [hunts, setHunts] = useState<Hunts>({});
  const [tripMessage, setTripMessage] = useState('');
  const [huntMessage, setHuntMessage] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(tripKey);
      if (saved) {
        const previous: Day[] = JSON.parse(saved);
        if (!Array.isArray(previous) || previous.length !== initial.length)
          throw new Error();
        setDays(
          previous.map((day) => ({
            ...day,
            items: day.items.map((row) => {
              if (row.booking !== undefined) return row;
              const booked = row.name.endsWith(' · 예약');
              return {
                ...row,
                name: row.name.replace(/ · 예약$/, ''),
                booking: booked ? 'confirmed' : '',
                bookingTime: booked ? row.time : '',
              };
            }),
          }))
        );
      }
    } catch {
      setTripMessage('저장된 일정을 읽을 수 없어 기본 일정을 표시했어요.');
    }

    try {
      const saved = localStorage.getItem(huntKey);
      if (saved) setHunts(JSON.parse(saved) ?? {});
    } catch {
      setHuntMessage('이전 컬러 헌트 기록을 읽을 수 없어요.');
    }
  }, []);

  const day = (draft ?? days)[selected];

  function updateHunt(next: Hunt) {
    const updated = { ...hunts, [day.date]: next };
    setHunts(updated);
    try {
      localStorage.setItem(huntKey, JSON.stringify(updated));
      setHuntMessage('');
    } catch {
      setHuntMessage('컬러 헌트 결과를 저장하지 못했어요.');
    }
  }

  function editItems(update: (rows: Item[]) => Item[]) {
    setDraft(
      (previous) =>
        previous?.map((entry, i) =>
          i === selected ? { ...entry, items: update(entry.items) } : entry
        ) ?? null
    );
  }

  function move(index: number, offset: number) {
    editItems((rows) => {
      const next = [...rows];
      const [row] = next.splice(index, 1);
      next.splice(index + offset, 0, row);
      return next;
    });
  }

  function save() {
    if (!draft) return;
    const invalid = draft.find((entry) =>
      entry.items.some((row) => row.url.trim() && !webUrl(row.url))
    );
    if (invalid) {
      setTripMessage(
        `${invalid.date}의 링크에 유효한 웹 주소를 입력해 주세요.`
      );
      return;
    }
    try {
      localStorage.setItem(tripKey, JSON.stringify(draft));
      setDays(draft);
      setDraft(null);
      setTripMessage('일정을 이 브라우저에 저장했어요.');
    } catch {
      setTripMessage('저장에 실패했어요. 입력한 내용은 화면에 남아 있어요.');
    }
  }

  return (
    <main className="tokyo-book">
      <header className="cover paper">
        <p className="date-label">2026.11.26–11.29 · 일본 현지 시각</p>
        <h1>
          <span>도</span>
          <span>쿄</span> 여행 일정 <b aria-hidden="true">♡</b>
        </h1>
      </header>

      <nav className="flex dates" aria-label="여행 날짜">
        {days.map((entry, i) => (
          <button
            key={entry.date}
            type="button"
            aria-current={i === selected ? 'date' : undefined}
            onClick={() => {
              setSelected(i);
              setHuntMessage('');
            }}
          >
            {entry.date}
          </button>
        ))}
      </nav>

      <ColorHunt
        key={day.date}
        hunt={hunts[day.date] ?? emptyHunt}
        onChange={updateHunt}
      />
      {huntMessage && (
        <p role="status" className="feedback">
          {huntMessage}
        </p>
      )}

      <section className="plan paper" aria-labelledby="day-title">
        <div className="flex toolbar">
          <h2 id="day-title">{day.title}</h2>
          {draft ? (
            <>
              <button
                type="button"
                onClick={() => editItems((rows) => [...rows, item('관광')])}
              >
                일정 추가
              </button>
              <button className="pink" type="button" onClick={save}>
                저장
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(null);
                  setTripMessage('');
                }}
              >
                취소
              </button>
            </>
          ) : (
            <button
              className="pink"
              type="button"
              onClick={() => {
                setDraft(days);
                setTripMessage('');
              }}
            >
              일정 수정
            </button>
          )}
        </div>
        {tripMessage && (
          <p role="status" className="feedback">
            {tripMessage}
          </p>
        )}
        {selected === 0 && !draft && <DayOneRoute items={day.items} />}
        {day.items.map((row, i) => (
          <article key={i} className="entry">
            {draft ? (
              <ItemEditor
                row={row}
                change={(patch) =>
                  editItems((rows) =>
                    rows.map((entry, j) =>
                      i === j ? { ...entry, ...patch } : entry
                    )
                  )
                }
                up={i > 0 ? () => move(i, -1) : undefined}
                down={i < day.items.length - 1 ? () => move(i, 1) : undefined}
                remove={() =>
                  editItems((rows) => rows.filter((_, j) => i !== j))
                }
              />
            ) : (
              <ItemView row={row} />
            )}
          </article>
        ))}
      </section>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </main>
  );
}

const css = `
.tokyo-book, .tokyo-book * { box-sizing: border-box; }
.tokyo-book {
  --ink: #263653; --sky: #7ea4d7; --pink: #a33156; --line: #566d90;
  max-width: 880px; min-height: 100vh; margin: auto; padding: clamp(14px, 4vw, 32px);
  color: var(--ink); background: radial-gradient(#b9d0ed 1px, transparent 1px) 0 0 / 17px 17px, #eaf4ff;
  font: 16px/1.55 system-ui, sans-serif;
}
.tokyo-book h1, .tokyo-book h2, .tokyo-book h3, .tokyo-book p { margin: 0; }
.tokyo-book h2 { font-size: clamp(19px, 4vw, 25px); font-weight: 750; }
.tokyo-book h3 { font-size: 16px; margin-bottom: 5px; font-weight: 750; }
.tokyo-book .flex { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; }
.tokyo-book .paper {
  padding: clamp(14px, 4vw, 24px); border: 2px solid var(--line);
  border-radius: 23px 28px 19px 26px; box-shadow: 4px 5px #526b8e25;
}
.tokyo-book .cover {
  padding: clamp(20px, 5vw, 36px); background: var(--sky); border-bottom: 5px solid #c94f73;
}
.tokyo-book .date-label {
  display: inline-block; padding: 4px 10px; border-radius: 7px 10px 8px 5px;
  background: #fff8e9; font-size: 14px; font-weight: 700;
}
.tokyo-book h1 {
  margin-top: 14px; font-size: clamp(29px, 7vw, 54px); line-height: 1.25;
  letter-spacing: -.06em; font-weight: 800;
}
.tokyo-book h1 span {
  display: inline-block; margin-right: 4px; padding: 0 .15em;
  border: 1px solid var(--line); border-radius: 28% 34% 24% 35%;
  background: #ffd4e4; transform: rotate(-6deg);
}
.tokyo-book h1 span:nth-child(2) { background: #fff0aa; transform: rotate(5deg); }
.tokyo-book h1 b { color: #852044; }
.tokyo-book .dates { margin: 20px 0 26px; }
.tokyo-book button {
  cursor: pointer; padding: 7px 13px; border: 1px solid var(--line);
  border-radius: 13px 15px 12px 14px; background: #fffdfa; color: var(--ink);
  font: inherit; font-weight: 700; box-shadow: 1px 2px #526b8e28;
}
.tokyo-book button[aria-current] { background: #bed9fb; box-shadow: 1px 3px #cf6487; }
.tokyo-book button.pink { background: var(--pink); color: white; border-color: #842745; }
.tokyo-book button:hover:not(:disabled) { filter: brightness(.95); }
.tokyo-book button:disabled { opacity: .45; cursor: default; }
.tokyo-book .hunt {
  position: relative; margin-bottom: 18px; border-color: #ad5d78;
  background: repeating-linear-gradient(0deg, #fff3f7, #fff3f7 25px, #f6dce6 26px, #fff3f7 27px);
}
.tokyo-book .hunt::before {
  content: ''; position: absolute; top: -10px; right: 25px; width: 68px; height: 21px;
  border: 1px solid #829db7; transform: rotate(8deg); pointer-events: none;
  background: repeating-linear-gradient(110deg, #bad9fa 0 6px, #d4e8fc 6px 12px);
}
.tokyo-book .hunt-controls { align-items: end; margin: 10px 0; }
.tokyo-book .friends { list-style: none; padding: 0; margin: 12px 0 0; display: grid; gap: 7px; }
.tokyo-book .friends li {
  display: grid; grid-template-columns: minmax(0, 210px) minmax(0, 1fr); align-items: center; gap: 8px;
}
.tokyo-book .result {
  display: inline-flex; align-items: center; flex-wrap: wrap; gap: 5px; padding: 3px 8px;
  background: #fffdf8; border: 1px solid #d5a9bc; border-radius: 999px; font-size: 14px; font-weight: 700;
}
.tokyo-book .swatch { width: 16px; height: 16px; border: 1px solid #342e5855; border-radius: 50%; flex-shrink: 0; }
.tokyo-book .plan { background: #fffdf8; }
.tokyo-book .toolbar h2 { margin-right: auto; }
.tokyo-book .map-note {
  margin: 13px 0; padding: 12px; background: #e5f0ff; border: 1px dashed var(--line); border-radius: 12px 17px;
}
.tokyo-book .map-note p { margin-bottom: 6px; }
.tokyo-book a { color: #294f80; text-decoration: underline; text-underline-offset: 3px; }
.tokyo-book .entry {
  margin-top: 8px; padding: 10px; background: white; border: 1px solid #bed2e8; border-radius: 12px 15px 11px 14px;
}
.tokyo-book .entry-links { margin-top: 8px; }
.tokyo-book .chip {
  padding: 2px 8px; border-radius: 999px; background: #e0edff; font-size: 14px; font-weight: 700; white-space: nowrap;
}
.tokyo-book .booking { gap: 4px; }
.tokyo-book .booked { background: var(--pink); color: white; }
.tokyo-book .booking-time { background: #ffe0eb; color: #862044; }
.tokyo-book .muted { background: #edf0f5; }
.tokyo-book time { font-variant-numeric: tabular-nums; }
.tokyo-book .blank { width: 95px; min-height: 1em; border-bottom: 2px dotted #c46b8a; }
.tokyo-book .fields { display: grid; gap: 8px; grid-template-columns: repeat(auto-fit, minmax(135px, 1fr)); }
.tokyo-book label { display: grid; gap: 3px; font-size: 14px; font-weight: 700; }
.tokyo-book input, .tokyo-book select {
  width: 100%; min-width: 0; padding: 6px 8px; border: 1px solid #91a8c3;
  border-radius: 8px; color: var(--ink); background: #fffefa; font: 16px/1.4 system-ui, sans-serif;
}
.tokyo-book .feedback { margin: 8px 0; color: #882446; }
.tokyo-book :focus-visible { outline: 2px solid var(--pink); outline-offset: 3px; }
`;

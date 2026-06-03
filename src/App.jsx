import React, { useEffect, useMemo, useState } from 'react';
import { Trophy, Target, Flame, Coins, CalendarDays, ShieldCheck, LogIn, Medal, RefreshCw, Users, AlertTriangle, Eye, LineChart, Moon, Sun } from 'lucide-react';

// =====================================================
// TEPER MŚ 2026 — DASHBOARD LIVE + TYPOWANIE
// =====================================================
// Wklej TUTAJ swój link do Apps Script Web App bez parametrów, np.:
// const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx.../exec';
// Ten sam link obsługuje:
// - panel gracza w iframe
// - dane publiczne do statystyk przez ?api=publicData

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxQHEFUiOqD3cz-l-nRnSSe2C6QnSDR57idsL4KcDkpKw66tW37T9vNnwx0GkFeACUrAw/exec';

const MOCK_DATA = {
  ranking: [
    { gracz: 'Mati', punkty: 5.50, trafione: 2, typy: 3, skutecznosc: 67, najwyzszy_kurs: 3.20, seria: 2, ostatnio: 2.10 },
    { gracz: 'Kuba', punkty: 3.40, trafione: 1, typy: 3, skutecznosc: 33, najwyzszy_kurs: 3.40, seria: 1, ostatnio: 0 },
  ],
  matches: [
    { id: '1', mecz: 'Meksyk - RPA', etap: 'Faza grupowa', start: '2026-06-11 21:00', kurs1: 2.10, kursX: 3.40, kurs2: 3.20, wynik: '1', status: 'ZAKOŃCZONY', typ1: 1, typx: 0, typ2: 1, najlepszy: 'Mati +2.10' },
    { id: '2', mecz: 'USA - Kanada', etap: 'Faza grupowa', start: '2026-06-12 18:00', kurs1: 1.90, kursX: 3.50, kurs2: 4.00, wynik: '', status: 'OTWARTE', typ1: 0, typx: 1, typ2: 1, najlepszy: '—' },
  ],
  hits: [
    { gracz: 'Kuba', mecz: 'USA - Kanada', typ: 'X', kurs: 3.40, punkty: 3.40 },
    { gracz: 'Mati', mecz: 'Meksyk - RPA', typ: '1', kurs: 2.10, punkty: 2.10 },
  ],
  bonuses: [
    { gracz: 'Mati', mecz: 'Hiszpania - Niemcy', zdarzenie: 'Obie drużyny strzelą gola', kurs: 2.38, status: 'OCZEKUJE', punkty: 0 },
  ],
  prizePool: { wpisowe: 100, gracze: 2, rebuy: 0, pula: 200 },
  players: [{ gracz: 'Mati' }, { gracz: 'Kuba' }],
  meta: { updatedAt: new Date().toLocaleString('pl-PL') }
};

function jsonp(url, params = {}) {
  return new Promise((resolve, reject) => {
    if (!url) return resolve(MOCK_DATA);
    const callback = 'teperCallback_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
    const script = document.createElement('script');
    const fullUrl = new URL(url);
    Object.entries(params).forEach(([key, value]) => fullUrl.searchParams.set(key, value));
    fullUrl.searchParams.set('callback', callback);

    window[callback] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('Nie udało się pobrać danych z Apps Script.'));
    };

    function cleanup() {
      delete window[callback];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    script.src = fullUrl.toString();
    document.body.appendChild(script);
  });
}

function formatNumber(n) {
  return Number(n || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;

  const normalized = String(value)
    .replace(/\s/g, '')
    .replace(',', '.');

  const number = Number(normalized);
  return Number.isNaN(number) ? 0 : number;
}

function normalizeDashboardData(raw) {
  const hits = raw.najlepszeTrafienia || raw.hits || [];
  const history = raw.historiaPunktow || raw.historia || [];

  const bestHitByPlayer = {};
  hits.forEach((h) => {
    const gracz = h.Gracz ?? h.gracz ?? '';
    const kurs = Number(h.Kurs ?? h.kurs ?? h['Typ kurs'] ?? 0);
    const punkty = Number(h.Punkty ?? h.punkty ?? 0);

    if (!gracz) return;

    const value = kurs || punkty || 0;

    if (!bestHitByPlayer[gracz] || value > bestHitByPlayer[gracz]) {
      bestHitByPlayer[gracz] = value;
    }
  });

  const historyByPlayer = {};

  history.forEach((row) => {
    const gracz = row.Gracz ?? row.gracz ?? '';
    const matchId = Number(row['Match ID'] ?? row.matchId ?? row.id ?? 0);
    const punktyMecz = Number(
      row['Punkty mecz'] ??
      row['Punkty mecz '] ??
      row.punktyMecz ??
      row.punkty ??
      0
    );

    if (!gracz) return;

    if (!historyByPlayer[gracz]) {
      historyByPlayer[gracz] = [];
    }

    historyByPlayer[gracz].push({
      matchId,
      punktyMecz,
    });
  });

  function getLastPoints(gracz) {
  const rows = (historyByPlayer[gracz] || [])
    .filter((r) => !Number.isNaN(r.matchId))
    .filter((r) => Number(r.punktyMecz) !== 0)
    .sort((a, b) => a.matchId - b.matchId);

  if (!rows.length) return 0;

  return rows[rows.length - 1].punktyMecz;
}

  function getBestSeries(gracz) {
    const rows = (historyByPlayer[gracz] || [])
      .filter((r) => !Number.isNaN(r.matchId))
      .sort((a, b) => a.matchId - b.matchId);

    let current = 0;
    let best = 0;

    rows.forEach((r) => {
      if (Number(r.punktyMecz) > 0) {
        current += 1;
        best = Math.max(best, current);
      } else {
        current = 0;
      }
    });

    return best;
  }

  const ranking = (raw.ranking || [])
    .map((r) => {
      const gracz = r.gracz ?? r.Gracz ?? '';

      const punkty = Number(r.punkty ?? r.Punkty ?? 0);
      const trafione = Number(r.trafione ?? r.Trafione ?? 0);
      const typy = Number(
        r.typy ??
        r.Typy ??
        r['Typy rozegrane'] ??
        r['Typy rozegrane '] ??
        0
      );

      let skutecznoscRaw = r.skutecznosc ?? r['Skuteczność %'] ?? r['Skutecznosc %'] ?? '';
      let skutecznosc = Number(skutecznoscRaw);

      if (!skutecznosc && typy > 0) {
        skutecznosc = (trafione / typy) * 100;
      } else if (skutecznosc > 0 && skutecznosc <= 1) {
        skutecznosc = skutecznosc * 100;
      }

      const najwyzszyKurs = Number(
        r.najwyzszy_kurs ??
        r['Najwyższy trafiony kurs'] ??
        r['Najwyższy kurs'] ??
        bestHitByPlayer[gracz] ??
        0
      );

      return {
        gracz,
        punkty,
        punkty_typy: Number(r.punkty_typy ?? r['Punkty typy'] ?? 0),
        punkty_zdarzenia: Number(r.punkty_zdarzenia ?? r['Punkty zdarzenia'] ?? 0),
        punkty_turniejowe: Number(r.punkty_turniejowe ?? r['Punkty turniejowe'] ?? 0),
        trafione,
        nietrafione: Number(r.nietrafione ?? r.Nietrafione ?? 0),
        brak_typow: Number(r.brak_typow ?? r['Brak typów'] ?? 0),
        typy,
        skutecznosc,
        najwyzszy_kurs: najwyzszyKurs,
        seria: Number(r.seria ?? r.Seria ?? getBestSeries(gracz)),
        ostatnio: Number(r.ostatnio ?? r.Ostatnio ?? getLastPoints(gracz)),
      };
    })
    .filter((r) => r.gracz);

  const meczeBase = raw.mecze || [];
const meczeStats = raw.statystykiMeczow || [];

const statsById = {};
meczeStats.forEach((m) => {
  const id = String(m['Match ID'] ?? m.ID ?? m.id ?? '').trim();
  if (id) statsById[id] = m;
});

const matches = meczeBase
  .map((m) => {
    const id = String(m.ID ?? m.id ?? m['Match ID'] ?? '').trim();
    const stats = statsById[id] || {};

    return {
      id,
      mecz: m.Mecz ?? m.mecz ?? stats.Mecz ?? '',
      etap: m.Etap ?? m.etap ?? stats.Etap ?? '',
      start: m['Data startu'] ?? m.Start ?? m.start ?? '',
      kurs1: Number(m['Kurs 1'] ?? m.kurs1 ?? 0),
      kursX: Number(m['Kurs X'] ?? m.kursX ?? 0),
      kurs2: Number(m['Kurs 2'] ?? m.kurs2 ?? 0),
      wynik: m['Wynik 1/X/2'] ?? m.Wynik ?? m.wynik ?? stats.Wynik ?? '',
      status: m.Status ?? m.status ?? '',
      typ1: Number(stats['Typy 1'] ?? stats.typ1 ?? 0),
      typx: Number(stats['Typy X'] ?? stats.typx ?? stats.typX ?? 0),
      typ2: Number(stats['Typy 2'] ?? stats.typ2 ?? 0),
      najlepszy: stats['Najlepszy gracz'] ?? stats.najlepszy ?? '—',
    };
  })
  .filter((m) => m.id || m.mecz);

  const hitsNormalized = (raw.najlepszeTrafienia || raw.hits || [])
  .map((h) => ({
    gracz: h.gracz ?? h.Gracz ?? '',
    matchId: h.matchId ?? h['Match ID'] ?? '',
    mecz: h.mecz ?? h.Mecz ?? '',
    etap: h.etap ?? h.Etap ?? '',
    typ: h.typ ?? h.Typ ?? '',
    kurs: toNumber(h.kurs ?? h.Kurs ?? h['Kurs typu'] ?? h['Typ kurs'] ?? 0),
    punkty: toNumber(h.punkty ?? h.Punkty ?? 0),
  }))
  .filter((h) => h.gracz || h.mecz || h.typ);

return {
  ...raw,
  ranking,
  hits: hitsNormalized,
  bonuses: raw.zdarzenia || raw.bonuses || [],
  matches,
  players: raw.statystykiGraczy || raw.players || ranking,
  prizePool: raw.pula?.[0] || raw.prizePool || MOCK_DATA.prizePool,
};
}

function StatCard({ icon: Icon, label, value, sub }) {
  return <div className="stat-card"><div className="stat-icon"><Icon size={24}/></div><div><p>{label}</p><strong>{value}</strong>{sub ? <span>{sub}</span> : null}</div></div>;
}

function Badge({ children, type = 'default' }) {
  return <span className={`badge-mini ${type}`}>{children}</span>;
}

function Tabs({ tab, setTab }) {
  const items = [
    ['ranking', 'Ranking', Trophy],
    ['matches', 'Mecze', CalendarDays],
    ["types", "Typy", Eye],
    ['hits', 'Trafienia', Target],
    ['bonuses', 'Side bety', ShieldCheck],
    ['charts', 'Wykresy', LineChart],
    ['pool', 'Pula', Coins],
    ['betting', 'Typowanie', LogIn],
  ];
  return <div className="tabs">{items.map(([id, label, Icon]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}><Icon size={17}/> {label}</button>)}</div>;
}

function Ranking({ ranking }) {
  return <div className="card table-card"><div className="card-head"><Medal size={20}/><h2>Ranking główny</h2></div><div className="table-wrap"><table><thead><tr><th>#</th><th>Gracz</th><th>Punkty</th><th>Trafione</th><th>Skuteczność</th><th>Najwyższy kurs</th><th>Seria</th><th>Ostatnio</th></tr></thead><tbody>{ranking.map((r, i) => <tr key={r.gracz}><td><b>{i+1}</b></td><td><b>{i===0?'🏆 ':''}{r.gracz}</b></td><td className="right"><b>{formatNumber(r.punkty)}</b></td><td className="right">{r.trafione}/{r.typy}</td><td className="right">{Math.round(Number(r.skutecznosc || 0))}%</td><td className="right">{formatNumber(r.najwyzszy_kurs)}</td><td className="right">🔥 {r.seria || 0}</td><td className="right">{formatNumber(r.ostatnio)}</td></tr>)}</tbody></table></div></div>;
}

function Matches({ matches }) {
  return (
    <div className="match-grid">
      {matches.map((m) => {
        const total = Number(m.typ1) + Number(m.typx) + Number(m.typ2) || 1;

        const isFinished =
          String(m.status || '').toUpperCase().includes('ZAKO') ||
          String(m.wynik || '').trim() !== '';

        return (
          <div className="card match-card" key={m.id}>
            <div className="match-top">
              <div>
                <span className="muted">{m.etap} · #{m.id}</span>
                <h3>{m.mecz}</h3>
                <p>{m.start}</p>
              </div>

              <Badge
                type={
                  String(m.status).includes('ZAKO')
                    ? 'good'
                    : String(m.status).includes('OTWAR')
                      ? 'good'
                      : 'wait'
                }
              >
                {m.status || '—'}
              </Badge>
            </div>

            <div className="odds-line">
              <span>1: {formatNumber(m.kurs1)}</span>
              <span>X: {formatNumber(m.kursX)}</span>
              <span>2: {formatNumber(m.kurs2)}</span>
            </div>

            {isFinished ? (
              <>
                {[
                  ['1', m.typ1],
                  ['X', m.typx],
                  ['2', m.typ2],
                ].map(([label, val]) => (
                  <div className="bar-row" key={label}>
                    <div>
                      <span>Typ {label}</span>
                      <b>{val || 0}</b>
                    </div>

                    <div className="bar">
                      <i style={{ width: `${(Number(val || 0) / total) * 100}%` }} />
                    </div>
                  </div>
                ))}

                <p>
                  <span className="muted">Wynik:</span> <b>{m.wynik || '—'}</b>
                </p>

                <p>
                  <span className="muted">Najlepiej:</span> <b>{m.najlepszy || '—'}</b>
                </p>
              </>
            ) : (
              <div className="hidden-types-box">
                Typy graczy będą widoczne po zakończeniu meczu.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SimpleTable({ title, icon: Icon, columns, rows }) {
  return <div className="card table-card"><div className="card-head"><Icon size={20}/><h2>{title}</h2></div><div className="table-wrap"><table><thead><tr>{columns.map(c => <th key={c.key} className={c.right?'right':''}>{c.label}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, i) => <tr key={i}>{columns.map(c => <td key={c.key} className={c.right?'right':''}>{c.render ? c.render(row) : row[c.key]}</td>)}</tr>) : <tr><td colSpan={columns.length} className="empty-cell">Brak danych</td></tr>}</tbody></table></div></div>;
}

function BettingTab({ darkMode }) {
  const [player, setPlayer] = useState('');
  const [code, setCode] = useState('');

  const iframeUrl = useMemo(() => {
    if (!APPS_SCRIPT_URL) return '';

    const url = new URL(APPS_SCRIPT_URL);

    if (player) url.searchParams.set('gracz', player);
    if (code) url.searchParams.set('kod', code);

    url.searchParams.set('theme', darkMode ? 'dark' : 'light');

    return url.toString();
  }, [player, code, darkMode]);

  if (!APPS_SCRIPT_URL) {
    return (
      <div className="card setup-card">
        <AlertTriangle />
        <h2>Wklej link do Apps Script</h2>
        <p>W pliku <b>src/App.jsx</b> ustaw:</p>
        <pre>{`const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/TWOJ_ID/exec';`}</pre>
        <p>Potem wrzuć zmianę na GitHub i zrób redeploy w Vercel.</p>
      </div>
    );
  }

  return (
    <div className="player-panel-full">
      <iframe
        title="Panel gracza"
        src={iframeUrl || APPS_SCRIPT_URL}
        className="player-panel"
      />
    </div>
  );
}

  if (!APPS_SCRIPT_URL) return <div className="card setup-card"><AlertTriangle/><h2>Wklej link do Apps Script</h2><p>W pliku <b>src/App.jsx</b> ustaw:</p><pre>{`const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/TWOJ_ID/exec';`}</pre><p>Potem wrzuć zmianę na GitHub i zrób redeploy w Vercel.</p></div>;

 return <div className="player-panel-full">
    <iframe
      title="Panel gracza"
      src={iframeUrl || APPS_SCRIPT_URL}
      className="player-panel"
    />
  </div>;
}

function TypesTab({ data }) {
  const rows = data?.typyWidoczne || [];

  const grouped = rows.reduce((acc, row) => {
    const matchId = row["Match ID"];
    if (!acc[matchId]) {
      acc[matchId] = {
        matchId,
        mecz: row["Mecz"],
        etap: row["Etap"],
        start: row["Start"],
        wynik: row["Wynik"],
        bets: []
      };
    }

    acc[matchId].bets.push(row);
    return acc;
  }, {});

  const groups = Object.values(grouped);

  if (!groups.length) {
    return (
      <div className="card">
        <h2>Typy graczy</h2>
        <p className="muted">
          Typy pojawią się tutaj dopiero po rozpoczęciu meczu.
        </p>
      </div>
    );
  }

  return (
    <div className="types-page">
      <div className="section-head">
        <h2>Typy graczy</h2>
        <p>Widoczne tylko dla meczów, które już się rozpoczęły.</p>
      </div>

      <div className="types-grid">
        {groups.map((group) => (
          <div className="card match-types-card" key={group.matchId}>
            <div className="match-types-head">
              <div>
                <div className="muted">#{group.matchId} · {group.etap}</div>
                <h3>{group.mecz}</h3>
                <div className="muted">Start: {group.start}</div>
              </div>

              <div className="result-pill">
                Wynik: {group.wynik || "oczekuje"}
              </div>
            </div>

            <div className="types-table-wrap">
              <table className="types-table">
                <thead>
                  <tr>
                    <th>Gracz</th>
                    <th>Typ</th>
                    <th>Kurs</th>
                    <th>Punkty</th>
                  </tr>
                </thead>

                <tbody>
                  {group.bets.map((bet, index) => (
                    <tr key={index}>
                      <td>{bet["Gracz"]}</td>
                      <td>
                        <strong>{bet["Typ"]}</strong>
                      </td>
                      <td>{formatNumber(bet["Kurs"])}</td>
                      <td className={Number(bet["Punkty"]) > 0 ? "positive" : Number(bet["Punkty"]) < 0 ? "negative" : ""}>
                        {formatNumber(bet["Punkty"])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartsTab({ data }) {
  const rows = data?.historiaPunktow || [];

  const parsedRows = rows
    .map((row) => ({
      matchId: Number(row['Match ID'] ?? row.matchId ?? 0),
      mecz: row.Mecz ?? row.mecz ?? '',
      etap: row.Etap ?? row.Data ?? row.etap ?? '',
      gracz: row.Gracz ?? row.gracz ?? '',
      punktyMecz: Number(row['Punkty mecz'] ?? row.punktyMecz ?? 0),
      punktyNarastajaco: Number(row['Punkty narastająco'] ?? row.punktyNarastajaco ?? 0),
    }))
    .filter((row) => row.gracz && row.matchId);

  const players = [...new Set(parsedRows.map((row) => row.gracz))];

  const matchIds = [...new Set(parsedRows.map((row) => row.matchId))]
    .sort((a, b) => a - b);

  if (!parsedRows.length) {
    return (
      <div className="card">
        <h2>Wykresy</h2>
        <p className="muted">
          Brak danych w arkuszu PUBLIC_HISTORIA_PUNKTOW.
        </p>
      </div>
    );
  }

  const width = 900;
  const height = 360;
  const padding = 44;

  const allPoints = parsedRows.map((row) => row.punktyNarastajaco);
  const minY = Math.min(0, ...allPoints);
  const maxY = Math.max(1, ...allPoints);

  const xFor = (matchId) => {
    if (matchIds.length <= 1) return padding;
    const index = matchIds.indexOf(matchId);
    return padding + (index / (matchIds.length - 1)) * (width - padding * 2);
  };

  const yFor = (value) => {
    if (maxY === minY) return height / 2;
    return height - padding - ((value - minY) / (maxY - minY)) * (height - padding * 2);
  };

  const palette = [
    '#0f172a',
    '#2563eb',
    '#16a34a',
    '#dc2626',
    '#9333ea',
    '#ea580c',
    '#0891b2',
    '#be123c',
  ];

  const series = players.map((player, index) => {
    const playerRows = parsedRows
      .filter((row) => row.gracz === player)
      .sort((a, b) => a.matchId - b.matchId);

    const points = playerRows
      .map((row) => `${xFor(row.matchId)},${yFor(row.punktyNarastajaco)}`)
      .join(' ');

    const last = playerRows[playerRows.length - 1];

    return {
      player,
      points,
      color: palette[index % palette.length],
      lastPoints: last?.punktyNarastajaco ?? 0,
    };
  });

  const leadersByMatch = matchIds.map((matchId) => {
    const rowsForMatch = parsedRows.filter((row) => row.matchId === matchId);
    const leader = rowsForMatch
      .slice()
      .sort((a, b) => b.punktyNarastajaco - a.punktyNarastajaco)[0];

    return {
      matchId,
      mecz: leader?.mecz || '',
      gracz: leader?.gracz || '',
      punkty: leader?.punktyNarastajaco ?? 0,
    };
  });

  return (
    <div className="charts-page">
      <div className="card chart-card">
        <div className="card-head">
          <LineChart size={20} />
          <h2>Historia punktów</h2>
        </div>

        <p className="muted">
          Wykres pokazuje punkty narastająco po kolejnych meczach.
        </p>

        <div className="chart-wrap">
          <svg viewBox={`0 0 ${width} ${height}`} className="points-chart">
            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding}
              y2={height - padding}
              className="axis-line"
            />

            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={height - padding}
              className="axis-line"
            />

            {matchIds.map((matchId) => (
              <line
                key={matchId}
                x1={xFor(matchId)}
                y1={padding}
                x2={xFor(matchId)}
                y2={height - padding}
                className="grid-line"
              />
            ))}

            {series.map((s) => (
              <polyline
                key={s.player}
                points={s.points}
                fill="none"
                stroke={s.color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>
        </div>

        <div className="chart-legend">
          {series.map((s) => (
            <div className="legend-item" key={s.player}>
              <span style={{ background: s.color }} />
              <b>{s.player}</b>
              <em>{formatNumber(s.lastPoints)} pkt</em>
            </div>
          ))}
        </div>
      </div>

      <div className="card table-card">
        <div className="card-head">
          <Trophy size={20} />
          <h2>Lider po każdym meczu</h2>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mecz</th>
                <th>Spotkanie</th>
                <th>Lider</th>
                <th className="right">Punkty</th>
              </tr>
            </thead>

            <tbody>
              {leadersByMatch.map((row) => (
                <tr key={row.matchId}>
                  <td>#{row.matchId}</td>
                  <td>{row.mecz || '—'}</td>
                  <td><b>{row.gracz || '—'}</b></td>
                  <td className="right">{formatNumber(row.punkty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('ranking');
  const [darkMode, setDarkMode] = useState(() => {
  return localStorage.getItem('typer-theme') === 'dark';
});
  const [data, setData] = useState(MOCK_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true); setError('');
    try {
      const res = await jsonp(APPS_SCRIPT_URL, { api: 'publicData' });
      if (!res || res.ok === false) throw new Error(res?.error || 'Błąd danych');
      const normalized = normalizeDashboardData(res);
setData({ ...MOCK_DATA, ...normalized });
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
  document.documentElement.classList.toggle('dark', darkMode);
  localStorage.setItem('typer-theme', darkMode ? 'dark' : 'light');
}, [darkMode]);

  const ranking = useMemo(() => [...(data.ranking || [])].sort((a,b)=>Number(b.punkty)-Number(a.punkty)), [data.ranking]);
  const leader = ranking[0];
  const pool = data.prizePool || { pula: 0, rebuy: 0, gracze: 0, wpisowe: 100 };
  const bestHit = [...(data.hits || [])]
  .map((h) => ({
    gracz: h.gracz ?? h.Gracz ?? '',
    mecz: h.mecz ?? h.Mecz ?? '',
    kurs: toNumber(h.kurs ?? h.Kurs ?? h['Kurs typu'] ?? h['Typ kurs'] ?? h.Punkty ?? h.punkty ?? 0),
  }))
  .filter((h) => h.gracz || h.mecz || h.kurs > 0)
  .sort((a, b) => b.kurs - a.kurs)[0];
  const bestStreak = [...ranking].sort((a,b)=>Number(b.seria)-Number(a.seria))[0];

  return <main className="page"><section className="hero"><div className="pill-main">🏆 TYPER MŚ 2026</div><h1>Panel turnieju</h1><p>Statystyki, ranking, mecze, side bety i zakładka typowania podpięte pod Twój Google Sheet.</p><div className="hero-actions">
  <button className="refresh" onClick={loadData}>
    <RefreshCw size={16}/> {loading ? 'Odświeżanie...' : 'Odśwież dane'}
  </button>

  <button className="theme-toggle" onClick={() => setDarkMode((value) => !value)}>
    {darkMode ? <Sun size={16}/> : <Moon size={16}/>}
    {darkMode ? 'Light mode' : 'Dark mode'}
  </button>
</div>{error ? <div className="error-box">{error}</div> : null}<div className="updated">Ostatnia aktualizacja: {data.meta?.updatedAt || '—'}</div></section><section className="stats"><StatCard icon={Trophy} label="Lider" value={leader?.gracz || '—'} sub={`${formatNumber(leader?.punkty)} pkt`}/><StatCard icon={Target} label="Najwyższy trafiony kurs" value={bestHit ? formatNumber(bestHit.kurs) : '—'} sub={bestHit ? `${bestHit.gracz} — ${bestHit.mecz}` : 'Brak'}/><StatCard icon={Flame} label="Najdłuższa seria" value={bestStreak ? `${bestStreak.seria || 0}` : '—'} sub={bestStreak?.gracz || ''}/><StatCard icon={Coins} label="Pula" value={`${formatNumber(pool.pula)} zł`} sub={`${pool.gracze || 0} graczy`}/></section><Tabs tab={tab} setTab={setTab}/>{tab === 'ranking' && <Ranking ranking={ranking}/>} {tab === 'matches' && <Matches matches={data.matches || []}/>} {tab === 'hits' && <SimpleTable title="Najlepsze trafienia" icon={Target} rows={data.hits || []} columns={[{key:'gracz',label:'Gracz'},{key:'mecz',label:'Mecz'},{key:'typ',label:'Typ'},{key:'kurs',label:'Kurs',right:true,render:r=>formatNumber(r.kurs)},{key:'punkty',label:'Punkty',right:true,render:r=>formatNumber(r.punkty)}]}/>} {tab === 'bonuses' && <SimpleTable title="Side bety" icon={ShieldCheck} rows={data.bonuses || []} columns={[{key:'gracz',label:'Gracz'},{key:'mecz',label:'Mecz'},{key:'zdarzenie',label:'Zdarzenie'},{key:'kurs',label:'Kurs',right:true,render:r=>formatNumber(r.kurs)},{key:'status',label:'Status'},{key:'punkty',label:'Punkty',right:true,render:r=>formatNumber(r.punkty)}]}/>} {tab === 'charts' && <ChartsTab data={data} />} {tab === 'pool' && <div className="pool-grid"><div className="card"><h2>Pula nagród</h2><p className="big-money">{formatNumber(pool.pula)} zł</p><p>{pool.gracze || 0} graczy × {formatNumber(pool.wpisowe || 100)} zł + {formatNumber(pool.rebuy || 0)} zł re-buyów</p></div><div className="card"><h2>Podział przykładowy</h2>{[['1. miejsce',35],['2. miejsce',15],['3. miejsce',5],['Etapy',30],['Bonusy',15]].map(([name,p])=><div className="split-row" key={name}><span>{name}</span><b>{formatNumber(Number(pool.pula||0)*p/100)} zł</b></div>)}</div></div>} {tab === 'betting' && <BettingTab/>} {tab === "types" && <TypesTab data={data} />}</main>;
}

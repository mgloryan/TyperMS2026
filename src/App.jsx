import React, { useMemo, useState } from 'react';
import { Trophy, Target, Flame, Coins, CalendarDays, ShieldCheck, LogIn, Users, Medal } from 'lucide-react';

// =====================================================
// TEPER MŚ 2026 — DASHBOARD + ZAKŁADKA TYPOWANIA
// =====================================================
// 1. Wklej tutaj link do wdrożonego Apps Script Web App.
//    Przykład:
//    const PLAYER_PANEL_URL = 'https://script.google.com/macros/s/AKfycbx.../exec';
// 2. Ten link musi pochodzić z: Apps Script -> Deploy/Wdróż -> Web app.
// 3. W Code.gs musi być: setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
//    To pozwala wyświetlić panel gracza wewnątrz tej strony Vercel.

const PLAYER_PANEL_URL = 'https://script.google.com/macros/s/AKfycbzDOmFjAodNCvoGQg_JDPTqSn2hYGlPWmQeBqQMOtkgxt60rbmS2v2rp0CE3RcNqyDfWg/exec';

// Linki CSV z Google Sheets do publicznych statystyk. Możesz uzupełnić później.
const SHEET_URLS = {
  ranking: '',
  matches: '',
  hits: '',
  bonuses: '',
  prizePool: '',
};

const MOCK_DATA = {
  ranking: [
    { gracz: 'Mati', punkty: 72.4, trafione: 31, typy: 48, najwyzszy_kurs: 5.8, seria: 6, ostatnio: 4.3 },
    { gracz: 'Kuba', punkty: 68.9, trafione: 29, typy: 48, najwyzszy_kurs: 4.9, seria: 4, ostatnio: 0 },
    { gracz: 'Bartek', punkty: 63.2, trafione: 27, typy: 47, najwyzszy_kurs: 6.2, seria: 5, ostatnio: 6.2 },
    { gracz: 'Ola', punkty: 59.7, trafione: 26, typy: 48, najwyzszy_kurs: 3.6, seria: 3, ostatnio: 1.8 },
  ],
  matches: [
    { id: 48, mecz: 'Francja - Argentyna', etap: '1/8 finału', start: '2026-07-03 21:00', wynik: '1', status: 'Zakończony', typ1: 6, typx: 2, typ2: 3, najlepszy: 'Bartek +6.20' },
    { id: 49, mecz: 'Hiszpania - Niemcy', etap: '1/8 finału', start: '2026-07-04 18:00', wynik: '', status: 'Oczekuje', typ1: 4, typx: 4, typ2: 3, najlepszy: '—' },
    { id: 50, mecz: 'Brazylia - Holandia', etap: '1/8 finału', start: '2026-07-04 21:00', wynik: '', status: 'Oczekuje', typ1: 7, typx: 1, typ2: 3, najlepszy: '—' },
  ],
  hits: [
    { gracz: 'Bartek', mecz: 'Francja - Argentyna', typ: '2', kurs: 6.2, punkty: 6.2 },
    { gracz: 'Mati', mecz: 'Meksyk - Japonia', typ: 'X', kurs: 5.8, punkty: 5.8 },
    { gracz: 'Kuba', mecz: 'USA - Chorwacja', typ: '1', kurs: 4.9, punkty: 4.9 },
  ],
  bonuses: [
    { gracz: 'Mati', mecz: 'Francja - Argentyna', zdarzenie: 'Mbappe strzeli gola', kurs: 2.4, status: 'TRAFIONE', punkty: 2.4 },
    { gracz: 'Ola', mecz: 'Francja - Argentyna', zdarzenie: 'Powyżej 2,5 gola', kurs: 1.85, status: 'NIETRAFIONE', punkty: 0 },
  ],
  prizePool: [{ wpisowe: 100, gracze: 10, rebuy: 70, pula: 1070 }],
};

function formatNumber(n) {
  return Number(n || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-icon"><Icon size={24} /></div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {sub ? <span>{sub}</span> : null}
      </div>
    </div>
  );
}

function Badge({ children, type = 'default' }) {
  return <span className={`badge-mini ${type}`}>{children}</span>;
}

function Tabs({ tab, setTab }) {
  const items = [
    ['ranking', 'Ranking', Trophy],
    ['matches', 'Mecze', CalendarDays],
    ['hits', 'Trafienia', Target],
    ['bonuses', 'Side bety', ShieldCheck],
    ['pool', 'Pula', Coins],
    ['betting', 'Typowanie', LogIn],
  ];

  return (
    <div className="tabs">
      {items.map(([id, label, Icon]) => (
        <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
          <Icon size={17} /> {label}
        </button>
      ))}
    </div>
  );
}

function Ranking({ ranking }) {
  return (
    <div className="card table-card">
      <div className="card-head"><Medal size={20} /><h2>Ranking główny</h2></div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>#</th><th>Gracz</th><th>Punkty</th><th>Trafione</th><th>Skuteczność</th><th>Najwyższy kurs</th><th>Seria</th><th>Ostatnio</th></tr>
          </thead>
          <tbody>
            {ranking.map((r, i) => (
              <tr key={r.gracz}>
                <td><b>{i + 1}</b></td>
                <td><b>{i === 0 ? '🏆 ' : ''}{r.gracz}</b></td>
                <td className="right"><b>{formatNumber(r.punkty)}</b></td>
                <td className="right">{r.trafione}/{r.typy}</td>
                <td className="right">{Math.round((r.trafione / (r.typy || 1)) * 100)}%</td>
                <td className="right">{formatNumber(r.najwyzszy_kurs)}</td>
                <td className="right">🔥 {r.seria}</td>
                <td className="right">{formatNumber(r.ostatnio)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Matches({ matches }) {
  return (
    <div className="match-grid">
      {matches.map((m) => {
        const total = Number(m.typ1) + Number(m.typx) + Number(m.typ2) || 1;
        return (
          <div className="card match-card" key={m.id}>
            <div className="match-top">
              <div><span className="muted">{m.etap} · #{m.id}</span><h3>{m.mecz}</h3><p>{m.start}</p></div>
              <Badge type={m.status === 'Zakończony' ? 'good' : 'wait'}>{m.status}</Badge>
            </div>
            {[["1", m.typ1], ["X", m.typx], ["2", m.typ2]].map(([label, val]) => (
              <div className="bar-row" key={label}>
                <div><span>Typ {label}</span><b>{val}</b></div>
                <div className="bar"><i style={{ width: `${(Number(val) / total) * 100}%` }} /></div>
              </div>
            ))}
            <p><span className="muted">Wynik:</span> <b>{m.wynik || '—'}</b></p>
            <p><span className="muted">Najlepiej:</span> <b>{m.najlepszy}</b></p>
          </div>
        );
      })}
    </div>
  );
}

function BettingTab() {
  const [player, setPlayer] = useState('');
  const [code, setCode] = useState('');

  const iframeUrl = useMemo(() => {
    if (!PLAYER_PANEL_URL) return '';
    const url = new URL(PLAYER_PANEL_URL);
    if (player) url.searchParams.set('gracz', player);
    if (code) url.searchParams.set('kod', code);
    return url.toString();
  }, [player, code]);

  if (!PLAYER_PANEL_URL) {
    return (
      <div className="card setup-card">
        <h2>Zakładka typowania nie jest jeszcze podłączona</h2>
        <p>W pliku <b>src/App.jsx</b> wklej link do Apps Script Web App w stałą:</p>
        <pre>{`const PLAYER_PANEL_URL = 'https://script.google.com/macros/s/TWOJ_ID/exec';`}</pre>
        <p>Po zapisaniu zmian wrzuć plik na GitHub i zrób redeploy w Vercel.</p>
      </div>
    );
  }

  return (
    <div className="betting-layout">
      <div className="card login-side">
        <h2>Typowanie</h2>
        <p>Wpisz gracza i kod. Panel poniżej zapisze typy bezpośrednio do Twojego Google Sheeta.</p>
        <label>Gracz</label>
        <input value={player} onChange={(e) => setPlayer(e.target.value)} placeholder="np. Mati" />
        <label>Kod gracza</label>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="np. abc123" />
        <p className="hint">Możesz też zostawić pola puste i wpisać dane bezpośrednio w panelu.</p>
      </div>
      <div className="iframe-card">
        <iframe title="Panel gracza" src={iframeUrl || PLAYER_PANEL_URL} />
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('ranking');
  const data = MOCK_DATA;
  const ranking = useMemo(() => [...data.ranking].sort((a, b) => Number(b.punkty) - Number(a.punkty)), [data.ranking]);
  const leader = ranking[0];
  const pool = data.prizePool[0] || { pula: 0, rebuy: 0 };
  const bestHit = [...data.hits].sort((a, b) => Number(b.kurs) - Number(a.kurs))[0];
  const bestStreak = [...ranking].sort((a, b) => Number(b.seria) - Number(a.seria))[0];

  return (
    <main className="page">
      <section className="hero">
        <div className="pill-main">🏆 TEPER MŚ 2026</div>
        <h1>Panel turnieju</h1>
        <p>Ranking, statystyki, side bety i zakładka do obstawiania w jednym miejscu.</p>
      </section>

      <section className="stats">
        <StatCard icon={Trophy} label="Lider" value={leader?.gracz || '—'} sub={`${formatNumber(leader?.punkty)} pkt`} />
        <StatCard icon={Target} label="Najwyższy kurs" value={bestHit ? formatNumber(bestHit.kurs) : '—'} sub={bestHit ? `${bestHit.gracz} — ${bestHit.mecz}` : ''} />
        <StatCard icon={Flame} label="Najdłuższa seria" value={bestStreak ? `${bestStreak.seria} trafień` : '—'} sub={bestStreak?.gracz} />
        <StatCard icon={Coins} label="Pula" value={`${formatNumber(pool.pula)} zł`} sub={`Rebuy: ${formatNumber(pool.rebuy)} zł`} />
      </section>

      <Tabs tab={tab} setTab={setTab} />

      {tab === 'ranking' && <Ranking ranking={ranking} />}
      {tab === 'matches' && <Matches matches={data.matches} />}
      {tab === 'hits' && (
        <div className="card table-card"><div className="card-head"><Target size={20}/><h2>Najlepsze trafienia</h2></div><Table rows={data.hits} /></div>
      )}
      {tab === 'bonuses' && (
        <div className="card table-card"><div className="card-head"><ShieldCheck size={20}/><h2>Side bety</h2></div><Table rows={data.bonuses} /></div>
      )}
      {tab === 'pool' && (
        <div className="pool-grid"><div className="card big-pool"><Coins size={34}/><h2>Pula nagród</h2><strong>{formatNumber(pool.pula)} zł</strong><p>{pool.gracze} graczy × {pool.wpisowe} zł + {formatNumber(pool.rebuy)} zł re-buyów</p></div><div className="card"><h2>Podział</h2>{[['1. miejsce',35],['2. miejsce',15],['3. miejsce',5],['Etapy',30],['Bonusy',15]].map(([n,p])=><div className="split" key={n}><span>{n}</span><b>{formatNumber(Number(pool.pula)*p/100)} zł</b></div>)}</div></div>
      )}
      {tab === 'betting' && <BettingTab />}
    </main>
  );
}

function Table({ rows }) {
  if (!rows.length) return <p>Brak danych.</p>;
  const keys = Object.keys(rows[0]);
  return <div className="table-wrap"><table><thead><tr>{keys.map(k=><th key={k}>{k}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{keys.map(k=><td key={k}>{typeof r[k] === 'number' ? formatNumber(r[k]) : r[k]}</td>)}</tr>)}</tbody></table></div>;
}

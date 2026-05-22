import React, { useEffect, useMemo, useState } from 'react';
import { Trophy, Target, Flame, Coins, CalendarDays, ShieldCheck, LogIn, Medal, RefreshCw, Users, AlertTriangle } from 'lucide-react';

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
    ['hits', 'Trafienia', Target],
    ['bonuses', 'Side bety', ShieldCheck],
    ['players', 'Gracze', Users],
    ['pool', 'Pula', Coins],
    ['betting', 'Typowanie', LogIn],
  ];
  return <div className="tabs">{items.map(([id, label, Icon]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}><Icon size={17}/> {label}</button>)}</div>;
}

function Ranking({ ranking }) {
  return <div className="card table-card"><div className="card-head"><Medal size={20}/><h2>Ranking główny</h2></div><div className="table-wrap"><table><thead><tr><th>#</th><th>Gracz</th><th>Punkty</th><th>Trafione</th><th>Skuteczność</th><th>Najwyższy kurs</th><th>Seria</th><th>Ostatnio</th></tr></thead><tbody>{ranking.map((r, i) => <tr key={r.gracz}><td><b>{i+1}</b></td><td><b>{i===0?'🏆 ':''}{r.gracz}</b></td><td className="right"><b>{formatNumber(r.punkty)}</b></td><td className="right">{r.trafione}/{r.typy}</td><td className="right">{Math.round(Number(r.skutecznosc || 0))}%</td><td className="right">{formatNumber(r.najwyzszy_kurs)}</td><td className="right">🔥 {r.seria || 0}</td><td className="right">{formatNumber(r.ostatnio)}</td></tr>)}</tbody></table></div></div>;
}

function Matches({ matches }) {
  return <div className="match-grid">{matches.map((m) => { const total = Number(m.typ1)+Number(m.typx)+Number(m.typ2) || 1; return <div className="card match-card" key={m.id}><div className="match-top"><div><span className="muted">{m.etap} · #{m.id}</span><h3>{m.mecz}</h3><p>{m.start}</p></div><Badge type={String(m.status).includes('ZAKO') ? 'good' : String(m.status).includes('OTWAR') ? 'good' : 'wait'}>{m.status || '—'}</Badge></div><div className="odds-line"><span>1: {formatNumber(m.kurs1)}</span><span>X: {formatNumber(m.kursX)}</span><span>2: {formatNumber(m.kurs2)}</span></div>{[['1',m.typ1],['X',m.typx],['2',m.typ2]].map(([label,val]) => <div className="bar-row" key={label}><div><span>Typ {label}</span><b>{val || 0}</b></div><div className="bar"><i style={{width:`${(Number(val||0)/total)*100}%`}}/></div></div>)}<p><span className="muted">Wynik:</span> <b>{m.wynik || '—'}</b></p><p><span className="muted">Najlepiej:</span> <b>{m.najlepszy || '—'}</b></p></div> })}</div>;
}

function SimpleTable({ title, icon: Icon, columns, rows }) {
  return <div className="card table-card"><div className="card-head"><Icon size={20}/><h2>{title}</h2></div><div className="table-wrap"><table><thead><tr>{columns.map(c => <th key={c.key} className={c.right?'right':''}>{c.label}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, i) => <tr key={i}>{columns.map(c => <td key={c.key} className={c.right?'right':''}>{c.render ? c.render(row) : row[c.key]}</td>)}</tr>) : <tr><td colSpan={columns.length} className="empty-cell">Brak danych</td></tr>}</tbody></table></div></div>;
}

function BettingTab() {
  const [player, setPlayer] = useState('');
  const [code, setCode] = useState('');
  const iframeUrl = useMemo(() => {
    if (!APPS_SCRIPT_URL) return '';
    const url = new URL(APPS_SCRIPT_URL);
    if (player) url.searchParams.set('gracz', player);
    if (code) url.searchParams.set('kod', code);
    return url.toString();
  }, [player, code]);

  if (!APPS_SCRIPT_URL) return <div className="card setup-card"><AlertTriangle/><h2>Wklej link do Apps Script</h2><p>W pliku <b>src/App.jsx</b> ustaw:</p><pre>{`const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/TWOJ_ID/exec';`}</pre><p>Potem wrzuć zmianę na GitHub i zrób redeploy w Vercel.</p></div>;

 return <div className="player-panel-full">
    <iframe
      title="Panel gracza"
      src={iframeUrl || APPS_SCRIPT_URL}
      className="player-panel"
    />
  </div>;
}

export default function App() {
  const [tab, setTab] = useState('ranking');
  const [data, setData] = useState(MOCK_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true); setError('');
    try {
      const res = await jsonp(APPS_SCRIPT_URL, { api: 'publicData' });
      if (!res || res.ok === false) throw new Error(res?.error || 'Błąd danych');
      setData({ ...MOCK_DATA, ...res });
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const ranking = useMemo(() => [...(data.ranking || [])].sort((a,b)=>Number(b.punkty)-Number(a.punkty)), [data.ranking]);
  const leader = ranking[0];
  const pool = data.prizePool || { pula: 0, rebuy: 0, gracze: 0, wpisowe: 100 };
  const bestHit = [...(data.hits || [])].sort((a,b)=>Number(b.kurs)-Number(a.kurs))[0];
  const bestStreak = [...ranking].sort((a,b)=>Number(b.seria)-Number(a.seria))[0];

  return <main className="page"><section className="hero"><div className="pill-main">🏆 TYPER MŚ 2026</div><h1>Panel turnieju</h1><p>Statystyki, ranking, mecze, side bety i zakładka typowania podpięte pod Twój Google Sheet.</p><button className="refresh" onClick={loadData}><RefreshCw size={16}/> {loading ? 'Odświeżanie...' : 'Odśwież dane'}</button>{error ? <div className="error-box">{error}</div> : null}<div className="updated">Ostatnia aktualizacja: {data.meta?.updatedAt || '—'}</div></section><section className="stats"><StatCard icon={Trophy} label="Lider" value={leader?.gracz || '—'} sub={`${formatNumber(leader?.punkty)} pkt`}/><StatCard icon={Target} label="Najwyższy trafiony kurs" value={bestHit ? formatNumber(bestHit.kurs) : '—'} sub={bestHit ? `${bestHit.gracz} — ${bestHit.mecz}` : 'Brak'}/><StatCard icon={Flame} label="Najdłuższa seria" value={bestStreak ? `${bestStreak.seria || 0}` : '—'} sub={bestStreak?.gracz || ''}/><StatCard icon={Coins} label="Pula" value={`${formatNumber(pool.pula)} zł`} sub={`${pool.gracze || 0} graczy`}/></section><Tabs tab={tab} setTab={setTab}/>{tab === 'ranking' && <Ranking ranking={ranking}/>} {tab === 'matches' && <Matches matches={data.matches || []}/>} {tab === 'hits' && <SimpleTable title="Najlepsze trafienia" icon={Target} rows={data.hits || []} columns={[{key:'gracz',label:'Gracz'},{key:'mecz',label:'Mecz'},{key:'typ',label:'Typ'},{key:'kurs',label:'Kurs',right:true,render:r=>formatNumber(r.kurs)},{key:'punkty',label:'Punkty',right:true,render:r=>formatNumber(r.punkty)}]}/>} {tab === 'bonuses' && <SimpleTable title="Side bety" icon={ShieldCheck} rows={data.bonuses || []} columns={[{key:'gracz',label:'Gracz'},{key:'mecz',label:'Mecz'},{key:'zdarzenie',label:'Zdarzenie'},{key:'kurs',label:'Kurs',right:true,render:r=>formatNumber(r.kurs)},{key:'status',label:'Status'},{key:'punkty',label:'Punkty',right:true,render:r=>formatNumber(r.punkty)}]}/>} {tab === 'players' && <SimpleTable title="Gracze" icon={Users} rows={data.players || []} columns={[{key:'gracz',label:'Gracz'},{key:'typy',label:'Typy',right:true},{key:'punkty',label:'Punkty',right:true,render:r=>formatNumber(r.punkty)}]}/>} {tab === 'pool' && <div className="pool-grid"><div className="card"><h2>Pula nagród</h2><p className="big-money">{formatNumber(pool.pula)} zł</p><p>{pool.gracze || 0} graczy × {formatNumber(pool.wpisowe || 100)} zł + {formatNumber(pool.rebuy || 0)} zł re-buyów</p></div><div className="card"><h2>Podział przykładowy</h2>{[['1. miejsce',35],['2. miejsce',15],['3. miejsce',5],['Etapy',30],['Bonusy',15]].map(([name,p])=><div className="split-row" key={name}><span>{name}</span><b>{formatNumber(Number(pool.pula||0)*p/100)} zł</b></div>)}</div></div>} {tab === 'betting' && <BettingTab/>}</main>;
}

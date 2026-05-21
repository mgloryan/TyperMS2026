# Teper MŚ 2026 — dashboard + typowanie

Ta paczka zawiera stronę Vercel z zakładką **Typowanie**, która osadza panel gracza z Google Apps Script.

## Jak podłączyć panel gracza

1. Wejdź w Apps Script, gdzie działa panel gracza.
2. Skopiuj link Web App, np. `https://script.google.com/macros/s/.../exec`.
3. Otwórz `src/App.jsx`.
4. Wklej link tutaj:

```js
const PLAYER_PANEL_URL = 'https://script.google.com/macros/s/TWOJ_ID/exec';
```

5. Zapisz plik, wrzuć na GitHub i zrób Redeploy w Vercel.

## Ważne

W `Code.gs` panelu gracza musi być:

```js
.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
```

Inaczej Google może zablokować wyświetlanie panelu w iframe.

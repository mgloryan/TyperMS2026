# Teper MŚ 2026 — dashboard live + typowanie

Ta paczka robi jedną stronę Vercel z zakładkami:

- Ranking
- Mecze
- Trafienia
- Side bety
- Gracze
- Pula
- Typowanie

Dane są pobierane bezpośrednio z Twojego Google Sheeta przez Apps Script.

## 1. Wklej API do Apps Script

W paczce masz plik:

```text
apps-script/PUBLIC_API_DO_WKLEJENIA.gs
```

Otwórz Apps Script podpięty do Twojego Google Sheeta i wklej kod z tego pliku na końcu `Code.gs`.

Bardzo ważne: jeśli masz już funkcję `doGet(e)`, zastąp ją wersją z pliku `PUBLIC_API_DO_WKLEJENIA.gs`.

Ta wersja `doGet(e)` obsługuje dwie rzeczy:

```text
normalny link Web App               → panel gracza do typowania
link z ?api=publicData&callback=... → dane do dashboardu Vercel
```

## 2. Wdróż Apps Script

Po zmianach w Apps Script zrób:

```text
Wdróż → Zarządzaj wdrożeniami → ołówek → Wersja: Nowa wersja → Wdróż
```

Skopiuj link Web App, np.:

```text
https://script.google.com/macros/s/AKfycbx.../exec
```

## 3. Wklej link do strony Vercel

Otwórz plik:

```text
src/App.jsx
```

Znajdź linię:

```javascript
const APPS_SCRIPT_URL = '';
```

I wklej swój link:

```javascript
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx.../exec';
```

## 4. Wrzuć na GitHub i zrób redeploy w Vercel

Wrzuć wszystkie pliki do repozytorium:

```text
index.html
package.json
src/
apps-script/
README.md
```

Vercel powinien sam zbudować stronę.

## 5. Wymagany układ arkuszy

### MECZE

```text
A ID
B Etap
C Grupa
D Data startu
E Drużyna 1
F Drużyna 2
G Mecz
H Kurs 1
I Kurs X
J Kurs 2
K Wynik 1/X/2
L Bramki 1
M Bramki 2
N Status
O Widoczny w typowaniu?
P Uwagi
```

### GRACZE

```text
A Gracz
B Kod
C Aktywny
```

### TYPY

```text
A Timestamp
B Gracz
C Kod
D Match ID
E Typ
F Status
G Ostatnia zmiana
```

### ZDARZENIA

```text
A Timestamp
B Gracz
C Kod
D Match ID
E Zdarzenie
F Kurs
G Status
H Punkty
I Ostatnia zmiana
```

## 6. Test API

Po wdrożeniu możesz sprawdzić w przeglądarce:

```text
TWÓJ_LINK_DO_APPS_SCRIPT?api=publicData&callback=test
```

Powinno pokazać coś w stylu:

```text
test({"ok":true,...});
```

Jeśli tak jest, Vercel będzie umiał pobierać dane.

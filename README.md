# System analizy składu kosmetyków INCI

Praca inżynierska, UKEN Kraków 2026/2027.

Aplikacja odczytuje skład kosmetyku ze zdjęcia etykiety, dopasowuje składniki do bazy
i pokazuje, co znajduje się w produkcie.

- Ewelina Rakoczy – OCR i parser INCI
- Małgorzata Słaboń – frontend
- Oliwia Budaj – baza danych, API, integracja z modelem językowym

## Backend

Python 3.12, FastAPI, PostgreSQL (Supabase). Polecenia uruchamiamy w katalogu `backend/`.

```
py -3.12 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Skopiuj `.env.example` do `.env` i wpisz adres bazy z Supabase (Connect → Session pooler).

```
uvicorn app.main:app --reload
python -m pytest
```

## Baza danych

Migracje są w `supabase/migrations/`. Uruchamiamy je z głównego katalogu repo:

```
npx supabase migration new nazwa_migracji
npx supabase db push --remote="<DATABASE_URL>" --dry-run
npx supabase db push --remote="<DATABASE_URL>"
```

## Import nazw składników

Nazwy INCI pochodzą z Decyzji wykonawczej Komisji (UE) 2025/1175 (słownik wspólnych nazw
składników, Dz.U. L z 10.7.2025). PDF zamieniamy na tekst narzędziem `pdftotext`
(jest w Git for Windows), a potem uruchamiamy import w katalogu `backend/`:

```
pdftotext -enc UTF-8 -layout OJ_L_202501175_PL_TXT.pdf decyzja.txt
python -m app.import_ingredients decyzja.txt --dry-run
python -m app.import_ingredients decyzja.txt --accept-suspicious
```

`--dry-run` tylko pokazuje podsumowanie i niczego nie zapisuje. Import zatrzymuje się,
jeśli w dokumencie są błędy (np. zła numeracja albo niejasny tekst). Nazwy podejrzane
(nietypowe znaki, bardzo długie) trzeba najpierw przejrzeć i potwierdzić flagą
`--accept-suspicious`. Import można uruchomić ponownie – nazwy, które już są w bazie,
zostają pominięte.

## Import funkcji składników

Funkcje pochodzą z Decyzji Komisji 2006/257/WE (sekcja I wykazu składników, Dz.U. L 97
z 5.4.2006). Dane przygotowujemy poza repozytorium: tabelę odczytujemy trzema niezależnymi
sposobami (dwa odczyty wersji angielskiej i wersja polska), a do pliku CSV trafiają tylko
zgodne wyniki dla nazw z Decyzji 2025/1175. Plików CSV nie publikujemy w repozytorium.
Najpierw importujemy nazwy, potem funkcje (w katalogu `backend/`):

```
python -m app.import_functions gotowe_do_importu.csv dodatkowe_bezpieczne.csv --dry-run
python -m app.import_functions gotowe_do_importu.csv dodatkowe_bezpieczne.csv
```

Import zatrzymuje się i niczego nie zapisuje, jeśli w plikach jest funkcja spoza oficjalnej
listy 63 funkcji, powtórzona nazwa albo nazwa, której nie ma w bazie. Ponowne uruchomienie
nie tworzy duplikatów.

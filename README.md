# System analizy składu kosmetyków INCI

Praca inżynierska, UKEN Kraków 2026/2027.

Aplikacja odczytuje skład kosmetyku ze zdjęcia etykiety, dopasowuje składniki do bazy
i pokazuje, co znajduje się w produkcie.

- Ewelina Rakoczy – OCR i parser INCI
- Małgorzata Słaboń – frontend
- Oliwia Budaj – baza danych, API, integracja z modelem językowym

## Backend

Python 3.13, FastAPI, PostgreSQL (Supabase). Polecenia uruchamiamy w katalogu `backend/`.

```
python -m venv .venv
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

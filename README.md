# Eva Dilemma's 🌸

## Stap 1 — Supabase (gratis database)

1. Ga naar https://supabase.com en maak een gratis account
2. Klik "New project" → geef het de naam `eva-dilemmas` → kies een wachtwoord (bewaar dit!)
3. Wacht tot het project klaar is (~1 minuut)
4. Ga naar **SQL Editor** (linkermenu) en plak dit erin, klik "Run":

```sql
create table votes (
  id uuid default gen_random_uuid() primary key,
  dilemma_id integer not null,
  direction text not null,
  created_at timestamp with time zone default now()
);

create table comments (
  id uuid default gen_random_uuid() primary key,
  dilemma_id integer not null,
  text text not null,
  created_at timestamp with time zone default now()
);

create table submitted_dilemmas (
  id uuid default gen_random_uuid() primary key,
  text text not null,
  created_at timestamp with time zone default now()
);

alter table votes enable row level security;
alter table comments enable row level security;
alter table submitted_dilemmas enable row level security;

create policy "Iedereen mag stemmen" on votes for insert with check (true);
create policy "Iedereen mag stemmen lezen" on votes for select using (true);
create policy "Iedereen mag reageren" on comments for insert with check (true);
create policy "Iedereen mag reacties lezen" on comments for select using (true);
create policy "Iedereen mag insturen" on submitted_dilemmas for insert with check (true);
create policy "Iedereen mag ingezonden lezen" on submitted_dilemmas for select using (true);
```

5. Ga naar **Project Settings → API**
6. Kopieer **Project URL** en **anon public key** — die heb je zo nodig

---

## Stap 2 — GitHub repo aanmaken

1. Ga naar https://github.com/new
2. Naam: `eva-dilemmas`
3. Klik "Create repository"
4. Upload alle bestanden uit deze map (drag & drop in GitHub werkt)

---

## Stap 3 — Vercel koppelen

1. Ga naar https://vercel.com en log in met je GitHub account
2. Klik "Add New Project"
3. Kies je `eva-dilemmas` repo → klik "Import"
4. Ga naar **Environment Variables** en voeg toe:
   - `VITE_SUPABASE_URL` = jouw Project URL uit stap 1
   - `VITE_SUPABASE_ANON_KEY` = jouw anon public key uit stap 1
5. Klik "Deploy"

Je krijgt een URL zoals `eva-dilemmas.vercel.app` 🎉

---

## De app gebruiken

- **App:** `jouwurl.vercel.app`
- **Dashboard:** `jouwurl.vercel.app/#admin`

In het dashboard zie je:
- Hoeveel stemmen per dilemma
- Procentuele verdeling raak/nope
- Alle reacties
- Alle ingezonden dilemma's

---

## Vragen?

Stuur de foutmelding naar je Claude chat, dan lossen we het op 🌸

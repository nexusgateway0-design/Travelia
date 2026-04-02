TRAVELIA REAL-TIME WEBSITE

Ky project eshte gati per deploy ne Vercel me backend real ne Supabase.

FILES KRYESORE
- index.html
- offers.html
- destinations.html
- about.html
- gallery.html
- contact.html
- admin.html
- assets/supabase-config.js
- supabase_schema.sql

SETUP I SHPEJTE
1) Krijo account ne Supabase.
2) Krijo nje project te ri.
3) Ne SQL Editor ekzekuto file-in: supabase_schema.sql
4) Ne Supabase > Authentication > Users krijo user admin, p.sh. admin@travelia-ks.com
5) Hap Project Settings > API dhe merre:
   - Project URL
   - anon public key
6) Hape file-in assets/supabase-config.js dhe vendosi ato vlera.
7) Ngarko te gjitha file-at ne Vercel.
8) Hap admin.html dhe kyqu me email/password te adminit.
9) Ndrysho ofertat ose settings. Faqja publike perditesohet live.

DEPLOY NE VERCEL
- Më lehta: upload ne GitHub repo pastaj import ne Vercel.
- Ose me Vercel CLI nga folderi i projektit.

E RENDESISHME
- Une nuk mund ta publikoj direkt ne domenin tend pa akses ne Vercel/GitHub/Supabase.
- Por ky project eshte gati qe sapo ti i vendos kredencialet dhe e deploy-on, del live real.

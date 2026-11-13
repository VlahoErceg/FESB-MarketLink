# MarketLink — frontend demo

Responzivno sučelje višepredavačke web-tržnice izrađeno u Reactu, TypeScriptu i Viteu. Projektna specifikacija opisana je u lokalnom frontendu; ovaj paket implementira samo korisničko sučelje i simulacije u pregledniku.

## Pokretanje

```powershell
corepack pnpm --filter marketlink-web dev
```

Vite će ispisati lokalnu adresu za otvaranje u pregledniku.

## Što možete isprobati

- Katalog s pretragom, filtriranjem po kategoriji, stanju, gradu, cijeni i zalihi, sortiranjem i paginacijom.
- Košaricu s više prodavača, izmjenom količine i provjerom zalihe.
- Simulirano plaćanje s ishodima uspjeh, odbijanje i timeout. Ne unose se niti obrađuju podaci kartice.
- Demo prijavu s ulogama kupca, prodavača i administratora.
- Nadzorne ploče: kupčeve narudžbe, samo pripadajuće stavke za prodavača te upravljanje katalogom za administratora.
- Automatske demo prijelaze narudžbe iz pripreme u slanje i dostavu, spremljene obavijesti i recenzije nakon dostave.
- Objašnjene preporuke i graf prodaje za odabranu demo ulogu.

## Granice prototipa

Podaci, prijava, plaćanje, statusi, zalihe i uloge simuliraju se samo u frontend aplikaciji te se spremaju u `localStorage` preglednika. Uloge nisu sigurnosna kontrola, a više preglednika ili kupaca ne dijeli pouzdano zaključavanje zalihe. Za stvarni rad potrebni su autentikacija, autorizacija, API, transakcijska baza i pružatelj plaćanja.

- Aukcije s filtrima za kategoriju, grad i vrijeme završetka; ponuda traži prijavu Kupca i sprema se lokalno kao demo.

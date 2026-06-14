# Atelier 3D

3D interieurontwerp-tool — meubels plaatsen, presets laden, ontwerpen opslaan en meubels aanpassen in een tekenomgeving.

## Features

- 3D-kamer met dag/avond-verlichting en plattegrondmodus
- Meubels slepen, roteren, dupliceren en kleuren wisselen
- Presets voor woonruimte en badkamer
- Ontwerpen opslaan (localStorage) + JSON export/import
- **Tekenomgeving**: individuele meubels samenstellen uit blokken en cilinders
- Ongedaan maken (Ctrl+Z) voor volledige ontwerp-state

## Lokaal draaien

```bash
npm install
npm run dev
```

Open de URL uit de terminal (meestal http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Sneltoetsen

| Toets | Actie |
|-------|-------|
| Ctrl+Z | Ongedaan maken |
| Delete / Backspace | Geselecteerd item verwijderen |
| R | 45° roteren |
| Escape | Deselecteren |

## Structuur

```
App.jsx              Hoofdcomponent
hooks/               Scene, history, opslag, keyboard
components/          UI + tekenomgeving
furniture/           Meubelbouwers + custom onderdelen
lib/                 Opslag, export, dispose helpers
```

## GitHub Pages

De workflow deployt automatisch naar GitHub Pages bij push naar `master`.

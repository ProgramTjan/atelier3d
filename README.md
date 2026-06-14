# Atelier 3D

3D interieurontwerp-tool — meubels plaatsen, presets laden, ontwerpen opslaan en meubels aanpassen in een tekenomgeving.

## Features

- 3D-kamer met dag/avond-verlichting en plattegrondmodus
- Meubels slepen, roteren, dupliceren en kleuren wisselen
- Presets voor woonruimte en badkamer
- Ontwerpen opslaan (localStorage) + JSON export/import
- **Tekenomgeving**: individuele meubels samenstellen uit blokken en cilinders
- Ongedaan maken (Ctrl+Z) voor volledige ontwerp-state
- **Installeerbaar** als PWA op mobiel (starts scherm)

## Lokaal draaien

```bash
npm install
npm run dev
```

Open de URL uit de terminal (meestal http://localhost:5173).

## Mobiele app installeren

### Optie A — PWA (snelste, geen app store)

1. Open de app op je telefoon: https://programtjan.github.io/atelier3d/
2. **Android (Chrome):** tik op **Installeren** in de banner, of menu → *App installeren*
3. **iPhone (Safari):** Deel-knop → *Zet op beginscherm*

De app werkt daarna offline (behalve eerste load) en opent fullscreen.

### Optie B — Android APK (native app)

Vereist: [Android Studio](https://developer.android.com/studio) + Java JDK.

```bash
npm install
npm run build
npx cap add android    # eenmalig
npm run cap:android    # opent Android Studio
```

In Android Studio: *Build → Build Bundle(s) / APK(s) → Build APK(s)*.  
Het APK-bestand staat in `android/app/build/outputs/apk/`.

Of direct op een aangesloten telefoon:

```bash
npm run cap:run:android
```

### iPhone (App Store)

Voor een echte iOS-app heb je een Mac met Xcode en een Apple Developer-account nodig. De PWA-optie werkt op iPhone zonder App Store.

## Build

```bash
npm run build          # standaard (lokaal / Capacitor)
npm run build:pages    # GitHub Pages (/atelier3d/)
npm run preview
```

## Sneltoetsen (desktop)

| Toets | Actie |
|-------|-------|
| Ctrl+Z | Ongedaan maken |
| Delete / Backspace | Geselecteerd item verwijderen |
| R | 45° roteren |
| Escape | Deselecteren |

## GitHub Pages

De workflow deployt automatisch naar https://programtjan.github.io/atelier3d/ bij push naar `master`.

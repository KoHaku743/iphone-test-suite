# iPhone Test Suite

- LCD test (pixely, škvrny)
- Test rohov displeja

- Multi-touch test
- 3D Touch / Haptic Touch

- Horný reproduktor (earpiece)
- Dolný reproduktor (stereo)
- Mikrofón (nahrávanie)

### 📷 Kamery

- Zadná kamera (ostrenie, zoom)
- Predná kamera (FaceTime)

- Gyroskop
- Akcelerometer

- NFC / Apple Pay

## Rýchla inštalácia pre technikov

- Profil na stiahnutie (Home Screen ikona): `profiles/webclip-iphone-test-suite.mobileconfig`.
- Jedným klepnutím v Safari: otvorte `download.html` a ťuknite na „Download Profile“.
- Ďalšie možnosti distribúcie (TestFlight, Ad Hoc OTA, AltStore/Sideloadly): pozri `DISTRIBUTION.md`.

Poznámka: Webová verzia nemá prístup k proximity senzoru (obmedzenie iOS). Pre plné hardvérové testy použite natívnu iOS aplikáciu v branche `ios-native-app` (návod v `INSTALL.md`).

- SIM karta (hovory, SMS, dáta)

### 🔋 Batéria & Nabíjanie

- Battery Health
- Káblové nabíjanie
- Bezdrôtové nabíjanie

### ✅ Finálne testy

- Reštart zariadenia
- Test hovorov
- Mobilné dáta

## Použitie

1. Otvor `index.html` v Safari na iPhone
2. Pre lepší zážitok pridaj na plochu (Share → Add to Home Screen)
3. Postupne prechod všetky testy
4. Výsledky sa automaticky zaznamenávajú

## Poznámky

- Niektoré testy vyžadujú povolenia (kamera, mikrofón, poloha)
- Na iOS 13+ je potrebné povoliť prístup k senzorom
- Odporúčame použiť Safari pre najlepšiu kompatibilitu
- Aplikácia funguje offline po prvom načítaní

## Technológie

- HTML5
- CSS3 (iOS styled)
- Vanilla JavaScript
- Web APIs (Camera, Geolocation, Sensors, Battery, Audio)
- Service Worker (offline podpora)

# iPhone Test Suite

Komplexná webová aplikácia pre testovanie funkcií iPhone zariadení.

## Funkcie

### 🔍 Vizuálna kontrola

- LCD test (pixely, škvrny)
- Test rohov displeja
- Test škrtov

### 📱 Displej & Dotyk

- Multi-touch test
- 3D Touch / Haptic Touch
- TrueTone & NightShift

### 🔊 Zvuk

- Horný reproduktor (earpiece)
- Dolný reproduktor (stereo)
- Mikrofón (nahrávanie)

### 📷 Kamery

- Zadná kamera (ostrenie, zoom)
- Predná kamera (FaceTime)

### 🎯 Senzory

- Proximity senzor
- FaceID / TouchID
- Gyroskop
- Akcelerometer

### 🌐 Konektivita

- WiFi
- Bluetooth
- GPS
- NFC / Apple Pay
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

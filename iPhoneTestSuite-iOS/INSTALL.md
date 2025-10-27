# Installing on iPhone - Free Methods

There are several ways to install the app on your iPhone without paying for an Apple Developer account:

## Method 1: AltStore (Recommended - Free, 7 days)

### What is AltStore?
AltStore lets you sideload apps using your free Apple ID. Apps last 7 days, then need to be re-signed.

### Requirements:
- Windows or Mac computer
- iPhone with iOS 14+
- Free Apple ID
- Lightning/USB-C cable

### Steps:

1. **Download AltStore:**
   - Visit: https://altstore.io
   - Download for Mac or Windows

2. **Install AltServer on your computer:**
   - Mac: Extract and move to Applications
   - Windows: Run the installer

3. **Install AltStore on iPhone:**
   - Connect iPhone via USB
   - Open AltServer on computer
   - Click AltServer icon in menu bar/system tray
   - Select "Install AltStore" → Choose your iPhone
   - Enter your Apple ID (stays on your device only)

4. **Trust AltStore on iPhone:**
   - Go to Settings → General → VPN & Device Management
   - Tap your Apple ID → Trust

5. **Install the IPA:**
   - Download the `.ipa` file from GitHub Actions
   - Open AltStore on iPhone
   - Tap "+" icon
   - Select the `.ipa` file (via AirDrop, Files app, etc.)
   - Wait for installation

6. **Refresh every 7 days:**
   - Open AltStore while connected to same WiFi as AltServer
   - It will auto-refresh your apps

---

## Method 2: Sideloadly (Free, 7 days)

### Steps:

1. **Download Sideloadly:**
   - Visit: https://sideloadly.io
   - Download for Mac or Windows

2. **Connect iPhone via USB**

3. **Open Sideloadly:**
   - Drag the `.ipa` file into Sideloadly
   - Enter your Apple ID
   - Click "Start"

4. **Trust on iPhone:**
   - Settings → General → VPN & Device Management
   - Trust your Apple ID

---

## Method 3: Xcode (Best for Development)

### Requirements:
- Mac with Xcode 15+
- Free Apple ID

### Steps:

1. **Open the project in Xcode:**
   ```bash
   cd "iPhone website/iPhoneTestSuite-iOS"
   open iPhoneTestSuite.xcodeproj
   ```

2. **Set up signing:**
   - Select project in Xcode
   - Select target "iPhoneTestSuite"
   - Go to "Signing & Capabilities"
   - Check "Automatically manage signing"
   - Select your Team (your Apple ID)
   - Xcode will create a free provisioning profile

3. **Connect iPhone via USB:**
   - Unlock iPhone
   - Trust the computer if prompted

4. **Select your iPhone as target:**
   - In Xcode toolbar, click device dropdown
   - Select your iPhone

5. **Build and Run:**
   - Press ⌘R or click the Play button
   - App installs and launches on your iPhone

6. **Trust developer on iPhone:**
   - First time only: Settings → General → VPN & Device Management
   - Tap your Apple ID → Trust

**Note:** Free provisioning profile expires after 7 days. Just reconnect and rebuild.

---

## Method 4: TestFlight (Best for Distribution - Requires $99/year)

If you have an Apple Developer account ($99/year):

1. **Archive the app in Xcode:**
   - Product → Archive
   - Upload to App Store Connect

2. **Add TestFlight testers:**
   - App Store Connect → TestFlight
   - Add internal or external testers

3. **Testers install via TestFlight app:**
   - Lasts 90 days
   - No 7-day limit
   - Up to 10,000 testers

---

## Comparison:

| Method | Cost | Duration | Requires Computer | Best For |
|--------|------|----------|-------------------|----------|
| **AltStore** | Free | 7 days (auto-refresh) | Initial + Refresh | Regular users |
| **Sideloadly** | Free | 7 days (manual refresh) | Every refresh | Quick testing |
| **Xcode** | Free | 7 days | Every install | Developers |
| **TestFlight** | $99/year | 90 days | No | Distribution |

---

## Download IPA from GitHub Actions:

Once the GitHub Actions workflow completes:

1. Go to: https://github.com/KoHaku743/iphone-test-suite/actions
2. Click on latest "iOS Build" workflow run
3. Scroll to "Artifacts" section at bottom
4. Download "iPhoneTestSuite-IPA"
5. Extract the `.ipa` file
6. Use any method above to install

---

## Troubleshooting:

### "Untrusted Developer"
- Go to Settings → General → VPN & Device Management
- Tap your developer profile → Trust

### "Unable to Install"
- Make sure you're using the same Apple ID that signed the app
- Check that your device is added to the provisioning profile

### App Crashes on Launch
- Check that all permissions are granted in Settings → Privacy
- Reinstall the app

### 7-Day Expiration
- With AltStore: Just open the app while on same WiFi (auto-refreshes)
- With Sideloadly/Xcode: Reinstall the app

---

## Free Apple ID Limitations:

- Apps expire after 7 days (need re-signing)
- Maximum 3 apps at a time
- No push notifications
- No certain entitlements (like Siri, iCloud, etc.)

**Paid Developer Account** ($99/year) removes these limits and extends to 1 year.

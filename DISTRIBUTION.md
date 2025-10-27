# Distribution Options for iPhone Test Suite

This repo supports multiple install paths depending on your needs at PCexpres.
Below is a quick guide with pros/cons and exact steps.

Note: We assume the web app is hosted at:
https://kohaku743.github.io/iphone-test-suite/
If you use a different URL, update it in `profiles/webclip-iphone-test-suite.mobileconfig` (URL key).

## 1) Easiest for customers: Web Clip profile (no App Store required)

- What it is: A configuration profile that adds a Home Screen icon linking to the website.
- Pros: Instant, no developer account, works on any iPhone, no UDIDs.
- Cons: Runs as a website (Safari), not a native app (no proximity sensor, fewer hardware APIs).

How to use:
1. Host the file `profiles/webclip-iphone-test-suite.mobileconfig` on HTTPS (GitHub Pages is fine).
2. On iPhone, open the profile URL in Safari; tap Allow to download.
3. Go to Settings → Profile Downloaded → Install.
4. A Home Screen icon "iPhone Test Suite" will be added.

MIME type note: iOS will install even if served as `application/octet-stream`, but ideal is `application/x-apple-aspen-config`.

## 2) For public beta with native features: TestFlight (Recommended)

- Requirements: Apple Developer account ($99/yr), App Store Connect.
- Pros: Safest public distribution, no UDIDs, easy install via public link, auto-updates.
- Cons: Needs review for external testers; lead time to set up.

Steps (high-level):
- Create an App ID + provisioning in App Store Connect.
- Archive in Xcode and upload via Organizer.
- Configure TestFlight beta; generate a public link for customers.

## 3) Internal store devices: Ad Hoc OTA (tap-to-install)

- Requirements: Paid developer account, register up to 100 iPhone UDIDs.
- Pros: Tap a link and the app installs directly (no TestFlight), native access.
- Cons: Limited to registered UDIDs; must re-sign each new build.

Setup:
- Sign the app with an Ad Hoc profile including the device UDIDs.
- Host `YourApp.ipa` and a `manifest.plist` over HTTPS.
- Provide a link: `itms-services://?action=download-manifest&url=https://yourdomain/manifest.plist`.

Note: We can add a `distribution/manifest.plist` template if you proceed with Ad Hoc.

## 4) No paid account: AltStore or Sideloadly (7-day free signing)

- Pros: Works with free Apple ID; you can install the app for internal testing.
- Cons: 7-day expiry; customers must use their Apple ID; not suitable for broad public installs.

Options:
- AltStore (auto-refresh): https://altstore.io
- Sideloadly (manual): https://sideloadly.io

Our CI already produces an unsigned `iPhoneTestSuite.ipa`. See `INSTALL.md` for full steps.

## Recommendation by scenario
- Customer devices in front of you: Use the Web Clip profile for quick access to the website.
- Your own in-store test phones: Use AltStore/Sideloadly or Ad Hoc if you have a paid account.
- Public beta for customers: Use TestFlight public link.
- MDM/Enterprise: Only for company-owned supervised devices; not for general customer devices.

## FAQ
- Can we install a native app with only a profile and no Apple ID? No (unless using Enterprise/MDM for company-owned devices). Apple blocks public distribution this way.
- Can we access the proximity sensor on the website? No (Safari has no proximity API). Use the native app.

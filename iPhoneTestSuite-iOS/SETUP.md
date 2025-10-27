# Setup Guide for iPhone Test Suite iOS App

## Step 1: Create Xcode Project

1. Open Xcode
2. File → New → Project
3. Choose **iOS** → **App**
4. Settings:
   - Product Name: `iPhoneTestSuite`
   - Team: Your Apple Developer Team
   - Organization Identifier: `com.yourname.iphoneteststuite`
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Minimum Deployment: **iOS 16.0**

## Step 2: Configure Info.plist

Add these privacy permission descriptions:

```xml
<key>NSCameraUsageDescription</key>
<string>Camera access is required to test front and rear cameras</string>

<key>NSMicrophoneUsageDescription</key>
<string>Microphone access is required to test audio recording</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Location access is required to test GPS functionality</string>

<key>NSBluetoothAlwaysUsageDescription</key>
<string>Bluetooth access is required to test Bluetooth functionality</string>

<key>NSFaceIDUsageDescription</key>
<string>Face ID is required to test biometric authentication</string>

<key>NSMotionUsageDescription</key>
<string>Motion sensor access is required to test gyroscope and accelerometer</string>

<key>NFCReaderUsageDescription</key>
<string>NFC access is required to test NFC functionality</string>
```

## Step 3: Add Capabilities

In Xcode:

1. Select your project
2. Select your target
3. Go to **Signing & Capabilities**
4. Click **+ Capability** and add:
   - Push Notifications (if needed)
   - Near Field Communication Tag Reading
   - Personal VPN (for network testing)

## Step 4: Copy Source Files

Copy all `.swift` files from this repository into your Xcode project:

1. Right-click on your project in Xcode
2. Add Files to "iPhoneTestSuite"
3. Select all Swift files
4. Ensure "Copy items if needed" is checked

## Step 5: Build and Run

1. Connect your iPhone via USB
2. Select it as the target device
3. Press ⌘R to build and run
4. Grant all requested permissions when prompted

## Troubleshooting

### Code Signing Issues

- Make sure you have a valid Apple Developer account
- Check that your device is added to your provisioning profile

### Permission Denied

- Make sure all Info.plist entries are added
- Check Settings → Privacy on your device

### Build Errors

- Clean Build Folder (⌘⇧K)
- Delete Derived Data
- Restart Xcode

## Testing on Simulator vs Device

⚠️ **Important:** Many tests require a physical device:

- Proximity sensor
- Face ID / Touch ID (can simulate on device)
- True accelerometer/gyroscope data
- Cellular connection
- NFC
- Flashlight

The simulator can test:

- UI/UX
- Display colors
- Basic touch input
- Camera UI (simulated)

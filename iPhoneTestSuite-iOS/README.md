# iPhone Test Suite - Native iOS App

This is the native iOS version of the iPhone Test Suite with full hardware access.

## Features

✅ **Complete Hardware Testing:**
- LCD & Display Tests (multi-color, dead pixels, corners)
- Multi-Touch & Haptic Touch
- Both Speakers (Top/Bottom) with real audio
- Microphone recording & playback
- Front & Rear Cameras
- **Proximity Sensor** (programmatic access!)
- Face ID / Touch ID
- Gyroscope & Accelerometer
- WiFi, Bluetooth, GPS, NFC
- Battery Health & Charging
- Cellular connectivity

## Advantages Over Web Version

- ✅ **Full Proximity Sensor Access** - no need for manual call testing
- ✅ **Better Audio Control** - route to specific speakers
- ✅ **Haptic Feedback** - test taptic engine
- ✅ **System Permissions** - proper access to all sensors
- ✅ **Better Performance** - native Swift/SwiftUI
- ✅ **Offline Capable** - no internet required

## Requirements

- Xcode 15.0+
- iOS 16.0+
- Physical iPhone device (for full testing)

## Installation

1. Open `iPhoneTestSuite.xcodeproj` in Xcode
2. Select your iPhone as the target device
3. Build and Run (⌘R)

## Project Structure

```
iPhoneTestSuite-iOS/
├── iPhoneTestSuite/
│   ├── App/
│   │   ├── iPhoneTestSuiteApp.swift
│   │   └── ContentView.swift
│   ├── Views/
│   │   ├── TestCategories/
│   │   ├── DisplayTests/
│   │   ├── AudioTests/
│   │   ├── CameraTests/
│   │   └── SensorTests/
│   ├── Models/
│   │   └── TestResult.swift
│   ├── Managers/
│   │   ├── AudioTestManager.swift
│   │   ├── SensorTestManager.swift
│   │   └── ProximityManager.swift
│   └── Resources/
└── Info.plist
```

## Building the Project

This is a standalone iOS project. You'll need to:
1. Create a new Xcode project
2. Copy all Swift files
3. Configure Info.plist permissions
4. Build and deploy

See `SETUP.md` for detailed instructions.

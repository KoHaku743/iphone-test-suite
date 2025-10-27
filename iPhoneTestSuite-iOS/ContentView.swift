import SwiftUI

struct ContentView: View {
    @EnvironmentObject var testManager: TestManager
    @State private var selectedCategory: TestCategory?
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Header
                    VStack(spacing: 8) {
                        Image(systemName: "iphone.gen3")
                            .font(.system(size: 60))
                            .foregroundStyle(.blue)
                        
                        Text("iPhone Test Suite")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        Text("Kompletné testovanie funkcií")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding(.top, 20)
                    
                    // Test Summary
                    TestSummaryCard()
                        .padding(.horizontal)
                    
                    // Test Categories
                    LazyVStack(spacing: 16) {
                        TestCategorySection(
                            title: "🔍 Vizuálna kontrola",
                            tests: [
                                TestItem(id: "lcd", name: "LCD Test - Skvrny/Pixely", icon: "display"),
                                TestItem(id: "corners", name: "Test rohov displeja", icon: "square.dashed"),
                                TestItem(id: "spots", name: "Test škrtov", icon: "eye")
                            ]
                        )
                        
                        TestCategorySection(
                            title: "📱 Displej & Dotyk",
                            tests: [
                                TestItem(id: "touch", name: "Multi-Touch Test", icon: "hand.tap"),
                                TestItem(id: "haptic", name: "Haptic Touch", icon: "waveform.path.ecg"),
                                TestItem(id: "truetone", name: "TrueTone & NightShift", icon: "sun.max")
                            ]
                        )
                        
                        TestCategorySection(
                            title: "🔊 Zvuk",
                            tests: [
                                TestItem(id: "speaker-top", name: "Horný reproduktor", icon: "speaker.wave.1"),
                                TestItem(id: "speaker-bottom", name: "Dolný reproduktor", icon: "speaker.wave.3"),
                                TestItem(id: "microphone", name: "Mikrofón", icon: "mic")
                            ]
                        )
                        
                        TestCategorySection(
                            title: "📷 Kamery",
                            tests: [
                                TestItem(id: "camera-rear", name: "Zadná kamera", icon: "camera"),
                                TestItem(id: "camera-front", name: "Predná kamera", icon: "camera.fill")
                            ]
                        )
                        
                        TestCategorySection(
                            title: "🎯 Senzory",
                            tests: [
                                TestItem(id: "proximity", name: "Proximity senzor", icon: "sensor"),
                                TestItem(id: "faceid", name: "Face ID / Touch ID", icon: "faceid"),
                                TestItem(id: "gyroscope", name: "Gyroskop", icon: "gyroscope"),
                                TestItem(id: "accelerometer", name: "Akcelerometer", icon: "move.3d")
                            ]
                        )
                        
                        TestCategorySection(
                            title: "🌐 Konektivita",
                            tests: [
                                TestItem(id: "wifi", name: "WiFi", icon: "wifi"),
                                TestItem(id: "bluetooth", name: "Bluetooth", icon: "bluetooth"),
                                TestItem(id: "gps", name: "GPS", icon: "location"),
                                TestItem(id: "nfc", name: "NFC / Apple Pay", icon: "wave.3.right"),
                                TestItem(id: "cellular", name: "SIM karta", icon: "antenna.radiowaves.left.and.right")
                            ]
                        )
                        
                        TestCategorySection(
                            title: "🔋 Batéria",
                            tests: [
                                TestItem(id: "battery", name: "Battery Health", icon: "battery.100"),
                                TestItem(id: "charging-cable", name: "Káblové nabíjanie", icon: "cable.connector"),
                                TestItem(id: "charging-wireless", name: "Bezdrôtové nabíjanie", icon: "magsafe.batterypack")
                            ]
                        )
                    }
                    .padding(.horizontal)
                    
                    // Reset Button
                    Button(action: {
                        testManager.resetAllTests()
                    }) {
                        Label("Reset všetkých testov", systemImage: "arrow.clockwise")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.red.opacity(0.2))
                            .foregroundColor(.red)
                            .cornerRadius(12)
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 30)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

// MARK: - Test Summary Card
struct TestSummaryCard: View {
    @EnvironmentObject var testManager: TestManager
    
    var body: some View {
        VStack(spacing: 16) {
            Text("📊 Prehľad testov")
                .font(.headline)
            
            HStack(spacing: 20) {
                SummaryItem(
                    value: testManager.totalTests,
                    label: "Celkom",
                    color: .blue
                )
                
                SummaryItem(
                    value: testManager.passedTests,
                    label: "Úspešné",
                    color: .green
                )
                
                SummaryItem(
                    value: testManager.failedTests,
                    label: "Neúspešné",
                    color: .red
                )
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(16)
    }
}

struct SummaryItem: View {
    let value: Int
    let label: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 4) {
            Text("\(value)")
                .font(.system(size: 32, weight: .bold))
                .foregroundColor(color)
            
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

// MARK: - Test Category Section
struct TestCategorySection: View {
    let title: String
    let tests: [TestItem]
    @EnvironmentObject var testManager: TestManager
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.title3)
                .fontWeight(.bold)
                .padding(.leading, 4)
            
            VStack(spacing: 12) {
                ForEach(tests) { test in
                    NavigationLink(destination: destinationView(for: test)) {
                        TestCard(test: test)
                    }
                }
            }
        }
    }
    
    @ViewBuilder
    func destinationView(for test: TestItem) -> some View {
        switch test.id {
        case "lcd":
            LCDTestView()
        case "speaker-top":
            SpeakerTestView(speakerType: .top)
        case "speaker-bottom":
            SpeakerTestView(speakerType: .bottom)
        case "microphone":
            MicrophoneTestView()
        case "proximity":
            ProximityTestView()
        case "gyroscope":
            GyroscopeTestView()
        case "accelerometer":
            AccelerometerTestView()
        case "camera-rear":
            CameraTestView(cameraType: .rear)
        case "camera-front":
            CameraTestView(cameraType: .front)
        case "touch":
            TouchTestView()
        case "battery":
            BatteryTestView()
        default:
            PlaceholderTestView(test: test)
        }
    }
}

// MARK: - Test Card
struct TestCard: View {
    let test: TestItem
    @EnvironmentObject var testManager: TestManager
    
    var testResult: TestResult? {
        testManager.results[test.id]
    }
    
    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: test.icon)
                .font(.title2)
                .foregroundColor(.blue)
                .frame(width: 40)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(test.name)
                    .font(.headline)
                    .foregroundColor(.primary)
            }
            
            Spacer()
            
            if let result = testResult {
                Image(systemName: result.passed ? "checkmark.circle.fill" : "xmark.circle.fill")
                    .foregroundColor(result.passed ? .green : .red)
                    .font(.title3)
            } else {
                Image(systemName: "circle")
                    .foregroundColor(.secondary)
                    .font(.title3)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
}

#Preview {
    ContentView()
        .environmentObject(TestManager())
}

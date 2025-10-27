import SwiftUI

// Placeholder views for tests not yet fully implemented

struct LCDTestView: View {
    @EnvironmentObject var testManager: TestManager
    @Environment(\.dismiss) var dismiss
    @State private var currentColorIndex = 0
    
    let colors: [Color] = [.white, .black, .red, .green, .blue, .yellow, .purple, .cyan]
    let colorNames = ["Biela", "Čierna", "Červená", "Zelená", "Modrá", "Žltá", "Fialová", "Tyrkysová"]
    
    var body: some View {
        ZStack {
            colors[currentColorIndex].ignoresSafeArea()
            
            VStack {
                Spacer()
                
                HStack(spacing: 16) {
                    Button(action: {
                        currentColorIndex = (currentColorIndex - 1 + colors.count) % colors.count
                    }) {
                        Image(systemName: "chevron.left")
                            .font(.title)
                            .padding()
                            .background(Color.black.opacity(0.5))
                            .foregroundColor(.white)
                            .cornerRadius(8)
                    }
                    
                    VStack {
                        Text(colorNames[currentColorIndex])
                            .font(.title2)
                            .fontWeight(.bold)
                            .padding()
                            .background(Color.black.opacity(0.5))
                            .foregroundColor(.white)
                            .cornerRadius(8)
                    }
                    
                    Button(action: {
                        currentColorIndex = (currentColorIndex + 1) % colors.count
                    }) {
                        Image(systemName: "chevron.right")
                            .font(.title)
                            .padding()
                            .background(Color.black.opacity(0.5))
                            .foregroundColor(.white)
                            .cornerRadius(8)
                    }
                }
                
                HStack(spacing: 12) {
                    Button(action: {
                        testManager.recordResult(testId: "lcd", passed: true)
                        dismiss()
                    }) {
                        Text("✓ V poriadku")
                            .font(.headline)
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(Color.green)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                    }
                    
                    Button(action: {
                        testManager.recordResult(testId: "lcd", passed: false)
                        dismiss()
                    }) {
                        Text("✗ Problém")
                            .font(.headline)
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(Color.red)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                    }
                }
                .padding()
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden()
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button(action: { dismiss() }) {
                    Image(systemName: "xmark")
                        .font(.title3)
                        .padding(8)
                        .background(Color.black.opacity(0.5))
                        .foregroundColor(.white)
                        .clipShape(Circle())
                }
            }
        }
    }
}

struct TouchTestView: View {
    @State private var touchPoints: [CGPoint] = []
    @EnvironmentObject var testManager: TestManager
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            Canvas { context, size in
                for point in touchPoints {
                    context.fill(
                        Path(ellipseIn: CGRect(x: point.x - 30, y: point.y - 30, width: 60, height: 60)),
                        with: .color(.blue.opacity(0.5))
                    )
                }
            }
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { value in
                        touchPoints.append(value.location)
                        if touchPoints.count > 50 {
                            touchPoints.removeFirst()
                        }
                    }
            )
            
            VStack {
                Text("Ťahaj prstom/prstami po obrazovke")
                    .font(.headline)
                    .padding()
                    .background(Color.white.opacity(0.2))
                    .foregroundColor(.white)
                    .cornerRadius(12)
                    .padding()
                
                Spacer()
                
                HStack(spacing: 12) {
                    Button("✓ Funguje") {
                        testManager.recordResult(testId: "touch", passed: true)
                        dismiss()
                    }
                    .buttonStyle(.borderedProminent)
                    
                    Button("✗ Problém") {
                        testManager.recordResult(testId: "touch", passed: false)
                        dismiss()
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.red)
                }
                .padding()
            }
        }
    }
}

struct CameraTestView: View {
    let cameraType: CameraType
    @EnvironmentObject var testManager: TestManager
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            VStack(spacing: 20) {
                Text("Camera preview would appear here")
                    .foregroundColor(.white)
                
                Text("Implement AVCaptureSession for full functionality")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
                
                Spacer()
                
                HStack(spacing: 12) {
                    Button("✓ Funguje") {
                        let testId = cameraType == .rear ? "camera-rear" : "camera-front"
                        testManager.recordResult(testId: testId, passed: true)
                        dismiss()
                    }
                    .buttonStyle(.borderedProminent)
                    
                    Button("✗ Problém") {
                        let testId = cameraType == .rear ? "camera-rear" : "camera-front"
                        testManager.recordResult(testId: testId, passed: false)
                        dismiss()
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.red)
                }
                .padding()
            }
        }
        .navigationTitle(cameraType.name)
    }
}

struct MicrophoneTestView: View {
    @EnvironmentObject var testManager: TestManager
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        VStack(spacing: 30) {
            Image(systemName: "mic.fill")
                .font(.system(size: 80))
                .foregroundColor(.red)
            
            Text("Mikrofón Test")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            Text("Implement AVAudioRecorder for full functionality")
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding()
            
            Spacer()
            
            HStack(spacing: 12) {
                Button("✓ Funguje") {
                    testManager.recordResult(testId: "microphone", passed: true)
                    dismiss()
                }
                .buttonStyle(.borderedProminent)
                
                Button("✗ Problém") {
                    testManager.recordResult(testId: "microphone", passed: false)
                    dismiss()
                }
                .buttonStyle(.borderedProminent)
                .tint(.red)
            }
            .padding()
        }
        .padding()
    }
}

struct AccelerometerTestView: View {
    @EnvironmentObject var testManager: TestManager
    @StateObject private var motionManager = AccelMotionManager()
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        VStack(spacing: 30) {
            Image(systemName: "move.3d")
                .font(.system(size: 80))
                .foregroundColor(.blue)
            
            Text("Akcelerometer Test")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            VStack(spacing: 12) {
                Text("X: \(String(format: "%.2f", motionManager.x))")
                Text("Y: \(String(format: "%.2f", motionManager.y))")
                Text("Z: \(String(format: "%.2f", motionManager.z))")
                Text("Magnitude: \(String(format: "%.2f", motionManager.magnitude))")
            }
            .font(.system(.title3, design: .monospaced))
            
            Text("Potrás telefónom")
                .font(.headline)
                .foregroundColor(.secondary)
            
            Spacer()
            
            if !motionManager.isMonitoring {
                Button("Spustiť test") {
                    motionManager.start()
                }
                .buttonStyle(.borderedProminent)
            } else {
                HStack(spacing: 12) {
                    Button("✓ Funguje") {
                        motionManager.stop()
                        testManager.recordResult(testId: "accelerometer", passed: true)
                        dismiss()
                    }
                    .buttonStyle(.borderedProminent)
                    
                    Button("✗ Problém") {
                        motionManager.stop()
                        testManager.recordResult(testId: "accelerometer", passed: false)
                        dismiss()
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.red)
                }
            }
        }
        .padding()
        .onDisappear {
            motionManager.stop()
        }
    }
}

class AccelMotionManager: ObservableObject {
    @Published var x: Double = 0
    @Published var y: Double = 0
    @Published var z: Double = 0
    @Published var magnitude: Double = 0
    @Published var isMonitoring = false
    
    private let motionManager = CMMotionManager()
    
    func start() {
        guard motionManager.isAccelerometerAvailable else { return }
        
        motionManager.accelerometerUpdateInterval = 0.1
        motionManager.startAccelerometerUpdates(to: .main) { [weak self] data, error in
            guard let self = self, let data = data else { return }
            
            self.x = data.acceleration.x
            self.y = data.acceleration.y
            self.z = data.acceleration.z
            self.magnitude = sqrt(self.x * self.x + self.y * self.y + self.z * self.z)
        }
        
        isMonitoring = true
    }
    
    func stop() {
        motionManager.stopAccelerometerUpdates()
        isMonitoring = false
    }
}

struct BatteryTestView: View {
    @EnvironmentObject var testManager: TestManager
    @Environment(\.dismiss) var dismiss
    @State private var batteryLevel: Float = UIDevice.current.batteryLevel
    @State private var batteryState: UIDevice.BatteryState = UIDevice.current.batteryState
    
    var body: some View {
        VStack(spacing: 30) {
            Image(systemName: batteryIcon)
                .font(.system(size: 80))
                .foregroundColor(batteryColor)
            
            Text("Battery Test")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            VStack(spacing: 16) {
                HStack {
                    Text("Úroveň:")
                    Spacer()
                    Text("\(Int(batteryLevel * 100))%")
                        .fontWeight(.bold)
                }
                
                HStack {
                    Text("Stav:")
                    Spacer()
                    Text(batteryStateText)
                        .fontWeight(.bold)
                        .foregroundColor(batteryState == .charging ? .green : .primary)
                }
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
            .padding(.horizontal)
            
            Text("Skontroluj Battery Health v Nastaveniach")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            Spacer()
            
            HStack(spacing: 12) {
                Button("✓ V poriadku") {
                    testManager.recordResult(testId: "battery", passed: true)
                    dismiss()
                }
                .buttonStyle(.borderedProminent)
                
                Button("✗ Problém") {
                    testManager.recordResult(testId: "battery", passed: false)
                    dismiss()
                }
                .buttonStyle(.borderedProminent)
                .tint(.red)
            }
        }
        .padding()
        .onAppear {
            UIDevice.current.isBatteryMonitoringEnabled = true
            batteryLevel = UIDevice.current.batteryLevel
            batteryState = UIDevice.current.batteryState
        }
    }
    
    var batteryIcon: String {
        if batteryState == .charging {
            return "battery.100.bolt"
        }
        let level = Int(batteryLevel * 100)
        if level > 75 { return "battery.100" }
        if level > 50 { return "battery.75" }
        if level > 25 { return "battery.50" }
        return "battery.25"
    }
    
    var batteryColor: Color {
        let level = Int(batteryLevel * 100)
        if level > 20 { return .green }
        return .red
    }
    
    var batteryStateText: String {
        switch batteryState {
        case .charging: return "Nabíja sa ⚡"
        case .full: return "Plná"
        case .unplugged: return "Odpojená"
        default: return "Neznámy"
        }
    }
}

struct PlaceholderTestView: View {
    let test: TestItem
    @EnvironmentObject var testManager: TestManager
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        VStack(spacing: 30) {
            Image(systemName: test.icon)
                .font(.system(size: 80))
                .foregroundColor(.blue)
            
            Text(test.name)
                .font(.largeTitle)
                .fontWeight(.bold)
            
            Text("This test is under development")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            Spacer()
            
            HStack(spacing: 12) {
                Button("✓ Funguje") {
                    testManager.recordResult(testId: test.id, passed: true)
                    dismiss()
                }
                .buttonStyle(.borderedProminent)
                
                Button("✗ Problém") {
                    testManager.recordResult(testId: test.id, passed: false)
                    dismiss()
                }
                .buttonStyle(.borderedProminent)
                .tint(.red)
            }
            .padding()
        }
        .padding()
    }
}

import CoreMotion

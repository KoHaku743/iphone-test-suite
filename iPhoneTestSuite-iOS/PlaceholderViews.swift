import SwiftUI
import CoreMotion

// MARK: - LCD Test View
struct LCDTestView: View {
    @EnvironmentObject var testManager: TestManager
    @Environment(\.dismiss) var dismiss
    @State private var currentColorIndex = 0
    
    let colors: [Color] = [.white, .black, .red, .green, .blue, .yellow, .purple, .cyan, Color(white: 0.5)]
    let colorNames = ["Biela", "Čierna", "Červená", "Zelená", "Modrá", "Žltá", "Fialová", "Tyrkysová", "Šedá"]
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                colors[currentColorIndex]
                    .ignoresSafeArea()
                
                VStack {
                    Spacer()
                    
                    VStack(spacing: 20) {
                        HStack(spacing: 16) {
                            Button(action: {
                                currentColorIndex = (currentColorIndex - 1 + colors.count) % colors.count
                            }) {
                                Image(systemName: "chevron.left.circle.fill")
                                    .font(.system(size: 50))
                                    .foregroundColor(.white)
                                    .shadow(color: .black.opacity(0.3), radius: 5)
                            }
                            
                            Text(colorNames[currentColorIndex])
                                .font(.title)
                                .fontWeight(.bold)
                                .padding(.horizontal, 24)
                                .padding(.vertical, 12)
                                .background(Color.black.opacity(0.6))
                                .foregroundColor(.white)
                                .cornerRadius(12)
                            
                            Button(action: {
                                currentColorIndex = (currentColorIndex + 1) % colors.count
                            }) {
                                Image(systemName: "chevron.right.circle.fill")
                                    .font(.system(size: 50))
                                    .foregroundColor(.white)
                                    .shadow(color: .black.opacity(0.3), radius: 5)
                            }
                        }
                        
                        Text("Hľadaj škvrny, mŕtve pixely a nerovnomerné osvetlenie")
                            .font(.subheadline)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 8)
                            .background(Color.black.opacity(0.6))
                            .foregroundColor(.white)
                            .cornerRadius(8)
                            .multilineTextAlignment(.center)
                        
                        HStack(spacing: 12) {
                            Button(action: {
                                testManager.recordResult(testId: "lcd", passed: true)
                                dismiss()
                            }) {
                                Label("V poriadku", systemImage: "checkmark.circle.fill")
                                    .font(.headline)
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 12)
                                    .frame(maxWidth: .infinity)
                                    .background(Color.green)
                                    .foregroundColor(.white)
                                    .cornerRadius(12)
                            }
                            
                            Button(action: {
                                testManager.recordResult(testId: "lcd", passed: false)
                                dismiss()
                            }) {
                                Label("Problém", systemImage: "xmark.circle.fill")
                                    .font(.headline)
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 12)
                                    .frame(maxWidth: .infinity)
                                    .background(Color.red)
                                    .foregroundColor(.white)
                                    .cornerRadius(12)
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                    .padding(.bottom, 40)
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden()
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button(action: { dismiss() }) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.title2)
                        .foregroundColor(.white)
                        .shadow(color: .black.opacity(0.3), radius: 5)
                }
            }
        }
    }
}

// MARK: - Touch Test View
struct TouchTestView: View {
    @State private var touchPoints: [TouchPoint] = []
    @EnvironmentObject var testManager: TestManager
    @Environment(\.dismiss) var dismiss
    
    struct TouchPoint: Identifiable {
        let id = UUID()
        let location: CGPoint
        let timestamp: Date
    }
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                LinearGradient(
                    colors: [Color.blue.opacity(0.3), Color.purple.opacity(0.3)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                Canvas { context, size in
                    let now = Date()
                    for point in touchPoints {
                        let age = now.timeIntervalSince(point.timestamp)
                        let alpha = max(0, 1 - age / 2.0) // Fade over 2 seconds
                        
                        context.fill(
                            Path(ellipseIn: CGRect(x: point.location.x - 30, y: point.location.y - 30, width: 60, height: 60)),
                            with: .color(.white.opacity(alpha * 0.7))
                        )
                    }
                }
                .gesture(
                    DragGesture(minimumDistance: 0)
                        .onChanged { value in
                            touchPoints.append(TouchPoint(location: value.location, timestamp: Date()))
                            if touchPoints.count > 100 {
                                touchPoints.removeFirst()
                            }
                        }
                )
                
                VStack {
                    VStack(spacing: 12) {
                        Image(systemName: "hand.draw.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.white)
                        
                        Text("Multi-Touch Test")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        
                        Text("Ťahaj prstom/prstami po celej obrazovke")
                            .font(.headline)
                            .foregroundColor(.white.opacity(0.8))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }
                    .padding()
                    .background(Color.black.opacity(0.5))
                    .cornerRadius(16)
                    .padding()
                    
                    Spacer()
                    
                    HStack(spacing: 16) {
                        Button(action: {
                            testManager.recordResult(testId: "touch", passed: true)
                            dismiss()
                        }) {
                            Label("Funguje", systemImage: "checkmark.circle.fill")
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.green)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }
                        
                        Button(action: {
                            testManager.recordResult(testId: "touch", passed: false)
                            dismiss()
                        }) {
                            Label("Problém", systemImage: "xmark.circle.fill")
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.red)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 30)
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Accelerometer Test View
struct AccelerometerTestView: View {
    @EnvironmentObject var testManager: TestManager
    @StateObject private var motionManager = AccelMotionManager()
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                LinearGradient(
                    colors: [Color.orange.opacity(0.3), Color.pink.opacity(0.3)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                VStack(spacing: 30) {
                    Image(systemName: "move.3d")
                        .font(.system(size: 80))
                        .foregroundColor(.white)
                        .rotationEffect(.degrees(motionManager.magnitude * 30))
                        .animation(.easeOut(duration: 0.2), value: motionManager.magnitude)
                    
                    Text("Akcelerometer Test")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    
                    VStack(spacing: 16) {
                        DataRow(label: "X axis:", value: String(format: "%.2f g", motionManager.x))
                        DataRow(label: "Y axis:", value: String(format: "%.2f g", motionManager.y))
                        DataRow(label: "Z axis:", value: String(format: "%.2f g", motionManager.z))
                        DataRow(label: "Magnitude:", value: String(format: "%.2f g", motionManager.magnitude), highlight: true)
                    }
                    .padding()
                    .background(Color.white.opacity(0.2))
                    .cornerRadius(16)
                    .padding(.horizontal)
                    
                    Text("Potrás telefónom vo všetkých smeroch")
                        .font(.headline)
                        .foregroundColor(.white.opacity(0.8))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                    
                    Spacer()
                    
                    if !motionManager.isMonitoring {
                        Button("Spustiť test") {
                            motionManager.start()
                        }
                        .font(.headline)
                        .padding(.horizontal, 40)
                        .padding(.vertical, 16)
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    } else {
                        HStack(spacing: 16) {
                            Button(action: {
                                motionManager.stop()
                                testManager.recordResult(testId: "accelerometer", passed: true)
                                dismiss()
                            }) {
                                Label("Funguje", systemImage: "checkmark.circle.fill")
                                    .font(.headline)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.green)
                                    .foregroundColor(.white)
                                    .cornerRadius(12)
                            }
                            
                            Button(action: {
                                motionManager.stop()
                                testManager.recordResult(testId: "accelerometer", passed: false)
                                dismiss()
                            }) {
                                Label("Problém", systemImage: "xmark.circle.fill")
                                    .font(.headline)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.red)
                                    .foregroundColor(.white)
                                    .cornerRadius(12)
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                }
                .padding(.vertical, 40)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .onDisappear {
            motionManager.stop()
        }
    }
    
    struct DataRow: View {
        let label: String
        let value: String
        var highlight: Bool = false
        
        var body: some View {
            HStack {
                Text(label)
                    .foregroundColor(.white.opacity(0.8))
                Spacer()
                Text(value)
                    .font(.system(.title3, design: .monospaced))
                    .fontWeight(highlight ? .bold : .regular)
                    .foregroundColor(.white)
            }
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
        
        motionManager.accelerometerUpdateInterval = 0.05
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

// MARK: - Battery Test View
struct BatteryTestView: View {
    @EnvironmentObject var testManager: TestManager
    @Environment(\.dismiss) var dismiss
    @State private var batteryLevel: Float = 0
    @State private var batteryState: UIDevice.BatteryState = .unknown
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                LinearGradient(
                    colors: [Color.green.opacity(0.3), Color.blue.opacity(0.3)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                VStack(spacing: 30) {
                    Image(systemName: batteryIcon)
                        .font(.system(size: 80))
                        .foregroundColor(.white)
                        .symbolEffect(.pulse, isActive: batteryState == .charging)
                    
                    Text("Battery Test")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    
                    VStack(spacing: 16) {
                        HStack {
                            Text("Úroveň:")
                                .foregroundColor(.white.opacity(0.8))
                            Spacer()
                            Text("\(Int(batteryLevel * 100))%")
                                .font(.title2)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                        }
                        
                        Divider()
                            .background(Color.white.opacity(0.3))
                        
                        HStack {
                            Text("Stav:")
                                .foregroundColor(.white.opacity(0.8))
                            Spacer()
                            Text(batteryStateText)
                                .font(.title3)
                                .fontWeight(.bold)
                                .foregroundColor(batteryState == .charging ? .green : .white)
                        }
                    }
                    .padding()
                    .background(Color.white.opacity(0.2))
                    .cornerRadius(16)
                    .padding(.horizontal)
                    
                    VStack(spacing: 8) {
                        Text("💡 Tip:")
                            .font(.headline)
                            .foregroundColor(.white)
                        
                        Text("Otvor Nastavenia → Batéria → Battery Health\npre detailné info o zdraví batérie")
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.8))
                            .multilineTextAlignment(.center)
                    }
                    .padding()
                    .background(Color.white.opacity(0.15))
                    .cornerRadius(12)
                    .padding(.horizontal)
                    
                    Spacer()
                    
                    HStack(spacing: 16) {
                        Button(action: {
                            testManager.recordResult(testId: "battery", passed: true)
                            dismiss()
                        }) {
                            Label("V poriadku", systemImage: "checkmark.circle.fill")
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.green)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }
                        
                        Button(action: {
                            testManager.recordResult(testId: "battery", passed: false)
                            dismiss()
                        }) {
                            Label("Problém", systemImage: "xmark.circle.fill")
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.red)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 30)
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            UIDevice.current.isBatteryMonitoringEnabled = true
            updateBatteryInfo()
            
            // Update battery info every 2 seconds
            Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { _ in
                updateBatteryInfo()
            }
        }
    }
    
    private func updateBatteryInfo() {
        batteryLevel = UIDevice.current.batteryLevel
        batteryState = UIDevice.current.batteryState
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
    
    var batteryStateText: String {
        switch batteryState {
        case .charging: return "Nabíja sa ⚡"
        case .full: return "Plná 💯"
        case .unplugged: return "Odpojená 🔋"
        default: return "Neznámy ❓"
        }
    }
}

// MARK: - Placeholder Test View
struct PlaceholderTestView: View {
    let test: TestItem
    @EnvironmentObject var testManager: TestManager
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                LinearGradient(
                    colors: [Color.gray.opacity(0.3), Color.blue.opacity(0.3)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                VStack(spacing: 30) {
                    Image(systemName: test.icon)
                        .font(.system(size: 80))
                        .foregroundColor(.white)
                    
                    Text(test.name)
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                    
                    Text("Tento test je v príprave")
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.7))
                    
                    Spacer()
                    
                    HStack(spacing: 16) {
                        Button(action: {
                            testManager.recordResult(testId: test.id, passed: true)
                            dismiss()
                        }) {
                            Label("Funguje", systemImage: "checkmark.circle.fill")
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.green)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }
                        
                        Button(action: {
                            testManager.recordResult(testId: test.id, passed: false)
                            dismiss()
                        }) {
                            Label("Problém", systemImage: "xmark.circle.fill")
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.red)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 30)
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
    }
}

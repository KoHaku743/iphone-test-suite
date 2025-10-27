import SwiftUI
import CoreMotion

struct GyroscopeTestView: View {
    @EnvironmentObject var testManager: TestManager
    @StateObject private var motionManager = MotionTestManager()
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        ZStack {
            Color(.systemGroupedBackground).ignoresSafeArea()
            
            VStack(spacing: 30) {
                // Header
                VStack(spacing: 12) {
                    Image(systemName: "gyroscope")
                        .font(.system(size: 80))
                        .foregroundColor(.blue)
                        .rotationEffect(.degrees(motionManager.rotationZ * 10))
                        .animation(.spring(), value: motionManager.rotationZ)
                    
                    Text("Gyroskop Test")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                }
                
                // 3D Ball Visualization
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                gradient: Gradient(colors: [.blue, .purple]),
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 200, height: 200)
                        .shadow(color: .black.opacity(0.2), radius: 10, x: motionManager.rotationX * 20, y: motionManager.rotationY * 20)
                        .rotation3DEffect(
                            .degrees(motionManager.rotationX * 30),
                            axis: (x: 1, y: 0, z: 0)
                        )
                        .rotation3DEffect(
                            .degrees(motionManager.rotationY * 30),
                            axis: (x: 0, y: 1, z: 0)
                        )
                    
                    Text("📱")
                        .font(.system(size: 80))
                        .rotation3DEffect(
                            .degrees(motionManager.rotationX * 20),
                            axis: (x: 1, y: 0, z: 0)
                        )
                        .rotation3DEffect(
                            .degrees(motionManager.rotationY * 20),
                            axis: (x: 0, y: 1, z: 0)
                        )
                }
                .padding()
                
                // Data Display
                VStack(spacing: 16) {
                    RotationDataRow(
                        label: "Alpha (Z)",
                        value: motionManager.rotationZ,
                        color: .red
                    )
                    
                    RotationDataRow(
                        label: "Beta (X)",
                        value: motionManager.rotationX,
                        color: .green
                    )
                    
                    RotationDataRow(
                        label: "Gamma (Y)",
                        value: motionManager.rotationY,
                        color: .blue
                    )
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(16)
                .padding(.horizontal)
                
                // Instructions
                Text("Nakloni zariadenie rôznymi smermi")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
                
                Spacer()
                
                // Control Buttons
                VStack(spacing: 12) {
                    if !motionManager.isMonitoring {
                        Button(action: {
                            motionManager.startGyroscope()
                        }) {
                            Label("Spustiť test", systemImage: "play.fill")
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.green)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }
                    } else {
                        Button(action: {
                            motionManager.stopGyroscope()
                        }) {
                            Label("Zastaviť test", systemImage: "stop.fill")
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.orange)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }
                    }
                    
                    if motionManager.hasData {
                        HStack(spacing: 12) {
                            Button(action: {
                                motionManager.stopGyroscope()
                                testManager.recordResult(testId: "gyroscope", passed: true)
                                dismiss()
                            }) {
                                Label("✓ Funguje", systemImage: "checkmark")
                                    .font(.headline)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.green)
                                    .foregroundColor(.white)
                                    .cornerRadius(12)
                            }
                            
                            Button(action: {
                                motionManager.stopGyroscope()
                                testManager.recordResult(testId: "gyroscope", passed: false)
                                dismiss()
                            }) {
                                Label("✗ Problém", systemImage: "xmark")
                                    .font(.headline)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.red)
                                    .foregroundColor(.white)
                                    .cornerRadius(12)
                            }
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.bottom)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .onDisappear {
            motionManager.stopGyroscope()
        }
    }
}

struct RotationDataRow: View {
    let label: String
    let value: Double
    let color: Color
    
    var body: some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .frame(width: 100, alignment: .leading)
            
            ZStack(alignment: .leading) {
                Rectangle()
                    .fill(Color.gray.opacity(0.2))
                    .frame(height: 8)
                    .cornerRadius(4)
                
                Rectangle()
                    .fill(color)
                    .frame(width: abs(value) * 100, height: 8)
                    .cornerRadius(4)
            }
            
            Text(String(format: "%.2f°", value * 180))
                .font(.system(.body, design: .monospaced))
                .fontWeight(.semibold)
                .foregroundColor(color)
                .frame(width: 80, alignment: .trailing)
        }
    }
}

// MARK: - Motion Test Manager
class MotionTestManager: ObservableObject {
    @Published var rotationX: Double = 0
    @Published var rotationY: Double = 0
    @Published var rotationZ: Double = 0
    @Published var isMonitoring = false
    @Published var hasData = false
    
    private let motionManager = CMMotionManager()
    
    func startGyroscope() {
        guard motionManager.isGyroAvailable else {
            print("Gyroscope not available")
            return
        }
        
        motionManager.gyroUpdateInterval = 0.1
        motionManager.startGyroUpdates(to: .main) { [weak self] data, error in
            guard let self = self, let data = data else { return }
            
            self.rotationX = data.rotationRate.x
            self.rotationY = data.rotationRate.y
            self.rotationZ = data.rotationRate.z
            
            if !self.hasData && (abs(self.rotationX) > 0.1 || abs(self.rotationY) > 0.1 || abs(self.rotationZ) > 0.1) {
                self.hasData = true
            }
        }
        
        isMonitoring = true
    }
    
    func stopGyroscope() {
        motionManager.stopGyroUpdates()
        isMonitoring = false
    }
}

#Preview {
    NavigationStack {
        GyroscopeTestView()
            .environmentObject(TestManager())
    }
}

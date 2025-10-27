import SwiftUI
import UIKit

struct ProximityTestView: View {
    @EnvironmentObject var testManager: TestManager
    @StateObject private var proximityManager = ProximityManager()
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        ZStack {
            // Background color changes based on proximity
            (proximityManager.isNear ? Color.red : Color.green)
                .opacity(0.3)
                .ignoresSafeArea()
            
            VStack(spacing: 30) {
                // Header
                VStack(spacing: 12) {
                    Image(systemName: "sensor")
                        .font(.system(size: 80))
                        .foregroundColor(proximityManager.isNear ? .red : .green)
                        .animation(.spring(), value: proximityManager.isNear)
                    
                    Text("Proximity Sensor Test")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                    
                    Text(proximityManager.isMonitoring ? "Test aktívny" : "Test zastavený")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                // Visual Indicator
                ZStack {
                    Circle()
                        .fill(proximityManager.isNear ? Color.red : Color.green)
                        .frame(width: 200, height: 200)
                        .scaleEffect(proximityManager.isNear ? 1.2 : 1.0)
                        .animation(.spring(response: 0.3), value: proximityManager.isNear)
                    
                    VStack(spacing: 8) {
                        Image(systemName: proximityManager.isNear ? "hand.raised.slash" : "hand.raised")
                            .font(.system(size: 60))
                            .foregroundColor(.white)
                        
                        Text(proximityManager.isNear ? "BLÍZKO" : "ĎALEKO")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                    }
                }
                .padding()
                
                // Instructions
                VStack(alignment: .leading, spacing: 16) {
                    InstructionRow(
                        number: 1,
                        text: "Klikni 'Spustiť test'",
                        isCompleted: proximityManager.isMonitoring
                    )
                    
                    InstructionRow(
                        number: 2,
                        text: "Zakry horný okraj displeja rukou",
                        isCompleted: proximityManager.detectionCount > 0
                    )
                    
                    InstructionRow(
                        number: 3,
                        text: "Indikátor by mal sčervenieť 🔴",
                        isCompleted: proximityManager.detectionCount > 0
                    )
                    
                    InstructionRow(
                        number: 4,
                        text: "Odlož ruku - indikátor zezelenie 🟢",
                        isCompleted: proximityManager.detectionCount > 1
                    )
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(16)
                .padding(.horizontal)
                
                // Detection Counter
                if proximityManager.detectionCount > 0 {
                    VStack(spacing: 8) {
                        Text("Detekcie:")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("\(proximityManager.detectionCount)")
                            .font(.system(size: 40, weight: .bold))
                            .foregroundColor(.blue)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                }
                
                Spacer()
                
                // Control Buttons
                VStack(spacing: 12) {
                    if !proximityManager.isMonitoring {
                        Button(action: {
                            proximityManager.startMonitoring()
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
                            proximityManager.stopMonitoring()
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
                    
                    if proximityManager.detectionCount > 0 {
                        HStack(spacing: 12) {
                            Button(action: {
                                proximityManager.stopMonitoring()
                                testManager.recordResult(testId: "proximity", passed: true)
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
                                proximityManager.stopMonitoring()
                                testManager.recordResult(testId: "proximity", passed: false)
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
            proximityManager.stopMonitoring()
        }
    }
}

// MARK: - Instruction Row
struct InstructionRow: View {
    let number: Int
    let text: String
    let isCompleted: Bool
    
    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(isCompleted ? Color.green : Color.gray.opacity(0.3))
                    .frame(width: 32, height: 32)
                
                if isCompleted {
                    Image(systemName: "checkmark")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                } else {
                    Text("\(number)")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                }
            }
            
            Text(text)
                .font(.subheadline)
                .foregroundColor(isCompleted ? .primary : .secondary)
            
            Spacer()
        }
    }
}

// MARK: - Proximity Manager
class ProximityManager: ObservableObject {
    @Published var isNear = false
    @Published var isMonitoring = false
    @Published var detectionCount = 0
    
    private var wasNear = false
    
    init() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(proximityStateChanged),
            name: UIDevice.proximityStateDidChangeNotification,
            object: nil
        )
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
        UIDevice.current.isProximityMonitoringEnabled = false
    }
    
    func startMonitoring() {
        UIDevice.current.isProximityMonitoringEnabled = true
        isMonitoring = true
        detectionCount = 0
    }
    
    func stopMonitoring() {
        UIDevice.current.isProximityMonitoringEnabled = false
        isMonitoring = false
    }
    
    @objc private func proximityStateChanged() {
        DispatchQueue.main.async {
            let newState = UIDevice.current.proximityState
            
            // Count state changes (near -> far or far -> near)
            if newState != self.wasNear {
                self.detectionCount += 1
                self.wasNear = newState
            }
            
            self.isNear = newState
            
            // Haptic feedback
            if newState {
                UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
            } else {
                UIImpactFeedbackGenerator(style: .light).impactOccurred()
            }
        }
    }
}

#if DEBUG
#Preview {
    NavigationStack {
        ProximityTestView()
            .environmentObject(TestManager())
    }
}
#endif

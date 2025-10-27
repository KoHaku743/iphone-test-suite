import SwiftUI
import AVFoundation

struct SpeakerTestView: View {
    let speakerType: SpeakerType
    @EnvironmentObject var testManager: TestManager
    @StateObject private var audioManager = AudioTestManager()
    @Environment(\.dismiss) var dismiss
    @State private var frequency: Double = 440
    
    var body: some View {
        VStack(spacing: 30) {
            // Header
            VStack(spacing: 12) {
                Image(systemName: speakerType == .top ? "speaker.wave.1" : "speaker.wave.3")
                    .font(.system(size: 80))
                    .foregroundColor(.blue)
                
                Text(speakerType.name)
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text(speakerType == .top ? "Earpiece speaker" : "Bottom stereo speaker")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            // Visual Indicator
            ZStack {
                Circle()
                    .fill(audioManager.isPlaying ? Color.green : Color.gray.opacity(0.3))
                    .frame(width: 150, height: 150)
                    .scaleEffect(audioManager.isPlaying ? 1.1 : 1.0)
                    .animation(.easeInOut(duration: 0.5).repeatForever(autoreverses: true), value: audioManager.isPlaying)
                
                Image(systemName: audioManager.isPlaying ? "speaker.wave.3.fill" : "speaker.slash")
                    .font(.system(size: 60))
                    .foregroundColor(.white)
            }
            
            // Frequency Slider
            VStack(spacing: 12) {
                Text("Frekvencia: \(Int(frequency)) Hz")
                    .font(.headline)
                
                Slider(value: $frequency, in: 200...2000, step: 50)
                    .onChange(of: frequency) { newValue in
                        if audioManager.isPlaying {
                            audioManager.updateFrequency(newValue)
                        }
                    }
                    .disabled(audioManager.isPlaying)
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
            .padding(.horizontal)
            
            // Instructions
            InstructionCard(
                speakerType: speakerType,
                isPlaying: audioManager.isPlaying
            )
            
            Spacer()
            
            // Control Buttons
            VStack(spacing: 12) {
                if !audioManager.isPlaying {
                    Button(action: {
                        audioManager.playSpeakerTest(type: speakerType, frequency: frequency)
                    }) {
                        Label("▶ Prehrať zvuk", systemImage: "play.fill")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.green)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                    }
                } else {
                    Button(action: {
                        audioManager.stopPlaying()
                    }) {
                        Label("⏹ Zastaviť", systemImage: "stop.fill")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.red)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                    }
                }
                
                HStack(spacing: 12) {
                    Button(action: {
                        audioManager.stopPlaying()
                        let testId = speakerType == .top ? "speaker-top" : "speaker-bottom"
                        testManager.recordResult(testId: testId, passed: true)
                        dismiss()
                    }) {
                        Label("✓ Funguje", systemImage: "checkmark")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.green.opacity(0.2))
                            .foregroundColor(.green)
                            .cornerRadius(12)
                    }
                    
                    Button(action: {
                        audioManager.stopPlaying()
                        let testId = speakerType == .top ? "speaker-top" : "speaker-bottom"
                        testManager.recordResult(testId: testId, passed: false)
                        dismiss()
                    }) {
                        Label("✗ Problém", systemImage: "xmark")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.red.opacity(0.2))
                            .foregroundColor(.red)
                            .cornerRadius(12)
                    }
                }
            }
            .padding(.horizontal)
            .padding(.bottom)
        }
        .navigationBarTitleDisplayMode(.inline)
        .onDisappear {
            audioManager.stopPlaying()
        }
    }
}

struct InstructionCard: View {
    let speakerType: SpeakerType
    let isPlaying: Bool
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Inštrukcie:")
                .font(.headline)
            
            if speakerType == .top {
                Text("• Prilož telefón k uchu ako pri hovore")
                Text("• Zvýš hlasitosť na maximum")
                Text("• Mal by si počuť tón cez earpiece")
            } else {
                Text("• Postav telefón na stôl")
                Text("• Zvýš hlasitosť na maximum")
                Text("• Mal by si počuť hlasný tón")
                Text("• Skontroluj či nie je praskanie")
            }
            
            if isPlaying {
                Text("\n🔊 Prehráva sa...")
                    .foregroundColor(.green)
                    .fontWeight(.bold)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .padding(.horizontal)
    }
}

// MARK: - Audio Test Manager
class AudioTestManager: ObservableObject {
    @Published var isPlaying = false
    
    private var audioEngine: AVAudioEngine?
    private var playerNode: AVAudioPlayerNode?
    private var audioFormat: AVAudioFormat?
    
    func playSpeakerTest(type: SpeakerType, frequency: Double) {
        do {
            let audioSession = AVAudioSession.sharedInstance()
            
            // Configure audio session based on speaker type
            if type == .top {
                // Force to receiver/earpiece
                try audioSession.setCategory(.playAndRecord, mode: .voiceChat, options: [])
                try audioSession.overrideOutputAudioPort(.none)
            } else {
                // Use bottom speaker
                try audioSession.setCategory(.playback, mode: .default, options: [])
                try audioSession.overrideOutputAudioPort(.speaker)
            }
            
            try audioSession.setActive(true)
            
            // Create audio engine
            audioEngine = AVAudioEngine()
            playerNode = AVAudioPlayerNode()
            
            guard let engine = audioEngine, let player = playerNode else { return }
            
            engine.attach(player)
            
            // Create format
            let sampleRate = 44100.0
            audioFormat = AVAudioFormat(standardFormatWithSampleRate: sampleRate, channels: 1)
            
            guard let format = audioFormat else { return }
            
            engine.connect(player, to: engine.mainMixerNode, format: format)
            
            // Generate tone
            let buffer = generateTone(frequency: frequency, duration: 10.0, format: format)
            
            try engine.start()
            player.scheduleBuffer(buffer, at: nil, options: .loops)
            player.play()
            
            isPlaying = true
            
        } catch {
            print("Audio error: \(error.localizedDescription)")
        }
    }
    
    func updateFrequency(_ frequency: Double) {
        stopPlaying()
        // Would need to restart with new frequency
    }
    
    func stopPlaying() {
        playerNode?.stop()
        audioEngine?.stop()
        audioEngine = nil
        playerNode = nil
        isPlaying = false
        
        do {
            try AVAudioSession.sharedInstance().setActive(false)
        } catch {
            print("Error deactivating audio session: \(error)")
        }
    }
    
    private func generateTone(frequency: Double, duration: Double, format: AVAudioFormat) -> AVAudioPCMBuffer {
        let sampleRate = format.sampleRate
        let frameCount = AVAudioFrameCount(duration * sampleRate)
        let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount)!
        buffer.frameLength = frameCount
        
        let channels = Int(format.channelCount)
        let floatChannelData = buffer.floatChannelData!
        
        for frame in 0..<Int(frameCount) {
            let value = sin(2.0 * .pi * frequency * Double(frame) / sampleRate)
            for channel in 0..<channels {
                floatChannelData[channel][frame] = Float(value)
            }
        }
        
        return buffer
    }
}

#if DEBUG
#Preview {
    NavigationStack {
        SpeakerTestView(speakerType: .bottom)
            .environmentObject(TestManager())
    }
}
#endif

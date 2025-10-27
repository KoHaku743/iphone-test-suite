import SwiftUI
import AVFoundation

struct MicrophoneTestView: View {
    @EnvironmentObject var testManager: TestManager
    @StateObject private var audioRecorder = AudioRecorder()
    @Environment(\.dismiss) var dismiss
    @State private var isPlaying = false
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                LinearGradient(
                    colors: [Color.red.opacity(0.3), Color.purple.opacity(0.3)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                VStack(spacing: 30) {
                    // Header
                    VStack(spacing: 12) {
                        Image(systemName: audioRecorder.isRecording ? "waveform.circle.fill" : "mic.fill")
                            .font(.system(size: 80))
                            .foregroundColor(audioRecorder.isRecording ? .red : .white)
                            .symbolEffect(.pulse, isActive: audioRecorder.isRecording)
                        
                        Text("Mikrofón Test")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        
                        Text(audioRecorder.isRecording ? "Nahráva sa..." : "Povedz niečo do mikrofónu")
                            .font(.headline)
                            .foregroundColor(.white.opacity(0.8))
                    }
                    .padding(.top, 40)
                    
                    // Audio level indicator
                    if audioRecorder.isRecording {
                        VStack(spacing: 8) {
                            Text("Hladina zvuku")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.7))
                            
                            ZStack(alignment: .leading) {
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(Color.white.opacity(0.2))
                                    .frame(height: 40)
                                
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(
                                        LinearGradient(
                                            colors: [.green, .yellow, .orange, .red],
                                            startPoint: .leading,
                                            endPoint: .trailing
                                        )
                                    )
                                    .frame(width: max(0, geometry.size.width * 0.8 * CGFloat(audioRecorder.audioLevel)), height: 40)
                                    .animation(.easeOut(duration: 0.1), value: audioRecorder.audioLevel)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.horizontal, 40)
                        }
                    }
                    
                    Spacer()
                    
                    // Recording controls
                    VStack(spacing: 20) {
                        if !audioRecorder.isRecording && audioRecorder.hasRecording {
                            Button(action: {
                                if isPlaying {
                                    audioRecorder.stopPlaying()
                                    isPlaying = false
                                } else {
                                    audioRecorder.playRecording()
                                    isPlaying = true
                                }
                            }) {
                                HStack {
                                    Image(systemName: isPlaying ? "stop.circle.fill" : "play.circle.fill")
                                        .font(.title2)
                                    Text(isPlaying ? "Zastaviť prehrávanie" : "Prehrať nahrávku")
                                        .fontWeight(.semibold)
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.blue)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                            }
                            .padding(.horizontal, 40)
                        }
                        
                        Button(action: {
                            if audioRecorder.isRecording {
                                audioRecorder.stopRecording()
                            } else {
                                audioRecorder.startRecording()
                                isPlaying = false
                            }
                        }) {
                            HStack {
                                Image(systemName: audioRecorder.isRecording ? "stop.circle.fill" : "mic.circle.fill")
                                    .font(.title2)
                                Text(audioRecorder.isRecording ? "Zastaviť nahrávanie" : "Spustiť nahrávanie")
                                    .fontWeight(.semibold)
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(audioRecorder.isRecording ? Color.red : Color.green)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        }
                        .padding(.horizontal, 40)
                        
                        // Test result buttons
                        if audioRecorder.hasRecording {
                            HStack(spacing: 16) {
                                Button(action: {
                                    testManager.recordResult(testId: "microphone", passed: true)
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
                                    testManager.recordResult(testId: "microphone", passed: false)
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
                            .padding(.horizontal, 40)
                        }
                    }
                    .padding(.bottom, 30)
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .onDisappear {
            audioRecorder.cleanup()
        }
    }
}

// MARK: - Audio Recorder
class AudioRecorder: NSObject, ObservableObject, AVAudioRecorderDelegate, AVAudioPlayerDelegate {
    @Published var isRecording = false
    @Published var hasRecording = false
    @Published var audioLevel: Double = 0.0
    
    private var audioRecorder: AVAudioRecorder?
    private var audioPlayer: AVAudioPlayer?
    private var levelTimer: Timer?
    
    private var recordingURL: URL {
        let paths = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)
        return paths[0].appendingPathComponent("test_recording.m4a")
    }
    
    override init() {
        super.init()
        setupAudioSession()
    }
    
    private func setupAudioSession() {
        let session = AVAudioSession.sharedInstance()
        do {
            try session.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker])
            try session.setActive(true)
        } catch {
            print("Failed to set up audio session: \(error)")
        }
    }
    
    func startRecording() {
        let settings: [String: Any] = [
            AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
            AVSampleRateKey: 44100.0,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
        ]
        
        do {
            audioRecorder = try AVAudioRecorder(url: recordingURL, settings: settings)
            audioRecorder?.delegate = self
            audioRecorder?.isMeteringEnabled = true
            audioRecorder?.record()
            
            isRecording = true
            hasRecording = false
            
            // Start monitoring audio levels
            levelTimer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
                self?.updateAudioLevel()
            }
        } catch {
            print("Failed to start recording: \(error)")
        }
    }
    
    func stopRecording() {
        audioRecorder?.stop()
        isRecording = false
        hasRecording = true
        audioLevel = 0.0
        levelTimer?.invalidate()
        levelTimer = nil
    }
    
    private func updateAudioLevel() {
        guard let recorder = audioRecorder else { return }
        recorder.updateMeters()
        
        // Get average power (range: -160 to 0)
        let averagePower = recorder.averagePower(forChannel: 0)
        
        // Normalize to 0.0 - 1.0
        let normalized = (averagePower + 160) / 160
        audioLevel = max(0, min(1, Double(normalized)))
    }
    
    func playRecording() {
        do {
            audioPlayer = try AVAudioPlayer(contentsOf: recordingURL)
            audioPlayer?.delegate = self
            audioPlayer?.play()
        } catch {
            print("Failed to play recording: \(error)")
        }
    }
    
    func stopPlaying() {
        audioPlayer?.stop()
    }
    
    func cleanup() {
        stopRecording()
        stopPlaying()
        audioRecorder = nil
        audioPlayer = nil
        levelTimer?.invalidate()
    }
    
    // MARK: - AVAudioPlayerDelegate
    func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        DispatchQueue.main.async { [weak self] in
            // Notify that playback finished if needed
        }
    }
}

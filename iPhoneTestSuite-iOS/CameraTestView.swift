import SwiftUI
import AVFoundation

struct CameraTestView: View {
    let cameraType: CameraType
    @EnvironmentObject var testManager: TestManager
    @StateObject private var cameraManager: CameraManager
    @Environment(\.dismiss) var dismiss
    @State private var flashOn = false
    @State private var showPermissionAlert = false
    
    init(cameraType: CameraType) {
        self.cameraType = cameraType
        self._cameraManager = StateObject(wrappedValue: CameraManager(cameraType: cameraType))
    }
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                Color.black.ignoresSafeArea()
                
                // Camera Preview
                CameraPreviewView(session: cameraManager.session)
                    .ignoresSafeArea()
                
                // Controls Overlay
                VStack {
                    // Top bar
                    HStack {
                        Button(action: { dismiss() }) {
                            Image(systemName: "xmark")
                                .font(.title3)
                                .padding(12)
                                .background(Color.black.opacity(0.6))
                                .foregroundColor(.white)
                                .clipShape(Circle())
                        }
                        
                        Spacer()
                        
                        Text(cameraType.name)
                            .font(.headline)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(Color.black.opacity(0.6))
                            .foregroundColor(.white)
                            .cornerRadius(20)
                        
                        Spacer()
                        
                        // Flash toggle (only for rear camera)
                        if cameraType == .rear {
                            Button(action: {
                                flashOn.toggle()
                                cameraManager.toggleTorch()
                            }) {
                                Image(systemName: flashOn ? "flashlight.on.fill" : "flashlight.off.fill")
                                    .font(.title3)
                                    .padding(12)
                                    .background(Color.black.opacity(0.6))
                                    .foregroundColor(flashOn ? .yellow : .white)
                                    .clipShape(Circle())
                            }
                        } else {
                            Color.clear.frame(width: 44, height: 44)
                        }
                    }
                    .padding()
                    
                    Spacer()
                    
                    // Bottom controls
                    VStack(spacing: 16) {
                        Text("Skontroluj kvalitu obrazu")
                            .font(.headline)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 10)
                            .background(Color.black.opacity(0.6))
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        
                        HStack(spacing: 20) {
                            Button(action: {
                                testManager.recordResult(testId: cameraType == .rear ? "camera-rear" : "camera-front", passed: true)
                                cameraManager.stopSession()
                                dismiss()
                            }) {
                                Label("Funguje", systemImage: "checkmark.circle.fill")
                                    .font(.headline)
                                    .padding(.horizontal, 24)
                                    .padding(.vertical, 12)
                                    .background(Color.green)
                                    .foregroundColor(.white)
                                    .cornerRadius(12)
                            }
                            
                            Button(action: {
                                testManager.recordResult(testId: cameraType == .rear ? "camera-rear" : "camera-front", passed: false)
                                cameraManager.stopSession()
                                dismiss()
                            }) {
                                Label("Problém", systemImage: "xmark.circle.fill")
                                    .font(.headline)
                                    .padding(.horizontal, 24)
                                    .padding(.vertical, 12)
                                    .background(Color.red)
                                    .foregroundColor(.white)
                                    .cornerRadius(12)
                            }
                        }
                    }
                    .padding(.bottom, 30)
                }
                
                if !cameraManager.isAuthorized {
                    VStack(spacing: 20) {
                        Image(systemName: "camera.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.white)
                        
                        Text("Kamera Denied")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        
                        Text("Povoľ prístup ku kamere v Nastaveniach")
                            .font(.body)
                            .foregroundColor(.white.opacity(0.8))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                        
                        Button("Otvoriť Nastavenia") {
                            if let url = URL(string: UIApplication.openSettingsURLString) {
                                UIApplication.shared.open(url)
                            }
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color.black)
                }
            }
        }
        .navigationBarHidden(true)
        .onAppear {
            cameraManager.checkAuthorization()
            cameraManager.startSession()
        }
        .onDisappear {
            cameraManager.stopSession()
        }
    }
}

// MARK: - Camera Manager
class CameraManager: NSObject, ObservableObject {
    @Published var isAuthorized = false
    let session = AVCaptureSession()
    private let cameraType: CameraType
    private var device: AVCaptureDevice?
    
    init(cameraType: CameraType) {
        self.cameraType = cameraType
        super.init()
    }
    
    func checkAuthorization() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            isAuthorized = true
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { [weak self] granted in
                DispatchQueue.main.async {
                    self?.isAuthorized = granted
                }
            }
        default:
            isAuthorized = false
        }
    }
    
    func startSession() {
        guard isAuthorized else { return }
        
        session.beginConfiguration()
        
        // Remove existing inputs
        session.inputs.forEach { session.removeInput($0) }
        
        // Set up camera device
        let position: AVCaptureDevice.Position = cameraType == .rear ? .back : .front
        
        guard let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: position) else {
            session.commitConfiguration()
            return
        }
        
        self.device = device
        
        do {
            let input = try AVCaptureDeviceInput(device: device)
            if session.canAddInput(input) {
                session.addInput(input)
            }
            
            session.sessionPreset = .high
            session.commitConfiguration()
            
            DispatchQueue.global(qos: .userInitiated).async { [weak self] in
                self?.session.startRunning()
            }
        } catch {
            print("Error setting up camera: \(error)")
            session.commitConfiguration()
        }
    }
    
    func stopSession() {
        if device?.hasTorch == true && device?.torchMode == .on {
            try? device?.lockForConfiguration()
            device?.torchMode = .off
            device?.unlockForConfiguration()
        }
        session.stopRunning()
    }
    
    func toggleTorch() {
        guard let device = device, device.hasTorch else { return }
        
        do {
            try device.lockForConfiguration()
            device.torchMode = device.torchMode == .on ? .off : .on
            device.unlockForConfiguration()
        } catch {
            print("Error toggling torch: \(error)")
        }
    }
}

// MARK: - Camera Preview
struct CameraPreviewView: UIViewRepresentable {
    let session: AVCaptureSession
    
    func makeUIView(context: Context) -> UIView {
        let view = UIView(frame: .zero)
        
        let previewLayer = AVCaptureVideoPreviewLayer(session: session)
        previewLayer.videoGravity = .resizeAspectFill
        view.layer.addSublayer(previewLayer)
        
        context.coordinator.previewLayer = previewLayer
        
        return view
    }
    
    func updateUIView(_ uiView: UIView, context: Context) {
        DispatchQueue.main.async {
            context.coordinator.previewLayer?.frame = uiView.bounds
        }
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator()
    }
    
    class Coordinator {
        var previewLayer: AVCaptureVideoPreviewLayer?
    }
}

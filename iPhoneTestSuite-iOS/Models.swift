import Foundation
import SwiftUI

// MARK: - Test Manager
class TestManager: ObservableObject {
    @Published var results: [String: TestResult] = [:]
    
    var totalTests: Int {
        results.count
    }
    
    var passedTests: Int {
        results.values.filter { $0.passed }.count
    }
    
    var failedTests: Int {
        results.values.filter { !$0.passed }.count
    }
    
    func recordResult(testId: String, passed: Bool) {
        results[testId] = TestResult(testId: testId, passed: passed, date: Date())
    }
    
    func resetAllTests() {
        results.removeAll()
    }
}

// MARK: - Test Result
struct TestResult: Identifiable {
    let id = UUID()
    let testId: String
    let passed: Bool
    let date: Date
}

// MARK: - Test Item
struct TestItem: Identifiable {
    let id: String
    let name: String
    let icon: String
}

// MARK: - Test Category
enum TestCategory: String, CaseIterable {
    case display = "Displej"
    case audio = "Zvuk"
    case camera = "Kamery"
    case sensors = "Senzory"
    case connectivity = "Konektivita"
    case battery = "Batéria"
}

// MARK: - Speaker Type
enum SpeakerType {
    case top
    case bottom
    
    var name: String {
        switch self {
        case .top: return "Horný reproduktor"
        case .bottom: return "Dolný reproduktor"
        }
    }
}

// MARK: - Camera Type
enum CameraType {
    case front
    case rear
    
    var name: String {
        switch self {
        case .front: return "Predná kamera"
        case .rear: return "Zadná kamera"
        }
    }
}

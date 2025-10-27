import SwiftUI

@main
struct iPhoneTestSuiteApp: App {
    @StateObject private var testManager = TestManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(testManager)
        }
    }
}

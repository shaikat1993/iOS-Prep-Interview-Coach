import { Topic } from './types';

export const TOPICS: Topic[] = [
  // ── SWIFT LANGUAGE ──
  { id: 'value-vs-reference', category: 'Swift Language', title: 'Value vs Reference Types', icon: '🔀', description: 'struct vs class, stack vs heap, and copy-on-write semantics.', query: 'Explain the difference between value types (struct, enum) and reference types (class) in Swift. Cover stack vs heap, copy-on-write, and when to use each in production iOS apps.' },
  { id: 'protocols', category: 'Swift Language', title: 'Protocols & POP', icon: '📋', description: 'Protocol-Oriented Programming, composition, and extensions.', query: 'Explain Protocol-Oriented Programming (POP) in Swift. How does it differ from OOP? Discuss protocol extensions, composition, and why Apple favors this approach.' },
  { id: 'generics', category: 'Swift Language', title: 'Generics', icon: '🧬', description: 'Reusable code, type constraints, and opaque types.', query: 'Explain Generics in Swift. Cover type constraints, associated types in protocols, and the "some" keyword (opaque types) vs "any" keyword (existential types).' },
  { id: 'closures', category: 'Swift Language', title: 'Closures & Escaping', icon: '📦', description: 'Capturing values, escaping vs non-escaping, and memory.', query: 'Explain Swift Closures. Detail the difference between @escaping and non-escaping closures. Discuss capture lists ([weak self]) and how they prevent retain cycles.' },
  { id: 'optionals', category: 'Swift Language', title: 'Optionals & Error Handling', icon: '❓', description: 'Optional chaining, nil-coalescing, and Result type.', query: 'Explain Optionals and Error Handling in Swift. Compare if-let, guard-let, and nil-coalescing. Discuss the Result type and throwing functions (try/catch).' },
  { id: 'codable', category: 'Swift Language', title: 'Codable', icon: '🔢', description: 'JSON parsing, CodingKeys, and custom encoding.', query: 'Explain the Codable protocol. How do you handle custom keys using CodingKeys? Discuss manual encoding/decoding for complex nested JSON structures.' },

  // ── SWIFTUI ──
  { id: 'swiftui-state', category: 'SwiftUI', title: 'State Management', icon: '🔄', description: '@State, @Binding, @ObservedObject, and @Environment.', query: 'Explain State Management in SwiftUI. Compare @State, @Binding, @StateObject, @ObservedObject, and @EnvironmentObject. When should you use each?' },
  { id: 'swiftui-lifecycle', category: 'SwiftUI', title: 'View Lifecycle', icon: '🌱', description: 'onAppear, task, and view updates.', query: 'Explain the SwiftUI View Lifecycle. How does SwiftUI decide when to redraw a view? Discuss onAppear, onDisappear, and the "task" modifier for async work.' },
  { id: 'swiftui-layout', category: 'SwiftUI', title: 'Layout System', icon: '📐', description: 'HStack, VStack, ZStack, and GeometryReader.', query: 'Explain the SwiftUI Layout System. How do stacks (H/V/Z) work? Discuss frame modifiers, padding, and when to use GeometryReader vs Layout protocol.' },

  // ── UIKIT ──
  { id: 'uikit-lifecycle', category: 'UIKit', title: 'ViewController Lifecycle', icon: '📱', description: 'viewDidLoad, viewWillAppear, and memory management.', query: 'Explain the UIViewController Lifecycle in detail. What happens in viewDidLoad vs viewWillAppear? When is the best time to start network calls or layout adjustments?' },
  { id: 'uikit-tableview', category: 'UIKit', title: 'TableView & CollectionView', icon: '📜', description: 'Reusable cells, diffable data sources, and performance.', query: 'Explain UITableView and UICollectionView. Discuss cell reuse (dequeue), Diffable Data Source, and how to optimize scrolling performance for complex layouts.' },
  { id: 'uikit-autolayout', category: 'UIKit', title: 'Auto Layout', icon: '🔗', description: 'Constraints, anchors, and intrinsic content size.', query: 'Explain Auto Layout. Discuss constraints, anchors, Intrinsic Content Size, and Compression Resistance vs Content Hugging priorities.' },

  // ── ARCHITECTURE ──
  { id: 'mvvm', category: 'Architecture', title: 'MVVM', icon: '🏗️', description: 'Model-View-ViewModel and data binding.', query: 'Explain the MVVM architecture in iOS. What are the responsibilities of the ViewModel? Discuss data binding techniques (Combine, Closures, or SwiftUI).' },
  { id: 'coordinator', category: 'Architecture', title: 'Coordinator Pattern', icon: '🗺️', description: 'Navigation logic separation and flow control.', query: 'Explain the Coordinator Pattern. How does it help in separating navigation logic from ViewControllers? Discuss how to handle child coordinators.' },
  { id: 'dependency-injection', category: 'Architecture', title: 'Dependency Injection', icon: '💉', description: 'Inversion of control and testability.', query: 'Explain Dependency Injection (DI) in iOS. Why is it important for unit testing? Compare constructor injection vs property injection.' },

  // ── PERFORMANCE & CONCURRENCY ──
  { id: 'arc', category: 'Performance & Concurrency', title: 'Memory Management (ARC)', icon: '🧠', description: 'Strong, weak, unowned, and retain cycles.', query: 'Explain Automatic Reference Counting (ARC) in Swift. Detail the differences between strong, weak, and unowned references. How do you detect and fix retain cycles?' },
  { id: 'gcd-vs-combine', category: 'Performance & Concurrency', title: 'GCD vs Combine', icon: '⚡', description: 'Queues, publishers, and reactive programming.', query: 'Compare Grand Central Dispatch (GCD) and Combine. When would you use a serial vs concurrent queue? Explain the basics of Combine publishers and subscribers.' },
  { id: 'async-await', category: 'Performance & Concurrency', title: 'Swift Concurrency (Async/Await)', icon: '⏳', description: 'Structured concurrency, Actors, and MainActor.', query: 'Explain Swift Structured Concurrency. Discuss async/await, Task groups, and Actors. How does @MainActor ensure UI updates happen on the main thread?' },

  // ── DATA & STORAGE ──
  { id: 'core-data', category: 'Data & Storage', title: 'Core Data & SwiftData', icon: '💾', description: 'Persistent storage, entities, and relationships.', query: 'Explain Core Data and the new SwiftData. How do you handle migrations and relationships? Discuss the difference between NSManagedObjectContext and ModelContext.' },
  { id: 'networking', category: 'Data & Storage', title: 'URLSession & Networking', icon: '🌐', description: 'API calls, authentication, and background downloads.', query: 'Explain networking in iOS using URLSession. How do you handle authentication (OAuth/Tokens)? Discuss background download tasks and error handling.' },

  // ── TESTING ──
  { id: 'unit-testing', category: 'Testing', title: 'Unit & UI Testing', icon: '🧪', description: 'XCTest, mocks, stubs, and code coverage.', query: 'Explain Unit Testing and UI Testing in iOS using XCTest. What is the difference between a Mock and a Stub? How do you test asynchronous code?' },
];

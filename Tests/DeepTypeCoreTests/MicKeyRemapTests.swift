import Foundation
import Testing
@testable import DeepType

@Test func parsesAndDeduplicatesHidutilKeyMappings() {
    let output = """
    RegistryID  Key                   Value
    100000f35   UserKeyMapping   (
            {
            HIDKeyboardModifierMappingDst = 30064771134;
            HIDKeyboardModifierMappingSrc = 51539607759;
        }
    )
    1000009e6   UserKeyMapping   (
            {
            HIDKeyboardModifierMappingDst = 30064771134;
            HIDKeyboardModifierMappingSrc = 51539607759;
        }
    )
    """
    let mappings = MicKeyRemap.parse(output)
    #expect(mappings.count == 1)
    #expect(mappings.first?.src == 51539607759)
    #expect(mappings.first?.dst == 30064771134)
    #expect(MicKeyRemap.parse("No such key").isEmpty)
}

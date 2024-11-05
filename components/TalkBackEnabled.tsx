import { AccessibilityInfo } from 'react-native';

const isTalkBackEnabled = async () => {
  try {
    const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
    return isEnabled;
  } catch (error) {
    console.error('Error checking screen reader status:', error);
    return false;
  }
};

// EXAMPLE of disabling buttons
// return (
// 	<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
// 		<Text>Welcome to the App</Text>
// 		<Button
// 			title="Button 1"
// 			disabled={isTalkBackActive}
// 			onPress={() => alert('Button 1 Pressed')}
// 		/>
// 	</View>
// );
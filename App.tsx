import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AlarmListScreen from './src/screens/AlarmListScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AlarmListScreen />
    </SafeAreaProvider>
  );
}

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from './pages/home';
import LoginPage from './pages/login';
import RegistroPage from './pages/registro';
import Postpage from './pages/post';
import AppProvider from "./contexts/context.js";
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
       <AppProvider>
      <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen name='Home' component={HomePage}/>
        <Stack.Screen name='Login' component={LoginPage}/>
        <Stack.Screen name='Register' component={RegistroPage}/>
        <Stack.Screen name='post' component={Postpage}/> 
      </Stack.Navigator>
      </AppProvider>
    </NavigationContainer>
  );
};

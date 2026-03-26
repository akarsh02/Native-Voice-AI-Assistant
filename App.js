import { Sparkles, Zap, Briefcase, MapPin, CheckCircle, ShieldCheck } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AssistantScreen from './screens/AssistantScreen';
import OptionsScreen from './screens/OptionsScreen';
import InsiderScreen from './screens/InsiderScreen';
import ParkingScreen from './screens/ParkingScreen';
import HabitScreen from './screens/HabitScreen';
import CheckoutModal from './components/CheckoutModal';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isPro, setIsPro] = React.useState(false);
  const [showCheckout, setShowCheckout] = React.useState(false);

  React.useEffect(() => {
    AsyncStorage.getItem('radar_pro').then(val => {
      if (val === 'true') setIsPro(true);
    });
  }, []);

  const handleUpgrade = () => {
    setIsPro(true);
    setShowCheckout(false);
    AsyncStorage.setItem('radar_pro', 'true');
  };
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: true, // Changed from false to true
          headerStyle: { backgroundColor: '#050505', borderBottomWidth: 1, borderBottomColor: '#222' }, // Added
          headerTitleStyle: { color: '#FFF', fontWeight: '900', fontSize: 13, textTransform: 'uppercase' }, // Added
          headerRight: () => ( // Added
            <TouchableOpacity 
              onPress={() => !isPro && setShowCheckout(true)}
              style={{ marginRight: 20, flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <ShieldCheck size={18} color={isPro ? "#00FF41" : "#666"} />
              <Text style={{ color: isPro ? "#00FF41" : "#666", fontSize: 10, fontWeight: '900' }}>
                {isPro ? "PRO" : "UPGRADE"}
              </Text>
            </TouchableOpacity>
          ),
          tabBarStyle: {
            backgroundColor: '#050505',
            borderTopWidth: 1,
            borderTopColor: '#222',
            paddingBottom: 10,
            paddingTop: 10,
            height: 70,
          },
          tabBarActiveTintColor: '#00FF41',
          tabBarInactiveTintColor: '#666',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '900',
            textTransform: 'uppercase',
          },
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Assistant') return <Sparkles size={size} color={color} />;
            if (route.name === 'Options') return <Zap size={size} color={color} />;
            if (route.name === 'Insiders') return <Briefcase size={size} color={color} />;
            if (route.name === 'Parking') return <MapPin size={size} color={color} />;
            if (route.name === 'Habits') return <CheckCircle size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Assistant" component={AssistantScreen} />
        <Tab.Screen name="Options" component={OptionsScreen} />
        <Tab.Screen name="Insiders" component={InsiderScreen} />
        <Tab.Screen name="Parking" component={ParkingScreen} />
        <Tab.Screen name="Habits" component={HabitScreen} />
      </Tab.Navigator>

      <CheckoutModal 
        visible={showCheckout} 
        onClose={() => setShowCheckout(false)} 
        onUpgrade={handleUpgrade} 
      />
    </NavigationContainer>
  );
}

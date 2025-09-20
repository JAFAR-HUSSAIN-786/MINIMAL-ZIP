import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function ActivationScreen({ navigation }) {
  const [key, setKey] = useState('');
  const activate = async () => {
    if (key === '7214125' || key === 'Majafar-786') {
      await AsyncStorage.setItem('activationKey', key);
      navigation.replace('Dashboard');
    } else {
      alert('Invalid key');
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Activation Key</Text>
      <TextInput style={styles.input} placeholder="Activation Key" value={key} onChangeText={setKey} />
      <TouchableOpacity style={styles.button} onPress={activate}><Text style={styles.buttonText}>Activate</Text></TouchableOpacity>
    </View>
  );
}

function DashboardScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.balance}>Balance: PKR 100,000</Text>
      {[
        { name: 'Trade Chart', screen: 'TradeChart' },
        { name: 'Backtest', screen: 'Backtest' },
        { name: 'Copy Trading', screen: 'CopyTrading' },
        { name: 'Logs', screen: 'Logs' },
        { name: 'Settings', screen: 'Settings' },
      ].map((item, idx) => (
        <TouchableOpacity key={idx} style={styles.menuButton} onPress={() => navigation.navigate(item.screen)}>
          <Text style={styles.buttonText}>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function TradeChartScreen() {
  const [autoTrade, setAutoTrade] = useState(false);
  const [timeframe, setTimeframe] = useState('M5');
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Trade Chart</Text>
      <Text>Timeframe: {timeframe}</Text>
      <View style={styles.row}>
        {['M1','M5','M15','H1','D1'].map((tf,idx)=>(
          <TouchableOpacity key={idx} style={styles.smallButton} onPress={()=>setTimeframe(tf)}>
            <Text style={styles.buttonText}>{tf}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text>Indicators: SMA ✅ | RSI ✅</Text>
      <Text>Forecast: Price may move up 🔼</Text>
      <Text>Markers: Green=Buy | Red=Sell</Text>
      <View style={styles.row}>
        <Text>Auto-Trade</Text>
        <Switch value={autoTrade} onValueChange={setAutoTrade} />
      </View>
    </ScrollView>
  );
}

function BacktestScreen(){ return (<ScrollView style={styles.container}><Text style={styles.title}>Backtest</Text><Text>Result: Profit +12% (demo)</Text></ScrollView>); }
function CopyTradingScreen(){ return (<ScrollView style={styles.container}><Text style={styles.title}>Copy Trading</Text><Text>Presets: Conservative | Balanced | Aggressive</Text></ScrollView>); }
function LogsScreen(){ return (<ScrollView style={styles.container}><Text style={styles.title}>Logs</Text><Text>09:15 Buy BTCUSD @ 65000</Text><Text>09:30 Sell BTCUSD @ 65300</Text></ScrollView>); }
function SettingsScreen(){ return (<ScrollView style={styles.container}><Text style={styles.title}>Settings</Text><Text>Telegram Alerts (demo)</Text></ScrollView>); }

export default function App(){
  const [loading,setLoading]=useState(true);
  const [activated,setActivated]=useState(false);
  useEffect(()=>{ (async ()=>{ const k = await AsyncStorage.getItem('activationKey'); if(k==='7214125' || k==='Majafar-786') setActivated(true); setLoading(false); })(); },[]);
  if(loading) return <View style={styles.container}><Text>Loading...</Text></View>;
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown:true}}>
        {!activated ? <Stack.Screen name='Activation' component={ActivationScreen} /> :
          (<>
            <Stack.Screen name='Dashboard' component={DashboardScreen} />
            <Stack.Screen name='TradeChart' component={TradeChartScreen} />
            <Stack.Screen name='Backtest' component={BacktestScreen} />
            <Stack.Screen name='CopyTrading' component={CopyTradingScreen} />
            <Stack.Screen name='Logs' component={LogsScreen} />
            <Stack.Screen name='Settings' component={SettingsScreen} />
          </>)
        }
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#121212',padding:20},
  title:{fontSize:22,fontWeight:'bold',color:'#fff',marginBottom:10},
  input:{backgroundColor:'#fff',padding:10,marginVertical:10,borderRadius:8},
  button:{backgroundColor:'#6200ea',padding:12,borderRadius:8,marginTop:10},
  buttonText:{color:'#fff',textAlign:'center'},
  balance:{fontSize:18,color:'#0f0',marginBottom:20},
  menuButton:{backgroundColor:'#03dac6',padding:12,borderRadius:8,marginVertical:5},
  row:{flexDirection:'row',alignItems:'center',marginVertical:10},
  smallButton:{backgroundColor:'#3700b3',padding:8,borderRadius:8,margin:5},
});

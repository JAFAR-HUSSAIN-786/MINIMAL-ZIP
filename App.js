import 'react-native-gesture-handler';
import React, {useEffect, useState, useRef} from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, StyleSheet, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LineChart } from 'react-native-chart-kit';

const Stack = createNativeStackNavigator();
const screenWidth = Dimensions.get('window').width - 40;

function ActivationScreen({ navigation }) {
  const [key, setKey] = useState('');
  const activate = async () => {
    if (key === '7214125' || key === 'Majafar-786') {
      try {
        await AsyncStorage.setItem('activationKey', key);
      } catch (e) {
        console.log('AsyncStorage error', e);
      }
      navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
    } else {
      Alert.alert('Invalid key');
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activate Jafar Trading</Text>
      <TextInput style={styles.input} placeholder="Activation Key" value={key} onChangeText={setKey} />
      <TouchableOpacity style={styles.button} onPress={activate}><Text style={styles.buttonText}>Activate</Text></TouchableOpacity>
      <Text style={styles.note}>Demo keys: 7214125 (trial) | Majafar-786 (full)</Text>
    </View>
  );
}

function DashboardScreen({ navigation }) {
  const [balance, setBalance] = useState('PKR 1,250,000');
  const [pnl, setPnl] = useState('+4,200 PKR');
  useEffect(()=>{ (async ()=>{ const b = await AsyncStorage.getItem('@balance'); if(b) setBalance(b); })(); },[]);
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <View style={styles.rowSpace}>
        <View><Text style={styles.balance}>{balance}</Text><Text style={styles.small}>{pnl}</Text></View>
        <TouchableOpacity style={styles.smallBtn} onPress={()=>navigation.navigate('Backtest')}><Text style={{color:'#fff'}}>Backtest</Text></TouchableOpacity>
      </View>

      <Text style={styles.section}>Open Trades</Text>
      {[{id:1,pair:'BTC/USDT',side:'BUY',price:46200,pnl:'+2.4%'},{id:2,pair:'ETH/USDT',side:'SELL',price:3200,pnl:'-0.6%'}].map(t=>(
        <TouchableOpacity key={t.id} style={styles.tradeCard} onPress={()=>navigation.navigate('Chart',{trade:t})}>
          <Text style={styles.tradePair}>{t.pair}</Text>
          <View style={styles.rowSpace}><Text style={styles.small}>{t.side}</Text><Text style={styles.small}>{t.price}</Text><Text style={styles.small}>{t.pnl}</Text></View>
        </TouchableOpacity>
      ))}

      <View style={{marginTop:16}}>
        <TouchableOpacity style={styles.menuButton} onPress={()=>navigation.navigate('CopyTrading')}><Text style={styles.menuText}>Copy Trading</Text></TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={()=>navigation.navigate('Logs')}><Text style={styles.menuText}>Logs</Text></TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={()=>navigation.navigate('Settings')}><Text style={styles.menuText}>Settings</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function TradeChartScreen({ route }) {
  const trade = route.params?.trade;
  const [timeframe, setTimeframe] = useState('M15');
  const [sma, setSma] = useState(true);
  const [rsi, setRsi] = useState(false);
  const [autoTrade, setAutoTrade] = useState(false);

  const data = {
    labels: ['09:00','10:00','11:00','12:00','13:00','14:00'],
    datasets: [
      { data: [46000,46120,46080,46200,46150,46300], strokeWidth: 2 }
    ]
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{trade?.pair || 'Chart'}</Text>
      <LineChart
        data={data}
        width={screenWidth}
        height={220}
        withDots={true}
        chartConfig={chartConfig}
        bezier
        style={{borderRadius:12}}
      />
      <Text style={{color:'#9aa4c4',marginTop:8}}>Forecast upper: 47,000  lower: 45,800</Text>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.ctrlBtn}><Text style={styles.ctrlText}>SMA: {sma? 'ON':'OFF'}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.ctrlBtn}><Text style={styles.ctrlText}>RSI: {rsi? 'ON':'OFF'}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.ctrlBtn}><Text style={styles.ctrlText}>TF: {timeframe}</Text></TouchableOpacity>
      </View>

      <View style={{flexDirection:'row',marginTop:12,flexWrap:'wrap'}}>
        {['M1','M5','M15','M30','H1','H4','D1','W1','Monthly'].map(tf=>(
          <TouchableOpacity key={tf} onPress={()=>setTimeframe(tf)} style={[styles.tfBtn, timeframe===tf && styles.tfActive]}><Text style={{color:'#fff'}}>{tf}</Text></TouchableOpacity>
        ))}
      </View>

      <View style={{flexDirection:'row',alignItems:'center',marginTop:12}}>
        <Text style={{color:'#fff',marginRight:8}}>Auto-Trade</Text>
        <Switch value={autoTrade} onValueChange={setAutoTrade} />
      </View>

      <TouchableOpacity style={{marginTop:16,backgroundColor:'#1e90ff',padding:12,borderRadius:8}} onPress={()=>Alert.alert('Order','Mock order executed (demo)')}><Text style={{color:'#fff'}}>Place Mock Order</Text></TouchableOpacity>
    </ScrollView>
  );
}

function BacktestScreen(){
  const [symbol,setSymbol]=useState('BTC/USDT');
  const [from,setFrom]=useState('2025-01-01');
  const [to,setTo]=useState('2025-09-01');
  const [result,setResult]=useState(null);
  const run = ()=> setResult({trades:120,winRate:'62%',profit:'+14.6%'});
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Backtest</Text>
      <Text style={styles.small}>Symbol</Text>
      <TextInput style={styles.input} value={symbol} onChangeText={setSymbol} />
      <Text style={styles.small}>From</Text>
      <TextInput style={styles.input} value={from} onChangeText={setFrom} />
      <Text style={styles.small}>To</Text>
      <TextInput style={styles.input} value={to} onChangeText={setTo} />
      <TouchableOpacity style={styles.button} onPress={run}><Text style={styles.buttonText}>Run Backtest</Text></TouchableOpacity>
      {result && <View style={{marginTop:12,backgroundColor:'#071029',padding:12,borderRadius:8}}><Text style={{color:'#9be7a5'}}>Trades: {result.trades}</Text><Text style={{color:'#fff'}}>Win rate: {result.winRate}</Text><Text style={{color:'#fff'}}>Profit: {result.profit}</Text></View>}
    </ScrollView>
  );
}

function CopyTradingScreen(){
  const presets = ['Conservative','Balanced','Aggressive'];
  const [active,setActive]=useState('Balanced');
  const exportTemplate = ()=> Alert.alert('Export','Template exported (demo)');
  const importTemplate = ()=> Alert.alert('Import','Template imported (demo)');
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Copy Trading</Text>
      {presets.map(p=>(<TouchableOpacity key={p} style={[styles.preset, active===p && styles.active]} onPress={()=>setActive(p)}><Text style={{color:'#fff'}}>{p}</Text></TouchableOpacity>))}
      <TouchableOpacity style={styles.button} onPress={exportTemplate}><Text style={styles.buttonText}>Export Template</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.button,{backgroundColor:'#6b7280'}]} onPress={importTemplate}><Text style={styles.buttonText}>Import Template</Text></TouchableOpacity>
    </ScrollView>
  );
}

function LogsScreen(){ 
  const logs = ['2025-09-18 10:23: Bought BTC/USDT 0.01 @46200','2025-09-18 11:05: Sold EUR/USD 0.5 @1.0823','2025-09-18 12:00: Backtest completed (BTC)'];
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Logs</Text>
      {logs.map((l,i)=>(<Text key={i} style={{color:'#fff',marginBottom:8}}>{l}</Text>))}
      <TouchableOpacity style={[styles.button,{marginTop:12}]} onPress={()=>Alert.alert('Export','Logs exported (demo)')}><Text style={styles.buttonText}>Export Logs</Text></TouchableOpacity>
    </ScrollView>
  );
}

function SettingsScreen(){ 
  const [telegram,setTelegram]=useState(false);
  const [gmail,setGmail]=useState('jafarhussainreti786@gmail.com');
  useEffect(()=>{(async ()=>{ const t = await AsyncStorage.getItem('@telegram_enabled'); const g = await AsyncStorage.getItem('@gmail'); if(t) setTelegram(t==='true'); if(g) setGmail(g); })();},[]);
  const save = async ()=>{ await AsyncStorage.setItem('@telegram_enabled', String(telegram)); await AsyncStorage.setItem('@gmail', gmail); Alert.alert('Saved','Settings saved (demo)'); };
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}><Text style={{color:'#fff'}}>Telegram Alerts</Text><Switch value={telegram} onValueChange={setTelegram} /></View>
      <Text style={{color:'#fff',marginTop:12}}>Gmail for alerts</Text>
      <TextInput value={gmail} onChangeText={setGmail} style={styles.input} />
      <TouchableOpacity style={styles.button} onPress={save}><Text style={styles.buttonText}>Save</Text></TouchableOpacity>
    </ScrollView>
  );
}

export default function App(){ 
  const [loading,setLoading]=useState(true);
  const [activated,setActivated]=useState(false);
  useEffect(()=>{ (async ()=>{ const k = await AsyncStorage.getItem('activationKey'); if(k==='7214125' || k==='Majafar-786') setActivated(true); setLoading(false); })(); },[]);
  if(loading) return <View style={styles.container}><Text style={{color:'#fff'}}>Loading...</Text></View>;
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={activated? 'Dashboard':'Activation'} screenOptions={{headerShown:true}}>
        <Stack.Screen name="Activation" component={ActivationScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Chart" component={TradeChartScreen} />
        <Stack.Screen name="ChartOld" component={TradeChartScreen} />
        <Stack.Screen name="Backtest" component={BacktestScreen} />
        <Stack.Screen name="CopyTrading" component={CopyTradingScreen} />
        <Stack.Screen name="Logs" component={LogsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#0b1226',
  backgroundGradientTo: '#0b1226',
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(154,164,196, ${opacity})`,
  propsForDots: { r: '4', strokeWidth: '1' },
};

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0b1226',padding:20},
  title:{fontSize:22,fontWeight:'bold',color:'#fff',marginBottom:10},
  input:{backgroundColor:'#fff',padding:10,marginVertical:10,borderRadius:8},
  button:{backgroundColor:'#1e90ff',padding:12,borderRadius:8,marginTop:10},
  buttonText:{color:'#fff',textAlign:'center'},
  note:{color:'#9aa4c4',marginTop:12,fontSize:12},
  balance:{fontSize:18,color:'#9be7a5',marginBottom:4},
  small:{color:'#d7e0ff'},
  smallBtn:{backgroundColor:'#123',padding:8,borderRadius:8,alignSelf:'flex-start'},
  section:{color:'#fff',marginTop:12,fontSize:16,marginBottom:8},
  tradeCard:{backgroundColor:'#0f2136',padding:12,borderRadius:10,marginBottom:10},
  tradePair:{color:'#fff',fontWeight:'700',marginBottom:6},
  rowSpace:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  menuButton:{backgroundColor:'#0f2136',padding:12,borderRadius:8,marginVertical:6},
  menuText:{color:'#fff',textAlign:'center'},
  controls:{flexDirection:'row',marginTop:12,justifyContent:'space-between'},
  ctrlBtn:{backgroundColor:'#0f2136',padding:10,borderRadius:8,flex:1,marginRight:8,alignItems:'center'},
  ctrlText:{color:'#fff'},
  tfBtn:{padding:8,marginRight:8,backgroundColor:'#123',borderRadius:6,marginTop:8},
  tfActive:{backgroundColor:'#1e90ff'},
  preset:{padding:12,backgroundColor:'#0f2136',borderRadius:8,marginTop:8},
  active:{borderColor:'#1e90ff',borderWidth:1}
});

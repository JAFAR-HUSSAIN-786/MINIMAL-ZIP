import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Switch, Alert, Dimensions, Clipboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LineChart } from 'react-native-chart-kit';

const Stack = createNativeStackNavigator();
const screenWidth = Dimensions.get('window').width - 40;

// ---------- Utility (mock implementations) ----------
const demoTrades = [
  { id: '1', pair: 'BTC/USDT', side: 'BUY', price: 46200, pnl: '+2.4%' },
  { id: '2', pair: 'ETH/USDT', side: 'SELL', price: 3200, pnl: '-0.6%' }
];

const ACTIVATION_KEYS = {
  '7214125': { type: 'trial', days: 30 },
  'Majafar-786': { type: 'full', days: 36500 }
};

async function saveLog(msg) {
  const raw = await AsyncStorage.getItem('@logs') || '[]';
  const arr = JSON.parse(raw);
  arr.unshift(`${new Date().toISOString()} - ${msg}`);
  await AsyncStorage.setItem('@logs', JSON.stringify(arr.slice(0, 200))); // keep last 200
}

// ---------- Activation Screen ----------
function ActivationScreen({ navigation }) {
  const [key, setKey] = useState('');
  const [expiryDays, setExpiryDays] = useState('1-month');

  const activate = async () => {
    if (!(key in ACTIVATION_KEYS)) {
      Alert.alert('Invalid key', 'Please enter a valid activation key.');
      return;
    }
    const meta = ACTIVATION_KEYS[key];
    // compute expiry based on chosen option
    const map = { '1-month': 30, '3-months': 90, 'lifetime': 36500 };
    const days = map[expiryDays] || meta.days;
    const expiryTs = Date.now() + days * 24 * 3600 * 1000;

    await AsyncStorage.setItem('@activated', 'true');
    await AsyncStorage.setItem('@activation_key', key);
    await AsyncStorage.setItem('@activation_expiry', String(expiryTs));
    await saveLog(`Activated with key ${key} (${meta.type})`);
    navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
  };

  return (
    <View style={styles.containerCentered}>
      <Text style={styles.title}>Activate Jafar Trading</Text>
      <TextInput style={styles.input} placeholder="Activation key" value={key} onChangeText={setKey} />
      <View style={{ flexDirection: 'row', marginTop: 8 }}>
        <TouchableOpacity style={[styles.badge, expiryDays === '1-month' && styles.badgeActive]} onPress={() => setExpiryDays('1-month')}>
          <Text style={styles.badgeText}>1-month</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.badge, expiryDays === '3-months' && styles.badgeActive]} onPress={() => setExpiryDays('3-months')}>
          <Text style={styles.badgeText}>3-months</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.badge, expiryDays === 'lifetime' && styles.badgeActive]} onPress={() => setExpiryDays('lifetime')}>
          <Text style={styles.badgeText}>Lifetime</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={activate}><Text style={styles.buttonText}>Activate</Text></TouchableOpacity>
      <Text style={styles.note}>Demo keys: 7214125 (trial), Majafar-786 (full)</Text>
    </View>
  );
}

// ---------- Dashboard ----------
function DashboardScreen({ navigation }) {
  const [balancePKR, setBalancePKR] = useState('PKR 1,250,000');
  const [pnl, setPnl] = useState('+4,200 PKR');

  useEffect(() => {
    (async () => {
      const b = await AsyncStorage.getItem('@balancePKR');
      if (b) setBalancePKR(b);
    })();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Jafar Trading - Dashboard</Text>

      <View style={styles.rowSpace}>
        <View>
          <Text style={styles.balance}>{balancePKR}</Text>
          <Text style={styles.small}>{pnl}</Text>
        </View>
        <TouchableOpacity style={styles.smallBtn} onPress={() => navigation.navigate('Settings')}>
          <Text style={{ color: '#fff' }}>Settings</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.section}>Open Trades</Text>
      {demoTrades.map(t => (
        <TouchableOpacity key={t.id} style={styles.tradeCard} onPress={() => navigation.navigate('Chart', { trade: t })}>
          <Text style={styles.tradePair}>{t.pair}</Text>
          <View style={styles.rowSpace}><Text style={styles.small}>{t.side}</Text><Text style={styles.small}>{t.price}</Text><Text style={styles.small}>{t.pnl}</Text></View>
        </TouchableOpacity>
      ))}

      <Text style={styles.section}>Quick Actions</Text>
      <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Chart')}>
        <Text style={styles.menuText}>Open Chart</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Backtest')}>
        <Text style={styles.menuText}>Backtest</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('CopyTrading')}>
        <Text style={styles.menuText}>Copy Trading</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Logs')}>
        <Text style={styles.menuText}>Logs</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ---------- Chart Screen (mock + indicators UI) ----------
function ChartScreen({ route }) {
  const trade = route.params?.trade;
  const [timeframe, setTimeframe] = useState('M15');
  const [indicators, setIndicators] = useState({
    SMA: true, RSI: false, MACD: false, Alligator: false
  });
  const [autoTrade, setAutoTrade] = useState(false);
  const [trendline, setTrendline] = useState(true);
  const [supplyDemand, setSupplyDemand] = useState(true);

  const data = {
    labels: ['09:00','10:00','11:00','12:00','13:00','14:00'],
    datasets: [{ data: [46000,46120,46080,46200,46150,46300] }]
  };

  const toggleIndicator = (k) => setIndicators(prev => ({ ...prev, [k]: !prev[k] }));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{trade?.pair || 'Chart'}</Text>

      <LineChart
        data={data}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={{ borderRadius: 12 }}
      />

      <Text style={{ color: '#9aa4c4', marginTop: 8 }}>Forecast upper: 47,000  lower: 45,800</Text>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.ctrlBtn} onPress={() => toggleIndicator('SMA')}><Text style={styles.ctrlText}>SMA: {indicators.SMA ? 'ON' : 'OFF'}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.ctrlBtn} onPress={() => toggleIndicator('RSI')}><Text style={styles.ctrlText}>RSI: {indicators.RSI ? 'ON' : 'OFF'}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.ctrlBtn} onPress={() => toggleIndicator('MACD')}><Text style={styles.ctrlText}>MACD: {indicators.MACD ? 'ON' : 'OFF'}</Text></TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
        {['M1','M5','M15','M30','H1','H4','D1','W1','Monthly'].map(tf => (
          <TouchableOpacity key={tf} onPress={() => setTimeframe(tf)} style={[styles.tfBtn, timeframe === tf && styles.tfActive]}>
            <Text style={{ color: '#fff' }}>{tf}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ marginTop: 12 }}>
        <View style={styles.rowSpace}>
          <Text style={{ color: '#fff' }}>Auto-Trade</Text>
          <Switch value={autoTrade} onValueChange={setAutoTrade} />
        </View>
        <View style={styles.rowSpace}>
          <Text style={{ color: '#fff' }}>Auto Trendline</Text>
          <Switch value={trendline} onValueChange={setTrendline} />
        </View>
        <View style={styles.rowSpace}>
          <Text style={{ color: '#fff' }}>Auto Supply/Demand</Text>
          <Switch value={supplyDemand} onValueChange={setSupplyDemand} />
        </View>
      </View>

      <TouchableOpacity style={[styles.button, { marginTop: 16 }]} onPress={() => { saveLog('Placed mock order'); Alert.alert('Mock order', 'Order placed (demo).'); }}>
        <Text style={styles.buttonText}>Place Mock Order</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ---------- Backtest ----------
function BacktestScreen() {
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [from, setFrom] = useState('2025-01-01');
  const [to, setTo] = useState('2025-09-01');
  const [result, setResult] = useState(null);

  const runBacktest = async () => {
    // mock heavy computation
    setResult({ trades: 120, winRate: '62%', profit: '+14.6%' });
    await saveLog(`Backtest run for ${symbol} from ${from} to ${to}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Backtest</Text>
      <TextInput style={styles.input} value={symbol} onChangeText={setSymbol} />
      <TextInput style={styles.input} value={from} onChangeText={setFrom} />
      <TextInput style={styles.input} value={to} onChangeText={setTo} />
      <TouchableOpacity style={styles.button} onPress={runBacktest}><Text style={styles.buttonText}>Run Backtest</Text></TouchableOpacity>
      {result && <View style={{ marginTop: 12, backgroundColor: '#071029', padding: 12, borderRadius: 8 }}>
        <Text style={{ color: '#9be7a5' }}>Trades: {result.trades}</Text>
        <Text style={{ color: '#fff' }}>Win rate: {result.winRate}</Text>
        <Text style={{ color: '#fff' }}>Profit: {result.profit}</Text>
      </View>}
    </ScrollView>
  );
}

// ---------- Copy Trading ----------
function CopyTradingScreen() {
  const presets = ['Conservative', 'Balanced', 'Aggressive'];
  const [active, setActive] = useState('Balanced');
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('@templates') || '[]';
      setTemplates(JSON.parse(raw));
    })();
  }, []);

  const saveTemplate = async () => {
    const obj = { name: `Template ${new Date().toISOString()}`, preset: active };
    const raw = await AsyncStorage.getItem('@templates') || '[]';
    const arr = JSON.parse(raw);
    arr.unshift(obj);
    await AsyncStorage.setItem('@templates', JSON.stringify(arr.slice(0, 20)));
    setTemplates(arr);
    await saveLog(`Saved template ${obj.name}`);
    Alert.alert('Saved', 'Template saved locally (demo).');
  };

  const exportTemplate = (t) => {
    Clipboard.setString(JSON.stringify(t));
    Alert.alert('Export', 'Template JSON copied to clipboard (demo).');
  };

  const importTemplate = async () => {
    const clipboard = await Clipboard.getString();
    try {
      const obj = JSON.parse(clipboard);
      const raw = await AsyncStorage.getItem('@templates') || '[]';
      const arr = JSON.parse(raw);
      arr.unshift(obj);
      await AsyncStorage.setItem('@templates', JSON.stringify(arr.slice(0, 20)));
      setTemplates(arr);
      Alert.alert('Imported', 'Template imported from clipboard (demo).');
    } catch (e) {
      Alert.alert('Error', 'Clipboard does not contain valid template JSON.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Copy Trading</Text>
      <Text style={{ color: '#fff' }}>Select preset</Text>
      {presets.map(p => <TouchableOpacity key={p} style={[styles.preset, active === p && styles.active]} onPress={() => setActive(p)}><Text style={{ color: '#fff' }}>{p}</Text></TouchableOpacity>)}
      <TouchableOpacity style={styles.button} onPress={saveTemplate}><Text style={styles.buttonText}>Save Template</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: '#6b7280' }]} onPress={importTemplate}><Text style={styles.buttonText}>Import Template (from clipboard)</Text></TouchableOpacity>
      <Text style={{ color: '#fff', marginTop: 12 }}>Saved templates (local)</Text>
      {templates.map((t, i) => <View key={i} style={{ backgroundColor: '#071029', padding: 10, marginTop: 8 }}>
        <Text style={{ color: '#fff' }}>{t.name} — {t.preset}</Text>
        <TouchableOpacity style={[styles.button, { marginTop: 8 }]} onPress={() => exportTemplate(t)}><Text style={styles.buttonText}>Export (copy JSON)</Text></TouchableOpacity>
      </View>)}
    </ScrollView>
  );
}

// ---------- Logs ----------
function LogsScreen() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const load = async () => {
      const raw = await AsyncStorage.getItem('@logs') || '[]';
      setLogs(JSON.parse(raw));
    };
    const unsub = load;
    unsub();
  }, []);

  const exportLogs = async () => {
    const raw = await AsyncStorage.getItem('@logs') || '[]';
    Clipboard.setString(raw);
    Alert.alert('Exported', 'Logs copied to clipboard (demo).');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Logs</Text>
      {logs.length === 0 ? <Text style={{ color: '#9aa4c4' }}>No logs yet.</Text> : logs.map((l, i) => <Text key={i} style={{ color: '#fff', marginBottom: 6 }}>{l}</Text>)}
      <TouchableOpacity style={[styles.button, { marginTop: 12 }]} onPress={exportLogs}><Text style={styles.buttonText}>Export Logs</Text></TouchableOpacity>
    </ScrollView>
  );
}

// ---------- Settings ----------
function SettingsScreen() {
  const [telegram, setTelegram] = useState(false);
  const [gmail, setGmail] = useState('jafarhussainreti786@gmail.com');
  const [pkr, setPkr] = useState('1250000');

  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem('@telegram_enabled');
      const g = await AsyncStorage.getItem('@gmail');
      const b = await AsyncStorage.getItem('@balancePKR');
      if (t) setTelegram(t === 'true');
      if (g) setGmail(g);
      if (b) setPkr(b);
    })();
  }, []);

  const save = async () => {
    await AsyncStorage.setItem('@telegram_enabled', String(telegram));
    await AsyncStorage.setItem('@gmail', gmail);
    await AsyncStorage.setItem('@balancePKR', pkr);
    await saveLog('Settings saved');
    Alert.alert('Saved', 'Settings saved locally (demo).');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.rowSpace}>
        <Text style={{ color: '#fff' }}>Telegram alerts</Text>
        <Switch value={telegram} onValueChange={setTelegram} />
      </View>
      <Text style={{ color: '#fff', marginTop: 12 }}>Gmail for alerts</Text>
      <TextInput style={styles.input} value={gmail} onChangeText={setGmail} />
      <Text style={{ color: '#fff', marginTop: 12 }}>Balance (PKR)</Text>
      <TextInput style={styles.input} value={pkr} onChangeText={setPkr} keyboardType="numeric" />
      <TouchableOpacity style={styles.button} onPress={save}><Text style={styles.buttonText}>Save Settings</Text></TouchableOpacity>
    </ScrollView>
  );
}

// ---------- App root ----------
export default function App() {
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    (async () => {
      const activated = await AsyncStorage.getItem('@activated');
      setInitial(activated === 'true' ? 'Dashboard' : 'Activation');
    })();
  }, []);

  if (!initial) {
    return <View style={styles.containerCentered}><Text style={{ color: '#fff' }}>Loading...</Text></View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initial} screenOptions={{ headerStyle: { backgroundColor: '#071029' }, headerTintColor: '#fff' }}>
        <Stack.Screen name="Activation" component={ActivationScreen} options={{ title: 'Activate' }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
        <Stack.Screen name="Chart" component={ChartScreen} options={{ title: 'Chart' }} />
        <Stack.Screen name="Backtest" component={BacktestScreen} options={{ title: 'Backtest' }} />
        <Stack.Screen name="CopyTrading" component={CopyTradingScreen} options={{ title: 'Copy Trading' }} />
        <Stack.Screen name="Logs" component={LogsScreen} options={{ title: 'Logs' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ---------- Chart config & styles ----------
const chartConfig = {
  backgroundGradientFrom: '#0b1226',
  backgroundGradientTo: '#0b1226',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(99, 255, 132, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(154,164,196, ${opacity})`,
  propsForDots: { r: '4', strokeWidth: '1', stroke: '#fff' }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1226', padding: 20 },
  containerCentered: { flex: 1, backgroundColor: '#0b1226', padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, color: '#fff', fontWeight: '700', marginBottom: 12 },
  input: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginTop: 8 },
  button: { backgroundColor: '#1e90ff', padding: 12, borderRadius: 8, marginTop: 12 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  badge: { backgroundColor: '#123', padding: 8, marginRight: 8, borderRadius: 6 },
  badgeActive: { backgroundColor: '#1e90ff' },
  badgeText: { color: '#fff' },
  note: { color: '#9aa4c4', marginTop: 8 },
  balance: { color: '#9be7a5', fontWeight: '700', fontSize: 18 },
  small: { color: '#d7e0ff' },
  tradeCard: { backgroundColor: '#0f2136', padding: 12, borderRadius: 10, marginBottom: 10 },
  tradePair: { color: '#fff', fontWeight: '700', marginBottom: 6 },
  rowSpace: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  smallBtn: { backgroundColor: '#123', padding: 8, borderRadius: 8 },
  section: { color: '#fff', fontSize: 16, marginTop: 14, marginBottom: 8 },
  menuButton: { backgroundColor: '#0f2136', padding: 12, borderRadius: 8, marginTop: 8 },
  menuText: { color: '#fff', textAlign: 'center' },
  controls: { flexDirection: 'row', marginTop: 12, justifyContent: 'space-between' },
  ctrlBtn: { backgroundColor: '#0f2136', padding: 10, borderRadius: 8, flex: 1, marginRight: 8, alignItems: 'center' },
  ctrlText: { color: '#fff' },
  tfBtn: { padding: 8, marginRight: 8, backgroundColor: '#123', borderRadius: 6, marginTop: 8 },
  tfActive: { backgroundColor: '#1e90ff' },
  preset: { padding: 12, backgroundColor: '#0f2136', borderRadius: 8, marginTop: 8 },
  active: { borderColor: '#1e90ff', borderWidth: 1 }
});
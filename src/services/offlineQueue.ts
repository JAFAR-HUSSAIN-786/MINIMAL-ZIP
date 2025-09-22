import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {makeLocalTrade} from './tradeModel';
import axios from 'axios';
const QUEUE_KEY='JB_QUEUE_V1';
export async function enqueueTrade(payload){
  const t = makeLocalTrade(payload);
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  const arr = raw?JSON.parse(raw):[];
  arr.push(t);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(arr));
  const state = await NetInfo.fetch();
  if(state.isConnected) try{ await axios.post('http://localhost:4000/api/trades/sync', [t]); }catch(e){ console.log('sync fail',e.message); }
  return t;
}
export async function listLocalTrades(){ const raw=await AsyncStorage.getItem(QUEUE_KEY); return raw?JSON.parse(raw):[];}

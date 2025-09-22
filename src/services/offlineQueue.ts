import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {makeLocalTrade} from './tradeModel';
import axios from 'axios';
import {applyCompounding} from './compounding';
import {saveAccount,getAccountOverview} from './account';
const QUEUE_KEY='JB_QUEUE_V1';
let syncing=false;
export async function enqueueTrade(payload){
  const trade=makeLocalTrade(payload);
  const raw=await AsyncStorage.getItem(QUEUE_KEY);
  const arr=raw?JSON.parse(raw):[];
  arr.push(trade);
  await AsyncStorage.setItem(QUEUE_KEY,JSON.stringify(arr));
  const state=await NetInfo.fetch();
  if(state.isConnected){ syncQueuedTrades().catch(e=>console.log('sync err',e)); }
  return trade;
}
export async function listLocalTrades(){const raw=await AsyncStorage.getItem(QUEUE_KEY);return raw?JSON.parse(raw):[];}
export async function syncQueuedTrades(){
  if(syncing) return;
  syncing=true;
  try{
    const raw=await AsyncStorage.getItem(QUEUE_KEY);
    const arr=raw?JSON.parse(raw):[];
    if(arr.length===0) return;
    const resp=await axios.post('http://localhost:4000/api/trades/sync',arr,{timeout:5000});
    const confirmations=Array.isArray(resp.data)?resp.data:[];
    const remaining=[];
    let account=await getAccountOverview();
    for(const t of confirmations){
      if(t.status==='EXECUTED'){
        const profitPercent=t.profitPercent||5;
        const newBal=applyCompounding(account.balancePKR,profitPercent);
        account.balancePKR=newBal;
        account.equityPKR=newBal;
        account.trades=(account.trades||0)+1;
      } else { remaining.push(t.localId?{localId:t.localId,status:'FAILED'}:{}); }
    }
    await saveAccount(account);
    await AsyncStorage.setItem(QUEUE_KEY,JSON.stringify(remaining));
    return confirmations;
  }catch(e){ console.log('sync error',e.message||e); throw e; } finally{ syncing=false; }
}
NetInfo.addEventListener(state=>{ if(state.isConnected) syncQueuedTrades().catch(e=>console.log('bg sync err',e)); });

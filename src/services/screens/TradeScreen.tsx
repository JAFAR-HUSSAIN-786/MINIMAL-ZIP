import React,{useState} from 'react';
import {View,Text,TextInput,Button} from 'react-native';
import {enqueueTrade} from '../services/offlineQueue';
export default function TradeScreen(){const [size,setSize]=useState('0.01');return (<View style={{padding:20}}><Text>Place Trade</Text><TextInput value={size} onChangeText={setSize} style={{borderWidth:1,padding:8,marginTop:8}}/></View>);} 

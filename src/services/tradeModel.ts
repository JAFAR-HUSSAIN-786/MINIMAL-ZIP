export function makeLocalTrade({pair,side,size}){return {localId:'q_'+Date.now(),pair,side,size,status:'QUEUED',createdAt:new Date().toISOString()};}

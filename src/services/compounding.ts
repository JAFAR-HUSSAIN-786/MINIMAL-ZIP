export function applyCompounding(balancePKR, profitPercent){const profit=Math.round((balancePKR*(profitPercent/100))*100)/100;return Math.round((balancePKR+profit)*100)/100;}

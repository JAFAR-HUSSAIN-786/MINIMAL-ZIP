export function applyCompounding(balancePKR, profitPercent){ const profit = Math.round(balancePKR * (profitPercent/100)); return balancePKR + profit; }

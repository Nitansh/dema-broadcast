import requests
import json

RENDER_BACKEND_URL = 'https://movingaverage-sh7s.onrender.com'
APP_FRONTEND_URL = 'https://moving-average-alpha.vercel.app'

print('Fetching scanned stocks from backend...')
r = requests.get(f'{RENDER_BACKEND_URL}/api/scan/results', timeout=30)
stocks = r.json()
print(f'Total stocks in universe: {len(stocks)}')

# 1. Filter: Turnover >= 350 Cr
cands_350cr = []
for s in stocks:
    p = s.get('price') or 0.0
    vol = s.get('volume') or 0
    turnover_cr = round((vol * p) / 10000000.0, 2)
    s['turnover_cr'] = turnover_cr
    if turnover_cr >= 350.0:
        cands_350cr.append(s)

print(f'Stocks with Turnover >= 350 Cr: {len(cands_350cr)}')

# 2. Filter: Live Price above ALL DEMA averages (20, 50, 100, 200)
above_all_demas = []
for s in cands_350cr:
    p = s.get('price') or 0.0
    d20 = s.get('DMA_20')
    d50 = s.get('DMA_50')
    d100 = s.get('DMA_100')
    d200 = s.get('DMA_200')
    
    # Check if price > all available DEMAs
    demas = [d for d in [d20, d50, d100, d200] if d is not None and d > 0]
    if len(demas) >= 3: # at least 20, 50, 100 present
        if all(p > d for d in demas):
            s['demas_checked'] = len(demas)
            above_all_demas.append(s)

print(f'Stocks above ALL DEMA averages: {len(above_all_demas)}')

# 3. Fetch Volume Profile Footprints (Month & Week)
symbols = [s['symbol'] for s in above_all_demas]
print(f'Fetching footprint levels for {len(symbols)} candidates...')

for period in ['month', 'week']:
    print(f'\n--- EVALUATING PERIOD: {period.upper()} ---')
    params = {'symbols': ','.join(symbols[:150]), 'period': period}
    try:
        resp = requests.get(f'{RENDER_BACKEND_URL}/api/stocks/batch-footprint', params=params, timeout=25)
        va_levels = resp.json().get('levels', {}) if resp.status_code == 200 else {}
    except Exception as e:
        print(f'Error fetching {period} footprint: {e}')
        va_levels = {}

    matches = []
    for s in above_all_demas:
        sym = s['symbol']
        p = s.get('price') or 0.0
        lvl = va_levels.get(sym) or va_levels.get(f'{sym}.NS') or {}
        
        vah = lvl.get('vah')
        poc = lvl.get('poc') or lvl.get('pocPrice')
        val = lvl.get('val')
        
        # Test proximity for POC, VAH, VAL
        proximity_hits = []
        for name, val_price in [('POC', poc), ('VAH', vah), ('VAL', val)]:
            if val_price and val_price > 0:
                delta = p - val_price
                delta_pct = abs(delta) / val_price * 100.0
                if delta_pct <= 0.5: # within 0.5% range
                    proximity_hits.append({
                        'level_name': name,
                        'level_price': val_price,
                        'delta': round(delta, 2),
                        'delta_pct': round(delta_pct, 3),
                        'position': 'ABOVE' if delta >= 0 else 'BELOW'
                    })
        
        if proximity_hits:
            s_copy = dict(s)
            s_copy['vah'] = vah
            s_copy['poc'] = poc
            s_copy['val'] = val
            s_copy['hits'] = proximity_hits
            matches.append(s_copy)
    
    print(f'Matches within 0.5% of POC/VAH/VAL ({period.upper()}): {len(matches)}')
    for m in matches:
        hit_str = ', '.join([f"{h['level_name']} ₹{h['level_price']} ({h['delta_pct']}% {h['position']})" for h in m['hits']])
        print(f"  • {m['symbol']}: CMP ₹{m['price']} | Turnover: ₹{m['turnover_cr']} Cr | DEMAs: 20D={m.get('DMA_20')}, 50D={m.get('DMA_50')}, 100D={m.get('DMA_100')}, 200D={m.get('DMA_200')} | In Range: [{hit_str}] | URL: {APP_FRONTEND_URL}/stock/{m['symbol']}")

# Also let's inspect proximity up to 1.0% or 2.0% just to see what nearby high-turnover stocks exist
print('\n--- ALL CANDIDATES ABOVE DEMAs WITH TURNOVER >= 350 CR (AND THEIR CLOSEST VP LEVELS) ---')
params = {'symbols': ','.join(symbols[:150]), 'period': 'month'}
resp = requests.get(f'{RENDER_BACKEND_URL}/api/stocks/batch-footprint', params=params, timeout=25)
month_lvls = resp.json().get('levels', {}) if resp.status_code == 200 else {}
for s in above_all_demas:
    sym = s['symbol']
    p = s.get('price') or 0.0
    lvl = month_lvls.get(sym) or month_lvls.get(f'{sym}.NS') or {}
    vah = lvl.get('vah')
    poc = lvl.get('poc') or lvl.get('pocPrice')
    val = lvl.get('val')
    deltas = []
    for name, v in [('VAL', val), ('POC', poc), ('VAH', vah)]:
        if v:
            dp = abs(p - v) / v * 100.0
            pos = 'ABOVE' if p >= v else 'BELOW'
            deltas.append(f"{name} ₹{v} (Δ {dp:.2f}% {pos})")
    print(f"{sym:<12}: CMP ₹{p:<8} | Turnover ₹{s['turnover_cr']} Cr | {', '.join(deltas)}")

import { useState, useEffect } from 'react';
import type { SalesRow } from './mockData';

// ─── Public state shape ────────────────────────────────────
export interface ExcelDataState {
  loading: boolean;
  error: string | null;
  mayRows: SalesRow[];
  aprRows: SalesRow[];
  refetch: () => void;
}

function genDemo(which: 'may' | 'apr'): SalesRow[] {
  const depots = [
    'ARUSHA',
    'MOSHI',
    'DAR',
    'KARATU',
    'SINGIDA',
    'MBEYA',
    'MWANZA',
    'SAME',
    'BABATI',
    'TARAKEA',
    'NZEGA',
    'MERERANI',
    'TERRAT',
    'DODOMA',
    'TANGA',
    'KATESH',
    'KITETO',
  ];
  const coords = ['Baraka', 'Livin Olotu', 'Godfrey Amani', 'Shafi Ur Rahman'];
  const sups = [
    'Beatrice Urio',
    'Hamza Ally',
    'Kamazima Brighton Lugangila',
    'Mandela Kullaya Daffi',
    'Beston E. Naftal',
    'Frank Robert Mushi',
    'George Josiah Mchome',
    'Rachel Kissota',
  ];
  const brands = [
    'COKE',
    'FANTA',
    'KILIMANJARO',
    'KREST',
    'NOVIDA',
    'SPARLETTA',
    'SPRITE',
    'STONEY',
  ];
  const packs = [
    'PET 500ML',
    'PET 300ML',
    'RGB 350ML',
    'KDW 1.5LTR',
    'KDW 0.5LTR',
    'KDW 1.0LTR',
    'RGB 300ML',
    'RGB 250ML',
    'KDW 18.9 Ltr',
    'KDW 12 Ltr',
  ];
  const skuMap: Record<string, string[]> = {
    COKE: ['Coke 350ml', 'Pet Coke 500ml', 'Coke Pet 300ML'],
    FANTA: ['F/Orange 350ml', 'Pet F/Orange 500ml', 'Fanta Fruit Blast'],
    KILIMANJARO: ['KDW 1500ml', 'KDW 500ml', 'KDW 1000ml'],
    KREST: ['Bitter Lemon 300ml', 'Tonic water 300ml'],
    NOVIDA: ['Novida Pineapple 300ML'],
    SPARLETTA: ['Pinenut 350ml', 'Pet Pinenut 500ml'],
    SPRITE: ['Sprite 350ml', 'Pet Sprite 500ml'],
    STONEY: ['Stoney 350ml', 'Pet Stoney 500ml'],
  };
  const chs = [
    'SHOP',
    'BAR & RESTAURANT',
    'GROCERY',
    'HOTEL',
    'KIOSK',
    'OTHER',
    'FILLING STATION',
  ];
  const cnt = which === 'may' ? 35495 : 35851;
  const baseMs =
    which === 'may'
      ? new Date(2026, 4, 1).getTime()
      : new Date(2026, 3, 1).getTime();

  let seed = which === 'may' ? 42 : 99;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const rows: SalesRow[] = [];
  for (let i = 0; i < cnt; i++) {
    const di = Math.floor(rand() * depots.length);
    const dp = depots[di];
    const br = brands[Math.floor(rand() * brands.length)];
    const skA = skuMap[br] || ['Generic'];
    const sk = skA[Math.floor(rand() * skA.length)];
    const pk = packs[Math.floor(rand() * packs.length)];
    const d = new Date(baseMs + Math.floor(rand() * 26) * 86400000);
    const uc = +(rand() * 14 + 0.5).toFixed(2);
    const pc = +(uc * (0.75 + rand() * 0.2)).toFixed(2);
    const tv = +(uc * (4000 + rand() * 3000)).toFixed(2);
    rows.push({
      Date: d.toISOString().slice(0, 10),
      Depot: dp,
      Coordinator: coords[di % 4],
      Supervisor: sups[di % 8],
      Route: `${dp.slice(0, 3)}${(Math.floor(rand() * 20) + 1).toString().padStart(2, '0')}-${['LION', 'ZEBRA', 'BUFFALO', 'GIRAFFE'][Math.floor(rand() * 4)]}`,
      Salesman: `Salesman ${(i % 158) + 1}`,
      OutletCode: `OUT${1000 + (i % 14037)}`,
      OutletName: `Outlet ${(i % 14037) + 1}`,
      CustomerChannel: chs[Math.floor(rand() * chs.length)],
      Brand: br,
      SKU: sk,
      Pack: pk,
      UC: uc,
      PC: pc,
      TV: tv,
      IsNew: false,
      StrikeRate: +(80 + rand() * 15).toFixed(1),
    });
  }
  return rows;
}

// ─── Hook ──────────────────────────────────────────────────
export function useExcelData(): ExcelDataState {
  const [trigger, setTrigger] = useState(0);
  const [state, setState] = useState<{
    loading: boolean;
    error: string | null;
    mayRows: SalesRow[];
    aprRows: SalesRow[];
  }>({
    loading: true,
    error: null,
    mayRows: [],
    aprRows: [],
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState(s => ({ ...s, loading: true, error: null }));

      const aprRows = genDemo('apr');
      const aprCodes = new Set(aprRows.map(r => r.OutletCode));
      const mayRows = genDemo('may').map(r => ({
        ...r,
        IsNew: !aprCodes.has(r.OutletCode),
      }));

      if (!cancelled) {
        setState({ loading: false, error: null, mayRows, aprRows });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [trigger]);

  return { ...state, refetch: () => setTrigger(t => t + 1) };
}

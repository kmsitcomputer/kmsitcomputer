// ─── RajaOngkir integration layer ───────────────────────────────────────────
// Mode LIVE : apiKey terisi di Integrasi → panggil api.rajaongkir.com/starter
// Mode SIM  : tanpa key / API gagal → dataset provinsi-kota + tarif simulasi
//             berbasis berat & tier jarak dari kota asal.

import type { DB } from "./db";

export interface Province { id: string; name: string; }
export interface City { id: string; provinceId: string; name: string; }
export interface ShippingOption { courier: string; courierName: string; service: string; description: string; cost: number; eta: string; }

export const PROVINCES: Province[] = [
  { id: "1", name: "Bali" }, { id: "2", name: "Bangka Belitung" }, { id: "3", name: "Banten" },
  { id: "4", name: "Bengkulu" }, { id: "5", name: "DI Yogyakarta" }, { id: "6", name: "DKI Jakarta" },
  { id: "7", name: "Gorontalo" }, { id: "8", name: "Jambi" }, { id: "9", name: "Jawa Barat" },
  { id: "10", name: "Jawa Tengah" }, { id: "11", name: "Jawa Timur" }, { id: "12", name: "Kalimantan Barat" },
  { id: "13", name: "Kalimantan Selatan" }, { id: "14", name: "Kalimantan Tengah" }, { id: "15", name: "Kalimantan Timur" },
  { id: "16", name: "Kalimantan Utara" }, { id: "17", name: "Kepulauan Riau" }, { id: "18", name: "Lampung" },
  { id: "19", name: "Maluku" }, { id: "20", name: "Maluku Utara" }, { id: "21", name: "Nanggroe Aceh Darussalam" },
  { id: "22", name: "Nusa Tenggara Barat" }, { id: "23", name: "Nusa Tenggara Timur" }, { id: "24", name: "Papua" },
  { id: "25", name: "Papua Barat" }, { id: "26", name: "Riau" }, { id: "27", name: "Sulawesi Barat" },
  { id: "28", name: "Sulawesi Selatan" }, { id: "29", name: "Sulawesi Tengah" }, { id: "30", name: "Sulawesi Tenggara" },
  { id: "31", name: "Sulawesi Utara" }, { id: "32", name: "Sumatera Barat" }, { id: "33", name: "Sumatera Selatan" },
  { id: "34", name: "Sumatera Utara" },
];

const c = (id: string, provinceId: string, name: string): City => ({ id, provinceId, name });
export const CITIES: City[] = [
  // DKI Jakarta (asal default)
  c("151", "6", "Jakarta Barat"), c("152", "6", "Jakarta Pusat"), c("153", "6", "Jakarta Selatan"), c("154", "6", "Jakarta Timur"), c("155", "6", "Jakarta Utara"),
  // Jawa Barat
  c("22", "9", "Bandung"), c("23", "9", "Bekasi"), c("25", "9", "Bogor"), c("107", "9", "Cimahi"), c("115", "9", "Depok"), c("141", "9", "Karawang"),
  // Banten
  c("473", "3", "Tangerang"), c("474", "3", "Tangerang Selatan"), c("472", "3", "Serang"), c("130", "3", "Cilegon"),
  // Jawa Tengah
  c("399", "10", "Semarang"), c("457", "10", "Surakarta (Solo)"), c("400", "10", "Purwokerto"), c("402", "10", "Kudus"),
  // DI Yogyakarta
  c("501", "5", "Yogyakarta"), c("498", "5", "Sleman"), c("497", "5", "Bantul"),
  // Jawa Timur
  c("501x", "11", "Surabaya"), c("458", "11", "Malang"), c("459", "11", "Sidoarjo"), c("460", "11", "Gresik"),
  // Bali
  c("24", "1", "Denpasar"), c("25b", "1", "Badung"), c("26", "1", "Gianyar"),
  // Sumatera Utara
  c("27", "34", "Medan"), c("28", "34", "Binjai"), c("29", "34", "Deli Serdang"),
  // Sumatera Barat / Selatan / Aceh / Riau / Lampung / Jambi / Bengkulu
  c("30", "32", "Padang"), c("31", "33", "Palembang"), c("32", "21", "Banda Aceh"), c("33", "26", "Pekanbaru"),
  c("34", "18", "Bandar Lampung"), c("35", "8", "Jambi"), c("36", "4", "Bengkulu"),
  // Kalimantan
  c("37", "12", "Pontianak"), c("38", "13", "Banjarmasin"), c("39", "14", "Palangka Raya"), c("40", "15", "Balikpapan"), c("41", "15", "Samarinda"), c("42", "16", "Tarakan"),
  // Sulawesi
  c("43", "27", "Mamuju"), c("44", "28", "Makassar"), c("45", "29", "Palu"), c("46", "30", "Kendari"), c("47", "31", "Manado"), c("48", "7", "Gorontalo"),
  // Nusa Tenggara / Maluku / Papua
  c("49", "22", "Mataram"), c("50", "23", "Kupang"), c("51", "19", "Ambon"), c("52", "20", "Ternate"), c("53", "24", "Jayapura"), c("54", "25", "Manokwari"),
  // Kepulauan
  c("55", "17", "Batam"), c("56", "17", "Tanjung Pinang"), c("57", "2", "Pangkal Pinang"),
];

const COURIER_META: Record<string, { name: string; base: number; services: [string, string, number, string][] }> = {
  jne: { name: "JNE", base: 10000, services: [["REG", "Layanan Reguler", 0, "2-4 hari"], ["YES", "Yakin Esok Sampai", 9000, "1 hari"], ["OKE", "Ongkos Kirim Ekonomis", -3500, "4-7 hari"]] },
  pos: { name: "POS Indonesia", base: 8500, services: [["Paket Kilat Khusus", "Kilat khusus darat-udara", 1500, "2-4 hari"], ["Paket Biasa", "Ekonomis", -2500, "5-9 hari"]] },
  tiki: { name: "TIKI", base: 9500, services: [["REG", "Regular Service", 0, "2-4 hari"], ["ECO", "Economy Service", -3000, "4-8 hari"], ["SDS", "Same Day Service", 12000, "1 hari"]] },
};

// Tier jarak dari DKI Jakarta (0 = Jabodetabek, 4 = terjauh)
const TIER: Record<string, number> = {
  "6": 0, "9": 1, "3": 1, "5": 1, "10": 1, "11": 1, "1": 2, "22": 2, "18": 2, "33": 2, "32": 2, "26": 2, "8": 2, "4": 2, "34": 2, "21": 3, "17": 3, "2": 3,
  "12": 3, "13": 3, "14": 3, "15": 3, "16": 3, "27": 3, "28": 3, "29": 3, "30": 3, "31": 3, "7": 3, "23": 3, "19": 4, "20": 4, "24": 4, "25": 4,
};

const RO_BASE = "https://api.rajaongkir.com/starter";
async function roFetch(path: string, key: string, init?: RequestInit): Promise<any> {
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`${RO_BASE}${path}`, { ...init, signal: ctrl.signal, headers: { key, ...(init?.headers ?? {}) } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()).rajaongkir;
  } finally { window.clearTimeout(t); }
}

const cfg = (db: DB | null) => db?.integrations.rajaongkir;
export const rajaMode = (db: DB | null): "live" | "sim" => (cfg(db)?.enabled && cfg(db)?.apiKey ? "live" : "sim");

export async function getProvinces(db: DB | null): Promise<Province[]> {
  const k = cfg(db)?.apiKey;
  if (k) { try { const r = await roFetch("/province", k); return (r.results as { province_id: string; province: string }[]).map((x) => ({ id: x.province_id, name: x.province })); } catch { /* fallback */ } }
  return PROVINCES;
}
export async function getCities(db: DB | null, provinceId: string): Promise<City[]> {
  const k = cfg(db)?.apiKey;
  if (k) { try { const r = await roFetch(`/city?province=${provinceId}`, k); return (r.results as { city_id: string; province_id: string; city_name: string }[]).map((x) => ({ id: x.city_id, provinceId: x.province_id, name: x.city_name })); } catch { /* fallback */ } }
  return CITIES.filter((x) => x.provinceId === provinceId);
}

export async function getShippingCosts(db: DB | null, destCityId: string, destProvinceId: string, weightGram: number, couriers: string[]): Promise<ShippingOption[]> {
  const k = cfg(db)?.apiKey;
  const origin = cfg(db)?.originCityId || "152";
  const weight = Math.max(100, weightGram);
  if (k) {
    const live: ShippingOption[] = [];
    for (const cour of couriers) {
      try {
        const body = new URLSearchParams({ origin, destination: destCityId, weight: String(weight), courier: cour });
        const r = await roFetch("/cost", k, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: body.toString() } as RequestInit);
        const res = r.results?.[0];
        (res?.costs ?? []).forEach((svc: { service: string; description: string; cost: { value: number; etd: string }[] }) => {
          const costRow = svc.cost[0];
          live.push({ courier: cour, courierName: res.name ?? cour.toUpperCase(), service: svc.service, description: svc.description, cost: costRow.value, eta: `${costRow.etd} hari` });
        });
      } catch { /* lanjut kurir lain */ }
    }
    if (live.length) return live;
  }
  // SIM: tarif berbasis berat + tier jarak provinsi tujuan
  const tier = TIER[destProvinceId] ?? 2;
  const kg = Math.max(1, Math.ceil(weight / 1000));
  const out: ShippingOption[] = [];
  for (const cour of couriers) {
    const meta = COURIER_META[cour];
    if (!meta) continue;
    for (const [service, desc, adj, eta] of meta.services) {
      out.push({ courier: cour, courierName: meta.name, service, description: desc, cost: Math.max(5000, Math.round((meta.base + tier * 4200 + adj) * kg / 500) * 500), eta });
    }
  }
  return out;
}

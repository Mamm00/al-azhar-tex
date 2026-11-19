import { COMPANY, PHONES } from '../data/company'

type FabricRef = {
  code: string
  name: string
  grade: 'A' | 'B' | 'C'
}

function waLink(phone: string, message: string): string {
  const clean = phone.replace(/[^0-9]/g, '')
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
}

export function waWholesaleAB(fabric: FabricRef, moq: number): string {
  const msg = `مرحباً الأزهر تكس، مهتم بـ ${fabric.code} — ${fabric.name} (درجة ${fabric.grade})، كمية ${moq} متر. متاح؟`
  return waLink(PHONES.wholesale.wa, msg)
}

export function waWholesaleC(fabric: FabricRef): string {
  const msg = `مرحباً، عايز أعرف تفاصيل الدفعة ${fabric.code} (درجة C) والسعر للكمية.`
  return waLink(PHONES.wholesale.wa, msg)
}

export function waRetail(fabric: FabricRef, metres: number): string {
  const msg = `مرحباً الأزهر تكس، عايز أشتري ${metres} متر قطاعي من ${fabric.code} — ${fabric.name} (درجة ${fabric.grade}). متاح في المعرض؟`
  return waLink(PHONES.retail.wa, msg)
}

export function waRetailGeneric(): string {
  const msg = `مرحباً، عايز أعرف المتاح قطاعي اليوم في المعرض.`
  return waLink(PHONES.retail.wa, msg)
}

export function waGeneric(): string {
  const msg = `مرحباً الأزهر تكس، عايز أستفسر عن المتاح عندكم.`
  return waLink(COMPANY.whatsapp1, msg)
}

export function getWaLinkForFabric(
  saleMode: 'wholesale' | 'retail' | 'both',
  grade: 'A' | 'B' | 'C',
  fabric: FabricRef,
  opts?: { moq?: number; metres?: number; preferRetail?: boolean }
): string {
  // If preferRetail or retail-only -> retail template
  if (opts?.preferRetail || saleMode === 'retail') {
    return waRetail(fabric, opts?.metres ?? 1)
  }
  if (saleMode === 'wholesale') {
    if (grade === 'C') return waWholesaleC(fabric)
    return waWholesaleAB(fabric, opts?.moq ?? 50)
  }
  // both: default to retail if preferRetail else wholesale
  if (opts?.preferRetail) return waRetail(fabric, opts?.metres ?? 1)
  if (grade === 'C') return waWholesaleC(fabric)
  return waWholesaleAB(fabric, opts?.moq ?? 50)
}

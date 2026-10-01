export function formatNum(val: number): string {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return Math.round(val).toLocaleString('ro-RO');
}

export function formatRon(val: number): string {
  if (val === undefined || val === null || isNaN(val)) return '0 lei';
  if (Math.abs(val) >= 1_000_000_000) {
    return `${(val / 1_000_000_000).toLocaleString('ro-RO', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} mld. lei`;
  }
  if (Math.abs(val) >= 1_000_000) {
    return `${(val / 1_000_000).toLocaleString('ro-RO', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} mil. lei`;
  }
  return `${Math.round(val).toLocaleString('ro-RO')} lei`;
}

export function formatRonIntreg(val: number): string {
  if (val === undefined || val === null || isNaN(val)) return '0 lei';
  return `${Math.round(val).toLocaleString('ro-RO')} lei`;
}

export function formatProcent(val: number): string {
  if (val === undefined || val === null || isNaN(val)) return '0%';
  return `${val.toLocaleString('ro-RO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

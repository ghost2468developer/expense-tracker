export function formatZar(amount: number) {
  return `R ${amount.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatEntryDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

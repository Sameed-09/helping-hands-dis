const timeFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'Asia/Kolkata',
})

export function formatTime(iso: string) {
  return `${timeFormat.format(new Date(iso))} IST`
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat('en-IN').format(n)
}

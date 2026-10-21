const paths = {
  book:"M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1m0-15c3-2 6-2 9-1v15c-3-1-6-1-9 1V5Z",
  message:"M21 11a9 9 0 0 1-9 9 10 10 0 0 1-4-.8L3 21l1.8-5A9 9 0 1 1 21 11Zm-13-1h.01M12 10h.01M16 10h.01",
  user:"M20 21v-2a7 7 0 0 0-14 0v2M17 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  grid:"M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z",
  "arrow-right":"M4 12h16m-6-6 6 6-6 6", "arrow-left":"M20 12H4m6-6-6 6 6 6", "chevron-right":"m9 5 7 7-7 7",
  check:"m5 12 4 4L19 6", lock:"M5 10h14v11H5Zm3 0V6a4 4 0 0 1 8 0v4m-4 5v2",
  search:"m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z", play:"m8 4 12 8-12 8V4Z", pause:"M7 4v16M17 4v16",
  refresh:"M20 7V2m0 5h-5M4 17v5m0-5h5M5 7a8 8 0 0 1 13-3l2 3M4 17l2 3a8 8 0 0 0 13-3",
  server:"M3 3h18v7H3Zm0 11h18v7H3ZM7 6.5h.01M7 17.5h.01M11 6.5h6M11 17.5h6",
  database:"M21 5c0 2-4 3-9 3S3 7 3 5s4-3 9-3 9 1 9 3Zm0 0v14c0 2-4 3-9 3s-9-1-9-3V5m18 7c0 2-4 3-9 3s-9-1-9-3",
  file:"M14 2H5v20h14V7Zm0 0v6h5M8 12h8M8 16h6", code:"m8 5-6 7 6 7m8-14 6 7-6 7m-2-17-4 20",
  layers:"m12 2 10 6-10 6L2 8Zm-10 11 10 6 10-6M2 18l10 6 10-6", branch:"M6 3v12a5 5 0 0 0 10 0V8M3 3a3 3 0 1 0 6 0 3 3 0 0 0-6 0Zm10 2a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z",
  clock:"M12 7v5l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z", close:"m6 6 12 12M6 18 18 6", menu:"M3 6h18M3 12h18M3 18h18",
  logout:"M9 3H3v18h6m5-15 6 6-6 6M8 12h12", cloud:"M7 19a5 5 0 1 1 0-10 6 6 0 0 1 12-1 5.5 5.5 0 0 1-1 11H7Z", plus:"M12 4v16M4 12h16",
} as const;

export function Icon({ name, size = 20, className }: { name: keyof typeof paths; size?: number; className?: string }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}><path d={paths[name]} /></svg>;
}

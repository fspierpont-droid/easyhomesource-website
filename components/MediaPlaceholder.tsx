export function MediaPlaceholder({ title = "Photo coming soon", className = "" }: { title?: string; className?: string }) {
  return <div className={`flex min-h-52 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-ehsSoftBlue via-white to-ehsLightBlue/40 p-6 text-center ${className}`}><div><p className="text-sm font-black uppercase tracking-[0.2em] text-ehsBlue">Easy HomeSource</p><p className="mt-2 text-2xl font-black text-ehsBlack">{title}</p><p className="mt-2 text-sm font-semibold text-ehsBlack/60">Fresh media will be added soon.</p></div></div>;
}

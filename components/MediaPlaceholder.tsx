export function MediaPlaceholder({ title = "Photos coming soon", className = "" }: { title?: string; className?: string }) {
  return (
    <div className={`flex h-full w-full min-h-36 items-center justify-center bg-gradient-to-br from-ehsSoftBlue via-white to-ehsLightBlue/30 p-4 text-center ${className}`}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-ehsBlue">Easy HomeSource</p>
        <p className="mt-1 text-sm font-black text-ehsBlack">{title}</p>
        <p className="mt-0.5 text-[11px] font-medium text-ehsBlack/50">Media updating soon</p>
      </div>
    </div>
  );
}

export function MediaPlaceholder({
  title = "Floor Plan & Specs Available",
  className = ""
}: {
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex h-full w-full min-h-36 items-center justify-center bg-gradient-to-br from-ehsSoftBlue via-white to-slate-100 p-4 text-center ${className}`}
    >
      <div className="space-y-1">
        <div className="w-8 h-8 rounded-full bg-ehsSoftBlue text-[#0B4F86] font-bold text-sm mx-auto flex items-center justify-center border border-ehsBlue/20">
          🏡
        </div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-ehsBlue">
          Easy HomeSource
        </p>
        <p className="text-xs font-black text-slate-800">{title}</p>
        <p className="text-[10px] font-medium text-slate-400">
          Verified builder specs on file
        </p>
      </div>
    </div>
  );
}

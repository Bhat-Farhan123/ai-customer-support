import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  bg,
  positive = true,
}) {
  return (
    <div
      className="
        group
        relative
        h-full
        overflow-hidden
        rounded-2xl
        border border-white/80
        bg-white
        p-5
        shadow-[0_8px_25px_rgba(15,23,42,0.06)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]
      "
    >
      {/* Decorative glow */}
      <div
        className={`
          pointer-events-none
          absolute
          -right-8
          -top-8
          h-24
          w-24
          rounded-full
          ${bg}
          opacity-70
          blur-2xl
          transition-all
          duration-300
          group-hover:scale-150
          group-hover:opacity-100
        `}
      />

      {/* Top accent */}
      <div
        className={`
          absolute
          left-0
          top-0
          h-1
          w-full
          ${color.replace("text-", "bg-")}
          opacity-80
        `}
      />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <div className="mt-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {value}
            </h2>
          </div>
        </div>

        {/* Icon */}
        <div
          className={`
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-2xl
            ${bg}
            shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_6px_15px_rgba(15,23,42,0.06)]
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:rotate-2
          `}
        >
          <Icon
            size={21}
            strokeWidth={2.2}
            className={color}
          />
        </div>
      </div>

      {/* Bottom trend */}
      <div className="relative z-10 mt-5 flex items-center">
        <span
          className={`
            inline-flex
            items-center
            gap-1.5
            rounded-full
            px-2.5
            py-1
            text-xs
            font-semibold
            ${
              positive
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600"
            }
          `}
        >
          {positive ? (
            <ArrowUpRight size={13} />
          ) : (
            <ArrowDownRight size={13} />
          )}

          {change}
        </span>
      </div>

      {/* Bottom highlight */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent" />
    </div>
  );
}
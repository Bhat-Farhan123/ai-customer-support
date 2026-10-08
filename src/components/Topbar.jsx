import { Search, Bell, ChevronDown } from "lucide-react";

export default function Topbar() {
  return (
    <header className="relative z-20 flex h-19 items-center justify-between border-b border-slate-200/70 bg-white/90 px-6 shadow-[0_4px_20px_rgba(15,23,42,0.05)] backdrop-blur-xl">

      {/* Soft background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute right-10 -top-20 h-32 w-32 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      {/* Search */}
      <div className="relative flex w-full max-w-xl items-center">

        <div
          className="
            group
            flex w-full items-center gap-3
            rounded-2xl
            border border-slate-200
            bg-slate-50/90
            px-4 py-3
            shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_3px_10px_rgba(15,23,42,0.04)]
            transition-all duration-200
            hover:border-blue-200
            hover:bg-white
            hover:shadow-[0_6px_20px_rgba(37,99,235,0.08)]
            focus-within:border-blue-400
            focus-within:bg-white
            focus-within:ring-4
            focus-within:ring-blue-500/10
          "
        >

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-sm transition-transform duration-200 group-focus-within:scale-105">
            <Search size={17} strokeWidth={2.2} />
          </div>

          <input
            type="text"
            placeholder="Search tickets, customers, or keywords..."
            className="
              w-full
              bg-transparent
              text-sm
              font-medium
              text-slate-700
              placeholder:text-slate-400
              outline-none
            "
          />

          <div className="hidden items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-400 shadow-sm sm:flex">
            <span>⌘</span>
            <span>K</span>
          </div>

        </div>

      </div>

      {/* Right side */}
      <div className="relative ml-6 flex items-center gap-3">

        {/* Notification */}
        <button
          className="
            group
            relative
            flex h-11 w-11
            items-center justify-center
            rounded-xl
            border border-slate-200
            bg-white
            text-slate-500
            shadow-[0_3px_10px_rgba(15,23,42,0.05)]
            transition-all duration-200
            hover:-translate-y-0.5
            hover:border-blue-200
            hover:bg-blue-50
            hover:text-blue-600
            hover:shadow-[0_8px_20px_rgba(37,99,235,0.12)]
          "
        >
          <Bell
            size={19}
            strokeWidth={2}
            className="transition-transform duration-200 group-hover:rotate-[-8deg]"
          />

          {/* Notification dot */}
          <span className="absolute right-2.5 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />

        </button>

        {/* Agent profile */}
        <button
          className="
            group
            flex
            items-center
            gap-3
            rounded-2xl
            border border-slate-200
            bg-white
            px-2.5 py-2
            shadow-[0_3px_10px_rgba(15,23,42,0.05)]
            transition-all duration-200
            hover:-translate-y-0.5
            hover:border-blue-200
            hover:shadow-[0_8px_22px_rgba(37,99,235,0.10)]
          "
        >

          {/* Avatar */}
          <span
            className="
              relative
              flex h-9 w-9
              items-center justify-center
              rounded-xl
              bg-linear-to-br from-blue-500 via-indigo-500 to-violet-600
              text-sm
              font-bold
              text-white
              shadow-[0_4px_12px_rgba(79,70,229,0.30)]
            "
          >
            A

            {/* Online indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
          </span>

          {/* Agent information */}
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-semibold leading-tight text-slate-800">
              Agent
            </span>

            <span className="block text-[11px] font-medium text-slate-400">
              Support Agent
            </span>
          </span>

          <ChevronDown
            size={16}
            className="text-slate-400 transition-transform duration-200 group-hover:translate-y-0.5"
          />

        </button>

      </div>

    </header>
  );
}
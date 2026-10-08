import {
  LayoutDashboard,
  Ticket,
  Mail,
  Users,
  BookOpen,
  ChartNoAxesCombined,
  Settings,
  Headset,
  Sparkles,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Tickets", path: "/tickets", icon: Ticket },
  { name: "Email Monitor", path: "/email-monitor", icon: Mail },
  { name: "Customers", path: "/customers", icon: Users },
  { name: "Knowledge Base", path: "/knowledge", icon: BookOpen },
  { name: "Analytics", path: "/analytics", icon: ChartNoAxesCombined },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col overflow-hidden bg-[#0b1224] text-white shadow-[8px_0_30px_rgba(15,23,42,0.18)]">

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-20 h-48 w-48 rounded-full bg-blue-600/20 blur-[80px]" />

        <div className="absolute -right-20 bottom-20 h-56 w-56 rounded-full bg-violet-600/10 blur-[90px]" />
      </div>

      {/* Logo */}
      <div className="relative flex h-19 items-center border-b border-white/10 px-5">

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-linear-to-br
              from-blue-500
              via-indigo-500
              to-violet-600
              shadow-[0_8px_20px_rgba(59,130,246,0.35)]
            "
          >
            <Headset size={21} strokeWidth={2.2} />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight">
                SupportAI
              </span>

              <Sparkles
                size={13}
                className="text-blue-400"
              />
            </div>

            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
              AI Support Platform
            </p>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 space-y-2 px-3 py-6">

        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Workspace
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `
                  group
                  relative
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-sm
                  font-medium
                  transition-all
                  duration-200
                  ${
                    isActive
                      ? `
                        bg-linear-to-r
                        from-blue-600
                        to-indigo-600
                        text-white
                        shadow-[0_8px_20px_rgba(37,99,235,0.28)]
                      `
                      : `
                        text-slate-400
                        hover:bg-white/6
                        hover:text-white
                      `
                  }
                `
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 h-6 w-1 rounded-r-full bg-blue-300 shadow-[0_0_10px_rgba(147,197,253,0.8)]" />
                  )}

                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2.3 : 2}
                    className={
                      isActive
                        ? "text-white"
                        : "text-slate-500 transition-colors group-hover:text-blue-400"
                    }
                  />

                  <span>{item.name}</span>

                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-200 shadow-[0_0_8px_rgba(147,197,253,0.8)]" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="relative border-t border-white/10 p-4">

        <div className="rounded-xl border border-white/10 bg-white/4 p-3 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />

            <span className="text-xs font-semibold text-slate-300">
              System Online
            </span>
          </div>

          <p className="mt-2 text-[10px] leading-4 text-slate-500">
            AI Customer Support
            <br />
            Version 1.0
          </p>
        </div>

      </div>

    </aside>
  );
}
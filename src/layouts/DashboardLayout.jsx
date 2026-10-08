import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f7fb]">

      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        {/* Blue glow */}
        <div
          className="
            absolute
            -left-32
            top-20
            h-96
            w-96
            rounded-full
            bg-blue-400/10
            blur-[110px]
          "
        />

        {/* Violet glow */}
        <div
          className="
            absolute
            right-0
            top-0
            h-80
            w-80
            rounded-full
            bg-violet-400/10
            blur-[100px]
          "
        />

        {/* Bottom glow */}
        <div
          className="
            absolute
            bottom-0
            left-1/3
            h-72
            w-72
            rounded-full
            bg-cyan-400/5
            blur-[100px]
          "
        />

      </div>

      <Sidebar />

      <div className="relative ml-60 min-h-screen">

        <Topbar />

        <main className="relative p-6">
          <Outlet />
        </main>

      </div>

    </div>
  );
}
  "use client";

  import React from "react";
  import SideBarWrapper from "../../shared/components/sidebar/sideBarWrapper";

  const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="min-h-screen flex">
        {/* Sidebar */}
        <aside className=" min-w-[260px] border-r border-r-slate-200 bg-black">
          <div className="sticky top-0 p-4">
            <SideBarWrapper />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-black text-white">
 
            {children}
        </main>
      </div>
    );
  };

  export default Layout;
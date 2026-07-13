"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { CommandPalette } from "./CommandPalette";
import styles from "./MainLayout.module.css";
import { useEffect, useState } from "react";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  
  // A small hack to sync padding with Sidebar state without complex context
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarCollapsed(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={styles.layout}>
      {!isLoginPage && <Sidebar />}
      
      <div 
        className={`${styles.mainWrapper} ${isLoginPage ? styles.mainWrapperFull : ""}`}
        style={!isLoginPage ? { paddingLeft: isSidebarCollapsed ? '80px' : '280px' } : {}}
      >
        {!isLoginPage && <TopBar />}
        
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>

      {!isLoginPage && <CommandPalette />}
    </div>
  );
}

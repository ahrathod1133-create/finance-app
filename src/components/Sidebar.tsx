"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, PieChart, Landmark, FileText, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Sidebar.module.css";
import { signOut } from "next-auth/react";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      if (window.innerWidth < 1024) setCollapsed(true);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted) return null;

  const navItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Loans", path: "/loans", icon: <CreditCard size={20} /> },
    { name: "Borrowers", path: "/customers", icon: <Users size={20} /> },
    { name: "Funding Sources", path: "/lenders", icon: <Landmark size={20} /> },
    { name: "Reports", path: "/reports", icon: <PieChart size={20} /> },
  ];

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>FL</div>
          {!collapsed && <span className={styles.logoText}>Finance Ledger</span>}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className={styles.collapseBtn}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
          return (
            <Link key={item.name} href={item.path} className={`${styles.navItem} ${isActive ? styles.active : ""}`}>
              <div className={styles.iconWrapper}>{item.icon}</div>
              {!collapsed && <span className={styles.navLabel}>{item.name}</span>}
              {isActive && !collapsed && <div className={styles.activeIndicator} />}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.profile}>
          <div className={styles.avatar}>A</div>
          {!collapsed && (
            <div className={styles.profileInfo}>
              <div className={styles.profileName}>Admin User</div>
              <div className={styles.profileRole}>Finance Team</div>
            </div>
          )}
        </div>
        <button onClick={() => signOut()} className={styles.logoutBtn} title="Logout">
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

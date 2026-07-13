"use client";

import { Bell, Search, SunMoon } from "lucide-react";
import styles from "./TopBar.module.css";
import { format } from "date-fns";
import { useEffect, useState } from "react";

export function TopBar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (!mounted) return null;

  return (
    <header className={styles.topbar}>
      <div className={styles.greetingSection}>
        <h2 className={styles.greeting}>{getGreeting()}!</h2>
        <p className={styles.date}>{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>

      <div className={styles.actions}>
        <button 
          className={styles.searchBar} 
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
          title="Open Command Palette"
        >
          <Search size={16} />
          <span>Quick Search...</span>
          <kbd className={styles.shortcut}>Ctrl K</kbd>
        </button>

        <div className={styles.iconGroup}>
          <button className={styles.iconBtn} title="Toggle Theme">
            <SunMoon size={20} />
          </button>
          <button className={styles.iconBtn} title="Notifications">
            <Bell size={20} />
            <span className={styles.badge}>3</span>
          </button>
        </div>
      </div>
    </header>
  );
}

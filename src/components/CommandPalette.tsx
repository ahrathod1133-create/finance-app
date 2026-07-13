"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, CreditCard, Users, Landmark, LayoutDashboard, PieChart } from "lucide-react";
import styles from "./CommandPalette.module.css";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const commands = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={18} /> },
    { name: "Add Loan (Give Money)", path: "/loans/new", icon: <CreditCard size={18} /> },
    { name: "View All Loans", path: "/loans", icon: <CreditCard size={18} /> },
    { name: "Borrowers (Customers)", path: "/customers", icon: <Users size={18} /> },
    { name: "Funding Sources (Lenders)", path: "/lenders", icon: <Landmark size={18} /> },
    { name: "Reports & Statements", path: "/reports", icon: <PieChart size={18} /> },
  ];

  const filteredCommands = commands.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <div className={styles.overlay} onClick={() => setIsOpen(false)}>
      <div className={`${styles.palette} animate-scale-in`} onClick={e => e.stopPropagation()}>
        <div className={styles.inputWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search commands, pages, or add new..." 
            className={styles.input}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <kbd className={styles.escHint}>ESC</kbd>
        </div>
        
        <div className={styles.results}>
          <div className={styles.label}>Suggestions</div>
          {filteredCommands.length > 0 ? (
            <div className={styles.list}>
              {filteredCommands.map((cmd, i) => (
                <button 
                  key={i} 
                  className={styles.item}
                  onClick={() => handleSelect(cmd.path)}
                >
                  <span className={styles.itemIcon}>{cmd.icon}</span>
                  <span className={styles.itemName}>{cmd.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>No results found for "{query}"</div>
          )}
        </div>
      </div>
    </div>
  );
}

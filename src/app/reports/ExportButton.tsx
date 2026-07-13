"use client";

import { Download } from "lucide-react";
import styles from "./reports.module.css";

export default function ExportButton() {
  const handleExport = () => {
    window.print();
  };

  return (
    <button className={styles.btnSecondary} onClick={handleExport}>
      <Download size={18} /> Export PDF / Print
    </button>
  );
}

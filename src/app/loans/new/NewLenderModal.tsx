"use client";

import { useState } from "react";
import { createLender } from "@/actions/lender";
import styles from "../loans.module.css"; // Reuse loan module styles for the modal layout

export default function NewLenderModal({ 
  onClose, 
  onSuccess 
}: { 
  onClose: () => void, 
  onSuccess: (lender: any) => void 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await createLender(formData);

    if (res.error) {
      setError(res.error);
      setIsSubmitting(false);
    } else if (res.success && res.lender) {
      onSuccess(res.lender);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
    }}>
      <div style={{
        background: "var(--bg-card)",
        padding: "2rem",
        borderRadius: "var(--radius-lg)",
        width: "100%",
        maxWidth: "500px",
        boxShadow: "var(--shadow-lg)"
      }}>
        <h2 style={{ marginBottom: "1.5rem" }}>Add New Funding Source</h2>
        
        {error && <div className={styles.error} style={{ marginBottom: "1rem" }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup} style={{ marginBottom: "1rem" }}>
            <label>Full Name *</label>
            <input type="text" name="name" required />
          </div>
          
          <div className={styles.inputGroup} style={{ marginBottom: "1rem" }}>
            <label>Mobile Number *</label>
            <input type="tel" name="mobile" required />
          </div>
          
          <div className={styles.inputGroup} style={{ marginBottom: "1rem" }}>
            <label>Address</label>
            <input type="text" name="address" />
          </div>

          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label>Amount Invested (₹) *</label>
              <input type="number" name="amountInvested" step="0.01" required />
            </div>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label>Default Rate (%) *</label>
              <input type="number" name="interestRate" step="0.01" required />
            </div>
          </div>
          
          <div className={styles.inputGroup} style={{ marginBottom: "1.5rem" }}>
            <label>Notes</label>
            <input type="text" name="notes" />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
            <button type="button" onClick={onClose} className={styles.btnSecondary}>
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Lender"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createLender, updateLender, deleteLender } from "@/actions/lender";
import styles from "./lenders.module.css";
import { formatCurrency } from "@/lib/utils";

type Lender = any; 

export function LendersClient({ initialLenders }: { initialLenders: Lender[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [showForm, setShowForm] = useState(false);
  const [editingLender, setEditingLender] = useState<Lender | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    router.replace(`/lenders?${params.toString()}`);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    
    let res;
    if (editingLender) {
      res = await updateLender(editingLender.id, formData);
    } else {
      res = await createLender(formData);
    }
    
    setIsSubmitting(false);
    
    if (res.error) {
      alert(res.error);
    } else {
      setShowForm(false);
      setEditingLender(null);
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this funding source?")) {
      await deleteLender(id);
    }
  };

  const openEdit = (lender: Lender) => {
    setEditingLender(lender);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingLender(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <input 
          type="text" 
          placeholder="Search lenders..." 
          defaultValue={searchParams.get("q") || ""}
          onChange={handleSearch}
          className="input"
        />
        <button className="btn btn-primary" onClick={() => showForm ? cancelForm() : setShowForm(true)}>
          {showForm ? "Cancel" : "+ Add Funding Source"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.formCard}>
          <h2>{editingLender ? "Edit Funding Source" : "Add New Funding Source"}</h2>
          <div className={styles.formGrid}>
            <div className="formGroup">
              <label>Full Name *</label>
              <input type="text" name="name" required className="input" defaultValue={editingLender?.name || ""} />
            </div>
            <div className="formGroup">
              <label>Mobile Number *</label>
              <input type="tel" name="mobile" required className="input" defaultValue={editingLender?.mobile || ""} />
            </div>
            <div className="formGroup">
              <label>Address</label>
              <input type="text" name="address" className="input" defaultValue={editingLender?.address || ""} />
            </div>
            <div className="formGroup">
              <label>Notes</label>
              <input type="text" name="notes" className="input" defaultValue={editingLender?.notes || ""} />
            </div>
            
            {!editingLender && (
              <div className="formGroup">
                <label>Amount Invested (₹) *</label>
                <input type="number" name="amountInvested" step="0.01" required className="input" />
              </div>
            )}
            
            <div className="formGroup">
              <label>Default Interest Rate (%) *</label>
              <input type="number" name="interestRate" step="0.01" required className="input" defaultValue={editingLender?.interestRate || ""} />
            </div>

            {editingLender && (
              <div className="formGroup">
                <label>Status *</label>
                <select name="status" className="input" defaultValue={editingLender.status}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            )}
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : editingLender ? "Save Changes" : "Add Lender"}
          </button>
        </form>
      )}

      <div className={styles.grid}>
        {initialLenders.map((lender) => {
          let utilized = 0;
          lender.fundings?.forEach((f: any) => {
            if (f.loan?.status === "ACTIVE") {
              utilized += f.amount;
            }
          });
          
          const available = lender.amountInvested - utilized;

          return (
            <div key={lender.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>{lender.name}</h3>
                <span className={styles.statusBadge}>{lender.status}</span>
              </div>
              <p className={styles.detail}><strong>Mobile:</strong> {lender.mobile}</p>
              {lender.address && <p className={styles.detail}><strong>Address:</strong> {lender.address}</p>}
              <p className={styles.detail}><strong>Rate:</strong> {lender.interestRate}%</p>
              {lender.notes && <p className={styles.detail}><strong>Notes:</strong> {lender.notes}</p>}
              
              <div className={styles.finances}>
                <div className={styles.financeItem}>
                  <label>Invested</label>
                  <span>{formatCurrency(lender.amountInvested)}</span>
                </div>
                <div className={styles.financeItem}>
                  <label>Utilized</label>
                  <span>{formatCurrency(utilized)}</span>
                </div>
                <div className={styles.financeItem}>
                  <label>Available</label>
                  <span style={{ color: available >= 0 ? "var(--success)" : "var(--danger)" }}>
                    {formatCurrency(available)}
                  </span>
                </div>
              </div>
              
              <div className={styles.actions} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(lender)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(lender.id)}>Delete</button>
              </div>
            </div>
          );
        })}
        {initialLenders.length === 0 && !showForm && (
          <p className={styles.empty}>No funding sources found.</p>
        )}
      </div>
    </div>
  );
}

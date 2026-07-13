/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createLoan } from "@/actions/loan";
import styles from "../loans.module.css";
import { Trash, Plus, ArrowLeft } from "lucide-react";
import NewLenderModal from "./NewLenderModal";

export default function NewLoanForm({ customers, lenders }: { customers: any[], lenders: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loanType, setLoanType] = useState("GIVEN");
  const [principalAmount, setPrincipalAmount] = useState<number>(0);

  // Local state for lenders to allow on-the-fly additions
  const [localLenders, setLocalLenders] = useState(lenders);
  const [showLenderModalForIndex, setShowLenderModalForIndex] = useState<number | null>(null);

  // Dynamic fundings
  const [fundings, setFundings] = useState([{ lenderId: "", amount: 0, interestRate: 0 }]);

  const handleAddFunding = () => {
    setFundings([...fundings, { lenderId: "", amount: 0, interestRate: 0 }]);
  };

  const handleRemoveFunding = (index: number) => {
    setFundings(fundings.filter((_, i) => i !== index));
  };

  const handleFundingChange = (index: number, field: string, value: string) => {
    const newFundings = [...fundings];
    if (field === "lenderId") {
      newFundings[index].lenderId = value;
      // Auto-populate default interest rate for the lender
      const lender = localLenders.find(l => l.id === value);
      if (lender) {
        newFundings[index].interestRate = lender.interestRate;
      }
    } else {
      (newFundings as any)[index][field] = parseFloat(value) || 0;
    }
    setFundings(newFundings);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation for loan given type: total funded must equal principal
    if (loanType === "GIVEN" && fundings.length > 0) {
      const totalFunded = fundings.reduce((sum, f) => sum + f.amount, 0);
      if (totalFunded !== principalAmount) {
        setError(`Total funded amount (₹${totalFunded}) must exactly match Principal Amount (₹${principalAmount}).`);
        setLoading(false);
        return;
      }
      
      const hasEmptyLender = fundings.some(f => !f.lenderId);
      if (hasEmptyLender) {
        setError("Please select a valid lender for all funding sources.");
        setLoading(false);
        return;
      }
    }

    const formData = new FormData(e.currentTarget);
    formData.append("fundings", JSON.stringify(loanType === "GIVEN" ? fundings : []));
    
    const res = await createLoan(formData);
    
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/loans");
      router.refresh();
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button type="button" onClick={() => router.back()} className={styles.iconBtn}>
            <ArrowLeft size={24} />
          </button>
          <h1 className={styles.title}>New Loan (Given)</h1>
        </div>
      </header>
      
      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.formCard}>
        <div className={styles.formSection}>
          <h2>Basic Information</h2>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Customer (Borrower) *</label>
              <select name="customerId" required>
                <option value="">Select a customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName} ({c.mobileNumber})</option>
                ))}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Loan Type *</label>
              <select name="type" required value={loanType} onChange={(e) => setLoanType(e.target.value)}>
                <option value="GIVEN">Money Given (Lending)</option>
                <option value="TAKEN">Money Taken (Borrowing)</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Principal Amount (₹) *</label>
              <input 
                type="number" 
                name="principalAmount" 
                step="0.01" 
                min="1" 
                required 
                value={principalAmount || ""}
                onChange={(e) => setPrincipalAmount(parseFloat(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Start Date *</label>
              <input type="date" name="startDate" defaultValue={new Date().toISOString().split("T")[0]} required />
            </div>
          </div>
        </div>

        {loanType === "GIVEN" && (
          <div className={styles.formSection}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
              <h2 style={{ margin: 0, border: "none", padding: 0 }}>Funding Sources</h2>
              <button type="button" onClick={handleAddFunding} className={styles.btnSecondary} style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}>
                + Add Source
              </button>
            </div>
            <div style={{ background: "rgba(0,0,0,0.2)", padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
              {fundings.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }} className={styles.inputGroup}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <label>Lender</label>
                      <button 
                        type="button" 
                        onClick={() => setShowLenderModalForIndex(i)} 
                        style={{ fontSize: "0.75rem", background: "none", border: "none", color: "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        <Plus size={12} /> New Lender
                      </button>
                    </div>
                    <select 
                      value={f.lenderId} 
                      onChange={(e) => handleFundingChange(i, "lenderId", e.target.value)}
                      required
                    >
                      <option value="">Select Lender</option>
                      {localLenders.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ width: "150px" }} className={styles.inputGroup}>
                    <label>Amount (₹)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={f.amount || ""} 
                      onChange={(e) => handleFundingChange(i, "amount", e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ width: "120px" }} className={styles.inputGroup}>
                    <label>Rate %</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={f.interestRate || ""} 
                      onChange={(e) => handleFundingChange(i, "interestRate", e.target.value)}
                      required
                    />
                  </div>
                  {fundings.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveFunding(i)}
                      style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", border: "none", padding: "0.75rem", borderRadius: "0.5rem", cursor: "pointer" }}
                    >
                      <Trash size={18} />
                    </button>
                  )}
                </div>
              ))}
              <div style={{ textAlign: "right", fontSize: "0.95rem", color: "var(--text-muted)", marginTop: "1rem" }}>
                Total Funded: <strong style={{ color: "var(--text-primary)" }}>₹{fundings.reduce((sum, f) => sum + (f.amount || 0), 0)}</strong> / ₹{principalAmount || 0}
              </div>
            </div>
          </div>
        )}

        <div className={styles.formSection}>
          <h2>Borrower Interest Details</h2>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Interest Rate Charged (%) *</label>
              <input type="number" name="interestRate" step="0.01" min="0" required defaultValue="18" />
            </div>
            <div className={styles.inputGroup}>
              <label>Interest Type *</label>
              <select name="interestType" required>
                <option value="SIMPLE">Simple Interest</option>
                <option value="COMPOUND">Compound Interest</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Frequency *</label>
              <select name="interestFrequency" required>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2>Duration</h2>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Duration Value *</label>
              <input type="number" name="durationValue" min="1" required defaultValue="12" />
            </div>
            <div className={styles.inputGroup}>
              <label>Duration Unit *</label>
              <select name="durationUnit" required>
                <option value="MONTHS">Months</option>
                <option value="DAYS">Days</option>
                <option value="YEARS">Years</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2>Additional Details</h2>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Payment Method *</label>
              <select name="paymentMethod" required>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Reference Number</label>
              <input type="text" name="referenceNumber" placeholder="UPI Ref / Cheque No." />
            </div>
          </div>
          
          <div className={styles.inputGroup} style={{ marginTop: "1.5rem" }}>
            <label>Purpose</label>
            <input type="text" name="purpose" />
          </div>

          <div className={styles.inputGroup} style={{ marginTop: "1.5rem" }}>
            <label>Notes</label>
            <textarea name="notes" rows={3}></textarea>
          </div>
        </div>

        <div className={styles.formFooter}>
          <button type="button" className={styles.btnSecondary} onClick={() => router.back()}>Cancel</button>
          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? "Creating..." : "Create Loan"}
          </button>
        </div>
      </form>

      {showLenderModalForIndex !== null && (
        <NewLenderModal 
          onClose={() => setShowLenderModalForIndex(null)}
          onSuccess={(newLender) => {
            // Add the new lender to the local state so it appears in the dropdowns
            setLocalLenders([...localLenders, newLender]);
            // Automatically select it for the dropdown that spawned the modal
            handleFundingChange(showLenderModalForIndex, "lenderId", newLender.id);
            // Close the modal
            setShowLenderModalForIndex(null);
          }}
        />
      )}
    </>
  );
}

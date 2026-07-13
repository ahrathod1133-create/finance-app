/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Download, FileText, Calendar as CalendarIcon, IndianRupee } from "lucide-react";
import { format } from "date-fns";
import styles from "./loanDetails.module.css";
import { addPayment } from "@/actions/payment";
import { useRouter } from "next/navigation";

export default function LoanDetailsClient({ loan }: { loan: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("PAYMENTS");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("loanId", loan.id);
    
    const res = await addPayment(formData);
    if (res.success) {
      setShowPaymentModal(false);
      router.refresh();
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  // Calculate profitability if it has fundings
  let blendedCost = 0;
  let totalAnnualCost = 0;
  let netMargin = 0;
  
  if (loan.fundings && loan.fundings.length > 0) {
    totalAnnualCost = loan.fundings.reduce((sum: number, f: any) => sum + (f.amount * (f.interestRate / 100)), 0);
    blendedCost = (totalAnnualCost / loan.principalAmount) * 100;
    netMargin = loan.interestRate - blendedCost;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/loans" className={styles.iconBtn}>
            <ArrowLeft size={24} />
          </Link>
          <h1 className={styles.title}>Loan #{loan.id.slice(-6).toUpperCase()}</h1>
          <span className={styles.statusBadge} data-status={loan.status}>{loan.status}</span>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          {loan.status === "ACTIVE" && (
            <button className={styles.btnPrimary} onClick={() => setShowPaymentModal(true)}>
              <Plus size={20} /> Add Payment
            </button>
          )}
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Summary</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Principal</span>
              <span className={styles.statValue}>{formatMoney(loan.principalAmount)}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Balance</span>
              <span className={`${styles.statValue} ${loan.type === 'GIVEN' ? styles.textPositive : styles.textNegative}`}>
                {formatMoney(loan.remainingAmount)}
              </span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Interest Charged</span>
              <span className={styles.statValue}>{loan.interestRate}% {loan.interestFrequency}</span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h3>Customer Details</h3>
          <p><strong>Name:</strong> {loan.customer.fullName}</p>
          <p><strong>Phone:</strong> {loan.customer.mobileNumber}</p>
          <p><strong>Address:</strong> {loan.customer.address}, {loan.customer.city}</p>
        </div>

        {loan.fundings && loan.fundings.length > 0 && (
          <div className={styles.card}>
            <h3>Funding Sources (Lenders)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
              {loan.fundings.map((f: any) => (
                <div key={f.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
                  <span><strong>{f.lender.name}</strong></span>
                  <span>{formatMoney(f.amount)} @ {f.interestRate}%</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.5rem" }}>
                <span><strong>Blended Cost of Capital</strong></span>
                <span>{blendedCost.toFixed(2)}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span><strong>Net Profit Margin</strong></span>
                <span style={{ color: netMargin > 0 ? "var(--success)" : "var(--danger)", fontWeight: 600 }}>
                  {netMargin.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.tabs}>
        {['PAYMENTS', 'TIMELINE', 'NOTES', 'ATTACHMENTS'].map(tab => (
          <button 
            key={tab}
            className={`${styles.tabBtn} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'PAYMENTS' && (
          <div className={styles.card}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Total Amount</th>
                  <th>Principal Paid</th>
                  <th>Interest Paid</th>
                  <th>Mode</th>
                </tr>
              </thead>
              <tbody>
                {loan.payments.map((p: any) => (
                  <tr key={p.id}>
                    <td>{format(new Date(p.paymentDate), 'dd MMM yyyy')}</td>
                    <td style={{ fontWeight: 600 }}>{formatMoney(p.amount)}</td>
                    <td>{formatMoney(p.principalPaid)}</td>
                    <td>{formatMoney(p.interestPaid)}</td>
                    <td>{p.paymentMode}</td>
                  </tr>
                ))}
                {loan.payments.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>No payments recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'TIMELINE' && (
          <div className={styles.card}>
            <div className={styles.timeline}>
              {loan.activityLogs.map((log: any) => (
                <div key={log.id} className={styles.timelineItem}>
                  <div className={styles.timelineIcon}>
                    {log.action.includes('PAYMENT') ? <IndianRupee size={16} /> : <FileText size={16} />}
                  </div>
                  <div className={styles.timelineContent}>
                    <h4>{log.action.replace('_', ' ')}</h4>
                    <p>{log.details}</p>
                    <span className={styles.timelineDate}>{format(new Date(log.createdAt), 'dd MMM yyyy HH:mm')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showPaymentModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Add Payment</h2>
              <button className={styles.iconBtn} onClick={() => setShowPaymentModal(false)}>✕</button>
            </div>
            <form onSubmit={handlePaymentSubmit} className={styles.form}>
              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label>Total Amount (₹) *</label>
                  <input type="number" name="amount" step="0.01" required />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label>Principal Paid (₹) *</label>
                  <input type="number" name="principalPaid" step="0.01" required />
                </div>
                <div className={styles.inputGroup}>
                  <label>Interest Paid (₹) *</label>
                  <input type="number" name="interestPaid" step="0.01" required />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label>Payment Mode *</label>
                  <select name="paymentMode" required>
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Reference Number</label>
                  <input type="text" name="referenceNumber" />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>Notes</label>
                <textarea name="notes" rows={2}></textarea>
              </div>
              <button type="submit" className={styles.btnPrimary} disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
                {loading ? "Saving..." : "Save Payment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

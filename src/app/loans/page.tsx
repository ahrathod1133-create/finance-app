import { db } from "@/lib/db";
import Link from "next/link";
import styles from "./loans.module.css";
import { Plus } from "lucide-react";
import { format } from "date-fns";

export default async function LoansPage() {
  const loans = await db.loan.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" }
  });

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Loans</h1>
        <Link href="/loans/new" className={styles.btnPrimary}>
          <Plus size={20} />
          New Loan
        </Link>
      </header>

      <div style={{ overflowX: "auto" }} className={styles.formCard}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
              <th style={{ padding: "1rem" }}>Customer</th>
              <th style={{ padding: "1rem" }}>Type</th>
              <th style={{ padding: "1rem" }}>Amount</th>
              <th style={{ padding: "1rem" }}>Balance</th>
              <th style={{ padding: "1rem" }}>Interest</th>
              <th style={{ padding: "1rem" }}>Status</th>
              <th style={{ padding: "1rem" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loans.map(loan => (
              <tr key={loan.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td style={{ padding: "1rem" }}>{loan.customer.fullName}</td>
                <td style={{ padding: "1rem" }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.75rem', 
                    fontWeight: 500,
                    backgroundColor: loan.type === 'GIVEN' ? '#dcfce7' : '#fee2e2',
                    color: loan.type === 'GIVEN' ? '#166534' : '#991b1b'
                  }}>
                    {loan.type}
                  </span>
                </td>
                <td style={{ padding: "1rem" }}>{formatMoney(loan.principalAmount)}</td>
                <td style={{ padding: "1rem" }}>{formatMoney(loan.remainingAmount)}</td>
                <td style={{ padding: "1rem" }}>{loan.interestRate}% {loan.interestFrequency}</td>
                <td style={{ padding: "1rem" }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    backgroundColor: loan.status === 'ACTIVE' ? '#dbeafe' : loan.status === 'CLOSED' ? '#dcfce7' : '#f3f4f6',
                    color: loan.status === 'ACTIVE' ? '#1e40af' : loan.status === 'CLOSED' ? '#166534' : '#4b5563'
                  }}>
                    {loan.status}
                  </span>
                </td>
                <td style={{ padding: "1rem" }}>
                  <Link href={`/loans/${loan.id}`} style={{ color: "var(--accent-color)", fontWeight: 500 }}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {loans.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                  No loans found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

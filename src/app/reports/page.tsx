import { db } from "@/lib/db";
import styles from "./reports.module.css";
import { format } from "date-fns";
import ExportButton from "./ExportButton";

export default async function ReportsPage() {
  const lenders = await db.lender.findMany({
    include: {
      fundings: {
        include: { loan: true }
      }
    }
  });

  const activeLoans = await db.loan.findMany({
    where: { status: "ACTIVE", type: "GIVEN" },
    include: {
      customer: true,
      fundings: { include: { lender: true } }
    }
  });

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  // Summaries
  let totalLenderCapital = 0;
  let totalAnnualLenderCost = 0;
  let totalAnnualBorrowerYield = 0;

  activeLoans.forEach(loan => {
    totalAnnualBorrowerYield += (loan.principalAmount * loan.interestRate / 100);
    loan.fundings.forEach(f => {
      totalLenderCapital += f.amount;
      totalAnnualLenderCost += (f.amount * f.interestRate / 100);
    });
  });

  const netAnnualProfit = totalAnnualBorrowerYield - totalAnnualLenderCost;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>System Reports & Statements</h1>
        <div className={styles.actions}>
          <ExportButton />
        </div>
      </header>

      <div className={styles.reportGrid}>
        <div className={styles.reportCard}>
          <h3>System Profitability (Annualized Est.)</h3>
          <ul className={styles.list}>
            <li><span>Total Active Given Loans:</span> <strong>{formatMoney(activeLoans.reduce((sum, l) => sum + l.principalAmount, 0))}</strong></li>
            <li><span>Gross Yield (Borrower Int.):</span> <strong className={styles.textPositive}>{formatMoney(totalAnnualBorrowerYield)}</strong></li>
            <li><span>Cost of Capital (Lender Int.):</span> <strong className={styles.textNegative}>{formatMoney(totalAnnualLenderCost)}</strong></li>
            <li style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
              <span>Net Annual Profit:</span> <strong className={styles.textPositive}>{formatMoney(netAnnualProfit)}</strong>
            </li>
          </ul>
        </div>
        
        <div className={styles.reportCard}>
          <h3>Lender Capital Summary</h3>
          <ul className={styles.list}>
            <li><span>Total Deployed Capital:</span> <strong>{formatMoney(totalLenderCapital)}</strong></li>
            <li><span>Total Lenders:</span> <strong>{lenders.length}</strong></li>
          </ul>
        </div>
      </div>

      <div className={styles.card}>
        <h3>Lender Statements</h3>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Lender Name</th>
                <th>Invested Amount</th>
                <th>Deployed Amount</th>
                <th>Available Balance</th>
                <th>Est. Annual Interest Payable</th>
              </tr>
            </thead>
            <tbody>
              {lenders.map(lender => {
                const deployed = lender.fundings.reduce((sum, f) => sum + (f.loan.status === 'ACTIVE' ? f.amount : 0), 0);
                const available = lender.amountInvested - deployed;
                const annualInterest = lender.fundings.reduce((sum, f) => sum + (f.loan.status === 'ACTIVE' ? (f.amount * f.interestRate / 100) : 0), 0);
                
                return (
                  <tr key={lender.id}>
                    <td><strong>{lender.name}</strong></td>
                    <td>{formatMoney(lender.amountInvested)}</td>
                    <td>{formatMoney(deployed)}</td>
                    <td style={{ color: available < 0 ? "var(--danger)" : "inherit" }}>{formatMoney(available)}</td>
                    <td className={styles.textPositive}>{formatMoney(annualInterest)}</td>
                  </tr>
                );
              })}
              {lenders.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-secondary)" }}>No lenders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.card} style={{ marginTop: "2rem" }}>
        <h3>Loan Profitability Breakdown</h3>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Borrower</th>
                <th>Principal</th>
                <th>Gross Yield</th>
                <th>Blended Cost</th>
                <th>Net Margin</th>
                <th>Est. Annual Net Profit</th>
              </tr>
            </thead>
            <tbody>
              {activeLoans.map(loan => {
                const loanCost = loan.fundings.reduce((sum, f) => sum + (f.amount * f.interestRate / 100), 0);
                const blendedCostPct = (loanCost / loan.principalAmount) * 100;
                const netMarginPct = loan.interestRate - blendedCostPct;
                const annualNetProfit = (loan.principalAmount * netMarginPct / 100);

                return (
                  <tr key={loan.id}>
                    <td>{loan.customer.fullName}</td>
                    <td>{formatMoney(loan.principalAmount)}</td>
                    <td>{loan.interestRate.toFixed(2)}%</td>
                    <td>{blendedCostPct ? blendedCostPct.toFixed(2) + "%" : "0.00%"}</td>
                    <td style={{ color: netMarginPct > 0 ? "var(--success)" : "var(--danger)", fontWeight: 600 }}>
                      {netMarginPct.toFixed(2)}%
                    </td>
                    <td>{formatMoney(annualNetProfit)}</td>
                  </tr>
                );
              })}
              {activeLoans.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-secondary)" }}>No active loans found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

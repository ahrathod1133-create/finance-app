import { db } from "@/lib/db";
import styles from "./page.module.css";
import { format } from "date-fns";
import { CashFlowChart, PortfolioDistributionChart } from "@/components/Charts";
import { TrendingUp, TrendingDown, DollarSign, Briefcase, Activity, AlertCircle } from "lucide-react";

export default async function Home() {
  const activeLoans = await db.loan.findMany({
    where: { status: "ACTIVE" },
    include: { customer: true, fundings: true },
    orderBy: { createdAt: "desc" }
  });

  const totalGiven = activeLoans.filter(l => l.type === "GIVEN").reduce((sum, l) => sum + l.principalAmount, 0);
  const totalTaken = activeLoans.filter(l => l.type === "TAKEN").reduce((sum, l) => sum + l.principalAmount, 0);
  
  const toReceive = activeLoans.filter(l => l.type === "GIVEN").reduce((sum, l) => sum + l.remainingAmount, 0);
  const toPay = activeLoans.filter(l => l.type === "TAKEN").reduce((sum, l) => sum + l.remainingAmount, 0);

  // Profitability metrics
  let totalFunded = 0;
  let totalAnnualLenderCost = 0;
  let totalAnnualBorrowerYield = 0;
  let totalOutstanding = 0;

  activeLoans.forEach(loan => {
    totalOutstanding += loan.remainingAmount;
    if (loan.type === "GIVEN") {
      totalAnnualBorrowerYield += (loan.principalAmount * loan.interestRate / 100);
      loan.fundings.forEach(f => {
        totalFunded += f.amount;
        totalAnnualLenderCost += (f.amount * f.interestRate / 100);
      });
    }
  });

  const estimatedAnnualProfit = totalAnnualBorrowerYield - totalAnnualLenderCost;
  const monthlyProfit = estimatedAnnualProfit / 12;

  const lenders = await db.lender.findMany();
  const totalLenderCapital = lenders.reduce((sum, l) => sum + l.amountInvested, 0);
  const availableCapital = totalLenderCapital - totalFunded;

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  // Mock data for charts - in reality this would be aggregated by month from db
  const cashFlowData = [
    { name: 'Jan', Given: 400000, Taken: 240000 },
    { name: 'Feb', Given: 300000, Taken: 139000 },
    { name: 'Mar', Given: 200000, Taken: 980000 },
    { name: 'Apr', Given: 278000, Taken: 390000 },
    { name: 'May', Given: 189000, Taken: 480000 },
    { name: 'Jun', Given: 239000, Taken: 380000 },
  ];

  const portfolioData = lenders.map(l => ({
    name: l.name,
    value: l.amountInvested
  })).slice(0, 5); // Top 5 lenders

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Overview</h1>
      </header>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Cash Available</div>
            <div className={styles.cardIcon}><DollarSign size={20} /></div>
          </div>
          <div className={`${styles.cardValue} ${styles.info}`}>
            {formatMoney(availableCapital)}
          </div>
          <div className={styles.cardTrend}>
            <TrendingUp size={14} className={styles.positive} />
            <span className={styles.positive}>+2.4%</span> this month
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Total Money Given</div>
            <div className={styles.cardIcon}><Briefcase size={20} /></div>
          </div>
          <div className={`${styles.cardValue} ${styles.positive}`}>
            {formatMoney(totalGiven)}
          </div>
          <div className={styles.cardTrend}>
            <span className={styles.textMuted}>Active capital deployed</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Est. Monthly Profit</div>
            <div className={styles.cardIcon}><TrendingUp size={20} /></div>
          </div>
          <div className={`${styles.cardValue} ${monthlyProfit >= 0 ? styles.positive : styles.negative}`}>
            {formatMoney(monthlyProfit)}
          </div>
          <div className={styles.cardTrend}>
            <Activity size={14} className={styles.info} />
            <span className={styles.textMuted}>Based on current rates</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Money to Receive</div>
            <div className={styles.cardIcon}><AlertCircle size={20} /></div>
          </div>
          <div className={`${styles.cardValue} ${styles.warning}`}>
            {formatMoney(toReceive)}
          </div>
          <div className={styles.cardTrend}>
            <span className={styles.textMuted}>Total outstanding balance</span>
          </div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Cash Flow (Given vs Taken)</h3>
          <CashFlowChart data={cashFlowData} />
        </div>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Lender Capital Distribution</h3>
          <PortfolioDistributionChart data={portfolioData} />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Active Loans</h2>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Type</th>
                <th>Principal</th>
                <th>Balance</th>
                <th>Start Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeLoans.slice(0, 5).map(loan => (
                <tr key={loan.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{loan.customer.fullName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{loan.customer.mobileNumber}</div>
                  </td>
                  <td>
                    <span className={loan.type === 'GIVEN' ? 'badge badge-active' : 'badge badge-danger'}>
                      {loan.type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatMoney(loan.principalAmount)}</td>
                  <td style={{ color: 'var(--warning)' }}>{formatMoney(loan.remainingAmount)}</td>
                  <td>{format(new Date(loan.startDate), 'dd MMM yyyy')}</td>
                  <td>
                    <span className="badge badge-active">Active</span>
                  </td>
                </tr>
              ))}
              {activeLoans.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                    No active loans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

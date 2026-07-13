import { db } from "@/lib/db";
import styles from "./calendar.module.css";
import { format, addMonths } from "date-fns";

export default async function CalendarPage() {
  const activeLoans = await db.loan.findMany({
    where: { status: "ACTIVE" },
    include: { customer: true }
  });

  // Calculate upcoming due dates for the next 3 months based on startDate and duration
  const upcomingPayments = activeLoans.map(loan => {
    const nextDueDate = addMonths(new Date(loan.startDate), 1); // Simplification: assume monthly payments
    return {
      loan,
      dueDate: nextDueDate
    };
  }).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Payment Calendar</h1>
      </header>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Upcoming Due Dates</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {upcomingPayments.map(({ loan, dueDate }, index) => (
              <tr key={`${loan.id}-${index}`}>
                <td style={{ fontWeight: 600, color: "var(--accent-color)" }}>
                  {format(dueDate, "dd MMM yyyy")}
                </td>
                <td>{loan.customer.fullName}</td>
                <td>{loan.type}</td>
                <td>₹{loan.remainingAmount.toFixed(2)}</td>
              </tr>
            ))}
            {upcomingPayments.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>No upcoming payments.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

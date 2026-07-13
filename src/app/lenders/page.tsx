import { getLenders } from "@/actions/lender";
import { LendersClient } from "./LendersClient";
import styles from "./lenders.module.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Funding Sources | Finance Ledger",
};

export default async function LendersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q || "";
  const lenders = await getLenders(query);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Funding Sources (Lenders)</h1>
      </header>
      
      <LendersClient initialLenders={lenders} />
    </div>
  );
}

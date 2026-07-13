import { getCustomers } from "@/actions/customer";
import { getLenders } from "@/actions/lender";
import NewLoanForm from "./NewLoanForm";
import styles from "../loans.module.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewLoanPage() {
  const customers = await getCustomers();
  const lenders = await getLenders();
  
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/loans" className={styles.iconBtn}>
            <ArrowLeft size={24} />
          </Link>
          <h1 className={styles.title}>Create New Loan</h1>
        </div>
      </header>
      <div className={styles.formCard}>
        <NewLoanForm customers={customers} lenders={lenders} />
      </div>
    </div>
  );
}

import { db } from "@/lib/db";
import LoanDetailsClient from "./LoanDetailsClient";
import { notFound } from "next/navigation";

export default async function LoanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const loan = await db.loan.findUnique({
    where: { id },
    include: {
      customer: true,
      fundings: { include: { lender: true } },
      payments: { orderBy: { paymentDate: "desc" } },
      activityLogs: { orderBy: { createdAt: "desc" } },
      loanNotes: { orderBy: { createdAt: "desc" } },
      attachments: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!loan) return notFound();

  return <LoanDetailsClient loan={loan as any} />;
}

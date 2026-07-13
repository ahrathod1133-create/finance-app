"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addPayment(formData: FormData) {
  try {
    const loanId = formData.get("loanId") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const interestPaid = parseFloat(formData.get("interestPaid") as string);
    const principalPaid = parseFloat(formData.get("principalPaid") as string);
    const paymentMode = formData.get("paymentMode") as string;
    const referenceNumber = formData.get("referenceNumber") as string;
    const notes = formData.get("notes") as string;
    
    // Fetch current loan
    const loan = await db.loan.findUnique({ where: { id: loanId }});
    if (!loan) throw new Error("Loan not found");

    const newRemainingPrincipal = loan.remainingAmount - principalPaid;
    // Here we assume remainingInterest is tracked, we can simplify for now or implement full logic.
    // Full logic would require updating remainingInterest too if we tracked it in the DB.
    
    // Create payment
    await db.payment.create({
      data: {
        loanId,
        amount,
        interestPaid,
        principalPaid,
        remainingPrincipal: newRemainingPrincipal,
        remainingInterest: 0, // Placeholder
        paymentMode,
        referenceNumber,
        notes
      }
    });

    // Update loan
    const status = newRemainingPrincipal <= 0 ? "CLOSED" : "ACTIVE";
    
    await db.loan.update({
      where: { id: loanId },
      data: {
        remainingAmount: newRemainingPrincipal,
        status
      }
    });

    await db.activityLog.create({
      data: {
        loanId,
        action: "PAYMENT_ADDED",
        details: `Payment of ${amount} added (Principal: ${principalPaid}, Interest: ${interestPaid})`
      }
    });

    if (status === "CLOSED") {
      await db.activityLog.create({
        data: {
          loanId,
          action: "LOAN_CLOSED",
          details: `Loan closed as principal is fully paid.`
        }
      });
    }

    revalidatePath(`/loans/${loanId}`);
    revalidatePath("/loans");
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

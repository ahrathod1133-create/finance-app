"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createLoan(formData: FormData) {
  try {
    const customerId = formData.get("customerId") as string;
    const type = formData.get("type") as string;
    const principalAmount = parseFloat(formData.get("principalAmount") as string);
    const interestRate = parseFloat(formData.get("interestRate") as string);
    const interestType = formData.get("interestType") as string;
    const interestFrequency = formData.get("interestFrequency") as string;
    const startDate = new Date(formData.get("startDate") as string);
    
    // Duration
    const durationValue = parseInt(formData.get("durationValue") as string);
    const durationUnit = formData.get("durationUnit") as string;
    
    let durationDays = null;
    let durationMonths = null;
    let durationYears = null;
    
    if (durationUnit === "DAYS") durationDays = durationValue;
    if (durationUnit === "MONTHS") durationMonths = durationValue;
    if (durationUnit === "YEARS") durationYears = durationValue;

    const purpose = formData.get("purpose") as string;
    const notes = formData.get("notes") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    const referenceNumber = formData.get("referenceNumber") as string;

    const fundingsStr = formData.get("fundings") as string;
    let fundings = [];
    if (fundingsStr) {
      fundings = JSON.parse(fundingsStr);
    }

    const loan = await db.loan.create({
      data: {
        customerId,
        type,
        principalAmount,
        interestRate,
        interestType,
        interestFrequency,
        startDate,
        durationDays,
        durationMonths,
        durationYears,
        purpose,
        notes,
        paymentMethod,
        referenceNumber,
        remainingAmount: principalAmount,
        status: "ACTIVE",
        fundings: fundings.length > 0 ? {
          create: fundings.map((f: any) => ({
            lenderId: f.lenderId,
            amount: f.amount,
            interestRate: f.interestRate
          }))
        } : undefined
      }
    });

    await db.activityLog.create({
      data: {
        loanId: loan.id,
        action: "LOAN_CREATED",
        details: `Loan of ${principalAmount} created for ${customerId} with ${fundings.length} funding sources.`
      }
    });

    revalidatePath("/loans");
    revalidatePath("/");
    return { success: true, loanId: loan.id };
  } catch (error: any) {
    return { error: error.message || "Failed to create loan" };
  }
}

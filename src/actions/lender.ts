"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getLenders(query: string = "") {
  return await db.lender.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { mobile: { contains: query } }
      ]
    },
    include: {
      fundings: {
        include: { loan: true }
      }
    },
    orderBy: { name: "asc" }
  });
}

export async function createLender(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const mobile = formData.get("mobile") as string;
    const address = formData.get("address") as string;
    const notes = formData.get("notes") as string;
    const amountInvested = parseFloat(formData.get("amountInvested") as string);
    const interestRate = parseFloat(formData.get("interestRate") as string);

    if (!name || !mobile || isNaN(amountInvested) || isNaN(interestRate)) {
      return { error: "Please fill in all required fields correctly." };
    }

    const lender = await db.lender.create({
      data: {
        name,
        mobile,
        address: address || null,
        notes: notes || null,
        amountInvested,
        interestRate,
      }
    });

    await db.lenderTransaction.create({
      data: {
        lenderId: lender.id,
        type: "DEPOSIT",
        amount: amountInvested,
        notes: "Initial Investment"
      }
    });

    revalidatePath("/lenders");
    return { success: true, lender };
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      return { error: "A lender with this name already exists. Please choose a different name." };
    }
    console.error(error);
    return { error: "An unexpected error occurred while creating the lender." };
  }
}

export async function updateLender(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const mobile = formData.get("mobile") as string;
    const address = formData.get("address") as string;
    const notes = formData.get("notes") as string;
    const interestRate = parseFloat(formData.get("interestRate") as string);
    const status = formData.get("status") as string;

    if (!name || !mobile || isNaN(interestRate)) {
      return { error: "Please fill in all required fields correctly." };
    }

    const lender = await db.lender.update({
      where: { id },
      data: {
        name,
        mobile,
        address: address || null,
        notes: notes || null,
        interestRate,
        status: status || "ACTIVE"
      }
    });

    revalidatePath("/lenders");
    return { success: true, lender };
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      return { error: "A lender with this name already exists. Please choose a different name." };
    }
    console.error(error);
    return { error: "An unexpected error occurred while updating the lender." };
  }
}

export async function deleteLender(id: string) {
  await db.lender.delete({ where: { id } });
  revalidatePath("/lenders");
  return { success: true };
}

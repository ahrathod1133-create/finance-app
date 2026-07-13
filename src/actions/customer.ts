"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getCustomers(query: string = "") {
  return await db.customer.findMany({
    where: {
      OR: [
        { fullName: { contains: query } },
        { mobileNumber: { contains: query } }
      ]
    },
    orderBy: { fullName: "asc" }
  });
}

export async function createCustomer(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const mobileNumber = formData.get("mobileNumber") as string;
  const alternateNumber = formData.get("alternateNumber") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const notes = formData.get("notes") as string;

  if (!fullName || !mobileNumber) {
    return { error: "Name and Mobile Number are required." };
  }

  await db.customer.create({
    data: {
      fullName,
      mobileNumber,
      alternateNumber,
      address,
      city,
      state,
      notes,
    }
  });

  revalidatePath("/customers");
  return { success: true };
}

export async function deleteCustomer(id: string) {
  await db.customer.delete({ where: { id } });
  revalidatePath("/customers");
  return { success: true };
}

'use server';
 import { prisma } from '@/lib/db';
 import {revalidatePath} from 'next/cache';

 export async function addTransaction(formdata: FormData)
 {
    const amount= parseFloat(formdata.get('amount') as string);
    const category=formdata.get('category') as string;
    const mode=formdata.get('mode') as string;
    const type = formdata.get('type') as string; // 'income' or 'expense'
    const dateStr = formdata.get('date') as string;
    const timestamp = dateStr ? new Date(dateStr) : new Date();
    const remarks = formdata.get('remarks') as string || null;

    if (!amount || !category) return;

    await prisma.transaction.create({
        data: {
        amount,
        category,
        mode,
        remarks: remarks,
        type,
        createdAt: timestamp,
        
        },
    });
    revalidatePath('/');
 }
 
 export async function deleteTransaction(id: string) {
  await prisma.transaction.delete({
    where: { id },
  });

  revalidatePath('/');
}

 export async function getTransactions()
 {
    const data=await prisma.transaction.findMany({
        orderBy:{createdAt:'desc'},
    });
    return data;
 }
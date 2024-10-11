// app/types/Medicine.ts
import { Category, Supplier } from "@prisma/client";

export type MedicineWithRelations = {
    id: number;
    name: string;
    description: string;
    dosage: string;
    price: number;
    quantity: number;
    stockOpname: boolean;
    expiryDate: Date;
    supplierId: number;
    categoryId: number;
    category?: Category; // Include category relation
    supplier?: Supplier; // Include supplier relation
    createdAt: Date;
    updatedAt: Date;
};
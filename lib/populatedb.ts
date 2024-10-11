import { Supplier, Category, Medicine } from '@prisma/client';
import prisma from './db';

const db = prisma;
const API_BASE_URL = 'http://127.0.0.1:5000'; // Adjust if your Flask API is hosted elsewhere

// Function to fetch suppliers, categories, and medicines from the Flask API
async function fetchAndCreateEntries() {
    try {
        // Fetch suppliers from the Flask API
        const suppliersResponse = await fetch(`${API_BASE_URL}/suppliers`);
        const suppliers: Supplier[] = await suppliersResponse.json();

        // Create suppliers in the database and store their IDs
        const createdSuppliers = await Promise.all(
            suppliers.map((supplier: Supplier) => 
                db.supplier.create({
                    data: {
                        name: supplier.name,
                        contact: supplier.contact,
                        email: supplier.email,
                        address: supplier.address,
                    },
                })
            )
        );

        // Fetch categories from the Flask API
        const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
        const categories: Category[] = await categoriesResponse.json();

        // Create categories in the database and store their IDs
        const createdCategories = await Promise.all(
            categories.map((category: Category) => 
                db.category.create({
                    data: {
                        name: category.name,
                    },
                })
            )
        );

        // Fetch medicines from the Flask API
        const medicinesResponse = await fetch(`${API_BASE_URL}/medicines`);
        const medicines: Medicine[] = await medicinesResponse.json();

        // Create medicines in the database using existing supplier and category IDs
        for (const medicine of medicines) {
            // Randomly select existing supplier and category IDs
            const randomSupplier = createdSuppliers[Math.floor(Math.random() * createdSuppliers.length)];
            const randomCategory = createdCategories[Math.floor(Math.random() * createdCategories.length)];

            await db.medicine.create({
                data: {
                    name: medicine.name,
                    description: medicine.description,
                    dosage: medicine.dosage,
                    price: medicine.price,
                    quantity: medicine.quantity,
                    stockOpname: medicine.stockOpname,
                    expiryDate: new Date(medicine.expiryDate), // Convert to Date object
                    supplierId: randomSupplier.id, // Use the ID of an existing supplier
                    categoryId: randomCategory.id, // Use the ID of an existing category
                },
            });
        }

        console.log('Data successfully fetched and created in the database.');
    } catch (error) {
        console.error('Error fetching or creating entries:', error);
    } finally {
        await db.$disconnect();
    }
}

// Call the function to execute
fetchAndCreateEntries();
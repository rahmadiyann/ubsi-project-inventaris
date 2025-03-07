import prisma from "@/lib/db";
import { hash } from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

const db = prisma;

async function getSuppliers(specific: boolean = false) {
  if (specific) {
    const suppliers = await db.supplier.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return suppliers;
  }

  const suppliers = await db.supplier.findMany({
    include: {
      medicines: true,
    },
  });

  return suppliers;
}

async function getSupplier(id: number) {
  const supplier = await db.supplier.findUnique({
    where: {
      id: id,
    },
  });

  return supplier;
}

async function createSupplier(
  name: string,
  email: string,
  contact: string,
  address: string
) {
  const supplier = await db.supplier.create({
    data: {
      name: name,
      email: email,
      contact: contact,
      address: address,
    },
  });

  return supplier;
}

async function updateSupplier(
  id: number,
  name: string,
  email: string,
  contact: string,
  address: string
) {
  const supplier = await db.supplier.update({
    where: {
      id: id,
    },
    data: {
      name: name,
      email: email,
      contact: contact,
      address: address,
    },
  });

  return supplier;
}

async function deleteSupplier(id: number) {
  // Get all medicines from the supplier
  const medicines = await db.medicine.findMany({
    where: {
      supplierId: id,
    },
    select: {
      id: true,
    },
  });

  const medicineIds = medicines.map((medicine) => medicine.id);

  // Delete associated transactions first
  await db.transaction.deleteMany({
    where: {
      medicineId: {
        in: medicineIds,
      },
    },
  });

  // Then delete the medicines
  await db.medicine.deleteMany({
    where: {
      supplierId: id,
    },
  });

  // Finally delete the supplier
  const supplier = await db.supplier.delete({
    where: {
      id: id,
    },
  });

  return supplier;
}

async function getCategories(specific: boolean = false) {
  if (specific) {
    const categories = await db.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return categories;
  }

  const categories = await db.category.findMany({
    include: {
      medicines: true,
    },
  });

  return categories;
}

async function getCategory(id: number) {
  const category = await db.category.findUnique({
    where: {
      id: id,
    },
  });

  return category;
}

async function createCategory(name: string) {
  const category = await db.category.create({
    data: {
      name: name,
    },
  });

  return category;
}

async function updateCategory(id: number, name: string) {
  const category = await db.category.update({
    where: {
      id: id,
    },
    data: {
      name: name,
    },
  });

  return category;
}

async function deleteCategory(id: number) {
  // Get all medicines in the category
  const medicines = await db.medicine.findMany({
    where: {
      categoryId: id,
    },
    select: {
      id: true,
    },
  });

  const medicineIds = medicines.map((medicine) => medicine.id);

  // Delete associated transactions first
  await db.transaction.deleteMany({
    where: {
      medicineId: {
        in: medicineIds,
      },
    },
  });

  // Then delete the medicines
  await db.medicine.deleteMany({
    where: {
      categoryId: id,
    },
  });

  // Finally delete the category
  const category = await db.category.delete({
    where: {
      id: id,
    },
  });

  return category;
}

async function getMedicines(specific: boolean = false) {
  if (specific) {
    const medicines = await db.medicine.findMany({
      select: {
        id: true,
        name: true,
        quantity: true,
      },
    });
    return medicines;
  }

  const medicines = await db.medicine.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      dosage: true,
      expiryDate: true,
      description: true,
      quantity: true,
      stockOpname: true,
    },
  });

  return medicines;
}

async function getMedicine(id: number) {
  const medicine = await db.medicine.findUnique({
    where: {
      id: id,
    },
    include: {
      category: true,
      supplier: true,
    },
  });

  return medicine;
}

async function createMedicine(
  name: string,
  description: string,
  price: number,
  quantity: number,
  categoryId: number,
  supplierId: number,
  dosage: string,
  expiryDate: Date
) {
  const medicine = await db.medicine.create({
    data: {
      name: name,
      description: description,
      price: price,
      quantity: quantity,
      categoryId: categoryId,
      supplierId: supplierId,
      dosage: dosage,
      expiryDate: expiryDate,
    },
  });

  return medicine;
}

async function updateMedicine(
  id: number,
  name: string,
  description: string,
  dosage: string,
  expiryDate: Date,
  stockOpname: boolean,
  price: number,
  quantity: number
) {
  const medicine = await db.medicine.update({
    where: {
      id: id,
    },
    data: {
      name: name,
      description: description,
      dosage: dosage,
      expiryDate: expiryDate,
      price: price,
      quantity: quantity,
      stockOpname: stockOpname,
    },
  });

  return medicine;
}

async function confirmStockOpname(id: number) {
  const medicine = await db.medicine.update({
    where: {
      id: id,
    },
    data: {
      stockOpname: true,
    },
  });

  return medicine;
}

async function deleteMedicine(id: number) {
  // Check for transactions using the medicineId
  const transactions = await db.transaction.findMany({
    where: {
      medicineId: id,
    },
  });

  // Delete associated transactions if they exist
  if (transactions.length > 0) {
    await db.transaction.deleteMany({
      where: {
        medicineId: id,
      },
    });
  }

  // Finally, delete the medicine
  const medicine = await db.medicine.delete({
    where: {
      id: id,
    },
  });

  return medicine;
}

async function getTransactions() {
  const transactions = await db.transaction.findMany({
    select: {
      id: true,
      type: true,
      quantity: true,
      totalPrice: true,
      createdAt: true,
      operator: {
        select: {
          name: true,
        },
      },
      medicine: {
        select: {
          name: true,
          quantity: true,
          price: true,
        },
      },
    },
  });

  return transactions;
}

async function createTransaction(
  medicineId: number,
  type: string,
  quantity: number,
  operatorId: number
) {
  if (type === "purchase") {
    console.log(
      `new purchase of medicineId: ${medicineId}, quantity: ${quantity}`
    );
    const medicine = await db.medicine.findUnique({
      where: {
        id: medicineId,
      },
    });

    if (!medicine) {
      return { error: "Medicine not found", status: 404 };
    }

    const transaction = await db.transaction.create({
      data: {
        medicineId: medicineId,
        type: type,
        quantity: quantity,
        operatorId: operatorId,
        totalPrice: quantity * medicine.price,
      },
    });

    await db.medicine.update({
      where: {
        id: medicineId,
      },
      data: {
        quantity: medicine.quantity + quantity,
        stockOpname: false,
      },
    });

    return transaction;
  }

  if (type === "sale") {
    console.log(`new sale of medicineId: ${medicineId}, quantity: ${quantity}`);
    const medicine = await db.medicine.findUnique({
      where: {
        id: medicineId,
      },
    });

    if (!medicine) {
      return { error: "Medicine not found", status: 404 };
    }

    if (medicine.quantity < quantity) {
      return {
        error: "Medicine quantity is less than the requested quantity",
        status: 400,
      };
    }

    const transaction = await db.transaction.create({
      data: {
        medicineId: medicineId,
        type: type,
        quantity: quantity,
        operatorId: operatorId,
        totalPrice: quantity * medicine.price,
      },
    });

    await db.medicine.update({
      where: {
        id: medicineId,
      },
      data: {
        quantity: medicine.quantity - quantity,
        stockOpname: false,
      },
    });

    return transaction;
  }

  return { error: "Invalid transaction type", status: 400 };
}

async function getTransaction(id: number) {
  const transaction = await db.transaction.findUnique({
    where: {
      id: id,
    },
  });

  return transaction;
}

async function updateTransaction(id: number, quantity: number) {
  const transaction = await db.transaction.update({
    where: {
      id: id,
    },
    data: {
      quantity: quantity,
    },
  });

  return transaction;
}

async function deleteTransaction(id: number) {
  const transaction = await db.transaction.delete({
    where: {
      id: id,
    },
  });

  return transaction;
}

async function getUsers() {
  const operators = await db.operator.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return operators;
}

async function getUser(id: number) {
  const operator = await db.operator.findUnique({
    where: {
      id: id,
    },
  });

  return operator;
}

async function createUser(
  name: string,
  email: string,
  role: string,
  password: string
) {
  const operator = await db.operator.create({
    data: {
      name: name,
      email: email,
      role: role,
      password: password,
    },
  });

  return operator;
}

async function updateUser(
  id: number,
  name: string,
  email: string,
  role: string
) {
  const operator = await db.operator.update({
    where: {
      id: id,
    },
    data: {
      name: name,
      email: email,
      role: role,
    },
  });

  return operator;
}

async function deleteUser(id: number) {
  const operator = await db.operator.delete({
    where: {
      id: id,
    },
  });

  return operator;
}

export async function POST(req: NextRequest, res: NextResponse) {
  const data = await req.json();

  if (!data.actionType) {
    return NextResponse.json(
      { error: "Action type is required" },
      { status: 400 }
    );
  }

  if (data.actionType === "operator") {
    const password =
      data.name.toLowerCase() + data.email.split("@")[0].toLowerCase();
    const operator = await createUser(
      data.name,
      data.email,
      data.role,
      await hash(password, 10)
    );
    return NextResponse.json({ ...operator, password }, { status: 200 });
  }

  if (data.actionType === "supplier") {
    const supplier = await createSupplier(
      data.name,
      data.email,
      data.contact,
      data.address
    );
    return NextResponse.json(supplier, { status: 200 });
  }

  if (data.actionType === "category") {
    const category = await createCategory(data.name);
    return NextResponse.json(category, { status: 200 });
  }

  if (data.actionType === "medicine") {
    const expiryDate = new Date(data.expiryDate);
    const medicine = await createMedicine(
      data.name,
      data.description,
      data.price,
      data.quantity,
      data.categoryId,
      data.supplierId,
      data.dosage,
      expiryDate
    );
    return NextResponse.json(medicine, { status: 200 });
  }

  if (data.actionType === "transaction") {
    if (
      !data.medicineId ||
      !data.transactionType ||
      !data.quantity ||
      !data.operatorId
    ) {
      return NextResponse.json(
        { error: "Missing required fields for transaction" },
        { status: 400 }
      );
    }
    const transaction = await createTransaction(
      data.medicineId,
      data.transactionType,
      data.quantity,
      data.operatorId
    );
    return NextResponse.json(transaction, { status: 200 });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

export async function PUT(req: NextRequest, res: NextResponse) {
  const data = await req.json();

  if (!data.actionType) {
    return NextResponse.json(
      { error: "Action type is required" },
      { status: 400 }
    );
  }

  if (data.actionType === "supplier") {
    const supplier = await updateSupplier(
      data.id,
      data.name,
      data.email,
      data.contact,
      data.address
    );
    return NextResponse.json(supplier, { status: 200 });
  }

  if (data.actionType === "category") {
    const category = await updateCategory(data.id, data.name);
    return NextResponse.json(category, { status: 200 });
  }

  if (data.actionType === "medicine") {
    const medicine = await updateMedicine(
      data.id,
      data.name,
      data.description,
      data.dosage,
      data.expiryDate,
      data.stockOpname,
      data.price,
      data.quantity
    );
    return NextResponse.json(medicine, { status: 200 });
  }

  if (data.actionType === "confirm-stock-opname") {
    const medicine = await confirmStockOpname(data.id);
    return NextResponse.json(medicine, { status: 200 });
  }

  if (data.actionType === "transaction") {
    const transaction = await updateTransaction(data.id, data.quantity);
    return NextResponse.json(transaction, { status: 200 });
  }

  if (data.actionType === "operator") {
    const user = await updateUser(data.id, data.name, data.email, data.role);
    return NextResponse.json(user, { status: 200 });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

export async function DELETE(req: NextRequest, res: NextResponse) {
  const data = await req.json();
  console.log(JSON.stringify(data, null, 2));

  if (!data.actionType) {
    return NextResponse.json({ error: "Type is required" }, { status: 400 });
  }

  if (data.actionType === "supplier") {
    const supplier = await deleteSupplier(data.id);
    return NextResponse.json(supplier, { status: 200 });
  }

  if (data.actionType === "category") {
    const category = await deleteCategory(data.id);
    return NextResponse.json(category, { status: 200 });
  }

  if (data.actionType === "medicine") {
    const medicine = await deleteMedicine(data.id);
    return NextResponse.json(medicine, { status: 200 });
  }

  if (data.actionType === "transaction") {
    const transaction = await deleteTransaction(data.id);
    return NextResponse.json(transaction, { status: 200 });
  }

  if (data.actionType === "operator") {
    const user = await deleteUser(data.id);
    return NextResponse.json(user, { status: 200 });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

export async function GET(req: NextRequest, res: NextResponse) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const specific = searchParams.get("specific") || null;
  const id = searchParams.get("id") || null;

  if (!type) {
    return NextResponse.json({ error: "Type is required" }, { status: 400 });
  }

  if (id) {
    if (type === "supplier") {
      const supplier = await getSupplier(Number(id));
      return NextResponse.json(supplier, { status: 200 });
    }

    if (type === "category") {
      const category = await getCategory(Number(id));
      return NextResponse.json(category, { status: 200 });
    }

    if (type === "medicine") {
      const medicine = await getMedicine(Number(id));
      return NextResponse.json(medicine, { status: 200 });
    }

    if (type === "transaction") {
      const transaction = await getTransaction(Number(id));
      return NextResponse.json(transaction, { status: 200 });
    }

    if (type === "user") {
      const user = await getUser(Number(id));
      return NextResponse.json(user, { status: 200 });
    }
  }

  if (type === "suppliers") {
    if (specific === "true") {
      const suppliers = await getSuppliers(true);
      return NextResponse.json(suppliers, { status: 200 });
    }
    const suppliers = await getSuppliers();
    return NextResponse.json(suppliers, { status: 200 });
  }

  if (type === "categories") {
    if (specific === "true") {
      const categories = await getCategories(true);
      return NextResponse.json(categories, { status: 200 });
    }
    const categories = await getCategories();
    return NextResponse.json(categories, { status: 200 });
  }

  if (type === "medicines") {
    if (specific === "true") {
      const medicines = await getMedicines(true);
      return NextResponse.json(medicines, { status: 200 });
    }
    const medicines = await getMedicines();
    return NextResponse.json(medicines, { status: 200 });
  }

  if (type === "transactions") {
    const transactions = await getTransactions();
    return NextResponse.json(transactions, { status: 200 });
  }

  if (type === "users") {
    const users = await getUsers();
    return NextResponse.json(users, { status: 200 });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

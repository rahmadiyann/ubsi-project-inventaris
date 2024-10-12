import prisma from "./db";

const db = prisma;

export async function fetchDataForVisualizations() {
  // 1. Supplier Overview Chart
  const suppliers = await db.supplier.findMany({
    include: {
      medicines: true,
    },
  });
  const supplierOverview = suppliers.map((supplier) => ({
    name: supplier.name,
    medicineCount: supplier.medicines.length,
  }));

  // 2. Category Distribution
  const categories = await db.category.findMany({
    include: {
      medicines: true,
    },
  });
  const categoryDistribution = categories.map((category) => ({
    name: category.name,
    medicineCount: category.medicines.length,
  }));

  // 3. Transaction Trends
  const transactions = await db.transaction.findMany({
    select: {
      createdAt: true,
      totalPrice: true,
    },
  });
  const transactionTrends = transactions.reduce((acc, transaction) => {
    const date = transaction.createdAt.toISOString().split("T")[0]; // Format date to YYYY-MM-DD
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += transaction.totalPrice;
    return acc;
  }, {} as Record<string, number>);

  // Convert to array for graphing
  const transactionTrendsArray = Object.entries(transactionTrends).map(
    ([date, totalPrice]) => ({
      date,
      totalPrice,
    })
  );

  // 4. Operator Performance
  const operators = await db.operator.findMany({
    include: {
      transactions: true,
    },
    where: {
      role: "operator",
    },
  });
  const operatorPerformance = operators.map((operator) => ({
    name: operator.name.split(" ")[0],
    transactionCount: operator.transactions.length,
  }));

  // 5. Expiry Date Analysis
  const medicines = await prisma.medicine.findMany();
  const expiryAnalysis = medicines.reduce((acc, medicine) => {
    const daysToExpiry = Math.ceil(
      (medicine.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    if (daysToExpiry >= 1 && daysToExpiry <= 5)
      acc["1-5"] = (acc["1-5"] || 0) + 1;
    else if (daysToExpiry >= 6 && daysToExpiry <= 10)
      acc["6-10"] = (acc["6-10"] || 0) + 1;
    else if (daysToExpiry >= 11 && daysToExpiry <= 15)
      acc["11-15"] = (acc["11-15"] || 0) + 1;
    else if (daysToExpiry >= 16 && daysToExpiry <= 20)
      acc["16-20"] = (acc["16-20"] || 0) + 1;
    else if (daysToExpiry >= 21 && daysToExpiry <= 25)
      acc["21-25"] = (acc["21-25"] || 0) + 1;
    else if (daysToExpiry >= 26 && daysToExpiry <= 30)
      acc["26-30"] = (acc["26-30"] || 0) + 1;
    else if (daysToExpiry > 30) acc[">30"] = (acc[">30"] || 0) + 1;

    return acc;
  }, {} as Record<string, number>);

  // Convert to array for graphing
  const expiryAnalysisArray = Object.entries(expiryAnalysis).map(
    ([range, count]) => ({
      range,
      count,
    })
  );

  // 6. Medicine Price Distribution
  const priceDistribution = await db.medicine.findMany({
    select: {
      price: true,
    },
  });
  const prices = priceDistribution.map((medicine) => medicine.price);

  // 7. Medicine Near Expiry
  const medicineNearExpiry = await db.medicine.findMany({
    where: {
      expiryDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    },
  });
  const medicineNearExpiryArray = medicineNearExpiry.map((medicine) => ({
    name: medicine.name,
    expiryDate: medicine.expiryDate.toISOString().split("T")[0],
  }));

  return {
    supplierOverview,
    categoryDistribution,
    transactionTrends: transactionTrendsArray,
    operatorPerformance,
    expiryAnalysis: expiryAnalysisArray,
    priceDistribution: prices,
    medicineNearExpiry: medicineNearExpiryArray,
  };
}

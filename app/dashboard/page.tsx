"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Loader2, LogOut, RefreshCw } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteCookie, getUser } from "@/lib/api/auth";

interface ChartData {
  supplierOverview: { name: string; medicineCount: number }[];
  categoryDistribution: { name: string; medicineCount: number }[];
  transactionTrends: { date: string; totalPrice: number }[];
  operatorPerformance: { name: string; transactionCount: number }[];
  expiryAnalysis: { range: string; count: number }[];
  priceDistribution: number[];
  medicineNearExpiry: { name: string; expiryDate: string }[];
  inventoryTurnover: { product: string; turnoverRate: number }[];
  profitMargins: { product: string; margin: number }[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function DashboardPage() {
  const [data, setData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const router = useRouter();

  useEffect(() => {
    const determineUser = async () => {
      const userData = await getUserData();
      if (!userData) {
        router.push("/auth");
      } else if (userData.userRole === "operator") {
        router.push("/admin");
      } else if (userData.userRole !== "stakeholder") {
        router.push("/auth");
      }
    };

    determineUser();

    fetchData();

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/testing");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getUserData = async () => {
    const userData = await getUser();
    return userData;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>{error}</CardContent>
        </Card>
      </div>
    );
  }

  if (!data || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const isMediumScreen = windowWidth >= 640 && windowWidth < 1024;

  // Sort supplier overview data by medicineCount
  const sortedSupplierOverview = [...data.supplierOverview].sort(
    (a, b) => b.medicineCount - a.medicineCount
  );

  const CustomizedAxisTick = (props: any) => {
    const { x, y, payload } = props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          fill="#666"
          transform="rotate(-45)"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  async function clearCookies() {
    await deleteCookie("token");
  }

  const signOut = async () => {
    await clearCookies();
    router.push("/auth");
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-row justify-between items-center mb-4">
        <div className="flex flex-row items-center">
          <Image src="/logo.png" alt="logo" width={40} height={40} />
          <h1 className="text-3xl font-bold mb-0">Dashboard</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon">
                <LogOut className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will log you out of the system.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={signOut}>Log Out</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Supplier Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sortedSupplierOverview}>
                <XAxis
                  dataKey="name"
                  interval={0}
                  height={100}
                  tick={<CustomizedAxisTick />}
                />
                <YAxis />
                <Tooltip />
                {/* {isMediumScreen && <Legend />} */}
                <Bar
                  dataKey="medicineCount"
                  fill="#8884d8"
                  name="Medicine Count"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.categoryDistribution}
                  dataKey="medicineCount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {data.categoryDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                {<Legend />}
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Trends by Date</CardTitle>
          </CardHeader>
          <CardContent>
            {data.transactionTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.transactionTrends}>
                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  {isMediumScreen && <Legend />}
                  <Line
                    type="monotone"
                    dataKey="totalPrice"
                    stroke="#8884d8"
                    name="Total Price"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operator Performance by Transaction Count</CardTitle>
          </CardHeader>
          <CardContent>
            {data.operatorPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={data.operatorPerformance.sort(
                    (a, b) => b.transactionCount - a.transactionCount
                  )}
                >
                  <XAxis
                    dataKey="name"
                    interval={0}
                    height={100}
                    tick={<CustomizedAxisTick />}
                  />
                  <YAxis />
                  <Tooltip />
                  {/* {isMediumScreen && <Legend />} */}
                  <Bar
                    dataKey="transactionCount"
                    fill="#82ca9d"
                    name="Transaction Count"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Days to Expiry</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.expiryAnalysis}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {data.expiryAnalysis.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                {<Legend />}
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Price Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data.priceDistribution.map((price, index) => ({
                  price,
                  index,
                }))}
              >
                <XAxis dataKey="index" />
                <YAxis />
                <Tooltip />
                {isMediumScreen && <Legend />}
                <Bar dataKey="price" fill="#ffc658" name="Price" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Medicines Near Expiry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Medicine Name
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Expiry Date
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Days Left
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.medicineNearExpiry
                    .map((medicine) => ({
                      ...medicine,
                      daysLeft: Math.ceil(
                        (new Date(medicine.expiryDate).getTime() -
                          new Date().getTime()) /
                          (1000 * 3600 * 24)
                      ),
                    }))
                    .sort((a, b) => a.daysLeft - b.daysLeft)
                    .map((medicine, index) => (
                      <tr
                        key={index}
                        className="bg-white border-b hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {medicine.name}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(medicine.expiryDate).toLocaleDateString()}
                        </td>
                        <td
                          className={`px-6 py-4 ${
                            medicine.daysLeft <= 7
                              ? "text-red-500 font-bold"
                              : medicine.daysLeft <= 14
                              ? "text-yellow-500"
                              : "text-green-500"
                          }`}
                        >
                          {medicine.daysLeft} days
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

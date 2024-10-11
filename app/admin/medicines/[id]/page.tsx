"use client";

import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  FileText,
  Package,
  Pill,
  Tag,
  Truck,
  Edit,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { MedicineWithRelations } from "@/app/types/Medicine";

export default function MedicineDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [medicine, setMedicine] = useState<MedicineWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    price: 0,
    quantity: 0,
  });

  useEffect(() => {
    const fetchMedicine = async () => {
      if (params.id) {
        try {
          const response = await fetch(
            `/api/prisma?type=medicine&id=${params.id}`
          );
          if (!response.ok) throw new Error("Failed to fetch medicine");
          const data: MedicineWithRelations = await response.json();
          setMedicine(data);
          setEditFormData({
            name: data.name,
            description: data.description,
            price: data.price,
            quantity: data.quantity,
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchMedicine();
  }, [params.id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "quantity" ? parseFloat(value) : value,
    }));
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(`/api/prisma`, {
        method: "PUT",
        body: JSON.stringify({
          type: "medicine",
          id: params.id,
          ...editFormData,
        }),
      });
      if (!response.ok) throw new Error("Failed to edit medicine");
      toast({ title: "Success", description: "Medicine updated successfully" });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update medicine",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/prisma`, {
        method: "DELETE",
        body: JSON.stringify({
          type: "medicines",
          id: params.id,
        }),
      });
      if (!response.ok) throw new Error("Failed to delete medicine");
      toast({ title: "Success", description: "Medicine deleted successfully" });
      router.push("/admin/medicine");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete medicine",
        variant: "destructive",
      });
    }
  };

  const handleStockOpname = async () => {
    try {
      const response = await fetch(`/api/prisma`, {
        method: "PUT",
        body: JSON.stringify({
          type: "medicines",
          id: params.id,
          stockOpname: true,
        }),
      });
      if (!response.ok) throw new Error("Failed to update stock opname");
      toast({
        title: "Success",
        description: "Stock opname confirmed successfully",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm stock opname",
        variant: "destructive",
      });
    }
  };

  if (loading) return <MedicineDetailSkeleton />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!medicine) return <div className="text-gray-500">Medicine not found</div>;

  return (
    <div className="flex justify-center items-center container mx-auto p-6 h-screen">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-[#FF4C4C] to-[#003366]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Pill className="text-white h-10 w-10" />
              <CardTitle className="text-3xl font-bold text-white">
                {medicine.name}
              </CardTitle>
            </div>
            <div className="flex space-x-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="secondary" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{medicine.name}</AlertDialogTitle>
                    <AlertDialogDescription>
                      Make changes to the medicine details below.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={editFormData.name}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={editFormData.description}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">
                        Price
                      </Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        value={editFormData.price}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="quantity" className="text-right">
                        Quantity
                      </Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        value={editFormData.quantity}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleEdit}>
                      Save changes
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the medicine from the database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem
              icon={FileText}
              title="Description"
              value={medicine.description}
            />
            <InfoItem
              icon={DollarSign}
              title="Price"
              value={`${medicine.price.toFixed(2)}`}
            />
            <InfoItem
              icon={Package}
              title="Quantity in Stock"
              value={medicine.quantity.toString()}
            />
            <InfoItem
              icon={Tag}
              title="Category"
              value={medicine.category?.name || "N/A"}
            />
            <InfoItem
              icon={Truck}
              title="Supplier"
              value={medicine.supplier?.name || "N/A"}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <CardDescription>
            Last updated: {new Date(medicine.updatedAt).toLocaleString()}
          </CardDescription>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={medicine.stockOpname}>
                {medicine.stockOpname
                  ? "Stock Opname Confirmed"
                  : "Confirm Stock Opname"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Stock Opname</AlertDialogTitle>
                <AlertDialogDescription>
                  Make sure the stock opname is correct!
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleStockOpname}>
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 w-5 h-5 mt-1">
        <Icon className="w-full h-full text-gray-500" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function MedicineDetailSkeleton() {
  return (
    <div className="flex justify-center items-center container mx-auto p-6 h-screen">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-[#FF4C4C] to-[#003366]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-8 w-48" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-40" />
        </CardFooter>
      </Card>
    </div>
  );
}

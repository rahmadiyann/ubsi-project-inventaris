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
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Edit,
  Trash2,
} from "lucide-react";
import { Supplier } from "@prisma/client";

export default function SupplierDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    contact: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    const fetchSupplier = async () => {
      if (params.id) {
        try {
          const response = await fetch(
            `/api/prisma?type=supplier&id=${params.id}`
          );
          if (!response.ok) throw new Error("Failed to fetch supplier");
          const data: Supplier = await response.json();
          setSupplier(data);
          setEditFormData({
            name: data.name,
            contact: data.contact,
            email: data.email,
            address: data.address,
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSupplier();
  }, [params.id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(`/api/prisma`, {
        method: "PUT",
        body: JSON.stringify({
          type: "supplier",
          id: params.id,
          ...editFormData,
        }),
      });
      if (!response.ok) throw new Error("Failed to edit supplier");
      toast({ title: "Success", description: "Supplier updated successfully" });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update supplier",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/prisma`, {
        method: "DELETE",
        body: JSON.stringify({
          type: "suppliers",
          id: params.id,
        }),
      });
      if (!response.ok) throw new Error("Failed to delete supplier");
      toast({ title: "Success", description: "Supplier deleted successfully" });
      router.push("/admin/suppliers");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      });
    }
  };

  if (loading) return <SupplierDetailSkeleton />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!supplier) return <div className="text-gray-500">Supplier not found</div>;

  return (
    <div className="flex justify-center items-center container mx-auto p-6 h-screen">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-[#4C4CFF] to-[#003366]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Building className="text-white h-10 w-10" />
              <CardTitle className="text-3xl font-bold text-white">
                {supplier.name}
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
                    <AlertDialogTitle>{supplier.name}</AlertDialogTitle>
                    <AlertDialogDescription>
                      Make changes to the supplier details below.
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
                      <Label htmlFor="phone" className="text-right">
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        name="contact"
                        value={editFormData.contact}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={editFormData.email}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="address" className="text-right">
                        Address
                      </Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={editFormData.address}
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
                      the supplier from the database.
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
            <InfoItem icon={Mail} title="Email" value={supplier.email} />
            <InfoItem icon={Phone} title="Phone" value={supplier.contact} />
            <InfoItem icon={MapPin} title="Address" value={supplier.address} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <CardDescription>
            Last updated: {new Date(supplier.updatedAt).toLocaleString()}
          </CardDescription>
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

function SupplierDetailSkeleton() {
  return (
    <div className="flex justify-center items-center container mx-auto p-6 h-screen">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-[#4C4CFF] to-[#003366]">
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
            {[...Array(4)].map((_, i) => (
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
        </CardFooter>
      </Card>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Plus, RefreshCw, Truck, Edit, Trash2 } from "lucide-react";
import { fetchTabData } from "../(utils)/api";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/api/auth";

export default function SuppliersTab() {
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    email: "",
    contact: "",
    address: "",
  });
  const [editSupplier, setEditSupplier] = useState<any>(null);
  const [isAddSupplierDialogOpen, setIsAddSupplierDialogOpen] = useState(false);
  const { toast } = useToast();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const user = await getUser();
      if (user) {
        setUserData(user);
      }
    };
    const fetchData = async () => {
      const fetchedData = await fetchTabData("suppliers");
      setData(fetchedData);
    };
    checkUser();
    fetchData();
  }, []);

  const filteredData = data.filter((item) =>
    Object.values(item).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleRefresh = async () => {
    setData([]);
    const fetchedData = await fetchTabData("suppliers");
    setData(fetchedData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSupplier((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSupplier = async () => {
    try {
      const response = await fetch("/api/prisma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType: "supplier", ...newSupplier }),
      });
      if (!response.ok) throw new Error("Failed to add supplier");
      toast({
        title: "Success",
        description: "Supplier added successfully",
      });
      handleRefresh();
      setIsAddSupplierDialogOpen(false);
      setNewSupplier({ name: "", email: "", contact: "", address: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add supplier",
        variant: "destructive",
      });
    }
  };

  const isAddSupplierDisabled =
    !newSupplier.name || !newSupplier.contact || !newSupplier.address;

  const handleEditClick = (supplier: any) => {
    setEditSupplier(supplier);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditSupplier((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleEditSupplier = async () => {
    try {
      const response = await fetch("/api/prisma", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType: "supplier", ...editSupplier }),
      });
      if (!response.ok) throw new Error("Failed to update supplier");
      toast({
        title: "Success",
        description: "Supplier updated successfully",
      });
      handleRefresh();
      setEditSupplier(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update supplier",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    try {
      const response = await fetch("/api/prisma", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType: "supplier", id }),
      });
      if (!response.ok) throw new Error("Failed to delete supplier");
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      });
      handleRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      });
    }
  };

  const isViewer = userData && userData.userRole === "viewer";

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <CardTitle className="flex items-center">
            <Truck className="mr-2 h-4 w-4" />
            Suppliers
          </CardTitle>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <AlertDialog
              open={isAddSupplierDialogOpen}
              onOpenChange={setIsAddSupplierDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  disabled={isViewer}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Supplier
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[90vw] w-full sm:max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle>Add New Supplier</AlertDialogTitle>
                  <AlertDialogDescription>
                    Enter the details of the new supplier below.
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
                      value={newSupplier.name}
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
                      value={newSupplier.email}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="contact" className="text-right">
                      Contact
                    </Label>
                    <Input
                      id="contact"
                      name="contact"
                      value={newSupplier.contact}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">
                      Address
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={newSupplier.address}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => {
                      setNewSupplier({
                        name: "",
                        email: "",
                        contact: "",
                        address: "",
                      });
                      setIsAddSupplierDialogOpen(false);
                    }}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleAddSupplier}
                    disabled={isAddSupplierDisabled}
                  >
                    Add Supplier
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          placeholder="Search suppliers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 w-full"
        />
        <div className="overflow-auto h-[calc(100vh-400px)] w-full">
          {data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="min-w-full w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2">
                      Name
                    </TableHead>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2 hidden lg:table-cell">
                      Email
                    </TableHead>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2 hidden lg:table-cell">
                      Contact
                    </TableHead>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2 hidden lg:table-cell">
                      Address
                    </TableHead>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2">
                      Medicines
                    </TableHead>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData
                    .sort((a, b) => a.id - b.id)
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="px-2 py-1 sm:px-4 sm:py-2">
                          {item.name}
                        </TableCell>
                        <TableCell className="px-2 py-1 sm:px-4 sm:py-2 hidden lg:table-cell">
                          {item.email}
                        </TableCell>
                        <TableCell className="px-2 py-1 sm:px-4 sm:py-2 hidden lg:table-cell">
                          {item.contact}
                        </TableCell>
                        <TableCell className="px-2 py-1 sm:px-4 sm:py-2 hidden lg:table-cell">
                          {item.address}
                        </TableCell>
                        <TableCell className="px-2 py-1 sm:px-4 sm:py-2">
                          {item.medicines
                            .map((medicine: any) => medicine.name)
                            .join(", ")}
                        </TableCell>
                        <TableCell className="px-2 py-1 sm:px-4 sm:py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(item)}
                            disabled={isViewer}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isViewer}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the supplier.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteSupplier(item.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          )}
        </div>
      </CardContent>
      <AlertDialog
        open={!!editSupplier}
        onOpenChange={(open) => {
          if (!open) {
            setEditSupplier(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Make changes to the supplier details below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={editSupplier?.name || ""}
                onChange={handleEditInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                name="email"
                value={editSupplier?.email || ""}
                onChange={handleEditInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-contact" className="text-right">
                Contact
              </Label>
              <Input
                id="edit-contact"
                name="contact"
                value={editSupplier?.contact || ""}
                onChange={handleEditInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-address" className="text-right">
                Address
              </Label>
              <Input
                id="edit-address"
                name="address"
                value={editSupplier?.address || ""}
                onChange={handleEditInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditSupplier(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleEditSupplier}>
              Save changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

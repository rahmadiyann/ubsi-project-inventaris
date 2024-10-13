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
import {
  Loader2,
  Pill,
  RefreshCw,
  Edit,
  Trash2,
  CalendarIcon,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { getUser } from "@/lib/api/auth";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Add these interfaces
interface Supplier {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

export default function MedicinesTab() {
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    description: "",
    price: 0,
    quantity: 0,
    supplierId: "",
    categoryId: "",
    dosage: "",
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  const { toast } = useToast();
  const [editMedicine, setEditMedicine] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const checkUser = async () => {
      const user = await getUser();
      if (user) {
        setUserData(user);
      }
    };
    checkUser();
    const fetchData = async () => {
      const fetchedData = await fetchTabData("medicines");
      setData(fetchedData);
    };
    fetchData();

    const fetchSuppliers = async () => {
      const suppliersData = await fetchTabData("suppliers");
      setSuppliers(suppliersData);
    };
    const fetchCategories = async () => {
      const categoriesData = await fetchTabData("categories");
      setCategories(categoriesData);
    };
    fetchSuppliers();
    fetchCategories();
  }, []);

  const filteredData = data.filter((item) =>
    [
      item.name,
      item.description,
      item.stockOpname ? "Confirmed" : "Pending",
    ].some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const fetchData = async () => {
    setData([]);
    const fetchedData = await fetchTabData("medicines");
    setData(fetchedData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMedicine((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "quantity" ? parseFloat(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string | Date) => {
    setNewMedicine((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMedicine = async () => {
    try {
      const response = await fetch("/api/prisma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType: "medicine", ...newMedicine }),
      });
      if (!response.ok) throw new Error("Failed to add medicine");
      toast({
        title: "Success",
        description: "Medicine added successfully",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add medicine",
        variant: "destructive",
      });
    }
  };

  const isAddMedicineDisabled =
    !newMedicine.name ||
    !newMedicine.description ||
    newMedicine.price <= 0 ||
    newMedicine.quantity < 0 ||
    !newMedicine.supplierId ||
    !newMedicine.categoryId ||
    !newMedicine.dosage ||
    !newMedicine.expiryDate;

  const handleEditClick = (medicine: any) => {
    setEditMedicine(medicine);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditMedicine((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleEditMedicine = async () => {
    try {
      const updatedMedicine = {
        ...editMedicine,
        price: parseFloat(editMedicine.price),
        quantity: parseInt(editMedicine.quantity, 10),
        expiryDate: new Date(editMedicine.expiryDate).toISOString(),
      };

      const response = await fetch("/api/prisma", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType: "medicine", ...updatedMedicine }),
      });
      if (!response.ok) throw new Error("Failed to update medicine");
      toast({
        title: "Success",
        description: "Medicine updated successfully",
      });
      fetchData();
      setEditMedicine(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update medicine",
        variant: "destructive",
      });
      console.error("Error updating medicine:", error);
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    try {
      const response = await fetch("/api/prisma", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType: "medicine", id }),
      });
      if (!response.ok) throw new Error("Failed to delete medicine");
      toast({
        title: "Success",
        description: "Medicine deleted successfully",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete medicine",
        variant: "destructive",
      });
    }
  };

  // Add this function near your other handler functions
  const handleStockOpnameChange = async (id: string, newStatus: boolean) => {
    try {
      const response = await fetch("/api/prisma", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "medicine",
          id: id,
          stockOpname: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update stock opname status");
      }

      // If the update was successful, update the local state
      setData((prevData) =>
        prevData.map((item) =>
          item.id === id ? { ...item, stockOpname: newStatus } : item
        )
      );

      toast({
        title: "Success",
        description: `Stock Opname status updated for ${id}`,
      });
    } catch (error) {
      console.error("Error updating stock opname status:", error);
      toast({
        title: "Error",
        description: "Failed to update Stock Opname status",
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
            <Pill className="mr-2 h-4 w-4" />
            Medicines
          </CardTitle>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  disabled={isViewer}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Medicine
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[90vw] w-full sm:max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle>Add New Medicine</AlertDialogTitle>
                  <AlertDialogDescription>
                    Enter the details of the new medicine below.
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
                      value={newMedicine.name}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="description"
                      name="description"
                      value={newMedicine.description}
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
                      value={newMedicine.price}
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
                      value={newMedicine.quantity}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="categoryId" className="text-right">
                      Category
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        handleSelectChange("categoryId", value)
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="supplierId" className="text-right">
                      Supplier
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        handleSelectChange("supplierId", value)
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dosage" className="text-right">
                      Dosage
                    </Label>
                    <Input
                      id="dosage"
                      name="dosage"
                      value={newMedicine.dosage}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="expiryDate" className="text-right">
                      Expiry Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !newMedicine.expiryDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newMedicine.expiryDate ? (
                            format(newMedicine.expiryDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newMedicine.expiryDate}
                          onSelect={(date: Date | undefined) =>
                            date && handleSelectChange("expiryDate", date)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleAddMedicine}
                    disabled={isAddMedicineDisabled}
                  >
                    Add Medicine
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              onClick={() => fetchData()}
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
          placeholder="Type in medicine name, description, or SO (Confirmed/Pending) status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 w-full"
        />
        <div className="overflow-auto h-[calc(100vh-400px)] w-full">
          {" "}
          {data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="min-w-full w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2">
                      Name
                    </TableHead>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2">
                      Price
                    </TableHead>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2">
                      Dosage
                    </TableHead>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2">
                      Expiry Date
                    </TableHead>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2 hidden md:table-cell">
                      Description
                    </TableHead>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2">
                      Stock
                    </TableHead>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2">
                      SO Status
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
                        <TableCell className="px-2 py-1 sm:px-4 sm:py-2">
                          {item.price}
                        </TableCell>
                        <TableCell className="px-2 py-1 sm:px-4 sm:py-2">
                          {item.dosage}
                        </TableCell>
                        <TableCell className="px-2 py-1 sm:px-4 sm:py-2">
                          {format(new Date(item.expiryDate), "PPP")}
                        </TableCell>
                        <TableCell className="px-2 py-1 sm:px-4 sm:py-2 hidden md:table-cell">
                          {item.description}
                        </TableCell>
                        <TableCell className="px-2 py-1 sm:px-4 sm:py-2">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="px-2 py-1 sm:px-4 sm:py-2">
                          <Switch
                            checked={item.stockOpname}
                            onCheckedChange={(checked) => {
                              handleStockOpnameChange(item.id, checked);
                            }}
                            disabled={isViewer}
                          />
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
                                  permanently delete the medicine.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteMedicine(item.id)}
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
              {" "}
              {/* Changed this line */}
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          )}
        </div>
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => setCurrentPage(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardContent>
      <AlertDialog
        open={!!editMedicine}
        onOpenChange={() => setEditMedicine(null)}
      >
        <AlertDialogContent className="max-w-[90vw] w-full sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Medicine</AlertDialogTitle>
            <AlertDialogDescription>
              Make changes to the medicine details below.
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
                value={editMedicine?.name || ""}
                onChange={handleEditInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Input
                id="edit-description"
                name="description"
                value={editMedicine?.description || ""}
                onChange={handleEditInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-dosage" className="text-right">
                Dosage
              </Label>
              <Input
                id="edit-dosage"
                name="dosage"
                value={editMedicine?.dosage || ""}
                onChange={handleEditInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiryDate" className="text-right">
                Expiry Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="expiryDate"
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal col-span-3",
                      !editMedicine?.expiryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editMedicine?.expiryDate ? (
                      format(new Date(editMedicine.expiryDate), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      editMedicine?.expiryDate
                        ? new Date(editMedicine.expiryDate)
                        : undefined
                    }
                    onSelect={(date: Date | undefined) =>
                      date &&
                      setEditMedicine((prev: any) => ({
                        ...prev,
                        expiryDate: date,
                      }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">
                Price
              </Label>
              <Input
                id="edit-price"
                name="price"
                type="number"
                value={parseFloat(editMedicine?.price) || 0}
                onChange={handleEditInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="edit-quantity"
                name="quantity"
                type="number"
                value={parseInt(editMedicine?.quantity) || 0}
                onChange={handleEditInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditMedicine(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleEditMedicine}>
              Save changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
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
  DollarSign,
  RefreshCw,
  Plus,
  Check,
  ChevronsUpDown,
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
import { getUser } from "@/lib/api/auth";
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Define an interface for the Medicine type
interface Medicine {
  id: string;
  name: string;
  quantity: number;
}

export default function TransactionsTab() {
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTransaction, setNewTransaction] = useState({
    type: "",
    medicineId: "",
    quantity: 0,
    operatorId: "",
  });
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
  const [isQuantityValid, setIsQuantityValid] = useState(true);
  const { toast } = useToast();
  const [userData, setUserData] = useState<any>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const checkUser = async () => {
      const user = await getUser();
      if (user) {
        setUserData(user);
        setNewTransaction((prev) => ({
          ...prev,
          operatorId: user.userId.toString(),
        }));
      }
    };
    const fetchData = async () => {
      const fetchedData = await fetchTabData("transactions");
      setData(fetchedData);
    };
    const fetchMedicines = async () => {
      const medicinesData = await fetchTabData("medicines");
      setMedicines(medicinesData);
    };
    checkUser();
    fetchData();
    fetchMedicines();
  }, []);

  const filteredData = data.filter((item) =>
    [item.type, item.medicine.name, item.operator.name].some((value) =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const jakartaDate = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );
    return jakartaDate
      .toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(/(\d+)\/(\d+)\/(\d+),/, "$3-$1-$2");
  };

  const fetchData = async () => {
    setData([]);
    const fetchedData = await fetchTabData("transactions");
    setData(fetchedData);
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewTransaction((prev) => ({ ...prev, [name]: value }));
    if (name === "medicineId") {
      const medicine = medicines.find((m) => m.id === value);
      setSelectedMedicine(medicine || null);
    }
    if (name === "type") {
      setIsQuantityValid(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value);
    setNewTransaction((prev) => ({
      ...prev,
      [name]: name === "quantity" ? numValue : value,
    }));

    if (
      name === "quantity" &&
      selectedMedicine &&
      newTransaction.type === "sale"
    ) {
      setIsQuantityValid(numValue <= selectedMedicine.quantity);
    }
  };

  const handleAddTransaction = async () => {
    try {
      const response = await fetch("/api/prisma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "transaction",
          medicineId: newTransaction.medicineId,
          transactionType: newTransaction.type, // Changed from 'type' to 'transactionType'
          quantity: newTransaction.quantity,
          operatorId: parseInt(newTransaction.operatorId),
        }),
      });
      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Transaction added successfully",
          variant: "default",
        });
        fetchData();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add transaction",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add transaction",
        variant: "destructive",
      });
    }
  };

  const isAddTransactionDisabled =
    !isQuantityValid ||
    newTransaction.quantity <= 0 ||
    !newTransaction.medicineId ||
    !newTransaction.type;

  const uniqueMedicines = Array.from(new Set(medicines.map((m) => m.name))).map(
    (name) => {
      return medicines.find((m) => m.name === name)!;
    }
  );

  const isViewer = userData && userData.userRole === "viewer";

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 h-4 w-4" />
            Transactions
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
                  Add Transaction
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[90vw] w-full sm:max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle>Add New Transaction</AlertDialogTitle>
                  <AlertDialogDescription>
                    Enter the details of the new transaction below.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="sm:text-right">
                      Type
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        handleSelectChange("type", value)
                      }
                    >
                      <SelectTrigger className="col-span-1 sm:col-span-3">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purchase">Purchase</SelectItem>
                        <SelectItem value="sale">Sale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="medicineId" className="sm:text-right">
                      Medicine
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="col-span-1 sm:col-span-3 justify-between"
                        >
                          {selectedMedicine
                            ? selectedMedicine.name
                            : "Select medicine..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search medicine..." />
                          <CommandList>
                            <CommandEmpty>No medicine found.</CommandEmpty>
                            <CommandGroup>
                              {uniqueMedicines.map((medicine) => (
                                <CommandItem
                                  key={medicine.id}
                                  value={medicine.name}
                                  onSelect={(value) => {
                                    const selected = medicines.find(
                                      (m) => m.name === value
                                    );
                                    if (selected) {
                                      handleSelectChange(
                                        "medicineId",
                                        selected.id
                                      );
                                      setSelectedMedicine(selected);
                                      // Close the dropdown
                                      const popoverTrigger =
                                        document.querySelector(
                                          '[role="combobox"]'
                                        ) as HTMLElement;
                                      if (popoverTrigger) {
                                        popoverTrigger.click();
                                      }
                                    }
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedMedicine?.id === medicine.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {medicine.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  {selectedMedicine && (
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                      <Label className="sm:text-right">Current Stock</Label>
                      <div className="col-span-1 sm:col-span-3">
                        {selectedMedicine.quantity}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="sm:text-right">
                      Quantity
                    </Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      value={newTransaction.quantity}
                      onChange={handleInputChange}
                      className={cn(
                        "col-span-1 sm:col-span-3",
                        !isQuantityValid && "border-red-500"
                      )}
                    />
                  </div>
                  {!isQuantityValid && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        Quantity exceeds available stock.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleAddTransaction}
                    disabled={isAddTransactionDisabled}
                  >
                    Add Transaction
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
          placeholder="Type in medicine name, type, or operator name..."
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
                      Type
                    </TableHead>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2">
                      Medicine
                    </TableHead>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2">
                      Quantity
                    </TableHead>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2 hidden md:table-cell">
                      Stock
                    </TableHead>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2 hidden md:table-cell">
                      Price
                    </TableHead>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2">
                      Total Price
                    </TableHead>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2 hidden lg:table-cell">
                      Date
                    </TableHead>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2 hidden lg:table-cell">
                      Operator
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="px-2 py-1 sm:px-4 sm:py-2">
                          {item.type}
                        </TableCell>
                        <TableCell className="px-2 py-1 sm:px-4 sm:py-2">
                          {item.medicine.name}
                        </TableCell>
                        <TableCell className="px-2 py-1 sm:px-4 sm:py-2">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="px-2 py-1 sm:px-4 sm:py-2 hidden md:table-cell">
                          {item.medicine.quantity}
                        </TableCell>
                        <TableCell className="px-2 py-1 sm:px-4 sm:py-2 hidden md:table-cell">
                          {item.medicine.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="px-2 py-1 sm:px-4 sm:py-2">
                          {item.totalPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="px-2 py-1 sm:px-4 sm:py-2 hidden lg:table-cell">
                          {formatDate(item.createdAt)}
                        </TableCell>
                        <TableCell className="px-2 py-1 sm:px-4 sm:py-2 hidden lg:table-cell">
                          {item.operator.name}
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
    </Card>
  );
}

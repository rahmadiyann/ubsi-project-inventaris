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
import { getAuthCookie } from "@/lib/getcookie";
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

// Define an interface for the Medicine type
interface Medicine {
  id: string;
  name: string;
  quantity: number;
}

export default function TransactionsTab() {
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    const fetchData = async () => {
      const fetchedData = await fetchTabData("transactions");
      setData(fetchedData);
    };
    const fetchMedicines = async () => {
      const medicinesData = await fetchTabData("medicines");
      setMedicines(medicinesData);
    };
    fetchData();
    fetchMedicines();
  }, []);

  useEffect(() => {
    const getOperatorId = async () => {
      const operatorId = await getAuthCookie("operatorId");
      if (operatorId) {
        setNewTransaction((prev) => ({ ...prev, operatorId }));
      }
    };
    getOperatorId();
  }, []);

  const filteredData = data.filter((item) =>
    [item.type, item.medicine.name, item.operator.name].some((value) =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
    setIsLoading(true);
    setData([]);
    const fetchedData = await fetchTabData("transactions");
    setData(fetchedData);
    setIsLoading(false);
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
        body: JSON.stringify({ actionType: "transaction", ...newTransaction }),
      });
      if (!response.ok) throw new Error("Failed to add transaction");
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction",
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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 h-4 w-4" />
            Transactions
          </CardTitle>
          <div className="flex space-x-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Transaction
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Add New Transaction</AlertDialogTitle>
                  <AlertDialogDescription>
                    Enter the details of the new transaction below.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        handleSelectChange("type", value)
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purchase">Purchase</SelectItem>
                        <SelectItem value="sale">Sale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="medicineId" className="text-right">
                      Medicine
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="col-span-3 justify-between"
                        >
                          {selectedMedicine
                            ? selectedMedicine.name
                            : "Select medicine..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
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
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Current Stock</Label>
                      <div className="col-span-3">
                        {selectedMedicine.quantity}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">
                      Quantity
                    </Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      value={newTransaction.quantity}
                      onChange={handleInputChange}
                      className={cn(
                        "col-span-3",
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
            <Button onClick={() => fetchData()} variant="outline" size="sm">
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
          className="mb-4"
        />
        <div className="overflow-auto h-64 w-full max-w-4xl mx-auto">
          {data.length > 0 ? (
            <div className="relative">
              <Table className="min-w-full w-full">
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="bg-white">Type</TableHead>
                    <TableHead className="bg-white">Medicine</TableHead>
                    <TableHead className="bg-white">Quantity</TableHead>
                    <TableHead className="bg-white">Stock</TableHead>
                    <TableHead className="bg-white">Price</TableHead>
                    <TableHead className="bg-white">Total Price</TableHead>
                    <TableHead className="bg-white">Date</TableHead>
                    <TableHead className="bg-white">Operator</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.medicine.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.medicine.quantity}</TableCell>
                        <TableCell>{item.medicine.price.toFixed(2)}</TableCell>
                        <TableCell>{item.totalPrice.toFixed(2)}</TableCell>
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell>{item.operator.name}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              {isLoading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <p>No data</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

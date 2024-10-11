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
import { Loader2, Pill, RefreshCw } from "lucide-react";
import { fetchTabData } from "../(utils)/api";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function MedicinesTab() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const fetchedData = await fetchTabData("medicines");
      setData(fetchedData);
    };
    fetchData();
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

  const fetchData = async () => {
    setIsLoading(true);
    setData([]);
    const fetchedData = await fetchTabData("medicines");
    setData(fetchedData);
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center">
            <Pill className="mr-2 h-4 w-4" />
            Medicines
          </CardTitle>
          <Button onClick={() => fetchData()} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          placeholder="Type in medicine name, description, or SO (Confirmed/Pending) status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <div className="overflow-auto h-64 w-full max-w-4xl mx-auto">
          {data.length > 0 ? (
            <Table className="min-w-full w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/6">Name</TableHead>
                  <TableHead className="w-3/6">Description</TableHead>
                  <TableHead className="w-1/6">Stock</TableHead>
                  <TableHead className="w-1/6">SO Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow
                    onClick={() => router.push(`/admin/medicines/${item.id}`)}
                    key={item.id}
                    className="cursor-pointer"
                  >
                    <TableCell className="w-1/6">{item.name}</TableCell>
                    <TableCell className="w-3/6">{item.description}</TableCell>
                    <TableCell className="w-1/6">{item.quantity}</TableCell>
                    <TableCell className="w-1/6">
                      {item.stockOpname ? "Confirmed" : "Pending"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              No data found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

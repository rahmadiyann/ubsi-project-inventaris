"use client";

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
import { Loader2, RefreshCw, Users, Edit, Trash2, Plus } from "lucide-react";
import { fetchTabData } from "../(utils)/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getUser } from "@/lib/api/auth";

export default function UsersTab() {
  const [data, setData] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editOperator, setEditOperator] = useState<any>(null);
  const [newOperator, setNewOperator] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const user = await getUser();
      if (user) {
        setUserData(user);
      }
    };
    checkUser();
    const fetchData = async () => {
      const fetchedData = await fetchTabData("users");
      setData(fetchedData);
    };
    fetchData();
  }, []);

  const filteredData = data.filter((item) =>
    Object.values(item).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const fetchData = async () => {
    setIsLoading(true);
    const fetchedData = await fetchTabData("users");
    setData(fetchedData);
    setIsLoading(false);
  };

  const handleEditClick = (operator: any) => {
    setEditOperator(operator);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditOperator((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleEditSelectChange = (name: string, value: string) => {
    setEditOperator((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleEditOperator = async () => {
    try {
      const response = await fetch("/api/prisma", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType: "operator", ...editOperator }),
      });
      if (!response.ok) throw new Error("Failed to update operator");
      toast({
        title: "Success",
        description: "Operator updated successfully",
      });
      fetchData();
      setEditOperator(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update operator",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOperator = async (id: string) => {
    try {
      const response = await fetch("/api/prisma", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType: "operator", id }),
      });
      if (!response.ok) throw new Error("Failed to delete operator");
      toast({
        title: "Success",
        description: "Operator deleted successfully",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete operator",
        variant: "destructive",
      });
    }
  };

  const handleNewOperatorInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setNewOperator((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleNewOperatorSelectChange = (name: string, value: string) => {
    setNewOperator((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCreateOperator = async () => {
    try {
      const response = await fetch("/api/prisma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType: "operator", ...newOperator }),
      });
      const data = await response.json();
      console.log(`data: ${JSON.stringify(data)}`);
      if (!response.ok) throw new Error("Failed to create operator");
      toast({
        title: "Success",
        description: `Operator created. Password: ${data.password}`,
      });
      fetchData();
      setNewOperator(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create operator",
        variant: "destructive",
      });
    }
  };

  const isAdmin = userData && userData.userRole === "admin";

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Users
          </CardTitle>
          <div className="flex space-x-2">
            {isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New User
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[90vw] w-full sm:max-w-lg">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Create New User</AlertDialogTitle>
                    <AlertDialogDescription>
                      Enter the details for the new user below.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                      <Label htmlFor="new-name" className="sm:text-right">
                        Name
                      </Label>
                      <Input
                        id="new-name"
                        name="name"
                        value={newOperator?.name || ""}
                        onChange={handleNewOperatorInputChange}
                        className="col-span-1 sm:col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                      <Label htmlFor="new-email" className="sm:text-right">
                        Email
                      </Label>
                      <Input
                        id="new-email"
                        name="email"
                        value={newOperator?.email || ""}
                        onChange={handleNewOperatorInputChange}
                        className="col-span-1 sm:col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                      <Label htmlFor="new-role" className="sm:text-right">
                        Role
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          handleNewOperatorSelectChange("role", value)
                        }
                        defaultValue={newOperator?.role}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="operator">Operator</SelectItem>
                          <SelectItem value="stakeholder">
                            Stakeholder
                          </SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setNewOperator(null)}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleCreateOperator}>
                      Create User
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
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
          placeholder="Search operators..."
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
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2">
                      Email
                    </TableHead>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2">
                      Role
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
                          {item.email}
                        </TableCell>
                        <TableCell className="px-2 py-1 sm:px-4 sm:py-2">
                          {item.role}
                        </TableCell>
                        <TableCell className="px-2 py-1 sm:px-4 sm:py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(item)}
                            disabled={!isAdmin}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={!isAdmin}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-[90vw] w-full sm:max-w-lg">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the operator.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteOperator(item.id)}
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
          ) : isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              No operators found
            </div>
          )}
        </div>
      </CardContent>
      <AlertDialog
        open={!!editOperator}
        onOpenChange={() => setEditOperator(null)}
      >
        <AlertDialogContent className="max-w-[90vw] w-full sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Operator</AlertDialogTitle>
            <AlertDialogDescription>
              Make changes to the operator details below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="sm:text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={editOperator?.name || ""}
                onChange={handleEditInputChange}
                className="col-span-1 sm:col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="sm:text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                name="email"
                value={editOperator?.email || ""}
                onChange={handleEditInputChange}
                className="col-span-1 sm:col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="sm:text-right">
                Role
              </Label>
              <Select
                onValueChange={(value) => handleEditSelectChange("role", value)}
                defaultValue={editOperator?.role}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="operator">Operator</SelectItem>
                  <SelectItem value="stakeholder">Stakeholder</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditOperator(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleEditOperator}>
              Save changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

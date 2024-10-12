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
import { Loader2, Layers, RefreshCw, Plus, Edit, Trash2 } from "lucide-react";
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
import { getUser } from "@/lib/api/auth";

export default function CategoriesTab() {
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newCategory, setNewCategory] = useState({
    name: "",
  });
  const [editCategory, setEditCategory] = useState<any>(null);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
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
      const fetchedData = await fetchTabData("categories");
      setData(fetchedData);
    };
    fetchData();
  }, []);

  const filteredData = data.filter((item) =>
    [item.name, ...item.medicines.map((medicine: any) => medicine.name)].some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const fetchData = async () => {
    setData([]);
    const fetchedData = await fetchTabData("categories");
    setData(fetchedData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCategory((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCategory = async () => {
    try {
      const response = await fetch("/api/prisma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType: "category", ...newCategory }),
      });
      if (!response.ok) throw new Error("Failed to add category");
      toast({
        title: "Success",
        description: "Category added successfully",
      });
      fetchData();
      setIsAddCategoryDialogOpen(false);
      setNewCategory({ name: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const isAddCategoryDisabled = !newCategory.name;

  const handleEditClick = (category: any) => {
    setEditCategory(category);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditCategory((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleEditCategory = async () => {
    try {
      const response = await fetch("/api/prisma", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType: "category", ...editCategory }),
      });
      if (!response.ok) throw new Error("Failed to update category");
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      fetchData();
      setEditCategory(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const response = await fetch("/api/prisma", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType: "category", id }),
      });
      if (!response.ok) throw new Error("Failed to delete category");
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
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
            <Layers className="mr-2 h-4 w-4" />
            Categories
          </CardTitle>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <AlertDialog
              open={isAddCategoryDialogOpen}
              onOpenChange={(open) => {
                setIsAddCategoryDialogOpen(open);
                if (!open) setNewCategory({ name: "" });
              }}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  disabled={isViewer}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[90vw] w-full sm:max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle>Add New Category</AlertDialogTitle>
                  <AlertDialogDescription>
                    Enter the name of the new category below.
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
                      value={newCategory.name}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleAddCategory}
                    disabled={isAddCategoryDisabled || isViewer}
                  >
                    Add Category
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
          placeholder="Type in category name or medicine name..."
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
                      ID
                    </TableHead>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2">
                      Name
                    </TableHead>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2 hidden sm:table-cell">
                      Medicines
                    </TableHead>
                    <TableHead className="px-2 py-1 sm:px-4 sm:py-2">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-2 py-1 sm:px-4 sm:py-2">
                        {item.id}
                      </TableCell>
                      <TableCell className="px-2 py-1 sm:px-4 sm:py-2">
                        {item.name}
                      </TableCell>
                      <TableCell className="px-2 py-1 sm:px-4 sm:py-2 hidden sm:table-cell">
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
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the category.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCategory(item.id)}
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
        open={!!editCategory}
        onOpenChange={(open) => {
          if (!open) setEditCategory(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Category</AlertDialogTitle>
            <AlertDialogDescription>
              Make changes to the category details below.
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
                value={editCategory?.name || ""}
                onChange={handleEditInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditCategory(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleEditCategory}>
              Save changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

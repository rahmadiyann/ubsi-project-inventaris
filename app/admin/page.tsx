"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Truck,
  Layers,
  Pill,
  DollarSign,
  Users,
  Loader2,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertDialog, AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import TransactionsTab from "./(components)/TransactionTab";
import SuppliersTab from "./(components)/SuppliersTab";
import CategoriesTab from "./(components)/CategoriesTab";
import MedicinesTab from "./(components)/MedicinesTab";
import UsersTab from "./(components)/UsersTab";
import { TabKey } from "@/app/admin/(utils)/api";
import { deleteCookie, getUser } from "@/lib/api/auth";

const tabContent: Record<TabKey, React.ReactNode> = {
  transactions: <TransactionsTab />,
  suppliers: <SuppliersTab />,
  categories: <CategoriesTab />,
  medicines: <MedicinesTab />,
  users: <UsersTab />,
};

const TabIcon: React.FC<{ tab: TabKey }> = ({ tab }) => {
  const icons: Record<TabKey, React.ReactNode> = {
    suppliers: <Truck className="mr-2 h-4 w-4" />,
    categories: <Layers className="mr-2 h-4 w-4" />,
    medicines: <Pill className="mr-2 h-4 w-4" />,
    transactions: <DollarSign className="mr-2 h-4 w-4" />,
    users: <Users className="mr-2 h-4 w-4" />,
  };
  return icons[tab] || null;
};

export default function AdminUI() {
  const [activeTab, setActiveTab] = useState<TabKey>("transactions");
  const [loading, setLoading] = useState(true);
  const [userDataState, setUserDataState] = useState<{
    userName: string;
    userId: number;
    userRole: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUserData();
      console.log(user);
      setUserDataState(user);
      if (!user) {
        console.log("User not found");
        router.push("/auth");
      } else if (["viewer", "operator", "admin"].includes(user.userRole)) {
        console.log("User is viewer, operator, or admin");
        setLoading(false);
      } else if (user.userRole === "stakeholder") {
        console.log("User is stakeholder");
        router.push("/dashboard");
      } else {
        console.log("Unknown user role");
        router.push("/auth");
      }
    };

    fetchUser();
  }, []);

  const getUserData = async () => {
    const user = await getUser();
    return user;
  };

  async function clearCookies() {
    await deleteCookie("token");
  }

  const signOut = () => {
    clearCookies();
    router.push("/auth");
  };

  const name = userDataState?.userName;

  return loading ? (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  ) : (
    <div className="flex flex-col h-screen items-center justify-center container mx-auto p-4">
      <div className="w-full max-w-4xl mb-6">
        <div className="flex flex-row items-center justify-between w-full mb-6 px-0">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-4">
              <Image
                src="/logo.png"
                alt="logo"
                width={40}
                height={40}
                className="object-fit"
                style={{ background: "transparent" }}
              />
            </div>
            <div className="text-xl font-semibold">
              Welcome, {name?.split(" ")[0]}
            </div>
          </div>
          <div>
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
                  <AlertDialogCancel onClick={signOut}>
                    Log Out
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabKey)}
        >
          <TabsList className="grid w-full grid-cols-5 mb-6">
            {(Object.keys(tabContent) as TabKey[]).map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex items-center justify-center"
              >
                <TabIcon tab={tab} />
                <span className="hidden sm:inline">
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
          {(Object.entries(tabContent) as [TabKey, React.ReactNode][]).map(
            ([key, content]) => (
              <TabsContent key={key} value={key}>
                {content}
              </TabsContent>
            )
          )}
        </Tabs>
      </div>
    </div>
  );
}

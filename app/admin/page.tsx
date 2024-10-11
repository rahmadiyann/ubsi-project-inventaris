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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogTrigger,
} from "@radix-ui/react-alert-dialog";
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
import OperatorsTab from "./(components)/OperatorsTab";
import { TabKey } from "@/app/admin/(utils)/api";

const tabContent: Record<TabKey, React.ReactNode> = {
  transactions: <TransactionsTab />,
  suppliers: <SuppliersTab />,
  categories: <CategoriesTab />,
  medicines: <MedicinesTab />,
  operators: <OperatorsTab />,
};

const TabIcon: React.FC<{ tab: TabKey }> = ({ tab }) => {
  const icons: Record<TabKey, React.ReactNode> = {
    suppliers: <Truck className="mr-2 h-4 w-4" />,
    categories: <Layers className="mr-2 h-4 w-4" />,
    medicines: <Pill className="mr-2 h-4 w-4" />,
    transactions: <DollarSign className="mr-2 h-4 w-4" />,
    operators: <Users className="mr-2 h-4 w-4" />,
  };
  return icons[tab] || null;
};

export default function AdminUI() {
  const [activeTab, setActiveTab] = useState<TabKey>("transactions");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const role = await getUser();
      if (!role) {
        router.push("/auth");
      }
      if (role === "stakeholder") {
        router.push("/dashboard");
      } else {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  async function getAuthCookie(): Promise<string | null> {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "auth") {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  const getUser = async () => {
    const role = await getAuthCookie();
    return role;
  };

  function clearCookies() {
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
      const cookieName = cookie.split("=")[0].trim();
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  }

  const signOut = () => {
    clearCookies();
    router.push("/auth");
  };

  return loading ? (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  ) : (
    <div className="flex flex-col h-screen items-center justify-center container mx-auto p-4">
      <div className="w-full max-w-4xl mb-6">
        <div className="flex flex-row items-center justify-between w-full mb-6 px-0">
          <div className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="logo"
              width={100}
              height={100}
              className="object-fit"
              style={{ background: "transparent" }}
            />
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
                  <AlertDialogAction onClick={signOut}>
                    Log Out
                  </AlertDialogAction>
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

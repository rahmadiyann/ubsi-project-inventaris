"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pill,
  Package,
  DollarSign,
  BarChart3,
  Shield,
  Cloud,
} from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const LandingPage = () => {
  const { toast } = useToast();
  const router = useRouter();

  const handleRequestDemo = (title: string, description: string) => {
    toast({
      title: title,
      description: description,
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto px-4 py-8">
        <nav className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex flex-row justify-start items-center mb-4 sm:mb-0">
            <Image
              src="/logo.png"
              alt="Pharmacin"
              width={40}
              height={40}
              className="mr-4"
            />
            <div className="text-xl sm:text-2xl font-bold text-black">
              Pharmacin
            </div>
          </div>
          <div className="flex flex-wrap justify-center sm:space-x-4">
            <Button
              onClick={() =>
                handleRequestDemo(
                  "Page not available",
                  "The features page is not implemented yet."
                )
              }
              variant="ghost"
              className="m-1 sm:m-0"
            >
              Features
            </Button>
            <Button
              onClick={() =>
                handleRequestDemo(
                  "Page not available",
                  "The pricing page is not implemented yet."
                )
              }
              variant="ghost"
              className="m-1 sm:m-0"
            >
              Pricing
            </Button>
            <Button
              onClick={() =>
                handleRequestDemo(
                  "Page not available",
                  "The contact page is not implemented yet."
                )
              }
              variant="ghost"
              className="m-1 sm:m-0"
            >
              Contact
            </Button>
            <Button onClick={() => router.push("/auth")} className="m-1 sm:m-0">
              Log In
            </Button>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Revolutionize Your Pharmacy Inventory Management
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Streamline operations, reduce costs, and improve patient care with
            Pharmacin
          </p>
          <Button
            size="lg"
            className="mr-4"
            onClick={() => router.push("/auth")}
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() =>
              handleRequestDemo(
                "Page not available",
                "The demo request page is not implemented yet."
              )
            }
          >
            Request Demo
          </Button>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: <Pill size={24} />,
              title: "Medication Tracking",
              description:
                "Easily track and manage your entire medication inventory",
            },
            {
              icon: <Package size={24} />,
              title: "Smart Reordering",
              description:
                "Automated reordering based on usage patterns and stock levels",
            },
            {
              icon: <DollarSign size={24} />,
              title: "Cost Optimization",
              description: "Reduce waste and optimize your inventory costs",
            },
            {
              icon: <BarChart3 size={24} />,
              title: "Analytics",
              description:
                "Gain insights with powerful reporting and analytics tools",
            },
            {
              icon: <Shield size={24} />,
              title: "Compliance",
              description: "Stay compliant with regulatory requirements",
            },
            {
              icon: <Cloud size={24} />,
              title: "Cloud-Based",
              description: "Access your inventory from anywhere, anytime",
            },
          ].map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {feature.icon}
                  <span className="ml-2">{feature.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Pharmacy?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of pharmacies already using Pharmacin to streamline
            their operations
          </p>
          <Button size="lg" onClick={() => router.push("/auth")}>
            Start Your Free Trial
          </Button>
        </section>
      </main>

      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 Pharmacin. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

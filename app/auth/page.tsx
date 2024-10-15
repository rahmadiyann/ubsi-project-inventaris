"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cookieExists, deleteCookie } from "@/lib/api/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
});

const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"register" | "login">("register");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  async function clearCookies() {
    const exists = await cookieExists("token");
    if (exists) {
      await deleteCookie("token");
    } else {
      return;
    }
  }

  useEffect(() => {
    clearCookies();
  }, []);

  async function onLogin(data: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    const { email, password } = data;
    try {
      const result = await fetch("/api/auth", {
        method: "POST",
        body: JSON.stringify({ email, password, isRegistration: false }),
      });

      if (result.status === 200) {
        const user = await result.json();
        const userData = {
          role: user.user.role,
        };

        if (userData.role === "stakeholder") {
          router.push("/dashboard");
        } else {
          router.push("/admin");
        }
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      loginForm.reset(); // Clear the login form
    }
  }

  async function onRegister(data: z.infer<typeof registerSchema>) {
    const { name, email, password } = data;
    setIsLoading(true);
    try {
      const result = await fetch("/api/auth", {
        method: "POST",
        body: JSON.stringify({ name, email, password, isRegistration: true }),
      });
      if (result.status === 200) {
        setActiveTab("login");
        toast({
          title: "Registration successful",
          description: "Please log in with your new account",
          variant: "default",
        });
      } else {
        toast({
          title: "Registration failed",
          description: "An error occurred during registration",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      registerForm.reset(); // Clear the registration form
    }
  }

  return (
    <div className="flex flex-col container mx-auto p-4 max-w-md min-h-screen justify-center items-center">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "register" | "login")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="register">Register</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LogIn className="mr-2" /> Login
              </CardTitle>
              <CardDescription>
                Enter your credentials to access the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* login form */}
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(onLogin)}
                  className="space-y-4"
                >
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {(isLoading && (
                    <div className="flex justify-center items-center">
                      <Loader2 className="animate-spin" />
                    </div>
                  )) || (
                    <Button type="submit" className="w-full">
                      Login
                    </Button>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="mr-2" /> Register
              </CardTitle>
              <CardDescription>
                Create a new account to access the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* register form */}
              <Form {...registerForm}>
                <form
                  onSubmit={registerForm.handleSubmit(onRegister)}
                  className="space-y-4"
                >
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {(isLoading && (
                    <div className="flex justify-center items-center">
                      <Loader2 className="animate-spin" />
                    </div>
                  )) || (
                    <Button type="submit" className="w-full">
                      Register
                    </Button>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {message && (
        <Alert className="mt-4">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AuthPage;

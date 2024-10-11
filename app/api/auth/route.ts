import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/api/auth";

export async function POST(request: Request) {
  const { email, password, isRegistration, name } = await request.json();
  try {
    const result = await authenticateUser(
      email,
      password,
      isRegistration,
      name
    );
    if (result.success) {
      console.log(`Authentication successful for email: ${email}`);
      return NextResponse.json(result, { status: 200 });
    } else {
      console.log(`Authentication failed for email: ${email}`);
      return NextResponse.json(result, { status: 401 });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during authentication" },
      { status: 500 }
    );
  }
}

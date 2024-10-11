import { fetchDataForVisualizations } from "@/lib/chart_data";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  const data = await fetchDataForVisualizations();
  if (data) {
    return NextResponse.json(data, { status: 200 });
  } else {
    return NextResponse.json(
      { message: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

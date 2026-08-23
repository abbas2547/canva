import { NextRequest, NextResponse } from "next/server";

const PEXELS_API_URL = "https://api.pexels.com/v1/search";

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.PEXELS_API_KEY;
    

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "PEXELS_API_KEY is not configured",
        },
        {
          status: 500,
        }
      );
    }

    const { searchParams } =
      new URL(request.url);

    const query =
      searchParams.get("query")?.trim() ||
      "nature";

    const page =
      searchParams.get("page") || "1";

    const perPage =
      searchParams.get("per_page") || "20";

    const url =
      `${PEXELS_API_URL}?query=${encodeURIComponent(
        query
      )}&page=${page}&per_page=${perPage}`;

    const response = await fetch(url, {
      headers: {
        Authorization: apiKey,
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.error ||
            "Pexels API request failed",
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "Pexels API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch Pexels images",
      },
      {
        status: 500,
      }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";

const PEXELS_API_URL = "https://api.pexels.com/v1/search";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query =
      searchParams.get("query")?.trim() || "nature";

    const pageParam =
      Number(searchParams.get("page") || "1");

    const perPageParam =
      Number(searchParams.get("per_page") || "24");

    const page = Math.max(
      1,
      Math.min(pageParam, 100)
    );

    const perPage = Math.max(
      1,
      Math.min(perPageParam, 80)
    );

    const apiKey =
      process.env.PEXELS_API_KEY;

    if (!apiKey) {
      console.error(
        "PEXELS_API_KEY is missing"
      );

      return NextResponse.json(
        {
          error:
            "Pexels API key is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    const url =
      new URL(PEXELS_API_URL);

    url.searchParams.set(
      "query",
      query
    );

    url.searchParams.set(
      "page",
      String(page)
    );

    url.searchParams.set(
      "per_page",
      String(perPage)
    );

    url.searchParams.set(
      "orientation",
      "landscape"
    );

    const response =
      await fetch(url.toString(), {
        method: "GET",

        headers: {
          Authorization: apiKey,
        },

        cache: "no-store",
      });

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "Pexels API error:",
        response.status,
        errorText
      );

      return NextResponse.json(
        {
          error:
            "Failed to fetch images from Pexels.",
        },
        {
          status: response.status,
        }
      );
    }

    const data =
      await response.json();

    return NextResponse.json({
      photos:
        data.photos ?? [],

      page:
        data.page ?? page,

      per_page:
        data.per_page ?? perPage,

      total_results:
        data.total_results ?? 0,

      next_page:
        data.next_page ?? null,
    });
  } catch (error) {
    console.error(
      "Images API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while searching images.",
      },
      {
        status: 500,
      }
    );
  }
}
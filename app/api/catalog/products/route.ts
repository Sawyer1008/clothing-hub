import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/catalog/catalog.server";

type RequestBody = {
  ids?: unknown;
};

function isValidIds(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((id) => typeof id === "string");
}

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isValidIds(body.ids) || body.ids.length > 200) {
    return NextResponse.json(
      { error: "Invalid ids; expected an array of up to 200 strings" },
      { status: 400 }
    );
  }

  const ids = new Set(body.ids);
  const products = getAllProducts().filter((p) => ids.has(p.id));

  return NextResponse.json({ products });
}

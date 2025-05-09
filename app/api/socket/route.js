import { NextResponse } from "next/server"

// This is a simplified version of the socket server for production
export async function GET(req) {
  return NextResponse.json({
    success: true,
    message: "Socket API endpoint is active. For a full socket server, please set up a separate deployment.",
  })
}

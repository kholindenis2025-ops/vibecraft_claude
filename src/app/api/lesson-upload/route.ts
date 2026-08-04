import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        await requireAdmin();
        return {
          allowedContentTypes: ["video/*", "application/pdf"],
          addRandomSuffix: true,
          // Lesson videos can be very large (1GB+ recordings).
          maximumSizeInBytes: 5 * 1024 * 1024 * 1024,
          // A multi-GB upload on a slow connection can take a while —
          // the default 1-hour token would expire mid-upload and abort it.
          validUntil: Date.now() + 6 * 60 * 60 * 1000,
        };
      },
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 }
    );
  }
}

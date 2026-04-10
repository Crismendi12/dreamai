import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY || "" });

interface FalVideoResult {
  video: { url: string };
}

export async function POST(request: Request) {
  const { request_id } = await request.json();

  if (!request_id) {
    return Response.json({ status: "FAILED" });
  }

  try {
    const status = await fal.queue.status("fal-ai/kling-video/v2/master/text-to-video", {
      requestId: request_id,
      logs: false,
    });

    if (status.status === "COMPLETED") {
      const result = await fal.queue.result("fal-ai/kling-video/v2/master/text-to-video", {
        requestId: request_id,
      });
      const data = result.data as FalVideoResult;
      return Response.json({
        status: "COMPLETED",
        video_url: data.video?.url || null,
      });
    }

    return Response.json({
      status: status.status, // IN_QUEUE, IN_PROGRESS, COMPLETED, FAILED
    });
  } catch {
    return Response.json({ status: "FAILED" });
  }
}

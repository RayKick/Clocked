import { ImageResponse } from "next/og";

import { getClaimBySlug } from "../../../../../lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const claim = await getClaimBySlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(180deg, #11151d 0%, #1f2937 100%)",
          color: "#f8f5ee",
          padding: 48
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4 }}>CLOCKED</div>
        <div style={{ display: "grid", gap: 20 }}>
          <div style={{ fontSize: 26 }}>{claim?.status ?? "OPEN"}</div>
          <div style={{ fontSize: 56, lineHeight: 1.1 }}>
            {claim?.normalizedClaim ?? "Claim not found"}
          </div>
          <div style={{ fontSize: 28 }}>
            Deadline: {claim?.deadlineText ?? "Needs review"}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24 }}>
          <span>{claim?.project?.name ?? "CLOCKED"}</span>
          <span>@{claim?.actor?.handle ?? "source"}</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

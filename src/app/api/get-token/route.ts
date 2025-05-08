import { AccessToken, AccessTokenOptions, VideoGrant } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";

const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

export const revalidate = 0;
async function createRoomIfNotExists(roomName: string) {
  const { LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET } = process.env;

  if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    throw new Error("Missing LiveKit config in environment variables.");
  }

  const roomService = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
  const rooms = await roomService.listRooms([roomName]);

  if (rooms.length === 0) {
    console.log("No room found, so create a room");
    await roomService.createRoom({
      name: roomName,
      metadata: JSON.stringify({ auto_agent: true }),
    });
  }
}
export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
};

export async function GET(req: NextRequest) {
  try {
    if (!LIVEKIT_URL || !API_KEY || !API_SECRET) {
      throw new Error("Missing LiveKit config in environment variables.");
    }

    // 从 URL 参数中获取 roomName 和 participantName
    const url = new URL(req.url);
    const roomName = url.searchParams.get("roomName")
    const participantName = url.searchParams.get("participantName")
    if (!participantName || !roomName) {
      throw new Error("Missing roomName or participantName");
    }

    await createRoomIfNotExists(roomName);

    // 签发 token
    const participantToken = await createParticipantToken(
        { identity: participantName },
        roomName
    );

    const data: ConnectionDetails = {
      serverUrl: LIVEKIT_URL,
      roomName,
      participantToken,
      participantName,
    };

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return new NextResponse(error.message, { status: 500 });
    }
  }
}

function createParticipantToken(userInfo: AccessTokenOptions, roomName: string) {
  const at = new AccessToken(API_KEY, API_SECRET, {
    ...userInfo,
    ttl: "120m",
  });

  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };

  at.addGrant(grant);
  return at.toJwt();
}

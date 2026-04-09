import { AccessToken } from "livekit-server-sdk";

export async function generateLiveKitToken(
  roomName: string,
  participantName: string,
  isHost: boolean
): Promise<string> {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("LiveKit API key or secret is missing from environment variables.");
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    ttl: "1h",
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,      // everyone can publish (two-way video)
    canSubscribe: true,
    canPublishData: true,  // enables chat/data channels
    roomAdmin: isHost,     // host gets admin controls (mute others, end session)
  });

  return token.toJwt();
}

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

  // Use a sanitized identity (no spaces/special chars) to avoid LiveKit's
  // internal track-reference array key mismatch bug. The human-readable
  // display name is set via the `name` field separately.
  const sanitizedIdentity = participantName.replace(/[^a-zA-Z0-9_-]/g, "_");

  const token = new AccessToken(apiKey, apiSecret, {
    identity: sanitizedIdentity,
    name: participantName,
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

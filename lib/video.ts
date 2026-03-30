import { RtcTokenBuilder, RtcRole } from "agora-token";

export function generateAgoraToken(channelName: string, uid: number, role: 'publisher' | 'subscriber' = 'publisher'): string | null {
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    console.warn("Agora APP ID or CERTIFICATE is missing. Proceeding without token.");
    return null;
  }

  const expirationTimeInSeconds = 3600;

  const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    agoraRole,
    expirationTimeInSeconds,
    expirationTimeInSeconds
  );

  return token;
}

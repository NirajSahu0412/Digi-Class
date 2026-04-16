"use client";

import { useState, useEffect } from "react";
import {
  LiveKitRoom,
  VideoConference,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { Loader2, PhoneOff, Mic, MicOff, Video, VideoOff, Maximize, Minimize, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { ParticipantSidebar } from "./ParticipantSidebar";

interface VideoRoomProps {
  token: string;
  livekitUrl: string;
  roomName: string;
  classroomId: string;
  isHost: boolean;
  videoSessionId: string;
  participantName: string;
}

export default function VideoRoom({
  token,
  livekitUrl,
  roomName,
  classroomId,
  isHost,
  videoSessionId,
  participantName,
}: VideoRoomProps) {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const toggleFullscreen = () => {
    const container = document.getElementById("video-room-container");
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleDisconnect = async () => {
    if (isHost) {
      try {
        await fetch("/api/video", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoSessionId }),
        });
      } catch (e) {
        console.error("Failed to end session:", e);
      }
    }
    router.push(`/classroom/${classroomId}`);
  };

  return (
    <div
      id="video-room-container"
      className={`flex flex-col bg-gray-950 overflow-hidden shadow-2xl relative border border-gray-800 transition-all ${
        isFullscreen
          ? "fixed inset-0 z-[100] w-screen h-screen rounded-none"
          : "h-[85vh] rounded-2xl"
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white font-semibold text-sm tracking-wide">
            LIVE CLASS
          </span>
          <span className="text-gray-400 text-xs bg-gray-800 px-2 py-0.5 rounded-full">
            Room: {roomName.slice(0, 8)}...
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {isHost ? "Host" : "Student"}
          </span>
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
              showParticipants ? "bg-indigo-600 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white"
            }`}
            title="Participants"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline text-sm font-medium">People</span>
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all"
            title="Fullscreen"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all font-semibold text-sm shadow-lg shadow-red-900/30"
          >
            <PhoneOff className="w-4 h-4" />
            {isHost ? "End Class" : "Leave"}
          </button>
        </div>
      </div>

      {/* LiveKit Room */}
      <div className="flex-1 min-h-0 relative">
        <LiveKitRoom
          serverUrl={livekitUrl}
          token={token}
          connect={true}
          video={true}
          audio={true}
          data-lk-theme="default"
          onDisconnected={handleDisconnect}
          style={{ height: "100%", display: "flex", width: "100%" }}
        >
          <div className="flex-1 min-w-0" style={{ height: "100%" }}>
            <VideoConference />
            <RoomAudioRenderer />
          </div>
          {showParticipants && (
            <ParticipantSidebar onClose={() => setShowParticipants(false)} />
          )}
        </LiveKitRoom>
      </div>
    </div>
  );
}

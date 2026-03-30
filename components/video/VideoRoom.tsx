"use client";

import { useEffect, useState } from "react";
import AgoraRTC, {
  AgoraRTCProvider,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  useJoin,
  usePublish,
  useRemoteUsers,
  RemoteUser,
  LocalVideoTrack
} from "agora-rtc-react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2, Maximize, Minimize } from "lucide-react";
import { useRouter } from "next/navigation";

// Ensure the client is valid
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

interface VideoRoomProps {
  channelName: string;
  appId: string;
  token: string | null;
  uid: number;
  classroomId: string;
  isHost: boolean;
  videoSessionId: string;
}

export default function VideoRoom(props: VideoRoomProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="flex items-center justify-center p-12 bg-gray-900 rounded-xl min-h-[50vh]">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <AgoraRTCProvider client={client}>
      <VideoCall {...props} />
    </AgoraRTCProvider>
  );
}

function VideoCall({ channelName, appId, token, uid, classroomId, isHost, videoSessionId }: VideoRoomProps) {
  const router = useRouter();

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const container = document.getElementById("video-room-container");
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Try to use camera/mic based on permissions
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(true);
  const { localCameraTrack } = useLocalCameraTrack(true);

  const [isJoined, setIsJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  // Use token if provided, null if AppID mode
  useJoin({
    appid: appId,
    channel: channelName,
    token: token || null,
    uid: uid,
  }, isJoined);

  usePublish([localMicrophoneTrack, localCameraTrack]);

  const remoteUsers = useRemoteUsers();

  useEffect(() => {
    if (appId) {
      setIsJoined(true);
    }
  }, [appId]);

  useEffect(() => {
    if (localMicrophoneTrack) {
      localMicrophoneTrack.setEnabled(micOn);
    }
  }, [micOn, localMicrophoneTrack]);

  useEffect(() => {
    if (localCameraTrack) {
      localCameraTrack.setEnabled(cameraOn);
    }
  }, [cameraOn, localCameraTrack]);

  const handleLeave = async () => {
    setIsJoined(false);

    if (isHost) {
      try {
        await fetch('/api/video', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoSessionId })
        });
      } catch (e) {
        console.error("Failed to end session", e);
      }
    }

    router.push(`/classroom/${classroomId}`);
  };

  const toggleMic = () => setMicOn(prev => !prev);
  const toggleCamera = () => setCameraOn(prev => !prev);

  return (
    <div id="video-room-container" className={`flex flex-col bg-gray-950 overflow-hidden shadow-2xl relative border border-gray-800 transition-all ${isFullscreen ? 'fixed inset-0 z-[100] w-screen h-screen rounded-none' : 'h-[80vh] rounded-2xl'}`}>

      {/* Viewport */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr overflow-y-auto w-full">

        {/* Local Frame */}
        <div className="bg-gray-900 rounded-xl overflow-hidden relative shadow-lg ring-1 ring-white/5 transition-all w-full h-full min-h-[250px] group">
          {localCameraTrack && cameraOn ? (
            <LocalVideoTrack track={localCameraTrack} play={true} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
              <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                <VideoOff className="w-10 h-10" />
              </div>
              <span className="mt-4 text-gray-500 font-medium tracking-wide">Camera Off</span>
            </div>
          )}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
            <span className="bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-md border border-white/10 shadow-sm">
              You ({isHost ? 'Host' : 'Student'})
            </span>
            <div className="flex gap-2">
              {!micOn && <div className="bg-red-500/80 p-1.5 rounded-full backdrop-blur-md"><MicOff className="w-4 h-4 text-white" /></div>}
            </div>
          </div>
        </div>

        {/* Remote Frames */}
        {remoteUsers.map((user) => (
          <div key={user.uid} className="bg-gray-900 rounded-xl overflow-hidden relative shadow-lg ring-1 ring-white/5 transition-all w-full h-full min-h-[250px] group">
            <RemoteUser user={user} className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10 transition-opacity opacity-0 group-hover:opacity-100">
              <span className="bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-md border border-white/10 shadow-sm">
                Participant {user.uid}
              </span>
              {!user.hasAudio && (
                <div className="bg-red-500/80 p-1.5 rounded-full backdrop-blur-md"><MicOff className="w-4 h-4 text-white" /></div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="bg-gray-900/80 backdrop-blur-xl p-4 md:px-8 border-t border-gray-800 flex justify-center items-center gap-4 z-20 shrink-0">
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full transition-all duration-300 shadow-lg ${micOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
        >
          {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        <button
          onClick={toggleCamera}
          className={`p-4 rounded-full transition-all duration-300 shadow-lg ${cameraOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
        >
          {cameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>

        <div className="w-px h-10 bg-gray-700 mx-2"></div>

        <button
          onClick={toggleFullscreen}
          className="p-4 rounded-full transition-all duration-300 shadow-lg bg-gray-800 hover:bg-gray-700 text-white"
        >
          {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
        </button>

        <button
          onClick={handleLeave}
          className="flex items-center gap-2 px-6 py-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all transform hover:scale-105 shadow-lg shadow-red-900/20 font-semibold tracking-wide"
        >
          <PhoneOff className="w-5 h-5" />
          <span className="hidden sm:inline">Leave Class</span>
        </button>
      </div>
    </div>
  );
}

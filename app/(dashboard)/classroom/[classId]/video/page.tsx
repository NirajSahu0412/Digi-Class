"use client";

import { useEffect, useState, use } from "react";
import dynamic from "next/dynamic";
import { VideoOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";

const VideoRoom = dynamic(() => import("@/components/video/VideoRoom"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center flex-1 min-h-[60vh] bg-white border border-gray-100 rounded-3xl shadow-sm">
      <Loader size="xl" />
      <h2 className="text-xl font-bold tracking-tight text-gray-900 mt-6">
        Initializing Classroom...
      </h2>
      <p className="text-gray-500 font-medium mt-2">Preparing the video player components</p>
    </div>
  ),
});

export default function VideoSessionPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = use(params);

  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!classId) return;

    const startSession = async () => {
      try {
        const res = await fetch("/api/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classroomId: classId }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to join video session");
        }

        const data = await res.json();
        setSessionData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    startSession();
  }, [classId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-[60vh] bg-white border border-gray-100 rounded-3xl shadow-sm mt-8">
        <Loader size="xl" />
        <h2 className="text-xl font-bold tracking-tight text-gray-900 mt-6">
          Connecting to Live Stream...
        </h2>
        <p className="text-gray-500 font-medium mt-2">Authenticating your connection</p>
      </div>
    );
  }

  if (error) {
    const isNoSession = error.includes("No live session found");

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-3xl border border-gray-100 shadow-sm p-10 max-w-2xl mx-auto mt-8 text-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />
        
        <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center mb-8 border border-indigo-100 relative z-10 shadow-sm relative">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping opacity-20" />
          <VideoOff className="w-10 h-10 text-indigo-500" strokeWidth={1.5} />
        </div>
        
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4 relative z-10">
          {isNoSession ? "Class hasn't started yet" : "Unable to Connect"}
        </h2>
        
        <p className="text-lg text-gray-600 mb-10 max-w-md relative z-10 leading-relaxed font-medium">
          {isNoSession 
            ? "Your teacher hasn't started the live session yet. Please wait here and check again once they begin."
            : error}
        </p>
        
        <div className="flex items-center gap-4 relative z-10">
          <Button
            variant="secondary"
            onClick={() => window.history.back()}
            className="w-32"
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            onClick={() => window.location.reload()}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="w-40"
          >
            Check Again
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Live Class Session
          </h2>
          <p className="mt-1 text-gray-500 font-medium">
            Connected as{" "}
            <span className="font-semibold text-indigo-600">
              {sessionData.participantName}
            </span>{" "}
            &mdash; {sessionData.isHost ? "You are the Host" : "You are a Student"}
          </p>
        </div>
      </div>

      <div className="flex-1 w-full">
        <VideoRoom
          token={sessionData.token}
          livekitUrl={sessionData.livekitUrl}
          roomName={sessionData.roomName}
          classroomId={classId}
          isHost={sessionData.isHost}
          videoSessionId={sessionData.videoSession.id}
          participantName={sessionData.participantName}
        />
      </div>
    </div>
  );
}

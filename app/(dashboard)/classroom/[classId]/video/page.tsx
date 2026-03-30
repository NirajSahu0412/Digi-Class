"use client";

import { useEffect, useState, use } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const VideoRoom = dynamic(() => import("@/components/video/VideoRoom"), { ssr: false });

export default function VideoSessionPage({ params }: { params: Promise<{ classId: string }> }) {
  // Use React.use() to implicitly unwrap the params promise for Next 15+ compatible unwrapping
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
      <div className="flex flex-col items-center justify-center p-20 min-h-[50vh]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Connecting to Live Server...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-8 rounded-xl border border-red-200 text-center flex flex-col items-center max-w-lg mx-auto mt-10 shadow-sm">
        <h2 className="text-xl font-bold mb-3">Unable to Connect</h2>
        <p className="mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2.5 bg-red-600 rounded-lg font-semibold text-white hover:bg-red-700 transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Live Class Session</h2>
          <p className="mt-1 text-gray-500 font-medium">You are connected to the main classroom video stream.</p>
        </div>
      </div>

      <div className="flex-1 w-full bg-black/5 rounded-2xl p-1">
        <VideoRoom 
          channelName={sessionData.channelName} 
          appId={sessionData.appId} 
          token={sessionData.token} 
          uid={sessionData.uid} 
          classroomId={classId}
          isHost={sessionData.isHost}
          videoSessionId={sessionData.videoSession.id}
        />
      </div>
    </div>
  );
}

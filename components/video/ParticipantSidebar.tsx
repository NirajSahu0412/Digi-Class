"use client";

import { useParticipants, useLocalParticipant } from "@livekit/components-react";
import { Users, Mic, MicOff, Video, VideoOff } from "lucide-react";

export function ParticipantSidebar({ onClose }: { onClose?: () => void }) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  return (
    <div className="absolute inset-y-0 right-0 z-50 w-full sm:w-80 sm:relative sm:z-auto bg-gray-900 border-l border-gray-800 flex flex-col h-full shrink-0 shadow-2xl transition-all">
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          Participants ({participants.length})
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            Close
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1 custom-scrollbar">
        {participants.map((p) => {
          const isLocal = p.identity === localParticipant.identity;
          const isAudioMuted = !p.isMicrophoneEnabled;
          const isVideoMuted = !p.isCameraEnabled;

          return (
            <div
              key={p.identity}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-800/50 transition-colors group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-semibold shrink-0">
                  {(p.name || p.identity)[0].toUpperCase()}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-gray-200 truncate pr-2">
                    {p.name || p.identity}
                    {isLocal && <span className="text-xs text-indigo-400 ml-1">(You)</span>}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-500 shrink-0">
                {isAudioMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" />}
                {isVideoMuted ? <VideoOff className="w-4 h-4 text-red-400" /> : <Video className="w-4 h-4" />}
              </div>
            </div>
          );
        })}
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151; /* gray-700 */
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4b5563; /* gray-600 */
        }
      `}</style>
    </div>
  );
}

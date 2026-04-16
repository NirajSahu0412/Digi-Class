import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { MessageSquare, Calendar } from "lucide-react";
import { CreateAnnouncementModal } from "@/components/classroom/CreateAnnouncementModal";

export default async function ClassroomStreamPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const session = await getServerSession(authOptions);

  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email || "" }
  });

  const [member, announcements] = await Promise.all([
    prisma.classroomMember.findUnique({
      where: {
        userId_classroomId: {
          userId: dbUser?.id || "",
          classroomId: classId,
        },
      },
      include: {
        classroom: true,
      },
    }),
    (prisma as any).announcement.findMany({
      where: { classroomId: classId },
      orderBy: { createdAt: "desc" },
      include: { author: true }
    })
  ]);

  const isTeacher = member?.role === "TEACHER";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Action Bar */}
      {isTeacher ? (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-3 text-gray-600 sm:text-gray-500">
            <div className="bg-indigo-100 p-2 rounded-full shrink-0">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            </div>
            <span className="font-medium text-sm sm:text-base">Announce something to your class</span>
          </div>
          <div className="w-full sm:w-auto self-end sm:self-auto">
            <CreateAnnouncementModal classId={classId} />
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-500 text-sm text-center">
          Monitoring stream... Only teachers can post announcements.
        </div>
      )}

      {/* Stream Content */}
      {announcements.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center flex flex-col items-center justify-center min-h-[300px]">
          <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No announcements yet</h3>
          <p className="text-gray-500 mt-1 max-w-sm">
            {isTeacher
              ? "Create an announcement to share information with your students."
              : "When your teacher posts an announcement, it will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {(announcements as any[]).map((announcement: any) => (
            <div key={announcement.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold">
                {announcement.author?.name?.[0]?.toUpperCase() || "T"}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{announcement.author?.name || "Teacher"}</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 mt-2 whitespace-pre-wrap">{announcement.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

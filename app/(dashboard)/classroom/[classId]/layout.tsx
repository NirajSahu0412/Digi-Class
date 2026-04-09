import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Users, ClipboardList, PenTool, Video } from "lucide-react";
import { ClassCodeDisplay } from "@/components/classroom/ClassCodeDisplay";

export default async function ClassroomLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!dbUser) {
    redirect("/login");
  }

  // Verify membership
  const member = await prisma.classroomMember.findUnique({
    where: {
      userId_classroomId: {
        userId: dbUser.id,
        classroomId: classId,
      },
    },
    include: {
      classroom: true,
    },
  });

  if (!member) {
    redirect("/dashboard");
  }

  const { classroom, role } = member;
  const isTeacher = role === "TEACHER";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Classroom Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 pb-24 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <BookOpen className="text-white w-8 h-8" />
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold tracking-tight">{classroom.name}</h1>
                <div className="flex items-center gap-3 mt-1 text-indigo-100 text-sm font-medium">
                  <span>{classroom.academicYear}</span>
                  {isTeacher && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-indigo-300"></span>
                      <span className="bg-indigo-500 text-white px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Teacher Area</span>
                    </>
                  )}
                </div>
                {isTeacher && (
                  <div className="mt-4">
                    <ClassCodeDisplay code={classroom.code} />
                  </div>
                )}
              </div>
            </div>
            {/* Nav Tabs - Server Side Rendered */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-8 mb-10 flex-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
          {/* Navigation */}
          <div className="border-b border-gray-200 bg-gray-50/50 px-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <Link
                href={`/classroom/${classroom.id}/stream`}
                className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 flex items-center gap-2"
              >
                <PenTool className="w-4 h-4" />
                Stream
              </Link>
              <Link
                href={`/classroom/${classroom.id}/assignments`}
                className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 flex items-center gap-2"
              >
                <ClipboardList className="w-4 h-4" />
                Assignments
              </Link>
              <Link
                href={`/classroom/${classroom.id}/people`}
                className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                People
              </Link>
              <Link
                href={`/classroom/${classroom.id}/notes`}
                className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Notes
              </Link>
              <Link
                href={`/classroom/${classroom.id}/video`}
                className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent text-indigo-600 hover:text-indigo-800 hover:border-indigo-300 flex items-center gap-2"
              >
                <Video className="w-4 h-4 text-indigo-600" />
                Live Class
              </Link>
              {isTeacher && (
                <Link
                  href={`/classroom/${classroom.id}/settings`}
                  className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 flex items-center gap-2 ml-auto"
                >
                  <PenTool className="w-4 h-4" />
                  Settings
                </Link>
              )}
            </nav>
          </div>
          
          <div className="p-6 flex-1 bg-white">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

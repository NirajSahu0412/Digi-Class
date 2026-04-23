import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ClipboardList, Calendar, BookOpen, Award, Users, ChevronRight } from "lucide-react";
import { CreateAssignmentModal } from "@/components/classroom/CreateAssignmentModal";
import Link from "next/link";

export default async function ClassroomAssignmentsPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const session = await getServerSession(authOptions);

  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email || "" }
  });

  const [member, assignments, subjects] = await Promise.all([
    prisma.classroomMember.findUnique({
      where: {
        userId_classroomId: {
          userId: dbUser?.id || "",
          classroomId: classId,
        },
      },
    }),
    prisma.assignment.findMany({
      where: { classroomId: classId },
      orderBy: { createdAt: "desc" },
      include: {
        creator: true,
        subject: true,
        _count: {
          select: { submissions: true }
        },
        submissions: dbUser ? {
          where: { studentId: dbUser.id },
          select: { status: true, marks: true }
        } : false,
      }
    }),
    prisma.subject.findMany({
      where: { classroomId: classId },
      orderBy: { name: "asc" },
    }),
  ]);

  const isTeacher = member?.role === "TEACHER";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            Classwork & Assignments
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {isTeacher
              ? "Manage assignments and class materials here."
              : "View all your pending and completed assignments."}
          </p>
        </div>

        {isTeacher && (
          <div className="w-full sm:w-auto self-end sm:self-auto">
            <CreateAssignmentModal classId={classId} subjects={subjects} />
          </div>
        )}
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100 border-dashed flex flex-col items-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No assignments yet</h3>
          <p className="text-gray-500 mt-1 max-w-sm">
            {isTeacher
              ? "Create your first assignment for the class."
              : "When your teacher posts an assignment, it will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const isOverdue = assignment.deadline
              ? new Date(assignment.deadline) < new Date()
              : false;

            // Student's own submission (if exists)
            const mySub = !isTeacher && assignment.submissions?.[0];

            return (
              <Link
                key={assignment.id}
                href={`/classroom/${classId}/assignments/${assignment.id}`}
                className="bg-white p-5 rounded-xl block border border-gray-200 hover:border-indigo-300 hover:shadow-md transition group"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="bg-indigo-50 p-2 sm:p-3 rounded-full group-hover:bg-indigo-100 transition shrink-0">
                      <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900 group-hover:text-indigo-600 transition truncate">
                        {assignment.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-1">
                        {assignment.description || "No description provided."}
                      </p>
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {assignment.subject && (
                          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full font-medium">
                            <BookOpen className="w-3 h-3" />
                            {assignment.subject.name}
                          </span>
                        )}
                        {assignment.totalMarks && (
                          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-600 text-[10px] px-2 py-0.5 rounded-full font-medium">
                            <Award className="w-3 h-3" />
                            {assignment.totalMarks} marks
                          </span>
                        )}
                        {isTeacher && (
                          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-medium">
                            <Users className="w-3 h-3" />
                            {assignment._count.submissions} submission{assignment._count.submissions !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                    {/* Student status badge */}
                    {!isTeacher && mySub && (
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          mySub.status === "EVALUATED"
                            ? "bg-green-50 text-green-600"
                            : mySub.status === "SUBMITTED"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {mySub.status === "EVALUATED"
                          ? `${mySub.marks}${assignment.totalMarks ? `/${assignment.totalMarks}` : ""}`
                          : mySub.status === "SUBMITTED"
                          ? "Submitted"
                          : "Pending"}
                      </span>
                    )}

                    {/* Due date */}
                    {assignment.deadline && (
                      <div
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                          isOverdue
                            ? "text-red-600 bg-red-50 border-red-100"
                            : "text-orange-600 bg-orange-50 border-orange-100"
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        {isOverdue ? "Overdue" : `Due ${new Date(assignment.deadline).toLocaleDateString()}`}
                      </div>
                    )}

                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

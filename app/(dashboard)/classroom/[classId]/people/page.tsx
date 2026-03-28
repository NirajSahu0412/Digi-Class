import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Plus, Users, ShieldCheck } from "lucide-react";

export default async function ClassroomPeoplePage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const session = await getServerSession(authOptions);

  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email || "" }
  });

  const [member, allMembers] = await Promise.all([
    prisma.classroomMember.findUnique({
      where: {
        userId_classroomId: {
          userId: dbUser?.id || "",
          classroomId: classId,
        },
      },
    }),
    prisma.classroomMember.findMany({
      where: { classroomId: classId },
      include: { user: true },
      orderBy: { joinedAt: "asc" }
    })
  ]);

  const isTeacher = member?.role === "TEACHER";
  
  const teachers = allMembers.filter(m => m.role === "TEACHER");
  const students = allMembers.filter(m => m.role === "STUDENT");

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Teachers Section */}
      <section>
        <div className="flex items-center justify-between border-b-2 border-indigo-600 pb-3 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            Teachers
          </h2>
          {isTeacher && (
            <button className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-md transition" title="Add Teacher">
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="space-y-4">
          {teachers.map(teacher => (
            <div key={teacher.id} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {teacher.user.name?.[0]?.toUpperCase() || "T"}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{teacher.user.name}</p>
                <p className="text-sm text-gray-500">{teacher.user.email}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Students Section */}
      <section>
        <div className="flex items-center justify-between border-b-2 border-indigo-600 pb-3 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Classmates
          </h2>
          <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
            <span>{students.length} student{students.length !== 1 && "s"}</span>
            {isTeacher && (
              <button className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-md transition" title="Add Student">
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        {students.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
            No students have joined yet.
            {isTeacher && " Share the class code with them."}
          </div>
        ) : (
          <div className="space-y-2">
            {students.map(student => (
              <div key={student.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 hover:border-indigo-100 transition group">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                    {student.user.name?.[0]?.toUpperCase() || "S"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student.user.name}</p>
                  </div>
                </div>
                {isTeacher && (
                  <button className="text-gray-400 hover:text-red-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition">
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

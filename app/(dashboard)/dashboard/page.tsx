import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Book, Users, Calendar } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) return null;

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!dbUser) return null;

  const classrooms = await prisma.classroom.findMany({
    where: {
      OR: [
        { createdBy: dbUser.id },
        { members: { some: { userId: dbUser.id } } }
      ]
    },
    include: {
      creator: true,
      _count: {
        select: { members: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Classrooms</h1>
        <p className="mt-2 text-gray-600 font-medium">Manage and access your enrolled and created classes.</p>
      </div>

      {classrooms.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 border-dashed">
          <Book className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No classes yet</h3>
          <p className="mt-2 text-gray-500 max-w-sm mx-auto">Get started by creating a new class or joining an existing one using a class code.</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/classroom/join"
              className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              Join Class
            </Link>
            <Link
              href="/classroom/create"
              className="px-5 py-2.5 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Create Class
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((cls: any) => (
            <Link
              key={cls.id}
              href={`/classroom/${cls.id}`}
              className="group flex flex-col justify-between bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all hover:border-indigo-300 relative"
            >
              <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 flex flex-col justify-end relative">
                <h3 className="text-xl font-bold text-white truncate drop-shadow-sm">{cls.name}</h3>
                <p className="text-indigo-100 text-sm font-medium mt-1 truncate">
                  {cls.creator.name}
                </p>
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-md">
                  {cls.createdBy === dbUser.id ? "Teacher" : "Student"}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col bg-white">
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2 mb-4">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>{cls.academicYear}</span>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500 font-medium">
                    <Users className="w-4 h-4 mr-1.5 text-gray-400" />
                    {cls._count.members} / {cls.maxStudents}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

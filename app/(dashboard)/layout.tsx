import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { MobileNav } from "@/components/MobileNav";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                EduConnect
              </span>
            </Link>
            
            <div className="flex items-center gap-6">
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/classroom/join"
                  className="text-gray-500 hover:text-indigo-600 font-medium text-sm transition-colors"
                >
                  Join Class
                </Link>
                <Link
                  href="/classroom/create"
                  className="bg-indigo-600 text-white px-5 py-2 rounded-full font-medium text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                >
                  Create Class
                </Link>
              </nav>

              <div className="hidden md:flex h-8 w-px bg-gray-200"></div>

              <div className="hidden md:flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-gray-900 truncate max-w-[120px]">
                    {session.user.name}
                  </span>
                  <LogoutButton />
                </div>
                <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold overflow-hidden border border-indigo-100 ring-2 ring-white">
                  {session.user.image ? (
                    <img src={session.user.image} alt={session.user.name || "User"} width={36} height={36} />
                  ) : (
                    (session.user.name || session.user.email || "U")[0].toUpperCase()
                  )}
                </div>
              </div>

              {/* Mobile Hamburger Menu */}
              <MobileNav 
                userName={session.user.name || "User"} 
                userEmail={session.user.email || ""} 
                userImage={session.user.image} 
              />
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

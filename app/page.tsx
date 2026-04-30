import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { APP_CONFIG } from '@/app/app.config';
import { ArrowRight, Video, BookOpen, Users, Shield, Zap, Sparkles } from "lucide-react";
import Logo from "@/components/Logo";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-[#050511] text-white selection:bg-indigo-500/30 overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo 
              textClassName="bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400 hidden sm:block"
            />
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-full bg-white/10 text-white text-xs sm:text-sm font-medium hover:bg-white/20 transition-all border border-white/5 hover:border-white/20"
                >
                  Dashboard
                </Link>
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/30 font-semibold text-indigo-300">
                  {(session.user?.name || session.user?.email || "U")[0].toUpperCase()}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="group relative px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-semibold text-white overflow-hidden rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6 sm:px-12 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap className="w-4 h-4" />
            The Next Generation Learning Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Limitless Learning,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">
              Anywhere.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            A unified virtual classroom combining high-quality live video sessions, real-time collaboration, and powerful assignment tracking.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            {session ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 hover:scale-105 transition-all shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)]"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 hover:scale-105 transition-all"
                >
                  Start Teaching for Free
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition-all font-mono text-sm"
                >
                  Have a Join Code?
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature UI Mockup visualization */}
        <div className="mt-32 relative mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-xl"></div>
          <div className="relative rounded-2xl bg-gray-900 border border-white/10 shadow-2xl overflow-hidden backdrop-blur-3xl filter drop-shadow-2xl flex flex-col items-center justify-center">
            <div className="absolute top-0 w-full h-12 bg-black/40 border-b border-white/5 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
            </div>

            {/* Mockup content */}
            <div className="w-full aspect-[16/9] flex pt-12">
              <div className="w-64 border-r border-white/5 hidden md:block p-6 space-y-4">
                <div className="h-8 w-2/3 bg-white/5 rounded-md animate-pulse"></div>
                <div className="h-4 w-1/2 bg-white/5 rounded-md animate-pulse delay-75"></div>
                <div className="h-4 w-3/4 bg-white/5 rounded-md animate-pulse delay-100"></div>
                <div className="h-4 w-1/3 bg-white/5 rounded-md animate-pulse delay-150"></div>
              </div>
              <div className="flex-1 p-8 grid grid-cols-2 gap-4">
                <div className="col-span-2 h-40 rounded-xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center relative overflow-hidden">
                  <Video className="w-12 h-12 text-indigo-400/50" />
                  <div className="absolute bottom-4 left-4 h-6 w-32 bg-black/40 backdrop-blur-md rounded-full border border-white/5"></div>
                </div>
                <div className="h-32 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-end p-4">
                  <div className="h-3 w-1/2 bg-white/10 rounded-full mb-2"></div>
                  <div className="h-3 w-3/4 bg-white/5 rounded-full"></div>
                </div>
                <div className="h-32 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-end p-4">
                  <div className="h-3 w-1/3 bg-indigo-500/20 rounded-full mb-2"></div>
                  <div className="h-3 w-1/2 bg-white/5 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-40 grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Video className="w-6 h-6 text-indigo-400" />}
            title="HD Live Classes"
            description="Seamless WebRTC and Socket.io powered virtual classrooms with reliable video routing without external plugins."
          />
          <FeatureCard
            icon={<BookOpen className="w-6 h-6 text-purple-400" />}
            title="Integrated Assignments"
            description="Create, assign, grade, and review students' tasks all within a single unified timeline."
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6 text-pink-400" />}
            title="Role-Based Security"
            description="Dynamic, context-aware classroom roles ensure that creators manage settings while peers learn safely."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm relative group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative z-10 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-100">{title}</h3>
        <p className="text-gray-400 leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </div>
  );
}

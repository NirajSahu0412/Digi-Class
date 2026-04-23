"use client";

import { useState, useRef } from "react";
import {
  ArrowLeft,
  Calendar,
  Award,
  BookOpen,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Download,
  Eye,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { gradeSubmission } from "@/app/(dashboard)/classroom/[classId]/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  totalMarks: number | null;
  deadline: string | null;
  createdAt: string;
  subject: { id: string; name: string } | null;
  creator: { name: string | null };
}

interface Submission {
  id: string;
  fileUrl: string | null;
  fileName: string | null;
  marks: number | null;
  feedback: string | null;
  status: "PENDING" | "SUBMITTED" | "EVALUATED";
  submittedAt: string;
  student: { id: string; name: string | null; email: string };
}

const STATUS_CONFIG = {
  PENDING: {
    label: "Not Submitted",
    color: "text-gray-500",
    bg: "bg-gray-100",
    icon: Clock,
  },
  SUBMITTED: {
    label: "Submitted",
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: CheckCircle,
  },
  EVALUATED: {
    label: "Graded",
    color: "text-green-600",
    bg: "bg-green-50",
    icon: Award,
  },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ==================== STUDENT VIEW ==================== */
function StudentSubmissionPanel({
  assignment,
  submission,
  classroomId,
}: {
  assignment: Assignment;
  submission: Submission | null;
  classroomId: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const isOverdue = assignment.deadline
    ? new Date(assignment.deadline) < new Date()
    : false;

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("classroomId", classroomId);
      formData.append("assignmentId", assignment.id);

      const res = await fetch("/api/assignments/submit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setSuccess(true);
      setFile(null);
      setTimeout(() => {
        router.refresh();
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Your Submission</h3>

      {/* Current submission status */}
      {submission && submission.status !== "PENDING" ? (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(() => {
                const cfg = STATUS_CONFIG[submission.status];
                const Icon = cfg.icon;
                return (
                  <>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                    <span className={`text-sm font-semibold ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </>
                );
              })()}
            </div>
            <span className="text-xs text-gray-400">
              {formatDate(submission.submittedAt)}
            </span>
          </div>

          {submission.fileUrl && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
              <FileText className="w-5 h-5 text-indigo-500" />
              <span className="text-sm text-gray-700 flex-1 truncate">
                {submission.fileName || "Submitted File"}
              </span>
              <a
                href={submission.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          )}

          {submission.status === "EVALUATED" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">
                  Marks Received
                </span>
                <span className="text-lg font-bold text-green-700">
                  {submission.marks}
                  {assignment.totalMarks ? ` / ${assignment.totalMarks}` : ""}
                </span>
              </div>
              {submission.feedback && (
                <p className="text-sm text-green-700 border-t border-green-200 pt-2">
                  <span className="font-medium">Feedback:</span>{" "}
                  {submission.feedback}
                </p>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* Upload / Resubmit */}
      {!isOverdue && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-medium text-gray-700">
            {submission && submission.status !== "PENDING"
              ? "Resubmit your work"
              : "Upload your work"}
          </h4>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Submitted successfully!
            </div>
          )}

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              file
                ? "border-green-300 bg-green-50/50"
                : "border-gray-300 hover:border-indigo-300 hover:bg-gray-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => {
                if (e.target.files?.[0]) setFile(e.target.files[0]);
              }}
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.zip,.rar"
            />
            {file ? (
              <div className="flex items-center gap-3 justify-center">
                <FileText className="w-6 h-6 text-green-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-indigo-600">Click to browse</span>{" "}
                  or drag and drop your file
                </p>
              </>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            isLoading={uploading}
            disabled={!file}
            leftIcon={<Upload className="w-4 h-4" />}
            className="w-full"
          >
            {submission && submission.status !== "PENDING"
              ? "Resubmit"
              : "Submit Assignment"}
          </Button>
        </div>
      )}

      {isOverdue && (!submission || submission.status === "PENDING") && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-red-700">Deadline has passed</p>
          <p className="text-xs text-red-500 mt-1">
            You can no longer submit this assignment.
          </p>
        </div>
      )}
    </div>
  );
}

/* ==================== GRADING MODAL ==================== */
function GradingModal({
  submission,
  totalMarks,
  classroomId,
  onClose,
}: {
  submission: Submission;
  totalMarks: number | null;
  classroomId: string;
  onClose: () => void;
}) {
  const [marks, setMarks] = useState(
    submission.marks !== null ? String(submission.marks) : ""
  );
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGrade = async () => {
    if (!marks) return;
    setLoading(true);
    setError(null);

    const result = await gradeSubmission(
      classroomId,
      submission.id,
      parseFloat(marks),
      feedback || undefined
    );

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.refresh();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Grade: {submission.student.name || submission.student.email}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Submitted file */}
          {submission.fileUrl && (
            <a
              href={submission.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition"
            >
              <FileText className="w-5 h-5 text-indigo-500" />
              <span className="text-sm text-gray-700 flex-1 truncate">
                {submission.fileName || "View File"}
              </span>
              <Eye className="w-4 h-4 text-indigo-500" />
            </a>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Marks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marks <span className="text-red-400">*</span>
              {totalMarks && (
                <span className="text-gray-400 font-normal"> / {totalMarks}</span>
              )}
            </label>
            <input
              type="number"
              min="0"
              max={totalMarks || undefined}
              step="0.5"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="Enter marks"
            />
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feedback (optional)
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-400"
              placeholder="Good work! Consider improving..."
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleGrade}
            isLoading={loading}
            disabled={!marks}
            leftIcon={<Award className="w-4 h-4" />}
          >
            Save Grade
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ==================== TEACHER VIEW ==================== */
function TeacherGradingPanel({
  assignment,
  submissions,
  classroomId,
}: {
  assignment: Assignment;
  submissions: Submission[];
  classroomId: string;
}) {
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);

  const submitted = submissions.filter((s) => s.status !== "PENDING");
  const evaluated = submissions.filter((s) => s.status === "EVALUATED");

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Students</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{submitted.length}</p>
          <p className="text-xs text-gray-500 mt-1">Submitted</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{evaluated.length}</p>
          <p className="text-xs text-gray-500 mt-1">Graded</p>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">Student Submissions</h3>
        </div>

        {submissions.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <User className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No students enrolled yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {submissions.map((sub) => {
              const cfg = STATUS_CONFIG[sub.status];
              const StatusIcon = cfg.icon;

              return (
                <div
                  key={sub.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition"
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0">
                    {(sub.student.name || sub.student.email)[0].toUpperCase()}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {sub.student.name || sub.student.email}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{sub.student.email}</p>
                  </div>

                  {/* Status */}
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </div>

                  {/* Marks */}
                  {sub.status === "EVALUATED" && (
                    <span className="text-sm font-semibold text-green-700 w-16 text-right">
                      {sub.marks}{assignment.totalMarks ? `/${assignment.totalMarks}` : ""}
                    </span>
                  )}

                  {/* File link */}
                  {sub.fileUrl && (
                    <a
                      href={sub.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                      title="View submission"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  )}

                  {/* Grade button */}
                  {sub.status !== "PENDING" && (
                    <button
                      onClick={() => setGradingSubmission(sub)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                    >
                      {sub.status === "EVALUATED" ? "Edit" : "Grade"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grading Modal */}
      {gradingSubmission && (
        <GradingModal
          submission={gradingSubmission}
          totalMarks={assignment.totalMarks}
          classroomId={classroomId}
          onClose={() => setGradingSubmission(null)}
        />
      )}
    </div>
  );
}

/* ==================== MAIN EXPORT ==================== */
export function AssignmentDetailClient({
  assignment,
  submissions,
  mySubmission,
  classroomId,
  isTeacher,
}: {
  assignment: Assignment;
  submissions: Submission[];
  mySubmission: Submission | null;
  classroomId: string;
  isTeacher: boolean;
}) {
  const isOverdue = assignment.deadline
    ? new Date(assignment.deadline) < new Date()
    : false;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href={`/classroom/${classroomId}/assignments`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Assignments
      </Link>

      {/* Assignment Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {assignment.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Posted by {assignment.creator.name} · {formatDate(assignment.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {assignment.subject && (
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 text-xs px-2.5 py-1 rounded-full font-medium">
                <BookOpen className="w-3.5 h-3.5" />
                {assignment.subject.name}
              </span>
            )}
            {assignment.totalMarks && (
              <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-600 text-xs px-2.5 py-1 rounded-full font-medium">
                <Award className="w-3.5 h-3.5" />
                {assignment.totalMarks} marks
              </span>
            )}
          </div>
        </div>

        {assignment.description && (
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap border border-gray-100">
            {assignment.description}
          </div>
        )}

        {assignment.deadline && (
          <div
            className={`flex items-center gap-2 text-sm font-medium ${
              isOverdue
                ? "text-red-600 bg-red-50 border-red-200"
                : "text-orange-600 bg-orange-50 border-orange-200"
            } px-4 py-2.5 rounded-lg border w-fit`}
          >
            <Calendar className="w-4 h-4" />
            {isOverdue ? "Overdue — " : "Due: "}
            {formatDate(assignment.deadline)}
          </div>
        )}
      </div>

      {/* Role-specific panel */}
      {isTeacher ? (
        <TeacherGradingPanel
          assignment={assignment}
          submissions={submissions}
          classroomId={classroomId}
        />
      ) : (
        <StudentSubmissionPanel
          assignment={assignment}
          submission={mySubmission}
          classroomId={classroomId}
        />
      )}
    </div>
  );
}

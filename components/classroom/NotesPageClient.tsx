"use client";

import { useState } from "react";
import {
  BookOpen,
  Plus,
  FileText,
  Image,
  Table,
  Presentation,
  File,
  Download,
  Trash2,
  Folder,
  ChevronDown,
  ChevronRight,
  Eye,
  X,
  ExternalLink,
} from "lucide-react";
import { UploadNoteModal } from "@/components/classroom/UploadNoteModal";
import { deleteNote } from "@/app/(dashboard)/classroom/[classId]/actions";
import { useRouter } from "next/navigation";

interface Subject {
  id: string;
  name: string;
}

interface NoteFolder {
  id: string;
  name: string;
}

interface Note {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  subject: Subject | null;
  folder: NoteFolder | null;
}

const FILE_TYPE_ICONS: Record<string, { icon: typeof FileText; color: string; bg: string }> = {
  pdf: { icon: FileText, color: "text-red-600", bg: "bg-red-50" },
  image: { icon: Image, color: "text-blue-600", bg: "bg-blue-50" },
  document: { icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
  spreadsheet: { icon: Table, color: "text-green-600", bg: "bg-green-50" },
  presentation: { icon: Presentation, color: "text-orange-600", bg: "bg-orange-50" },
  other: { icon: File, color: "text-gray-600", bg: "bg-gray-50" },
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ---------- Note Viewer Modal ---------- */
function NoteViewer({ note, onClose }: { note: Note; onClose: () => void }) {
  const canPreview = note.fileType === "pdf" || note.fileType === "image";

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Viewer Chrome */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-gray-900/90 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="w-5 h-5 text-indigo-400 shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">
                {note.title}
              </h3>
              <p className="text-xs text-gray-400 truncate">
                {note.fileName} · {formatSize(note.fileSize)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={note.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in new tab
            </a>
            <a
              href={note.fileUrl}
              download={note.fileName}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          {note.fileType === "pdf" ? (
            <iframe
              src={note.fileUrl}
              className="w-full h-full max-w-5xl rounded-lg bg-white shadow-2xl"
              title={note.title}
            />
          ) : note.fileType === "image" ? (
            <img
              src={note.fileUrl}
              alt={note.title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          ) : ["presentation", "document", "spreadsheet"].includes(note.fileType) ? (
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(note.fileUrl)}&embedded=true`}
              className="w-full h-full max-w-5xl rounded-lg bg-white shadow-2xl"
              title={note.title}
            />
          ) : (
            /* Fallback for non-previewable files */
            <div className="text-center bg-gray-800 rounded-2xl p-12 max-w-md">
              <File className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">
                Preview not available
              </h4>
              <p className="text-sm text-gray-400 mb-6">
                This file type cannot be previewed in the browser.Download it to view.
              </p>
              <a
                href={note.fileUrl}
                download={note.fileName}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
              >
                <Download className="w-4 h-4" />
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Note Card ---------- */
function NoteCard({
  note,
  isTeacher,
  classroomId,
  onDeleted,
  onView,
}: {
  note: Note;
  isTeacher: boolean;
  classroomId: string;
  onDeleted: () => void;
  onView: (note: Note) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const typeInfo = FILE_TYPE_ICONS[note.fileType] || FILE_TYPE_ICONS.other;
  const Icon = typeInfo.icon;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this note permanently?")) return;
    setDeleting(true);
    await deleteNote(classroomId, note.id);
    onDeleted();
  };

  return (
    <div
      onClick={() => onView(note)}
      className={`bg-white p-4 rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-md transition group flex flex-col cursor-pointer ${
        deleting ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <div className="flex items-start gap-3 flex-1">
        <div className={`${typeInfo.bg} p-2.5 rounded-lg shrink-0`}>
          <Icon className={`w-5 h-5 ${typeInfo.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">
            {note.title}
          </h4>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{note.fileName}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {note.folder && (
              <span className="inline-block bg-amber-50 text-amber-600 text-[10px] px-2 py-0.5 rounded-full font-medium">
                {note.folder.name}
              </span>
            )}
            <span className="text-[10px] text-gray-400">
              {formatSize(note.fileSize)}
            </span>
            <span className="text-[10px] text-gray-400">
              · {formatDate(note.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onView(note); }}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition"
          >
            <Eye className="w-3.5 h-3.5" />
            View
          </button>
          <a
            href={note.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </a>
        </div>
        {isTeacher && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export function NotesPageClient({
  classroomId,
  isTeacher,
  notes,
  subjects,
  folders,
}: {
  classroomId: string;
  isTeacher: boolean;
  notes: Note[];
  subjects: Subject[];
  folders: NoteFolder[];
}) {
  const [showUpload, setShowUpload] = useState(false);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
    new Set(["__none__", ...subjects.map((s) => s.id)])
  );
  const router = useRouter();

  // Group notes by subject
  const subjectMap = new Map<string, { subject: Subject; notes: Note[] }>();
  const ungroupedNotes: Note[] = [];

  for (const subject of subjects) {
    subjectMap.set(subject.id, { subject, notes: [] });
  }
  for (const note of notes) {
    if (note.subject) {
      const entry = subjectMap.get(note.subject.id);
      if (entry) entry.notes.push(note);
      else ungroupedNotes.push(note);
    } else {
      ungroupedNotes.push(note);
    }
  }

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) next.delete(subjectId);
      else next.add(subjectId);
      return next;
    });
  };

  const handleDeleted = () => {
    router.refresh();
  };

  const subjectGroups = Array.from(subjectMap.values()).filter(
    (entry) => entry.notes.length > 0
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            Class Notes
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Access study materials and resources shared by the teacher.
          </p>
        </div>

        {isTeacher && (
          <button
            onClick={() => setShowUpload(true)}
            className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Upload Note
          </button>
        )}
      </div>

      {/* Content */}
      {notes.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100 border-dashed flex flex-col items-center">
          <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No notes yet</h3>
          <p className="text-gray-500 mt-1 max-w-sm">
            {isTeacher
              ? "Upload notes, PDFs, or presentations for your students."
              : "When your teacher uploads study materials, they will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Subject Groups */}
          {subjectGroups.map(({ subject, notes: subjectNotes }) => {
            const isExpanded = expandedSubjects.has(subject.id);
            return (
              <div
                key={subject.id}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleSubject(subject.id)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-indigo-400" />
                  )}
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  <span className="font-semibold text-sm text-gray-800">
                    {subject.name}
                  </span>
                  <span className="ml-auto text-xs text-indigo-500 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200 font-medium">
                    {subjectNotes.length} note{subjectNotes.length !== 1 ? "s" : ""}
                  </span>
                </button>

                {isExpanded && (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjectNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        isTeacher={isTeacher}
                        classroomId={classroomId}
                        onDeleted={handleDeleted}
                        onView={setViewingNote}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Ungrouped Notes (no subject) */}
          {ungroupedNotes.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSubject("__none__")}
                className="w-full flex items-center gap-3 px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition text-left"
              >
                {expandedSubjects.has("__none__") ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
                <Folder className="w-5 h-5 text-gray-400" />
                <span className="font-semibold text-sm text-gray-600">
                  General
                </span>
                <span className="ml-auto text-xs text-gray-400 bg-white px-2.5 py-0.5 rounded-full border border-gray-200 font-medium">
                  {ungroupedNotes.length} note{ungroupedNotes.length !== 1 ? "s" : ""}
                </span>
              </button>

              {expandedSubjects.has("__none__") && (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ungroupedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      isTeacher={isTeacher}
                      classroomId={classroomId}
                      onDeleted={handleDeleted}
                      onView={setViewingNote}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <UploadNoteModal
          classroomId={classroomId}
          subjects={subjects}
          folders={folders}
          onClose={() => setShowUpload(false)}
        />
      )}

      {/* Note Viewer */}
      {viewingNote && (
        <NoteViewer
          note={viewingNote}
          onClose={() => setViewingNote(null)}
        />
      )}
    </div>
  );
}

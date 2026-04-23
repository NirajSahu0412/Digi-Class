"use client";

import { useState, useRef, useCallback } from "react";
import {
  X,
  Upload,
  FileText,
  FolderPlus,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

interface Subject {
  id: string;
  name: string;
}

interface Folder {
  id: string;
  name: string;
}

export function UploadNoteModal({
  classroomId,
  subjects,
  folders,
  onClose,
}: {
  classroomId: string;
  subjects: Subject[];
  folders: Folder[];
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [folderId, setFolderId] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [isNewFolder, setIsNewFolder] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (!title) setTitle(droppedFile.name.replace(/\.[^.]+$/, ""));
    }
  }, [title]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!title) setTitle(selected.name.replace(/\.[^.]+$/, ""));
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) return;

    setUploading(true);
    setError(null);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("classroomId", classroomId);
      formData.append("title", title.trim());

      if (subjectId) formData.append("subjectId", subjectId);

      if (isNewFolder && newFolderName.trim()) {
        formData.append("folderName", newFolderName.trim());
      } else if (folderId) {
        formData.append("folderId", folderId);
      }

      setProgress(30);

      const res = await fetch("/api/notes/upload", {
        method: "POST",
        body: formData,
      });

      setProgress(80);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setProgress(100);
      setSuccess(true);

      setTimeout(() => {
        router.refresh();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-[modalIn_0.25s_ease]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            Upload Note
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Success State */}
          {success && (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
              <p className="text-lg font-semibold text-gray-900">
                Uploaded Successfully!
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Your note has been added.
              </p>
            </div>
          )}

          {!success && (
            <>
              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chapter 5 — Thermodynamics"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                >
                  <option value="">No subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Folder */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Folder
                </label>
                {!isNewFolder ? (
                  <div className="flex gap-2">
                    <select
                      value={folderId}
                      onChange={(e) => setFolderId(e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    >
                      <option value="">No folder</option>
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewFolder(true);
                        setFolderId("");
                      }}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-dashed border-indigo-300 text-indigo-600 text-sm font-medium hover:bg-indigo-50 transition"
                    >
                      <FolderPlus className="w-4 h-4" />
                      New
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Enter folder name…"
                      className="flex-1 rounded-lg border border-indigo-300 px-3 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewFolder(false);
                        setNewFolderName("");
                      }}
                      className="shrink-0 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* File Drop Zone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File <span className="text-red-400">*</span>
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    dragging
                      ? "border-indigo-400 bg-indigo-50"
                      : file
                      ? "border-green-300 bg-green-50/50"
                      : "border-gray-300 hover:border-indigo-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.gif,.webp,.svg"
                  />
                  {file ? (
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2.5 rounded-lg">
                        <FileText className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatSize(file.size)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-indigo-600">
                          Click to browse
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PDF, DOC, PPT, XLS, Images up to 50MB
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Uploading…</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} disabled={uploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              isLoading={uploading}
              disabled={!file || !title.trim()}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Upload
            </Button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

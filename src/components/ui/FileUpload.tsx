import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Upload, X, File, Image } from 'lucide-react';

interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onFilesChange: (files: File[]) => void;
  error?: string;
  hint?: string;
  className?: string;
}

export function FileUpload({
  label,
  accept,
  multiple = false,
  maxSize = 5 * 1024 * 1024,
  onFilesChange,
  error,
  hint,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const valid = Array.from(newFiles).filter((f) => f.size <= maxSize);
    const updated = multiple ? [...files, ...valid] : valid;
    setFiles(updated);
    onFilesChange(updated);
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFilesChange(updated);
  };

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && <span className="text-sm font-medium text-neutral-700">{label}</span>}
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors',
          dragOver ? 'border-[#1B4F9C] bg-blue-50' : 'border-neutral-300 hover:border-neutral-400',
          error && 'border-red-300'
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      >
        <Upload className="h-8 w-8 text-neutral-400" />
        <div>
          <p className="text-sm font-medium text-neutral-700">
            Drop files here or <span className="text-[#1B4F9C]">browse</span>
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {accept ? `Accepted: ${accept}` : 'Any file type'} · Max {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {files.length > 0 && (
        <div className="space-y-1.5 mt-1">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
              {file.type.startsWith('image/') ? (
                <Image className="h-4 w-4 text-neutral-400" />
              ) : (
                <File className="h-4 w-4 text-neutral-400" />
              )}
              <span className="flex-1 truncate text-xs text-neutral-700">{file.name}</span>
              <span className="text-xs text-neutral-400">{(file.size / 1024).toFixed(0)}KB</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="text-neutral-400 hover:text-red-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

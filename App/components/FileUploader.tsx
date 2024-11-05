"use client";

import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  onFolderSelect: (folder: any) => void;
}

export function FileUploader({ onFolderSelect }: FileUploaderProps) {
  const handleFolderSelect = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      // Check if the API is available
      if (!('showDirectoryPicker' in window)) {
        throw new Error('File System Access API is not supported in this environment');
      }

      // @ts-ignore - FileSystemDirectoryHandle is experimental
      const dirHandle = await window.showDirectoryPicker({
        mode: 'read'
      });
      onFolderSelect(dirHandle);
    } catch (err) {
      console.error("Error selecting folder:", err);
      // Handle the error gracefully
      if (err instanceof Error && err.name === 'SecurityError') {
        alert('Unable to access files. This feature may not be available in the current environment.');
      }
    }
  };

  return (
    <Button 
      onClick={handleFolderSelect}
      className="w-full"
    >
      <FolderOpen className="w-4 h-4 mr-2" />
      Open Folder
    </Button>
  );
}
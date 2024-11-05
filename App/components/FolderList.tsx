"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Folder, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderListProps {
  folders: Array<{ name: string; path: string }>;
  currentFolder: string | null;
  onFolderSelect: (path: string) => void;
  onFolderDelete: (path: string) => void;
}

export function FolderList({ 
  folders, 
  currentFolder, 
  onFolderSelect,
  onFolderDelete 
}: FolderListProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="space-y-2 p-2">
        {folders.map((folder) => (
          <div key={folder.path} className="flex items-center gap-2">
            <Button
              variant="ghost"
              className={cn(
                "flex-1 justify-start",
                currentFolder === folder.path && "bg-accent"
              )}
              onClick={() => onFolderSelect(folder.path)}
            >
              <Folder className="mr-2 h-4 w-4" aria-hidden="true" />
              <span className="truncate">{folder.name}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onFolderDelete(folder.path)}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
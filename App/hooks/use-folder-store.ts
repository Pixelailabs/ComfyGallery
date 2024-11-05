"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FolderData {
  name: string;
  path: string;
  handle?: FileSystemDirectoryHandle;
  lastAccessed?: number;
}

interface FolderStore {
  folders: FolderData[];
  addFolder: (folder: FolderData) => void;
  removeFolder: (path: string) => void;
  updateFolderHandle: (path: string, handle: FileSystemDirectoryHandle) => void;
  updateLastAccessed: (path: string) => void;
  getLastAccessedFolder: () => FolderData | undefined;
}

export const useFolderStore = create<FolderStore>()(
  persist(
    (set, get) => ({
      folders: [],
      addFolder: (folder) =>
        set((state) => ({
          folders: [
            ...state.folders.filter((f) => f.path !== folder.path),
            { ...folder, lastAccessed: Date.now() }
          ],
        })),
      removeFolder: (path) =>
        set((state) => ({
          folders: state.folders.filter((f) => f.path !== path),
        })),
      updateFolderHandle: (path, handle) =>
        set((state) => ({
          folders: state.folders.map((f) =>
            f.path === path ? { ...f, handle, lastAccessed: Date.now() } : f
          ),
        })),
      updateLastAccessed: (path) =>
        set((state) => ({
          folders: state.folders.map((f) =>
            f.path === path ? { ...f, lastAccessed: Date.now() } : f
          ),
        })),
      getLastAccessedFolder: () => {
        const { folders } = get();
        return folders.reduce((latest, current) => {
          if (!latest || (current.lastAccessed && (!latest.lastAccessed || current.lastAccessed > latest.lastAccessed))) {
            return current;
          }
          return latest;
        }, undefined as FolderData | undefined);
      },
    }),
    {
      name: 'folder-storage',
      partialize: (state) => ({
        folders: state.folders.map(({ handle, ...rest }) => rest),
      }),
    }
  )
);
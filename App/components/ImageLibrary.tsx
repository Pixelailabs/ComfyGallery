"use client";

import { useState, useEffect } from 'react';
import { FolderList } from './FolderList';
import { ImageGrid } from './ImageGrid';
import { ImageMetadata } from './ImageMetadata';
import { SocialLinks } from './SocialLinks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderOpen, Search, SortAsc, SortDesc } from 'lucide-react';
import { useFolderStore } from '@/hooks/use-folder-store';
import { readImageMetadata } from '@/lib/utils';
import { Pagination } from './Pagination';

const IMAGES_PER_PAGE = 50;

export default function ImageLibrary() {
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAscending, setSortAscending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { 
    folders, 
    addFolder, 
    removeFolder, 
    updateFolderHandle,
    updateLastAccessed,
    getLastAccessedFolder 
  } = useFolderStore();

  const handleFolderSelect = async (folderHandle: FileSystemDirectoryHandle) => {
    try {
      setIsLoading(true);
      const images = [];
      for await (const entry of folderHandle.values()) {
        if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.png')) {
          const metadata = await readImageMetadata(entry);
          const file = await entry.getFile();
          images.push({
            path: URL.createObjectURL(file),
            metadata,
            name: entry.name,
            lastModified: file.lastModified,
          });
        }
      }
      setImages(images);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error reading folder:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openFolder = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      const folder = {
        name: handle.name,
        path: handle.name,
        handle,
      };
      addFolder(folder);
      setCurrentFolder(folder.path);
      await handleFolderSelect(handle);
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };

  const handleFolderDelete = (path: string) => {
    if (currentFolder === path) {
      setImages([]);
      setCurrentFolder(null);
    }
    removeFolder(path);
  };

  const handleStoredFolderSelect = async (path: string) => {
    try {
      const folder = folders.find((f) => f.path === path);
      if (!folder) return;

      setCurrentFolder(path);
      updateLastAccessed(path);
      let handle = folder.handle;

      if (!handle) {
        try {
          handle = await window.showDirectoryPicker({
            id: path,
            startIn: 'desktop',
          });
          updateFolderHandle(path, handle);
        } catch (error) {
          console.error('Error getting folder handle:', error);
          return;
        }
      }

      // Verify permission
      try {
        await handle.requestPermission({ mode: 'read' });
        await handleFolderSelect(handle);
      } catch (error) {
        console.error('Permission denied, requesting new handle:', error);
        try {
          handle = await window.showDirectoryPicker({
            id: path,
            startIn: 'desktop',
          });
          updateFolderHandle(path, handle);
          await handleFolderSelect(handle);
        } catch (innerError) {
          console.error('Error selecting folder:', innerError);
        }
      }
    } catch (error) {
      console.error('Error accessing folder:', error);
    }
  };

  // Auto-load last accessed folder on mount
  useEffect(() => {
    const loadLastFolder = async () => {
      const lastFolder = getLastAccessedFolder();
      if (lastFolder?.path) {
        await handleStoredFolderSelect(lastFolder.path);
      }
    };
    loadLastFolder();
  }, []);

  const filteredAndSortedImages = images
    .filter((image) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        image.metadata?.toLowerCase().includes(query) ||
        image.name.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const modifier = sortAscending ? 1 : -1;
      return (a.lastModified - b.lastModified) * modifier;
    });

  const totalPages = Math.ceil(filteredAndSortedImages.length / IMAGES_PER_PAGE);
  const paginatedImages = filteredAndSortedImages.slice(
    (currentPage - 1) * IMAGES_PER_PAGE,
    currentPage * IMAGES_PER_PAGE
  );

  useEffect(() => {
    // Reset to first page when search query changes
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r bg-card p-4 flex flex-col">
        <Button
          onClick={openFolder}
          className="w-full mb-4"
          variant="secondary"
        >
          <FolderOpen className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Open Folder</span>
        </Button>
        <FolderList
          folders={folders}
          currentFolder={currentFolder}
          onFolderSelect={handleStoredFolderSelect}
          onFolderDelete={handleFolderDelete}
        />
        <SocialLinks />
      </aside>
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-card">
          <div className="space-y-3 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search images..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setSortAscending(!sortAscending)}
              >
                {sortAscending ? (
                  <SortAsc className="h-4 w-4 mr-2" aria-hidden="true" />
                ) : (
                  <SortDesc className="h-4 w-4 mr-2" aria-hidden="true" />
                )}
                {sortAscending ? 'Oldest First' : 'Newest First'}
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <ImageGrid
            images={paginatedImages}
            onImageSelect={setSelectedImage}
          />
        </div>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
      {selectedImage && (
        <ImageMetadata
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
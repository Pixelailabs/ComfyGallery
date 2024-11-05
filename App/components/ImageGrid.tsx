"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageGridProps {
  images: Array<{
    path: string;
    name: string;
  }>;
  onImageSelect: (image: any) => void;
}

export function ImageGrid({ images, onImageSelect }: ImageGridProps) {
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [errorStates, setErrorStates] = useState<{ [key: string]: boolean }>({});

  const handleImageLoad = (imagePath: string) => {
    setLoadingStates(prev => ({ ...prev, [imagePath]: false }));
  };

  const handleImageError = (imagePath: string) => {
    setLoadingStates(prev => ({ ...prev, [imagePath]: false }));
    setErrorStates(prev => ({ ...prev, [imagePath]: true }));
  };

  return (
    <ScrollArea className="h-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {images.map((image, index) => (
          <div
            key={image.path + index}
            className="cursor-pointer group relative overflow-hidden rounded-lg border bg-background"
            onClick={() => !errorStates[image.path] && onImageSelect(image)}
          >
            <AspectRatio ratio={1}>
              {!errorStates[image.path] ? (
                <>
                  {(loadingStates[image.path] !== false) && (
                    <Skeleton className="absolute inset-0 z-10" />
                  )}
                  <Image
                    src={image.path}
                    alt={image.name}
                    fill
                    className={`object-cover transition-all duration-300 group-hover:scale-105 ${
                      loadingStates[image.path] === false ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoadingComplete={() => handleImageLoad(image.path)}
                    onError={() => handleImageError(image.path)}
                  />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <p className="text-sm text-muted-foreground">Failed to load</p>
                </div>
              )}
            </AspectRatio>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
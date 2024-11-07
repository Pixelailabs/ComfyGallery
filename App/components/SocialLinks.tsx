"use client";

import { Button } from "@/components/ui/button";
import { Instagram, Youtube, Globe, Twitter } from "lucide-react";

export function SocialLinks() {
  return (
    <div className="mt-auto p-4 text-center space-y-6">
      <p className="text-sm">
        ComfyGallery made by <a href="https://pixelailabs.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">PixelAILabs.com</a>. For more information, visit the links below.
      </p>

      <div className="flex justify-center gap-4">
        <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
          <a
            href="https://youtube.com/@aiconomist"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Youtube className="h-5 w-5" />
            <span className="sr-only">YouTube</span>
          </a>
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
          <a
            href="https://x.com/@aiconomist1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Twitter className="h-5 w-5" />
            <span className="sr-only">X (Twitter)</span>
          </a>
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
          <a
            href="https://pixelailabs.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Globe className="h-5 w-5" />
            <span className="sr-only">Website</span>
          </a>
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
          <a
            href="https://instagram.com/pixelai.labs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram className="h-5 w-5" />
            <span className="sr-only">Instagram</span>
          </a>
        </Button>
      </div>
    </div>
  );
}

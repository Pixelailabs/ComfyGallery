"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, FileImage, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ImageMetadataProps {
  image: {
    path: string;
    name: string;
    metadata: any;
  };
  onClose: () => void;
}

interface ImageDimensions {
  width: number;
  height: number;
}

export function ImageMetadata({ image, onClose }: ImageMetadataProps) {
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      setImageDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.src = image.path;
  }, [image.path]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const parseMetadata = (metadata: any) => {
    try {
      if (!metadata) return null;
      
      const data = typeof metadata === 'string' ? 
        JSON.parse(metadata.trim()) : 
        metadata;

      // Find prompt from different possible locations
      let prompt = "";
      
      // Check for direct text input (new format)
      if (data["113"]?.inputs?.text) {
        prompt = data["113"].inputs.text;
      } else {
        // Find prompt node (CLIPTextEncode with non-empty text)
        const promptNode = Object.entries(data).find(([, value]: [string, any]) => 
          value?.class_type === "CLIPTextEncode" && 
          value?.inputs?.text && 
          !value?.inputs?.text?.includes("negative") &&
          value?.inputs?.text?.length > 0
        );
        if (promptNode) {
          prompt = promptNode[1].inputs.text;
        }
      }

      // Find model node
      const modelNode = Object.entries(data).find(([, value]: [string, any]) => 
        value?.class_type === "UnetLoaderGGUF" || 
        value?.class_type === "CheckpointLoaderSimple" ||
        value?.class_type === "UNETLoader"
      );

      // Find LoRA nodes
      const loraNames = [];
      Object.entries(data).forEach(([, value]: [string, any]) => {
        if (value?.class_type === "Power Lora Loader (rgthree)") {
          Object.entries(value.inputs).forEach(([key, val]: [string, any]) => {
            if (key.startsWith('lora_') && val?.on && val?.lora) {
              loraNames.push(val.lora);
            }
          });
        } else if (value?.class_type === "LoraLoader|pysssss") {
          if (value.inputs?.lora_name?.content) {
            loraNames.push(value.inputs.lora_name.content);
          }
        } else if (value?.inputs?.lora_name && typeof value.inputs.lora_name === 'string') {
          loraNames.push(value.inputs.lora_name);
        }
      });

      // Find seed
      const samplerNode = Object.entries(data).find(([, value]: [string, any]) => 
        value?.class_type === "KSampler" && 
        value?.inputs?.seed
      );

      return {
        prompt,
        modelName: 
          modelNode?.[1]?.inputs?.unet_name || 
          modelNode?.[1]?.inputs?.ckpt_name ||
          "",
        loraNames: [...new Set(loraNames)], // Remove duplicates
        seed: samplerNode?.[1]?.inputs?.seed || ""
      };
    } catch (error) {
      console.error('Error parsing metadata:', error);
      return null;
    }
  };

  const metadata = parseMetadata(image.metadata);

  return (
    <div className="w-96 border-l bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Image Details</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-6">
          <div className="relative h-64 rounded-lg overflow-hidden bg-muted">
            <Image
              src={image.path}
              alt={image.name}
              fill
              className="object-contain"
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
              <FileImage className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium truncate flex-1">
                {image.name}
              </span>
              {imageDimensions && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {imageDimensions.width} × {imageDimensions.height}
                </span>
              )}
            </div>

            {metadata ? (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Prompt</h4>
                    {metadata.prompt && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(metadata.prompt)}
                      >
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {metadata.prompt || "No prompt available"}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Model</h4>
                  <p className="text-sm text-muted-foreground">
                    {metadata.modelName || "No model information available"}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">LoRA Models</h4>
                  <div className="space-y-1">
                    {metadata.loraNames?.length > 0 ? (
                      metadata.loraNames.map((lora, index) => (
                        <p key={index} className="text-sm text-muted-foreground">
                          {lora}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No LoRA models used</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Seed</h4>
                  <p className="text-sm text-muted-foreground">
                    {metadata.seed || "Seed not available"}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No metadata available for this image</p>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function readImageMetadata(fileHandle: FileSystemFileHandle): Promise<string | null> {
  try {
    const file = await fileHandle.getFile();
    const arrayBuffer = await file.arrayBuffer();
    const view = new DataView(arrayBuffer);
    
    let offset = 8; // Skip PNG signature
    
    while (offset < arrayBuffer.byteLength) {
      const length = view.getUint32(offset);
      const chunkType = String.fromCharCode(
        view.getUint8(offset + 4),
        view.getUint8(offset + 5),
        view.getUint8(offset + 6),
        view.getUint8(offset + 7)
      );
      
      if (chunkType === 'tEXt') {
        const textData = new Uint8Array(arrayBuffer, offset + 8, length);
        const decoder = new TextDecoder();
        const text = decoder.decode(textData);
        
        // Look for "parameters" or "prompt" keyword
        if (text.startsWith('parameters\0') || text.startsWith('prompt\0')) {
          const value = text.slice(text.indexOf('\0') + 1);
          return value;
        }
      }
      
      offset += length + 12; // Length + Type (4) + CRC (4)
    }
    return null;
  } catch (error) {
    console.error('Error reading image metadata:', error);
    return null;
  }
}
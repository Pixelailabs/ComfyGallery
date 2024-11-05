export function extractMetadata(pngBuffer: ArrayBuffer) {
  // This is a placeholder for the actual PNG metadata extraction
  // You'll need to implement the actual PNG chunk parsing logic here
  return {
    prompt: "",
    unet_name: "",
    lora_name: "",
    width: 0,
    height: 0,
    seed: 0
  };
}

export function parseComfyMetadata(metadata: string) {
  try {
    const parsed = JSON.parse(metadata);
    
    // Find the CLIPTextEncode node with the prompt
    const promptNode = Object.values(parsed).find((node: any) => 
      node.class_type === "CLIPTextEncode" && node.inputs?.text
    ) as any;

    // Find the UnetLoader node
    const unetNode = Object.values(parsed).find((node: any) =>
      node.class_type === "UnetLoaderGGUF"
    ) as any;

    // Find the Power Lora Loader node
    const loraNode = Object.values(parsed).find((node: any) =>
      node.class_type === "Power Lora Loader (rgthree)"
    ) as any;

    // Find the EmptyLatentImage node for dimensions
    const latentNode = Object.values(parsed).find((node: any) =>
      node.class_type === "EmptyLatentImage"
    ) as any;

    // Find the KSampler node for seed
    const samplerNode = Object.values(parsed).find((node: any) =>
      node.class_type === "KSampler"
    ) as any;

    return {
      prompt: promptNode?.inputs?.text || "",
      unet_name: unetNode?.inputs?.unet_name || "",
      lora_name: loraNode?.inputs?.lora_1?.lora || "",
      width: latentNode?.inputs?.width || 0,
      height: latentNode?.inputs?.height || 0,
      seed: samplerNode?.inputs?.seed || 0
    };
  } catch (error) {
    console.error("Error parsing ComfyUI metadata:", error);
    return null;
  }
}
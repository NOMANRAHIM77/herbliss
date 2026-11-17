import assets from "@/content/imagekit-assets.json";

const hostedImages = new Map(Object.entries(assets));

export function hostedImageUrl(path: string) {
  return hostedImages.get(path) ?? path;
}

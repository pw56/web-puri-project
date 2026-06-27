export class Puri {
  #imageUrl: string;

  constructor(image: Blob) {
    this.#imageUrl = URL.createObjectURL(image);
  }

  dispose(): void {
    URL.revokeObjectURL(this.getImageAsUrl());
  }

  getImageAsImage(): HTMLImageElement {
    const image = new Image();
    image.src = this.#imageUrl;
    return image;
  }

  async getImageAsBlob(): Promise<Blob> {
    const response = await fetch(this.#imageUrl);
    const image = await response.blob();
    return image;
  }

  getImageAsUrl(): string {
    return this.#imageUrl;
  }
}
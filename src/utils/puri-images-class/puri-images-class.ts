import { Puri } from './puri-class';

export class PuriImages {
  #puris: Array<Puri> = [];

  count(): number {
    return this.#puris.length;
  }

  dispose(): void {
    this.#puris.forEach((puri) => {
      URL.revokeObjectURL(puri.getImageAsUrl());
    });
  }

  addImageFromBlob(image: Blob): void {
    const puri:Puri = new Puri(image);
    this.#puris.push(puri);
  }

  addImagesFromBlob(images: Array<Blob>): void {
    images.forEach((image) => {
      const puri:Puri = new Puri(image);
      this.#puris.push(puri);
    });

  }

  getImageAsImage(index: number): HTMLImageElement {
    return this.#puris[index].getImageAsImage();
  }

  async getImageAsBlob(index: number): Promise<Blob> {
    return await this.#puris[index].getImageAsBlob();
  }

  getImageAsUrl(index: number): string {
    return this.#puris[index].getImageAsUrl();
  }
  
  getAllImagesAsImage(): Array<HTMLImageElement> {
    return this.#puris.map((puri) => {
      return puri.getImageAsImage();
    });
  }

  getAllImagesAsBlob(): Array<Blob> {
    return this.#puris.map((puri) => {
      return puri.getImageAsBlob();
    });
  }

  getAllImagesAsUrl(): Array<string> {
    return this.#puris.map((puri) => {
      return puri.getImageAsUrl();
    });
  }
}
import { Puri } from './puri-class';

interface GeoLocation {
  lat: number; // 緯度 (-90 ～ 90)
  lng: number; // 経度 (-180 ～ 180)
}

export class PuriImages {
  #puris: Puri[] = [];
  #date: Date | null = null;
  #location: GeoLocation | null = null;

  count(): number {
    return this.#puris.length;
  }

  dispose(): void {
    this.#puris.forEach((puri) => {
      URL.revokeObjectURL(puri.getImageAsUrl());
    });
  }

  addImageFromBlob(image: Blob): void {
    const puri: Puri = new Puri(image);
    this.#puris.push(puri);
  }

  addImagesFromBlob(images: Blob[]): void {
    images.forEach((image) => {
      const puri: Puri = new Puri(image);
      this.#puris.push(puri);
    });

  }

  getImageAsImage(index: number): HTMLImageElement {
    return this.#puris[index].getImageAsImage();
  }

  async getImageAsBlob(index: number): Promise<Blob> {
    return await this.#puris[index].getImageAsBlob();
  }

  async getImageAsFile(index: number): Promise<Blob> {
    const blob = await this.#puris[index].getImageAsBlob();
    
    /*
       ファイル名は日時(yyyy-mm-dd-hh-mm形式)
        例: "2025-12-20-16-36"
      */
    const dateTime: string =
      new Intl.DateTimeFormat('sv-SE', {
        dateStyle: 'short',
        timeStyle: 'short'
      }).format(this.#date ?? undefined).replace(' ', '-').replace(':', '-');

    /*
      出力されるファイル名は
      "puri" + 日時 + 枚数のインデックス
      となり、文字列はハイフンで結合される
      
      例:
      "puri-2025-06-15-09-32-1"
    */
    const fileName: string = `puri-${dateTime}-${index}`;

    return new File(
      [blob],
      fileName
    );
  }

  getImageAsUrl(index: number): string {
    return this.#puris[index].getImageAsUrl();
  }

  getAllImagesAsImage(): HTMLImageElement[] {
    return this.#puris.map((puri) => {
      return puri.getImageAsImage();
    });
  }

  async getAllImagesAsBlob(): Promise<Blob[]> {
    return await Promise.all(
      this.#puris.map((puri) => puri.getImageAsBlob())
    );
  }

  async getAllImagesAsFile(): Promise<File[]> {
    const blobImages: Blob[] = await Promise.all(
      this.#puris.map((puri) => puri.getImageAsBlob())
    );
    return blobImages.map((blob, index) => {
      /*
       ファイル名は日時(yyyy-mm-dd-hh-mm形式)
        例: "2025-12-20-16-36"
      */
      const dateTime: string =
        new Intl.DateTimeFormat('sv-SE', {
          dateStyle: 'short',
          timeStyle: 'short'
        }).format(this.#date ?? undefined).replace(' ', '-').replace(':', '-');

      /*
        出力されるファイル名は
        "puri" + 日時 + 枚数のインデックス
        となり、文字列はハイフンで結合される
        
        例:
        "puri-2025-06-15-09-32-1"
      */
      const fileName: string = `puri-${dateTime}-${index}`;

      return new File(
        [blob],
        fileName
      );
    });
  }

  getAllImagesAsUrl(): string[] {
    return this.#puris.map((puri) => {
      return puri.getImageAsUrl();
    });
  }

  setDate(date: Date): void {
    this.#date = date;
  }

  getDate(): Date | null {
    return this.#date;
  }

  setLocation(location: GeoLocation): void {
    this.#location = location;
  }

  getLocation(): GeoLocation | null {
    return this.#location;
  }
}
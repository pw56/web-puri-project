export class Puri {
  #imageUrl: string;

  constructor(image: Blob) {
    let imageUrl: string = "";
    if() {} // Blob型のチェック&URL変換
    this.#imageUrl = imageUrl;
  }

  getImageAsImage(): HTMLImageElement {
    const image = new Image();
    image.src = this.#imageUrl;
    return image;
  }

  getImageAsBlob(): Blob {
    const image = new Blob();
    return image;
  }

  getImageAsUrl(): string {
    return this.#imageUrl;
  }
}
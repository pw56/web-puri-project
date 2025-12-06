import { printElement } from "./printElement.ts";
import { isLengthValue} from "./isLengthValue.ts";
import { imageDataToBlob } from "./imageDataToBlob.ts";

export async function printPuriSheet(
  original: ImageData,
  height: string,
  width: string
): Promise<void> {
  if (!(original instanceof ImageData)) {
    throw new Error("画像が正しくありません。");
  }
  if (!isLengthValue(height)) {
    throw new Error("高さが正しくありません。");
  }
  if (!isLengthValue(width)) {
    throw new Error("横幅が正しくありません。");
  }

  // imageDataToBlob は Promise<Blob | null> を返すので await が必要
  const converted = await imageDataToBlob(original);
  if (!converted) {
    throw new Error("画像の変換に失敗しました。");
  }

  // createElement は document.createElement のことだと推測
  const imgElement = document.createElement("img");
  imgElement.src = URL.createObjectURL(converted);
  imgElement.style.height = height;
  imgElement.style.width = width;

  printElement(imgElement);
}
import { printElement } from "./print"

export function printPuriSheet(original, height, width) {
  if(!(original instanceof ImageData)) throw new Error("画像が正しくありません。");
  // 高さと幅もセンチメートルまたはミリメートルか判断するガード節お願い

  const converted = original; // ここにImagaData型をBlob型に変換して代入
  let imgElement = createElement("img");
  imgElement.src = URL.createObjectURL(converted);
  imgElement.style.height = height;
  imgElement.style.width = width;
  printElement(imgElement);
}
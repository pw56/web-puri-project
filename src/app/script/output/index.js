import { printElement } from "./print"

export function printPuriSheet(original, height, width) {
  // ここに引数の"originalData型"かのガード節をお願い
  // 高さと幅もセンチメートルか判断するガード節お願い

  const converted = original; // ここにImagaData型をBlob型に変換して代入
  let imgElement = createElement("img");
  imgElement.src = URL.createObjectURL(converted);
  imgElement.style.height = height;
  imgElement.style.width = width;
  printElement(imgElement);
}
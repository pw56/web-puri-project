import "print.js"

export function printPuriSheet(original, height, width) {
  if(!(original instanceof ImageData)) throw new Error("画像が正しくありません。");
  if(!isLengthValue(height)) throw new Error("高さが正しくありません。");
  if(!isLengthValue(width)) throw new Error("横幅が正しくありません。");

  const converted = imageDataToBlob(original);
  let imgElement = createElement("img");
  imgElement.src = URL.createObjectURL(converted);
  imgElement.style.height = height;
  imgElement.style.width = width;
  printElement(imgElement);
}
export function isLengthValue(str: string): boolean {
  return /^(\d+(\.\d+)?)(cm|mm)$/.test(str);
}
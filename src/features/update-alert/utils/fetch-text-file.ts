async function fetchTextFile(path: string): Promise<string> {
  const response: Response = await fetch(path);
  if (!response.ok) {
    throw new Error(`HTTPエラー ステータス: ${response.status}`);
  }
  const fileContent: string = await response.text();
  return fileContent;
}
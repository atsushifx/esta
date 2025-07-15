/**
 * パス文字列の厳密な検証
 * - 空文字列でないこと
 * - 絶対パス: "/"で始まる、またはWindowsドライブレター形式（C:\など）
 * - 相対パス: "."で始まる、または直接ディレクトリ名
 * - 無効文字を含まないこと
 */
export const validatePath = (path: string): boolean => {
  // 空文字列チェック
  if (!path || path.trim().length === 0) {
    return false;
  }

  const trimmedPath = path.trim();

  // 無効な文字をチェック（Windows/Unix共通）
  const invalidChars = /[<>"|*?]/;
  if (invalidChars.test(trimmedPath)) {
    return false;
  }

  // 連続するスラッシュは無効
  if (trimmedPath.includes('//') || trimmedPath.includes('\\\\')) {
    return false;
  }

  // 絶対パスの検証
  const isUnixAbsolute = trimmedPath.startsWith('/');
  const isWindowsAbsolute = /^[a-zA-Z]:[\\/]/.test(trimmedPath);

  // 相対パスの検証
  const isRelative = trimmedPath.startsWith('./')
    || trimmedPath.startsWith('../')
    || trimmedPath.startsWith('.\\')
    || trimmedPath.startsWith('..\\')
    || trimmedPath === '.'
    || trimmedPath === '..'
    || (!trimmedPath.startsWith('/') && !isWindowsAbsolute);

  // 絶対パスまたは相対パスのいずれかである必要がある
  if (!isUnixAbsolute && !isWindowsAbsolute && !isRelative) {
    return false;
  }

  // パス区切り文字の一貫性チェック（混在を避ける）
  const hasForwardSlash = trimmedPath.includes('/');
  const hasBackSlash = trimmedPath.includes('\\');

  // Windowsの場合、ドライブレター後は両方許可するが、
  // それ以外では混在は避ける
  if (!isWindowsAbsolute && hasForwardSlash && hasBackSlash) {
    return false;
  }

  return true;
};

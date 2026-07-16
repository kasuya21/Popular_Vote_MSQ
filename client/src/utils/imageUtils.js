/**
 * แปลง Google Drive URL ให้เป็น URL ที่ใช้แสดงรูปภาพได้โดยตรง
 * รองรับทั้ง:
 *  - https://drive.google.com/file/d/FILE_ID/view?...
 *  - https://drive.google.com/open?id=FILE_ID
 *  - https://drive.google.com/uc?id=FILE_ID
 */
export function resolveImageUrl(url, fallback = 'https://placehold.co/300x400/1a1730/e8dfc8?text=No+Image') {
  if (!url) return fallback;

  // Pattern: /file/d/FILE_ID/
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w1000`;
  }

  // Pattern: ?id=FILE_ID or open?id=FILE_ID or uc?id=FILE_ID
  if (url.includes('drive.google.com')) {
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
    }
  }

  // Not a Drive URL — return as-is
  return url;
}

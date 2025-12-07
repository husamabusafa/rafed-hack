import type { PresentationState } from '../tools/presentationTools';

type FileHandleWritable = FileSystemFileHandle & { createWritable: () => Promise<FileSystemWritableFileStream> };

const nav = (typeof navigator !== 'undefined' ? (navigator as unknown as Navigator & { storage?: { getDirectory?: () => Promise<FileSystemDirectoryHandle> } }) : undefined);
const OPFS_AVAILABLE = !!(nav?.storage?.getDirectory);

function safeLog(...args: unknown[]) {
  try { console.log('[OPFS][Presentation]', ...args); } catch { return; }
}
function safeError(...args: unknown[]) {
  try { console.error('[OPFS][Presentation]', ...args); } catch { return; }
}

async function getRootDir(): Promise<FileSystemDirectoryHandle | null> {
  if (!OPFS_AVAILABLE || !nav?.storage?.getDirectory) return null;
  try {
    const root: FileSystemDirectoryHandle = await nav.storage.getDirectory();
    return root;
  } catch (e) {
    safeError('getRootDir failed', e);
    return null;
  }
}

async function getOrCreateDirectory(parent: FileSystemDirectoryHandle, name: string): Promise<FileSystemDirectoryHandle> {
  return await parent.getDirectoryHandle(name, { create: true });
}

async function getOrCreateFile(parent: FileSystemDirectoryHandle, name: string): Promise<FileSystemFileHandle> {
  return await parent.getFileHandle(name, { create: true });
}

async function fileExists(parent: FileSystemDirectoryHandle, name: string): Promise<boolean> {
  try {
    await parent.getFileHandle(name, { create: false });
    return true;
  } catch {
    return false;
  }
}

function lsKeyLatest(chatId: string) { return `hsafa:presentations:${chatId}:latest`; }
function lsKeyVersion(chatId: string, messageId: string) { return `hsafa:presentations:${chatId}:versions:${messageId}`; }

export type SavedPresentationVersion = {
  chatId: string;
  messageId: string;
  presentation: PresentationState;
  updatedAt: string;
};

export async function savePresentationVersion(chatId: string, messageId: string, presentation: PresentationState): Promise<void> {
  const payload: SavedPresentationVersion = {
    chatId,
    messageId,
    presentation,
    updatedAt: new Date().toISOString(),
  };

  safeLog('savePresentationVersion start', { chatId, messageId });

  if (OPFS_AVAILABLE) {
    try {
      const root = await getRootDir();
      if (!root) throw new Error('OPFS root unavailable');
      const presentations = await getOrCreateDirectory(root, 'presentations');
      const chatDir = await getOrCreateDirectory(presentations, chatId);
      const versionsDir = await getOrCreateDirectory(chatDir, 'versions');

      const fileName = `${messageId}.json`;
      const fileHandle = await getOrCreateFile(versionsDir, fileName);
      const writable = await (fileHandle as FileHandleWritable).createWritable();
      await writable.write(new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      await writable.close();

      const latestHandle = await getOrCreateFile(chatDir, 'latest.json');
      const latestWritable = await (latestHandle as FileHandleWritable).createWritable();
      await latestWritable.write(new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      await latestWritable.close();

      safeLog('savePresentationVersion success (OPFS)', { chatId, messageId });
      return;
    } catch (e) {
      safeError('savePresentationVersion OPFS failed, falling back to localStorage', e);
    }
  }

  try {
    localStorage.setItem(lsKeyVersion(chatId, messageId), JSON.stringify(payload));
    localStorage.setItem(lsKeyLatest(chatId), JSON.stringify(payload));
    safeLog('savePresentationVersion success (localStorage)', { chatId, messageId });
  } catch (e) {
    safeError('savePresentationVersion localStorage failed', e);
  }
}

export async function loadPresentationVersion(chatId: string, messageId: string): Promise<PresentationState | null> {
  safeLog('loadPresentationVersion start', { chatId, messageId });

  if (OPFS_AVAILABLE) {
    try {
      const root = await getRootDir();
      if (!root) throw new Error('OPFS root unavailable');
      const presentations = await getOrCreateDirectory(root, 'presentations');
      const chatDir = await getOrCreateDirectory(presentations, chatId);
      const versionsDir = await getOrCreateDirectory(chatDir, 'versions');
      try {
        const versionHandle = await versionsDir.getFileHandle(`${messageId}.json`, { create: false });
        const file = await versionHandle.getFile();
        const text = await file.text();
        const saved: SavedPresentationVersion = JSON.parse(text);
        safeLog('loadPresentationVersion success (OPFS)', { chatId, messageId });
        return saved?.presentation || null;
      } catch (e) {
        safeError('loadPresentationVersion version file missing (OPFS)', e);
        // fall through to localStorage below
      }
    } catch (e) {
      safeError('loadPresentationVersion OPFS failed', e);
    }
  }

  try {
    const raw = localStorage.getItem(lsKeyVersion(chatId, messageId));
    if (!raw) return null;
    const saved: SavedPresentationVersion = JSON.parse(raw);
    safeLog('loadPresentationVersion success (localStorage)', { chatId, messageId });
    return saved?.presentation || null;
  } catch (e) {
    safeError('loadPresentationVersion localStorage failed', e);
    return null;
  }
}

export async function loadLatestPresentation(chatId: string): Promise<PresentationState | null> {
  safeLog('loadLatestPresentation start', { chatId });

  if (OPFS_AVAILABLE) {
    try {
      const root = await getRootDir();
      if (!root) throw new Error('OPFS root unavailable');
      const presentations = await getOrCreateDirectory(root, 'presentations');
      const chatDir = await getOrCreateDirectory(presentations, chatId);
      try {
        const latestHandle = await chatDir.getFileHandle('latest.json', { create: false });
        const file = await latestHandle.getFile();
        const text = await file.text();
        const saved: SavedPresentationVersion = JSON.parse(text);
        safeLog('loadLatestPresentation success (OPFS)', { chatId, messageId: saved?.messageId });
        return saved?.presentation || null;
      } catch (e) {
        safeError('loadLatestPresentation latest.json missing (OPFS)', e);
        // fall through to localStorage below
      }
    } catch (e) {
      safeError('loadLatestPresentation OPFS failed', e);
    }
  }

  try {
    const raw = localStorage.getItem(lsKeyLatest(chatId));
    if (!raw) return null;
    const saved: SavedPresentationVersion = JSON.parse(raw);
    safeLog('loadLatestPresentation success (localStorage)', { chatId, messageId: saved?.messageId });
    return saved?.presentation || null;
  } catch (e) {
    safeError('loadLatestPresentation localStorage failed', e);
    return null;
  }
}

export async function hasVersion(chatId: string, messageId: string): Promise<boolean> {
  safeLog('hasVersion start', { chatId, messageId, OPFS_AVAILABLE });
  if (OPFS_AVAILABLE) {
    try {
      const root = await getRootDir();
      if (!root) {
        safeLog('hasVersion OPFS root unavailable, falling back to localStorage', { chatId, messageId });
      } else {
        const presentations = await getOrCreateDirectory(root, 'presentations');
        const chatDir = await getOrCreateDirectory(presentations, chatId);
        const versionsDir = await getOrCreateDirectory(chatDir, 'versions');
        const exists = await fileExists(versionsDir, `${messageId}.json`);
        safeLog('hasVersion (OPFS) exists', { chatId, messageId, exists });
        if (exists) return true;
      }
    } catch (e) {
      safeError('hasVersion OPFS check failed, will try localStorage', e);
    }
  }
  try {
    const exists = localStorage.getItem(lsKeyVersion(chatId, messageId)) != null;
    safeLog('hasVersion (localStorage) exists', { chatId, messageId, exists });
    return exists;
  } catch (e) {
    safeError('hasVersion localStorage check failed', e);
    return false;
  }
}

export async function findMostRecentSavedChatId(): Promise<string | null> {
  if (OPFS_AVAILABLE) {
    try {
      const root = await getRootDir();
      if (!root) throw new Error('OPFS root unavailable');
      const presentations = await getOrCreateDirectory(root, 'presentations');
      let bestId: string | null = null;
      let bestTime = 0;
      // @ts-expect-error - Using OPFS API that may not be fully typed
      for await (const [name, handle] of (presentations as unknown as { entries?: () => AsyncIterableIterator<[string, FileSystemHandle]> }).entries?.() ?? []) {
        // @ts-expect-error - Checking handle kind at runtime
        if (handle?.kind === 'directory') {
          try {
            // @ts-expect-error - Type assertion for directory handle
            const latestHandle = await (handle as FileSystemDirectoryHandle).getFileHandle('latest.json', { create: false });
            const file = await latestHandle.getFile();
            const text = await file.text();
            const saved: SavedPresentationVersion = JSON.parse(text);
            const t = Date.parse(saved?.updatedAt || '');
            if (!Number.isNaN(t) && t > bestTime) { bestTime = t; bestId = name; }
          } catch (_e) {
            continue;
          }
        }
      }
      if (bestId) return bestId;
    } catch (e) {
      safeError('findMostRecentSavedChatId OPFS failed', e);
    }
  }
  try {
    let bestId: string | null = null;
    let bestTime = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.startsWith('hsafa:presentations:') && key.endsWith(':latest')) {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const saved: SavedPresentationVersion = JSON.parse(raw);
          const t = Date.parse(saved?.updatedAt || '');
          if (!Number.isNaN(t) && t > bestTime && saved?.chatId) { bestTime = t; bestId = saved.chatId; }
        } catch (_e) {
          continue;
        }
      }
    }
    return bestId;
  } catch (e) {
    safeError('findMostRecentSavedChatId localStorage failed', e);
    return null;
  }
}

export async function loadMostRecentPresentation(): Promise<{ chatId: string; presentation: PresentationState } | null> {
  try {
    const chatId = await findMostRecentSavedChatId();
    if (!chatId) return null;
    const presentation = await loadLatestPresentation(chatId);
    if (!presentation) return null;
    return { chatId, presentation };
  } catch (e) {
    safeError('loadMostRecentPresentation failed', e);
    return null;
  }
}

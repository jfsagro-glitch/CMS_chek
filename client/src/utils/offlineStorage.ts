// Утилиты для офлайн хранения фотографий

interface OfflinePhoto {
  id: string;
  inspectionId: number;
  objectId: number;
  file: Blob;
  fileName: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
  uploaded: boolean;
}

const DB_NAME = 'CMS_CHECK_OFFLINE';
const STORE_NAME = 'photos';
const DB_VERSION = 1;

// Открыть IndexedDB
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('inspectionId', 'inspectionId', { unique: false });
        objectStore.createIndex('uploaded', 'uploaded', { unique: false });
      }
    };
  });
};

// Сохранить фото в офлайн хранилище
export const savePhotoOffline = async (photo: Omit<OfflinePhoto, 'id'>): Promise<string> => {
  const db = await openDB();
  const id = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const photoWithId: OfflinePhoto = {
    ...photo,
    id,
    uploaded: false
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(photoWithId);

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
};

// Получить все фото для осмотра
export const getPhotosForInspection = async (inspectionId: number): Promise<OfflinePhoto[]> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('inspectionId');
    const request = index.getAll(inspectionId);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

// Получить неотправленные фото
export const getPendingPhotos = async (): Promise<OfflinePhoto[]> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const allPhotos = request.result || [];
      const pending = allPhotos.filter((photo: OfflinePhoto) => !photo.uploaded);
      resolve(pending);
    };
    request.onerror = () => reject(request.error);
  });
};

// Отметить фото как отправленное
export const markPhotoAsUploaded = async (photoId: string): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(photoId);

    request.onsuccess = () => {
      const photo = request.result;
      if (photo) {
        photo.uploaded = true;
        const updateRequest = store.put(photo);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        resolve();
      }
    };
    request.onerror = () => reject(request.error);
  });
};

// Удалить фото
export const deletePhoto = async (photoId: string): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(photoId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Проверить доступность интернета
export const checkOnlineStatus = (): boolean => {
  return navigator.onLine;
};

// Попытаться загрузить неотправленные фото
export const uploadPendingPhotos = async (uploadFunction: (photo: OfflinePhoto) => Promise<void>): Promise<number> => {
  if (!checkOnlineStatus()) {
    return 0;
  }

  const pendingPhotos = await getPendingPhotos();
  let uploadedCount = 0;

  for (const photo of pendingPhotos) {
    try {
      await uploadFunction(photo);
      await markPhotoAsUploaded(photo.id);
      uploadedCount++;
    } catch (error) {
      console.error('Ошибка загрузки фото:', error);
      // Продолжаем попытки загрузки остальных фото
    }
  }

  return uploadedCount;
};


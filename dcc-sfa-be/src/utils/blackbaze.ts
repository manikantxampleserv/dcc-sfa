import B2 from 'backblaze-b2';
import { config } from '../configs/env';

const b2 = new B2({
  applicationKeyId: config.b2.keyId,
  applicationKey: config.b2.applicationKey,
});

let authPromise: Promise<void> | null = null;
let authExpiry: number = 0;

export async function authorizeB2(): Promise<void> {
  const now = Date.now();

  if (authExpiry > now + 5 * 60 * 1000) {
    return;
  }

  if (authPromise) {
    return authPromise;
  }

  authPromise = (async () => {
    try {
      await b2.authorize();
      authExpiry = now + 60 * 60 * 1000;
      console.log('Authzation successful');
    } catch (error: any) {
      authExpiry = 0;
      console.error('Authorizion failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(`B2 Authorization failed: ${error.message}`);
    } finally {
      authPromise = null;
    }
  })();

  return authPromise;
}

export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  try {
    await authorizeB2();

    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: config.b2.bucketId,
    });

    if (!uploadUrlResponse.data) {
      throw new Error('Failed to get upload URL');
    }

    const { uploadUrl, authorizationToken } = uploadUrlResponse.data;

    const uploadResponse = await b2.uploadFile({
      uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName,
      data: fileBuffer,
      mime: mimeType,
      info: {
        src_last_modified_millis: String(Date.now()),
      },
    });

    if (!uploadResponse.data) {
      throw new Error('Upload response missing data');
    }

    const fileUrl = `https://f005.backblazeb2.com/file/${config.b2.bucketName}/${fileName}`;

    return fileUrl;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message;
    console.error('Upload failed:', {
      fileName,
      error: errorMsg,
      status: error.response?.status,
    });
    throw new Error(`Failed to upload file: ${errorMsg}`);
  }
}

export async function deleteFile(fileName: string): Promise<void> {
  try {
    await authorizeB2();

    let fileKey = fileName;
    if (fileName.startsWith('http')) {
      const url = new URL(fileName);
      const pathParts = url.pathname.split('/').filter(Boolean);
      const bucketIndex = pathParts.indexOf(config.b2.bucketName);

      if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
        fileKey = pathParts.slice(bucketIndex + 1).join('/');
      } else if (pathParts[0] === 'file' && pathParts.length > 2) {
        fileKey = pathParts.slice(2).join('/');
      }
    }

    console.log(`Deleting file: ${fileKey}`);

    const response = await b2.listFileNames({
      bucketId: config.b2.bucketId,
      startFileName: fileKey,
      maxFileCount: 1,
      prefix: fileKey,
      delimiter: '',
    });

    if (!response.data?.files || response.data.files.length === 0) {
      console.warn(`File not found: ${fileKey}`);
      return;
    }

    const file = response.data.files[0];

    if (file.fileName !== fileKey) {
      console.warn(
        ` File mismatch. Expected: ${fileKey}, Found: ${file.fileName}`
      );
      return;
    }

    await b2.deleteFileVersion({
      fileId: file.fileId,
      fileName: file.fileName,
    });

    console.log(` File deleted: ${fileKey}`);
  } catch (error: any) {
    console.error('Delete failed:', error.response?.data || error.message);
  }
}

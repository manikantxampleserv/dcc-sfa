import B2 from 'backblaze-b2';

const b2 = new B2({
  applicationKeyId: process.env.BACKBLAZE_B2_KEY_ID as string,
  applicationKey: process.env.BACKBLAZE_B2_APPLICATION_KEY as string,
});

let isAuthorized = false;
let authorizationExpiry: Date | null = null;

export async function authorizeB2(): Promise<void> {
  if (isAuthorized && authorizationExpiry && authorizationExpiry > new Date()) {
    return;
  }

  try {
    const authResponse = await b2.authorize();
    isAuthorized = true;
    authorizationExpiry = new Date(Date.now() + 60 * 60 * 1000);
    console.log('[B2] Authorization successful');
  } catch (error) {
    console.error('[B2] Authorization failed:', error);
    throw error;
  }
}

export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  try {
    await authorizeB2();

    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: process.env.BACKBLAZE_B2_BUCKET_ID as string,
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
      throw new Error('Failed to upload file');
    }

    const bucketName = process.env.BACKBLAZE_B2_BUCKET_NAME as string;

    const url = `https://f005.backblazeb2.com/file/${bucketName}/${fileName}`;

    console.log(' File uploaded successfully:', url);
    return url;
  } catch (error: any) {
    console.error(' Upload error:', error.response?.data || error.message);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

export async function deleteFile(fileName: string): Promise<void> {
  try {
    await authorizeB2();

    let fileKey = fileName;
    if (fileName.startsWith('http')) {
      try {
        const url = new URL(fileName);
        const pathParts = url.pathname.split('/');
        const bucketIndex = pathParts.indexOf(
          process.env.BACKBLAZE_B2_BUCKET_NAME as string
        );
        if (bucketIndex !== -1) {
          fileKey = pathParts.slice(bucketIndex + 1).join('/');
        } else {
          const fileIndex = pathParts.indexOf('file');
          if (fileIndex !== -1 && pathParts[fileIndex + 1]) {
            fileKey = pathParts.slice(fileIndex + 2).join('/');
          }
        }
      } catch (urlError) {
        console.error('[B2] Error parsing URL:', urlError);
        fileKey = fileName;
      }
    }

    console.log(`[B2] Attempting to delete file: ${fileKey}`);

    const response = await b2.listFileNames({
      bucketId: process.env.BACKBLAZE_B2_BUCKET_ID as string,
      startFileName: fileKey,
      maxFileCount: 1,
      prefix: fileKey,
      delimiter: '',
    });

    if (
      !response.data ||
      !response.data.files ||
      response.data.files.length === 0
    ) {
      console.warn(`[B2] File not found: ${fileKey}`);
      return;
    }

    const file = response.data.files[0];

    if (file.fileName !== fileKey) {
      console.warn(
        `[B2] File name mismatch. Expected: ${fileKey}, Found: ${file.fileName}`
      );
      return;
    }

    await b2.deleteFileVersion({
      fileId: file.fileId,
      fileName: file.fileName,
    });

    console.log(`[B2] File deleted successfully: ${fileKey}`);
  } catch (error: any) {
    console.error('[B2] Delete error:', error.response?.data || error.message);
  }
}

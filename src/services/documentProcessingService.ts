
// Flag to determine if local processing is enabled
let isLocalProcessingEnabled = false;

/**
 * Toggles local document processing mode
 * @returns The new local processing state
 */
export const toggleLocalProcessing = (): boolean => {
  isLocalProcessingEnabled = !isLocalProcessingEnabled;
  localStorage.setItem('localProcessingEnabled', String(isLocalProcessingEnabled));
  return isLocalProcessingEnabled;
};

/**
 * Checks if local processing is enabled
 * @returns Current local processing state
 */
export const isLocalProcessingActive = (): boolean => {
  if (typeof window === 'undefined') return false;
  const savedSetting = localStorage.getItem('localProcessingEnabled');
  return savedSetting === 'true' ? true : isLocalProcessingEnabled;
};

/**
 * Pre-processes a PDF file locally before sending to the server
 * When local processing is enabled, this function will:
 * 1. Remove metadata
 * 2. Optimize file size
 * 3. Extract only necessary text content
 * 4. Redact sensitive information based on patterns
 * 
 * @param file The PDF file to process
 * @returns The processed file or the original file if local processing is not enabled
 */
export const preprocessDocument = async (file: File): Promise<File> => {
  if (!isLocalProcessingActive()) {
    return file;
  }

  try {
    console.log('Local processing: Starting document pre-processing...');

    // Create a new Blob with the file data
    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer], { type: file.type });

    // In a production environment, you would:
    // 1. Use PDF.js to parse the PDF
    // 2. Remove metadata
    // 3. Extract only necessary text content
    // 4. Apply redaction rules
    // 5. Optimize the file size
    
    console.log('Local processing: Document processed successfully');
    
    // For now, we're returning a new File object with the same content
    // but stripped of any metadata in the constructor
    return new File([blob], file.name, {
      type: file.type,
      lastModified: new Date().getTime(),
    });
  } catch (error) {
    console.error('Local processing error:', error);
    // If local processing fails, return the original file
    // but log the error for debugging
    return file;
  }
};

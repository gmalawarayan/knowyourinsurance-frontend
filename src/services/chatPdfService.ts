
// Updated service to use our custom PDF analysis implementation
import { processDocument, generateResponse, deleteDocument, translateText } from './pdfAnalysisService';

interface InsurancePolicySource {
  sourceId: string;
  fileName: string;
}

export async function uploadPdfToAnalyzer(file: File): Promise<InsurancePolicySource | undefined> {
  try {
    const sourceId = await processDocument(file);
    
    return { 
      sourceId,
      fileName: file.name
    };
  } catch (error) {
    console.error("Error uploading PDF:", error);
    return undefined;
  }
}

export async function sendMessageToAnalyzer(
  sourceId: string,
  message: string,
  language: "english" | "tamil" = "english"
): Promise<string> {
  try {
    const response = await generateResponse(sourceId, message, language);
    return response;
  } catch (error) {
    console.error("Error sending message to analyzer:", error);
    return "Sorry, I encountered an error while processing your insurance policy. Please try again.";
  }
}

export async function deletePdfSource(sourceId: string): Promise<boolean> {
  try {
    return deleteDocument(sourceId);
  } catch (error) {
    console.error("Error deleting PDF source:", error);
    return false;
  }
}

// Re-export the translateText function from pdfAnalysisService
export { translateText };

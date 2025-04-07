
// Service for handling ChatPDF API integration for insurance policy analysis
import { 
  uploadPdfToChatPdf, 
  sendMessageToChatPdf, 
  deleteChatPdfSource,
  translateText
} from './pdfAnalysisService';

interface InsurancePolicySource {
  sourceId: string;
  fileName: string;
}

// Upload insurance policy PDF to ChatPDF API
export async function uploadPdfToAnalyzer(file: File): Promise<InsurancePolicySource | undefined> {
  try {
    const sourceId = await uploadPdfToChatPdf(file);
    
    if (!sourceId) {
      return undefined;
    }
    
    return { 
      sourceId,
      fileName: file.name
    };
  } catch (error) {
    console.error("Error uploading PDF:", error);
    return undefined;
  }
}

// Send a message to ChatPDF API and get response
export async function sendMessageToAnalyzer(
  sourceId: string,
  message: string,
  language: "english" | "tamil" = "english"
): Promise<string> {
  try {
    // If the query is in Tamil, translate it to English for processing
    let processedQuery = message;
    if (language === "tamil") {
      processedQuery = await translateText(message, "tamil", "english");
    }
    
    // Get response from ChatPDF
    const response = await sendMessageToChatPdf(sourceId, processedQuery);
    
    // Translate the response back to Tamil if needed
    if (language === "tamil") {
      return translateText(response, "english", "tamil");
    }
    
    return response;
  } catch (error) {
    console.error("Error sending message to analyzer:", error);
    const errorMsg = "Sorry, I encountered an error while processing your insurance policy. Please try again.";
    return language === "tamil" ? await translateText(errorMsg, "english", "tamil") : errorMsg;
  }
}

// Delete a source from ChatPDF API
export async function deletePdfSource(sourceId: string): Promise<boolean> {
  try {
    return deleteChatPdfSource(sourceId);
  } catch (error) {
    console.error("Error deleting PDF source:", error);
    return false;
  }
}

// Re-export the translateText function
export { translateText };

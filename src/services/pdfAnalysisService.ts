
// This file contains utility functions for PDF analysis
// We'll use ChatPDF API for analyzing insurance policies

const CHATPDF_API_KEY = "sec_9xGYfKqRSbkYaqVk8aGBg3I4GKT71qzN"; // Public API key for demo purposes
const CHATPDF_API_URL = "https://api.chatpdf.com/v1";

// Source ID storage for current session
let currentSourceId: string | null = null;

// Upload PDF to ChatPDF API and get source ID
export async function uploadPdfToChatPdf(file: File): Promise<string | null> {
  try {
    // Create form data with the file
    const formData = new FormData();
    formData.append("file", file);
    
    // Upload the file to ChatPDF API
    const response = await fetch(`${CHATPDF_API_URL}/sources`, {
      method: "POST",
      headers: {
        "x-api-key": CHATPDF_API_KEY,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    currentSourceId = data.sourceId;
    return data.sourceId;
  } catch (error) {
    console.error("Error uploading PDF to ChatPDF:", error);
    return null;
  }
}

// Send a message to ChatPDF API and get response
export async function sendMessageToChatPdf(
  sourceId: string,
  message: string
): Promise<string> {
  try {
    // Prepare the request to ChatPDF API
    const response = await fetch(`${CHATPDF_API_URL}/chats/message`, {
      method: "POST",
      headers: {
        "x-api-key": CHATPDF_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourceId,
        messages: [
          {
            role: "user",
            content: `This is an insurance policy. ${message}`,
          },
        ],
      }),
    });
    
    if (!response.ok) {
      throw new Error(`ChatPDF API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error("Error sending message to ChatPDF:", error);
    return "Sorry, I encountered an error while processing your insurance policy. Please try again.";
  }
}

// Delete a source from ChatPDF API
export async function deleteChatPdfSource(sourceId: string): Promise<boolean> {
  try {
    const response = await fetch(`${CHATPDF_API_URL}/sources/${sourceId}`, {
      method: "DELETE",
      headers: {
        "x-api-key": CHATPDF_API_KEY,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Delete source failed with status: ${response.status}`);
    }
    
    currentSourceId = null;
    return true;
  } catch (error) {
    console.error("Error deleting source from ChatPDF:", error);
    return false;
  }
}

// Clean up any active sources when the application is closed
export function cleanupChatPdfSources(): void {
  if (currentSourceId) {
    deleteChatPdfSource(currentSourceId)
      .then(() => console.log("Cleaned up ChatPDF source"))
      .catch((error) => console.error("Error cleaning up ChatPDF source:", error));
  }
}

// Translation service using Google Translate API
export async function translateText(
  text: string, 
  from: "english" | "tamil", 
  to: "english" | "tamil"
): Promise<string> {
  try {
    const fromCode = from === "english" ? "en" : "ta";
    const toCode = to === "english" ? "en" : "ta";
    
    const response = await fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + 
      fromCode + "&tl=" + toCode + "&dt=t&q=" + encodeURIComponent(text));
    
    if (!response.ok) {
      throw new Error("Translation failed");
    }
    
    const data = await response.json();
    let translatedText = "";
    
    // The response format has translations in nested arrays
    if (data && data[0]) {
      data[0].forEach((item: any) => {
        if (item[0]) {
          translatedText += item[0];
        }
      });
    }
    
    return translatedText || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Return original text if translation fails
  }
}

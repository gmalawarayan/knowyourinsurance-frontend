
// AnalyzeYourInsurancePolicy API service
// API Key: sec_EvOyQVA4IfSmWsdU3EZufWHAhgUEN2WS

interface InsurancePolicySource {
  sourceId: string;
  fileName: string;
}

export async function uploadPdfToAnalyzer(file: File): Promise<InsurancePolicySource | undefined> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch("https://api.chatpdf.com/v1/sources/add-file", {
      method: "POST",
      headers: {
        "x-api-key": "sec_EvOyQVA4IfSmWsdU3EZufWHAhgUEN2WS",
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload PDF");
    }

    const data = await response.json();
    return { 
      sourceId: data.sourceId,
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
    // If the message is in Tamil, translate it to English before sending to ChatPDF
    let processedMessage = message;
    if (language === "tamil") {
      processedMessage = await translateText(message, "tamil", "english");
    }

    const response = await fetch("https://api.chatpdf.com/v1/chats/message", {
      method: "POST",
      headers: {
        "x-api-key": "sec_EvOyQVA4IfSmWsdU3EZufWHAhgUEN2WS",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourceId,
        messages: [
          {
            role: "user",
            content: processedMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send message to analyzer");
    }

    const data = await response.json();
    
    // If Tamil is selected, translate the response to Tamil
    if (language === "tamil") {
      return translateText(data.content, "english", "tamil");
    }
    
    return data.content;
  } catch (error) {
    console.error("Error sending message to analyzer:", error);
    return "Sorry, I encountered an error while processing your insurance policy. Please try again.";
  }
}

export async function deletePdfSource(sourceId: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.chatpdf.com/v1/sources/delete", {
      method: "POST",
      headers: {
        "x-api-key": "sec_EvOyQVA4IfSmWsdU3EZufWHAhgUEN2WS",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sources: [sourceId],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete PDF source");
    }

    return true;
  } catch (error) {
    console.error("Error deleting PDF source:", error);
    return false;
  }
}

// Translation service using LibreTranslate API
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

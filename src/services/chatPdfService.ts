
// ChatPDF API service
// API Key: sec_EvOyQVA4IfSmWsdU3EZufWHAhgUEN2WS

interface ChatPDFSource {
  sourceId: string;
  fileName: string;
}

export async function uploadPdfToChatPDF(file: File): Promise<ChatPDFSource | undefined> {
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

export async function sendMessageToChatPDF(
  sourceId: string,
  message: string
): Promise<string> {
  try {
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
            content: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send message to ChatPDF");
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error("Error sending message to ChatPDF:", error);
    return "Sorry, I encountered an error while processing your PDF. Please try again.";
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

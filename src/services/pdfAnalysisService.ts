
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface DocumentChunk {
  text: string;
  metadata: {
    pageNumber: number;
    chunkIndex: number;
  };
  embedding?: number[];
}

interface AnalyzedDocument {
  id: string;
  fileName: string;
  chunks: DocumentChunk[];
  embeddingsReady: boolean;
}

// In-memory database to store documents and chunks
// In a production app, this would be a proper database
const documentStore: Record<string, AnalyzedDocument> = {};

// Extract text from PDF
export async function extractTextFromPdf(file: File): Promise<string[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageTexts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      pageTexts.push(pageText);
    }

    return pageTexts;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Split text into chunks
function splitTextIntoChunks(texts: string[], chunkSize: number = 1000, overlap: number = 200): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  
  texts.forEach((pageText, pageIndex) => {
    let startChar = 0;
    let chunkIndex = 0;
    
    while (startChar < pageText.length) {
      const endChar = Math.min(startChar + chunkSize, pageText.length);
      const chunkText = pageText.substring(startChar, endChar);
      
      chunks.push({
        text: chunkText,
        metadata: {
          pageNumber: pageIndex + 1,
          chunkIndex: chunkIndex,
        }
      });
      
      // Move to next chunk with overlap
      startChar = endChar - overlap;
      if (startChar < 0) startChar = 0;
      chunkIndex++;
    }
  });
  
  return chunks;
}

// Create embeddings for chunks using a basic model
// In production, you would use a proper embedding model like OpenAI's
async function generateEmbeddings(text: string): Promise<number[]> {
  // This is a simplified implementation
  // In a real app, you would use an embedding model API
  // Example with OpenAI would be:
  // const response = await fetch('https://api.openai.com/v1/embeddings', ...)
  
  // For demo purposes, create a random embedding vector
  // Real embeddings would capture semantic meaning
  const VECTOR_DIMENSION = 128;
  const embedding = Array.from({ length: VECTOR_DIMENSION }, () => Math.random());
  
  // Normalize the vector (unit length)
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}

// Calculate similarity between two vectors (cosine similarity)
function calculateSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) throw new Error('Vectors must be of the same length');
  
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  
  // Vectors are already normalized, so dot product equals cosine similarity
  return dotProduct;
}

// Process document and generate embeddings
export async function processDocument(file: File): Promise<string> {
  try {
    const pageTexts = await extractTextFromPdf(file);
    const chunks = splitTextIntoChunks(pageTexts);
    
    const documentId = Date.now().toString();
    documentStore[documentId] = {
      id: documentId,
      fileName: file.name,
      chunks: chunks,
      embeddingsReady: false
    };
    
    // Generate embeddings for each chunk (async)
    setTimeout(async () => {
      try {
        const updatedChunks = await Promise.all(
          chunks.map(async (chunk) => ({
            ...chunk,
            embedding: await generateEmbeddings(chunk.text)
          }))
        );
        
        documentStore[documentId].chunks = updatedChunks;
        documentStore[documentId].embeddingsReady = true;
        console.log(`Embeddings completed for document ${documentId}`);
      } catch (err) {
        console.error('Error generating embeddings:', err);
      }
    }, 0);
    
    return documentId;
  } catch (error) {
    console.error('Error processing document:', error);
    throw new Error('Failed to process document');
  }
}

// Retrieve relevant chunks for a query
export async function findRelevantChunks(documentId: string, query: string, limit: number = 5): Promise<DocumentChunk[]> {
  try {
    const document = documentStore[documentId];
    if (!document) throw new Error('Document not found');
    
    // If embeddings are not ready, return the first few chunks
    if (!document.embeddingsReady) {
      return document.chunks.slice(0, limit);
    }
    
    // Generate embedding for the query
    const queryEmbedding = await generateEmbeddings(query);
    
    // Calculate similarity scores for each chunk
    const chunksWithScores = document.chunks
      .filter(chunk => chunk.embedding)
      .map(chunk => ({
        chunk,
        score: calculateSimilarity(queryEmbedding, chunk.embedding!)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.chunk);
    
    return chunksWithScores;
  } catch (error) {
    console.error('Error finding relevant chunks:', error);
    return [];
  }
}

// Delete document from store
export function deleteDocument(documentId: string): boolean {
  if (documentStore[documentId]) {
    delete documentStore[documentId];
    return true;
  }
  return false;
}

// Generate a context-aware response using relevant chunks
export async function generateResponse(documentId: string, query: string, language: "english" | "tamil" = "english"): Promise<string> {
  try {
    // If the query is in Tamil, translate it to English for processing
    let processedQuery = query;
    if (language === "tamil") {
      processedQuery = await translateText(query, "tamil", "english");
    }
    
    // Find relevant chunks
    const relevantChunks = await findRelevantChunks(documentId, processedQuery);
    
    if (relevantChunks.length === 0) {
      const response = "I couldn't find relevant information in the document to answer your question.";
      return language === "tamil" ? await translateText(response, "english", "tamil") : response;
    }
    
    // Combine chunks to create context
    const context = relevantChunks
      .map(chunk => chunk.text)
      .join('\n\n');
    
    // Generate an answer based on the context
    // In a real app, you would use an LLM API here
    const answer = generateBasicAnswer(context, processedQuery);
    
    // Translate the answer to Tamil if requested
    if (language === "tamil") {
      return translateText(answer, "english", "tamil");
    }
    
    return answer;
  } catch (error) {
    console.error('Error generating response:', error);
    const errorMsg = "Sorry, I encountered an error while processing your insurance policy. Please try again.";
    return language === "tamil" ? await translateText(errorMsg, "english", "tamil") : errorMsg;
  }
}

// Basic answer generation - in a real app, this would use an LLM API
function generateBasicAnswer(context: string, query: string): string {
  // This is a very simplified "AI" that just looks for sentences containing query terms
  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 3);
  
  if (queryTerms.length === 0) {
    return "I couldn't understand your question. Can you please rephrase it?";
  }
  
  // Split context into sentences
  const sentences = context.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Find sentences that contain query terms
  const relevantSentences = sentences.filter(sentence => {
    const sentenceLower = sentence.toLowerCase();
    return queryTerms.some(term => sentenceLower.includes(term));
  });
  
  if (relevantSentences.length === 0) {
    return "I couldn't find specific information about that in the document. Can you ask a different question?";
  }
  
  // Construct a simple answer
  let answer = "Based on the insurance policy document:\n\n";
  answer += relevantSentences.slice(0, 3).join('. ') + '.';
  
  return answer;
}

// Translation service using LibreTranslate API - preserved from original code
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

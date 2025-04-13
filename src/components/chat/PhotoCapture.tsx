
import React, { useRef, useState, useEffect } from "react";
import { X, Camera, RotateCcw, Plus, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PhotoCaptureProps {
  onCapture: (photoBlob: Blob) => void;
  onClose: () => void;
  currentPageCount: number;
  maxPages: number;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onCapture, onClose, currentPageCount, maxPages }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<"environment" | "user">("environment");

  const remainingPages = maxPages - currentPageCount;

  useEffect(() => {
    const startCamera = async () => {
      try {
        // Stop any existing stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: cameraFacingMode },
          audio: false,
        });
        
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Unable to access camera. Please ensure you've granted permission and your device has a camera.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraFacingMode]);

  const switchCamera = () => {
    setCameraFacingMode(prev => prev === "environment" ? "user" : "environment");
  };

  const takePhoto = () => {
    if (currentPageCount >= maxPages) {
      toast.error(`You've reached the maximum limit of ${maxPages} pages.`);
      return;
    }

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the video frame to the canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      
      setPhotoTaken(true);
    }
  };

  const retakePhoto = () => {
    setPhotoTaken(false);
  };

  const confirmPhoto = () => {
    if (canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          toast.info(`Processing page ${currentPageCount + 1}...`);
          onCapture(blob);
        }
      }, 'image/jpeg', 0.95);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-background border rounded-xl shadow-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">Take Photo of Document</h2>
            <p className="text-sm text-muted-foreground">
              Page {currentPageCount + 1} of max {maxPages} • {remainingPages} remaining
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="relative w-full bg-black">
          {error ? (
            <div className="p-6 text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full ${photoTaken ? "hidden" : "block"}`}
              />
              <canvas 
                ref={canvasRef} 
                className={`w-full ${photoTaken ? "block" : "hidden"}`}
              />
              {!photoTaken && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={switchCamera}
                  className="absolute top-2 right-2 bg-background/50 hover:bg-background/80"
                >
                  Switch Camera
                </Button>
              )}
            </>
          )}
        </div>
        
        <div className="p-4 border-t flex justify-center space-x-4">
          {!photoTaken ? (
            <Button 
              onClick={takePhoto}
              disabled={!!error || currentPageCount >= maxPages}
              className={`rounded-full w-16 h-16 ${currentPageCount >= maxPages ? 'bg-muted text-muted-foreground' : 'bg-primary hover:bg-primary/90'}`}
              title={currentPageCount >= maxPages ? `Maximum ${maxPages} pages reached` : "Take photo"}
            >
              <Camera className="h-6 w-6" />
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={retakePhoto}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Retake
              </Button>
              <Button 
                onClick={confirmPhoto}
                className="flex items-center gap-2"
              >
                {currentPageCount + 1 >= maxPages ? "Finish" : "Add Page"}
                {currentPageCount + 1 < maxPages && <Plus className="h-4 w-4 ml-1" />}
              </Button>
            </>
          )}
        </div>
        
        <div className="p-4 bg-muted text-xs text-muted-foreground">
          <p>Position the document in good lighting with all corners visible for best results.</p>
          <p className="mt-1">You may capture up to {maxPages} pages of your policy document.</p>
        </div>
      </div>
    </div>
  );
};

export default PhotoCapture;

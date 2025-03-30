
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import { Upload, Image as ImageIcon, Loader, Download } from 'lucide-react';

const Generate = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Simulate authentication check
  const isAuthenticated = localStorage.getItem('authenticated') === 'true';
  
  React.useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate images",
      });
      navigate('/sign-in');
    }
  }, [isAuthenticated, navigate, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG, etc.)",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          setGeneratedImage(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.includes('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG, etc.)",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          setGeneratedImage(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleGenerate = () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please upload an image first",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setProgressValue(0);
    
    // Simulate generation progress
    const interval = setInterval(() => {
      setProgressValue((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 300);
    
    // Simulate image generation with a timeout
    // In a real app, this would be an API call to your backend
    setTimeout(() => {
      clearInterval(interval);
      setProgressValue(100);
      
      // Just using the same image for demo purposes
      setGeneratedImage(selectedImage);
      setIsGenerating(false);
      
      toast({
        title: "Generation complete!",
        description: "Your Ghibli-style image has been created.",
      });
    }, 6000);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ghibli-art-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Image downloaded",
      description: "Your artwork has been saved to your device.",
    });
  };

  const handleViewGallery = () => {
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">Transform Your Image</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Upload Reference Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center h-64 transition-colors ${isDragging ? 'border-ghibli-green bg-ghibli-green/10' : 'border-gray-300 hover:border-ghibli-blue'} ${selectedImage ? 'bg-gray-50' : ''}`}
              onClick={handleUploadClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
              />
              
              {!selectedImage ? (
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg mb-2 font-medium">Drop your image here or click to browse</p>
                  <p className="text-sm text-gray-500">Supports JPG, PNG, WebP (max 5MB)</p>
                </div>
              ) : (
                <div className="text-center w-full">
                  <div className="relative w-full h-48 mb-2">
                    <img 
                      src={selectedImage} 
                      alt="Preview" 
                      className="h-full mx-auto object-contain"
                    />
                  </div>
                  <p className="text-sm text-gray-500">Click to choose a different image</p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <Label htmlFor="prompt" className="block mb-2">Styling Prompt (optional)</Label>
              <Input
                id="prompt"
                placeholder="E.g., Miyazaki style, with vibrant colors and fantasy elements"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-ghibli-blue hover:bg-ghibli-blue/80"
              onClick={handleGenerate}
              disabled={!selectedImage || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Transforming...
                </>
              ) : (
                'Transform to Ghibli Style'
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Generated Artwork</CardTitle>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="p-6 bg-gray-50 rounded-lg h-64 flex flex-col items-center justify-center">
                <div className="w-full max-w-md mb-4">
                  <Progress value={progressValue} className="h-2" />
                </div>
                <p className="text-center text-gray-500 font-medium">Generating your Ghibli masterpiece...</p>
                <p className="text-center text-gray-400 text-sm mt-2">This might take a moment</p>
              </div>
            ) : generatedImage ? (
              <div className="relative w-full h-64 bg-gray-50 rounded-lg overflow-hidden">
                <img 
                  src={generatedImage} 
                  alt="Generated Ghibli Art" 
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="p-6 bg-gray-50 rounded-lg h-64 flex flex-col items-center justify-center">
                <ImageIcon className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-center text-gray-500">Your generated artwork will appear here</p>
                <p className="text-center text-gray-400 text-sm mt-2">Upload an image and click "Transform"</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              className="w-full"
              onClick={handleDownload}
              disabled={!generatedImage}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Artwork
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleViewGallery}
            >
              View All Creations
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Generate;

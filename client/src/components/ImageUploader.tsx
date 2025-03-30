import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import axios from 'axios';

const ImageUploader = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Simulate authentication check (replace with your actual auth check)
  const isAuthenticated = localStorage.getItem('authenticated') === 'true';

  useEffect(() => {
    if (isAuthenticated) {
      fetchGeneratedImages();
    }
  }, [isAuthenticated]);

  const fetchGeneratedImages = async () => {
    try {
      const response = await axios.get('/api/images/generated', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setGeneratedImages(response.data.generatedImages.map((img: { url: string }) => img.url));
    } catch (error) {
      console.error('Error fetching generated images:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch generated images.',
        variant: 'destructive',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file (JPEG, PNG, etc.)',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          setConvertedImage(null);
        }
      };
      reader.readAsDataURL(file); // Convert image to base64
    }
  };

  const handleClick = () => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.includes('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file (JPEG, PNG, etc.)',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          setConvertedImage(null);
        }
      };
      reader.readAsDataURL(file); // Convert image to base64
    }
  };

  const redirectToLogin = () => {
    toast({
      title: 'Authentication required',
      description: 'Please sign in to transform images',
    });
    navigate('/sign-in');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const uploadImage = async () => {
    if (!selectedImage) return;

    try {
      const response = await axios.post(
        '/api/images/upload',
        { image: selectedImage },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setConvertedImage(response.data.generatedImageUrl);
      toast({
        title: 'Upload successful!',
        description: 'Your image has been uploaded and transformed.',
      });

      // Refresh the list of generated images
      fetchGeneratedImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload and transform the image.',
        variant: 'destructive',
      });
    }
  };

  const triggerImageGeneration = async () => {
    try {
      await axios.post(
        '/api/images/generate',
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      toast({
        title: 'Image generation triggered!',
        description: 'Your image generation request has been submitted.',
      });
    } catch (error) {
      console.error('Error triggering image generation:', error);
      toast({
        title: 'Error',
        description: 'Failed to trigger image generation.',
        variant: 'destructive',
      });
    }
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Transform Your Image</h2>

          <div className="ghibli-card mb-8">
            <div className="text-center mb-6">
              <p className="text-lg mb-6">
                Upload your images and transform them into magical Ghibli-style artwork
              </p>
              <Button
                onClick={triggerImageGeneration}
                className="px-6 py-3 bg-ghibli-blue hover:bg-ghibli-blue/80 text-white rounded-md shadow-md"
              >
                Trigger Image Generation
              </Button>
            </div>

            <div
              className={`ghibli-input-area ${isDragging ? 'border-ghibli-green' : ''} ${
                selectedImage ? 'border-ghibli-green/70' : ''
              }`}
              onClick={handleClick}
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
                  <Upload className="mx-auto h-12 w-12 text-ghibli-blue mb-4" />
                  <p className="text-lg mb-2">Drop your image here or click to browse</p>
                  <p className="text-sm text-gray-500">Supports JPG, PNG, WebP (max 5MB)</p>
                </div>
              ) : (
                <div className="text-center">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg shadow-sm"
                  />
                  <p className="mt-4 text-sm text-gray-500">Click to choose a different image</p>
                </div>
              )}
            </div>

            {selectedImage && (
              <div className="mt-6 text-center">
                <button
                  className="ghibli-btn-primary"
                  onClick={uploadImage}
                  disabled={isConverting}
                >
                  {isConverting ? 'Uploading...' : 'Upload and Transform'}
                </button>
              </div>
            )}
          </div>

          {convertedImage && (
            <div className="ghibli-card animate-fade-in">
              <h3 className="text-xl font-bold mb-4 text-center">Your Ghibli Artwork</h3>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <img
                  src={convertedImage}
                  alt="Ghibli Style"
                  className="max-h-80 mx-auto rounded-lg"
                />
              </div>
              <div className="mt-6 text-center">
                <a
                  href={convertedImage}
                  download="ghibli-artwork.jpg"
                  className="ghibli-btn-secondary"
                >
                  Download Artwork
                </a>
              </div>
            </div>
          )}

          {generatedImages.length > 0 && (
            <div className="ghibli-card mt-8">
              <h3 className="text-xl font-bold mb-4 text-center">Your Generated Images</h3>
              <div className="grid grid-cols-2 gap-4">
                {generatedImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Generated ${index + 1}`}
                    className="max-h-40 mx-auto rounded-lg shadow-sm"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ImageUploader;

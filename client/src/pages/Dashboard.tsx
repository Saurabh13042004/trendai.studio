import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Image, Download, Plus } from 'lucide-react';
import API from '@/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [creations, setCreations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view your dashboard",
      });
      navigate('/sign-in');
      return;
    }
    
    // Fetch user's creations from API
    const fetchUserCreations = async () => {
      setIsLoading(true);
      try {
        const response = await API.get('/images/generated');
        
        // Transform the data to match the component's expected format
        const userCreations = response.data.generatedImages.map((img, index) => ({
          id: index + 1,
          name: `Creation ${index + 1}`,
          date: new Date(img.createdAt || Date.now()).toISOString().split('T')[0],
          imageUrl: img.url
        }));
        
        setCreations(userCreations);
      } catch (error) {
        console.error('Error fetching user creations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your creations',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserCreations();
  }, [navigate, toast]);

  const handleCreateNew = () => {
    navigate('/generate');
  };

  const handleDownload = (imageUrl: string, name: string) => {
    // This is a placeholder. In a real app, you would implement actual download functionality
    toast({
      title: "Download started",
      description: `Downloading ${name}...`,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-8"></div>
          <div className="h-64 w-full max-w-4xl bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Your Magical Creations</h1>
        <Button onClick={handleCreateNew} className="bg-ghibli-blue hover:bg-ghibli-blue/80">
          <Plus className="mr-2" size={18} />
          Create New
        </Button>
      </div>

      {creations.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent className="pt-6">
            <Image className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-lg mb-4">You haven't created any magical images yet</p>
            <Button onClick={handleCreateNew} className="bg-ghibli-green hover:bg-ghibli-green/80">
              Create Your First Artwork
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creations.map((creation) => (
            <Card key={creation.id} className="overflow-hidden transition-all hover:shadow-lg">
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img 
                  src={creation.imageUrl} 
                  alt={creation.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">{creation.name}</CardTitle>
              </CardHeader>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <span className="text-sm text-gray-500">{creation.date}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownload(creation.imageUrl, creation.name)}
                >
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creations.map((creation) => (
                <TableRow key={creation.id}>
                  <TableCell className="font-medium">{creation.name}</TableCell>
                  <TableCell>{creation.date}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownload(creation.imageUrl, creation.name)}
                    >
                      <Download size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

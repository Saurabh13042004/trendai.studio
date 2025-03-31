import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Ensure this path is correct
import { useCart } from '@/contexts/CartContext';

const CartIcon: React.FC = () => {
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => navigate('/cart')}
      className="relative"
      aria-label="View cart"
    >
      <ShoppingCart className="h-6 w-6" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </Button>
  );
};

export default CartIcon;
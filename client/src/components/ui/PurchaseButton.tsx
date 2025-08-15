
import React from 'react';
import { appendUTMtoLink } from '../../lib/utils';

interface PurchaseButtonProps {
  productId: string;
  buttonText?: string;
  className?: string;
}

export const PurchaseButton: React.FC<PurchaseButtonProps> = ({
  productId,
  buttonText = "Comprar agora", 
  className = "action-button bg-primary text-white hover:bg-primary/90"
}) => {
  const checkoutLink = `https://pay.perfectpay.com.br/checkout?produto=${productId}`;
  
  return (
    <a
      href={generateUTMUrl(checkoutLink)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {buttonText}
    </a>
  );
};

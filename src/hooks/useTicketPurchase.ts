import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface PurchaseTicketParams {
  lotteryId: string;
  ticketPrice: number;
}

export const useTicketPurchase = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const purchaseTicket = async ({ lotteryId, ticketPrice }: PurchaseTicketParams) => {
    setLoading(true);
    
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Потрібна авторизація",
          description: "Увійдіть в систему, щоб купувати квитки",
          variant: "destructive",
        });
        navigate('/auth');
        return false;
      }

      // Call secure database function for atomic ticket purchase
      const { data, error } = await supabase.rpc('purchase_ticket', {
        p_lottery_id: lotteryId,
        p_price: ticketPrice
      });

      if (error) {
        toast({
          title: "Помилка",
          description: "Не вдалося обробити покупку",
          variant: "destructive",
        });
        return false;
      }

      // Check if purchase was successful
      const result = data?.[0];
      if (!result || !result.success) {
        const errorMsg = result?.error_message || "Невідома помилка";
        toast({
          title: "Не вдалося купити квиток",
          description: errorMsg === 'Insufficient balance' 
            ? "Недостатньо коштів на балансі"
            : errorMsg === 'Lottery sold out'
            ? "Усі квитки продані"
            : errorMsg,
          variant: "destructive",
        });
        return false;
      }

      // Show success message
      toast({
        title: "Квиток успішно придбано!",
        description: `Ваш номер квитка: ${result.ticket_number}`,
      });

      // Navigate to my tickets page
      navigate('/my-tickets');
      return true;

    } catch (error) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error purchasing ticket:', error);
      }
      toast({
        title: "Помилка",
        description: "Виникла непередбачена помилка",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    purchaseTicket,
    loading
  };
};
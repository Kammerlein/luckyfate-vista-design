import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles } from "lucide-react";

interface LotteryPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LotteryPromptDialog = ({ open, onOpenChange }: LotteryPromptDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="bg-gradient-to-br from-slate-800 to-teal-800 border-2 border-yellow-400 text-white shadow-2xl animate-slide-in-from-bottom-right"
        style={{
          position: 'fixed',
          bottom: '8rem',
          right: '4rem',
          top: 'auto',
          left: 'auto',
          transform: 'none',
          width: '40vw',
          height: '30vh',
          maxWidth: '600px',
          minWidth: '320px',
          maxHeight: '400px',
          minHeight: '250px',
        }}
      >
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-yellow-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
            Створіть лотерею з вашого товару!
          </DialogTitle>
          <DialogDescription className="text-slate-200 text-base leading-relaxed">
            <div className="space-y-3">
              <p className="flex items-start gap-2">
                <Gift className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                <span>
                  Ви можете розмістити цей товар у розділі <span className="font-semibold text-yellow-400">"Активні лотереї"</span> як лот!
                </span>
              </p>
              <p className="pl-7 text-sm">
                Учасники купуватимуть квитки на ваш товар, а після завершення лотереї визначиться щасливчик, 
                який отримає ваш товар у подарунок.
              </p>
              <p className="pl-7 text-sm font-semibold text-green-400">
                Ви отримаєте гроші за свій товар після визначення переможця!
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-4">
          <Button
            onClick={() => {
              // TODO: Navigate to lottery creation
              onOpenChange(false);
            }}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Створити лотерею
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="border-slate-400 text-slate-300 hover:bg-slate-700"
          >
            Пізніше
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

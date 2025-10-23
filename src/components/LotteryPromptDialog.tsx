import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, X, Info, TrendingUp } from "lucide-react";

interface LotteryPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LotteryPromptDialog = ({ open, onOpenChange }: LotteryPromptDialogProps) => {
  const [showBenefits, setShowBenefits] = useState(false);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setShowBenefits(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowBenefits(false);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed top-20 left-4 right-4 z-40 max-w-md mx-auto"
        >
          <div className="bg-gradient-to-r from-cyan-400/10 to-indigo-400/10 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-4 shadow-2xl">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                <Info className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-semibold text-cyan-400">
                  Організуйте розіграш!
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-gray-400 hover:text-white p-1 h-auto"
                aria-label="Закрити"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start justify-between gap-2">
                <p className="flex-1">
                  Ви можете розмістити цей товар у розділі{" "}
                  <span className="font-semibold text-yellow-400">"Активні промо-розіграші"</span> як лот!
                </p>
                <div 
                  className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5 bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"
                  title="Функція доступна"
                />
              </div>
              
              <AnimatePresence>
                {showBenefits && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                  >
                    <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-2">
                      <p className="text-xs text-yellow-400 flex items-start gap-2">
                        <Gift className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>
                          Учасники купуватимуть квитки на лот вашого товару, а після завершення конкурсу визначиться щасливчик
                        </span>
                      </p>
                    </div>

                    <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-2">
                      <p className="text-xs text-green-400 flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span className="font-semibold">
                          Ви отримаєте гроші за свій товар після визначення переможця!
                        </span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => onOpenChange(false)}
                  variant="outline"
                  className="text-gray-200 border-gray-600 hover:bg-cyan-400/10 hover:border-cyan-400 transition-colors"
                >
                  Пізніше
                </Button>
                
                <Button
                  onClick={() => {
                    // TODO: Navigate to lottery creation
                    onOpenChange(false);
                  }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-all"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Створити розіграш
                </Button>
              </div>
              
              <p className="text-xs text-gray-400 text-center">
                🎁 Перетворіть ваш товар на захоплюючий лот конкурса і отримайте свої кошти
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

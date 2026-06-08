import React, { useState } from 'react';
import { Check } from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export default function MobileSelectDrawer({ 
  trigger, 
  options, 
  value, 
  onValueChange, 
  title = "Выберите значение" 
}) {
  const [open, setOpen] = useState(false);

  const handleSelect = (optionValue) => {
    onValueChange(optionValue);
    setOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {trigger}
      </DrawerTrigger>
      <DrawerContent className="glass-strong border-t border-white/20">
        <DrawerHeader className="border-b border-white/10">
          <DrawerTitle className="text-white">{title}</DrawerTitle>
        </DrawerHeader>
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                value === option.value
                  ? 'glass-strong border border-violet-500/50 bg-violet-500/10'
                  : 'glass border border-white/10 hover:bg-white/5'
              }`}
            >
              <span className="text-white font-medium">{option.label}</span>
              {value === option.value && (
                <Check className="w-5 h-5 text-violet-400" />
              )}
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
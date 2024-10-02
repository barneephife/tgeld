import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Baby, Laugh, Smile, Star, Heart, Flower, User, Users, Bird, Bug, Cat, Dog, Egg, Rabbit, Snail, Squirrel, Turtle } from 'lucide-react';

type IconOption = {
  name: string;
  icon: React.ReactNode;
};

const iconOptions: IconOption[] = [
  { name: 'baby', icon: <Baby /> },
  { name: 'laugh', icon: <Laugh /> },
  { name: 'smile', icon: <Smile /> },
  { name: 'star', icon: <Star /> },
  { name: 'heart', icon: <Heart /> },
  { name: 'flower', icon: <Flower /> },
  { name: 'user', icon: <User /> },
  { name: 'users', icon: <Users /> },
  { name: 'bird', icon: <Bird /> },
  { name: 'bug', icon: <Bug /> },
  { name: 'cat', icon: <Cat /> },
  { name: 'dog', icon: <Dog /> },
  { name: 'egg', icon: <Egg /> },
  { name: 'rabbit', icon: <Rabbit /> },
  { name: 'snail', icon: <Snail /> },
  { name: 'squirrel', icon: <Squirrel /> },
  { name: 'turtle', icon: <Turtle /> },
];

type IconSelectorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (iconName: string) => void;
};

export function IconSelectorModal({ isOpen, onClose, onSelectIcon }: IconSelectorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select an Icon</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-5 gap-4">
          {iconOptions.map((option) => (
            <Button
              key={option.name}
              variant="outline"
              className="p-4 flex items-center justify-center h-16 w-16"
              onClick={() => {
                onSelectIcon(option.name);
                onClose();
              }}
              title={option.name}
            >
              {React.cloneElement(option.icon as React.ReactElement, { className: 'h-8 w-8' })}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
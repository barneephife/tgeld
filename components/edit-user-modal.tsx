import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconSelectorModal } from './icon-selector-modal';
import { DeleteConfirmationModal } from './delete-confirmation-modal';
import { Baby, Laugh, Smile, Star, Heart, Flower, User, Users, Bird, Bug, Cat, Dog, Egg, Rabbit, Snail, Squirrel, Turtle, Save, Trash2, X } from 'lucide-react';

type User = {
  id: string;
  name: string;
  icon: string;
  sound: string | null;
  birthday: string;
  role: 'parent' | 'child';
};

type EditUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  user: User | null;
};

export function EditUserModal({ isOpen, onClose, onEditUser, onDeleteUser, user }: EditUserModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('user');
  const [sound, setSound] = useState<string | null>(null);
  const [birthday, setBirthday] = useState('');
  const [role, setRole] = useState<'parent' | 'child'>('child');
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setIcon(user.icon || 'user');
      setSound(user.sound);
      setBirthday(user.birthday);
      setRole(user.role);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      onEditUser({ ...user, name, icon, sound, birthday, role });
    }
    onClose();
  };

  const handleDelete = () => {
    setIsDeleteConfirmationOpen(true);
  };

  const confirmDelete = () => {
    if (user) {
      onDeleteUser(user.id);
      setIsDeleteConfirmationOpen(false);
      onClose();
    }
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = {
      baby: Baby, laugh: Laugh, smile: Smile, star: Star, heart: Heart, flower: Flower, user: User, users: Users,
      bird: Bird, bug: Bug, cat: Cat, dog: Dog, egg: Egg, rabbit: Rabbit, snail: Snail, squirrel: Squirrel, turtle: Turtle
    }[iconName] || User;
    return <IconComponent className="h-6 w-6" />;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="birthday" className="text-right">
                  Birthday
                </Label>
                <Input
                  id="birthday"
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select onValueChange={(value: 'parent' | 'child') => setRole(value)} value={role} required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sound" className="text-right">
                  Sound
                </Label>
                <Select onValueChange={(value) => setSound(value === 'none' ? null : value)} value={sound || 'none'}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a sound" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Sound</SelectItem>
                    <SelectItem value="chime">Chime</SelectItem>
                    <SelectItem value="bell">Bell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  className="p-2 h-16 w-16 flex justify-center items-center"
                  onClick={() => setIsIconSelectorOpen(true)}
                >
                  {getIconComponent(icon)}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
              <Button type="button" variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <IconSelectorModal
        isOpen={isIconSelectorOpen}
        onClose={() => setIsIconSelectorOpen(false)}
        onSelectIcon={setIcon}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteConfirmationOpen}
        onClose={() => setIsDeleteConfirmationOpen(false)}
        onConfirm={confirmDelete}
        userName={user?.name || ''}
      />
    </>
  );
}
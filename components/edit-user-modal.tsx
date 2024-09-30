import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  user: User | null;
};

export function EditUserModal({ isOpen, onClose, onEditUser, user }: EditUserModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('user');
  const [sound, setSound] = useState<string | null>('chime');
  const [birthday, setBirthday] = useState('');
  const [role, setRole] = useState<'parent' | 'child'>('child');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setIcon(user.icon);
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

  return (
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
              <Select onValueChange={(value: 'parent' | 'child') => setRole(value)} value={role}>
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
              <Label htmlFor="icon" className="text-right">
                Icon
              </Label>
              <Select onValueChange={setIcon} value={icon}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  {/* Add more icon options as needed */}
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
                  {/* Add more sound options as needed */}
                </SelectContent>
              </Select>
            </div>
            {/* TODO: Add icon and sound selectors */}
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
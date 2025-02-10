import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IconComponent } from './icon-component';
import { Camera } from 'lucide-react';

interface WithdrawFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdrawFunds: (amount: number, comments: string, photo: string | null) => Promise<void>;
  balance: string | number;
  userName: string;
  userIcon: string;
}

export function WithdrawFundsModal({
  isOpen,
  onClose,
  onWithdrawFunds,
  balance,
  userName,
  userIcon,
}: WithdrawFundsModalProps) {
  const [amount, setAmount] = useState('');
  const [comments, setComments] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form fields when modal opens
      setAmount('');
      setComments('');
      setPhoto(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const playLoseSound = async () => {
    try {
      const audio = new Audio('/sounds/lose1.wav');
      await audio.play();
    } catch (error) {
      console.error('Error playing lose sound:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const numBalance = Number(balance);
    if (!isNaN(numAmount) && numAmount > 0 && numAmount <= numBalance && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onWithdrawFunds(numAmount, comments, photo);
        await playLoseSound();
        onClose();
      } catch (error) {
        console.error('Error withdrawing funds:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          onClose();
        }
      }}
    >
      <DialogContent
        onPointerDownOutside={(e) => {
          if (!isSubmitting) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className='flex items-center'>
            Withdraw Funds for {userName} <IconComponent icon={userIcon} className='ml-2 h-6 w-6' />
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='amount'>Amount (Max: {Number(balance).toFixed(2)})</Label>
              <Input
                id='amount'
                type='number'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder='Enter amount'
                step='0.01'
                min='0'
                max={Number(balance)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor='comments'>Comments</Label>
              <Textarea
                id='comments'
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder='Add any comments...'
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor='photo'>Attach Photo</Label>
              <div className='flex items-center space-x-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={triggerFileInput}
                  className='w-full'
                  disabled={isSubmitting}
                >
                  <Camera className='mr-2 h-4 w-4' />
                  {photo ? 'Change Photo' : 'Choose File'}
                </Button>
                {photo && (
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setPhoto(null)}
                    className='text-red-500'
                    disabled={isSubmitting}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <Input
                id='photo'
                type='file'
                accept='image/*'
                onChange={handlePhotoUpload}
                className='hidden'
                ref={fileInputRef}
                disabled={isSubmitting}
              />
              {photo && (
                <div className='mt-2 relative w-full h-32'>
                  <Image
                    src={photo}
                    alt='Attached'
                    layout='fill'
                    objectFit='cover'
                    className='rounded'
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Withdrawing Funds...' : 'Withdraw Funds'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

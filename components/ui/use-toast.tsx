import * as React from 'react';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToastOriginal, ToastProps } from '@/components/ui/use-toast-original';

export function Toaster() {
  const { toasts } = useToastOriginal();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }: ToastProps) => (
        <Toast key={id} {...props}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}

export { useToastOriginal as useToast, toast } from '@/components/ui/use-toast-original';

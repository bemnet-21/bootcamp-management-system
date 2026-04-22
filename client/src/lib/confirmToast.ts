import { toast } from 'sonner';

type ConfirmLabels = { confirm: string; cancel: string };

/** Replaces `window.confirm` with a Sonner toast that has confirm / cancel actions. */
export function toastConfirm(
  message: string,
  description: string,
  onConfirm: () => void | Promise<void>,
  labels: ConfirmLabels = { confirm: 'Confirm', cancel: 'Cancel' },
): void {
  toast.message(message, {
    description,
    duration: 25000,
    action: {
      label: labels.confirm,
      onClick: () => {
        void Promise.resolve(onConfirm());
      },
    },
    cancel: {
      label: labels.cancel,
      onClick: () => {},
    },
  });
}

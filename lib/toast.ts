import { toast } from "sonner";

export function toastSuccess(title: string, description?: string) {
  toast.success(title, description ? { description } : undefined);
}

export function toastError(title: string, description?: string) {
  toast.error(title, description ? { description } : undefined);
}

export function toastInfo(title: string, description?: string) {
  toast(title, description ? { description } : undefined);
}

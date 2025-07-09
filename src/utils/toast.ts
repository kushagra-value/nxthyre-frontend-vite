import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => toast.success(message, {
    duration: 4000,
    position: 'bottom-right',
    style: {
      background: '#10B981',
      color: '#fff',
      fontWeight: '500',
    },
  }),
  
  error: (message: string) => toast.error(message, {
    duration: 4000,
    position: 'bottom-right',
    style: {
      background: '#EF4444',
      color: '#fff',
      fontWeight: '500',
    },
  }),
  
  loading: (message: string) => toast.loading(message, {
    position: 'bottom-right',
    style: {
      background: '#3B82F6',
      color: '#fff',
      fontWeight: '500',
    },
  }),
  
  info: (message: string) => toast(message, {
    duration: 4000,
    position: 'bottom-right',
    icon: 'ℹ️',
    style: {
      background: '#3B82F6',
      color: '#fff',
      fontWeight: '500',
    },
  }),
  
  dismiss: (toastId?: string) => toast.dismiss(toastId),
  
  promise: <T,>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string;
      error: string;
    }
  ) => toast.promise(promise, msgs, {
    position: 'bottom-right',
    style: {
      fontWeight: '500',
    },
  }),
};
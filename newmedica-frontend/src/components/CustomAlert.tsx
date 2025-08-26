'use client';

import Swal from 'sweetalert2';

interface CustomAlertOptions {
  title: string;
  text: string;
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
  position?: 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end';
  toast?: boolean;
  timer?: number;
  showConfirmButton?: boolean;
  timerProgressBar?: boolean;
  confirmButtonText?: string;
}

export const CustomAlert = (options: CustomAlertOptions) => {
  Swal.fire({
    ...options,
    customClass: {
      popup: 'custom-swal-popup',
      title: 'custom-swal-title',
      htmlContainer: 'custom-swal-html-container',
    },
    buttonsStyling: false,
    confirmButtonText: options.showConfirmButton === false ? undefined : options.confirmButtonText || 'OK',
    confirmButtonColor: '#000000', // Example: black button
  });
};

// You can also create specific alert types for convenience
export const showSuccessToast = (text: string) => {
  CustomAlert({
    icon: 'success',
    title: 'Success!',
    text,
    position: 'top-end',
    toast: true,
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
  });
};

export const showWarningAlert = (text: string) => {
  CustomAlert({
    icon: 'warning',
    title: 'Warning',
    text,
    confirmButtonText: 'OK',
  });
};

export const showErrorAlert = (text: string) => {
  CustomAlert({
    icon: 'error',
    title: 'Error',
    text,
    confirmButtonText: 'OK',
  });
};

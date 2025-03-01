interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
}

export function Toast({ message, type = 'info' }: ToastProps) {
  const bgColor = {
    success: 'bg-green-50 text-green-800',
    error: 'bg-red-50 text-red-800',
    info: 'bg-blue-50 text-blue-800',
  }[type];

  return (
    <div className={`p-4 rounded-md ${bgColor}`}>
      <p className="text-sm">{message}</p>
    </div>
  );
}

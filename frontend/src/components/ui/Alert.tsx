import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useState } from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const alertStyles = {
  success: {
    bg: 'bg-green-900/30 border-green-700',
    icon: CheckCircle,
    iconColor: 'text-green-400',
  },
  error: {
    bg: 'bg-red-900/30 border-red-700',
    icon: AlertCircle,
    iconColor: 'text-red-400',
  },
  info: {
    bg: 'bg-blue-900/30 border-blue-700',
    icon: Info,
    iconColor: 'text-blue-400',
  },
  warning: {
    bg: 'bg-yellow-900/30 border-yellow-700',
    icon: AlertCircle,
    iconColor: 'text-yellow-400',
  },
};

export function Alert({ type, title, message, dismissible = false, onDismiss }: AlertProps) {
  const [visible, setVisible] = useState(true);
  const styles = alertStyles[type];
  const Icon = styles.icon;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  return (
    <div className={`rounded-lg border p-4 ${styles.bg}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${styles.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          {title && <h4 className="font-medium text-white mb-1">{title}</h4>}
          <p className="text-gray-300 text-sm">{message}</p>
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

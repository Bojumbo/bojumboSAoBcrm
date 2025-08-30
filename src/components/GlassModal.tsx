import GlassCard from './GlassCard';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function GlassModal({ open, title, onClose, children }: Props) {
  if (!open) return null;
  if (typeof document === 'undefined') return null;
  const content = (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-xl bg-black/50" onClick={onClose} />
      <GlassCard className="relative z-10 w-[min(720px,92vw)] p-6">
        {title && <h3 className="text-xl font-semibold mb-3">{title}</h3>}
        <div>{children}</div>
      </GlassCard>
    </div>
  );
  return createPortal(content, document.body);
}

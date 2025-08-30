import { PropsWithChildren, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type Props = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  width?: string; // e.g., '70vw'
  title?: string;
  actions?: ReactNode; // optional header actions rendered next to close button
}>;

export default function GlassDrawer({ open, onClose, width = '70vw', title, actions, children }: Props) {
  const [render, setRender] = useState(open);
  const [visible, setVisible] = useState(false);
  const DURATION = 300; // ms
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useLayoutEffect(() => {
    let t: any;
    if (open) {
      setRender(true);
      // Ensure initial transform(100%) is applied, then flip to 0%
      requestAnimationFrame(() => {
        // Force layout to flush styles before enabling transition
        void panelRef.current?.getBoundingClientRect();
        setVisible(true);
      });
    } else {
      setVisible(false);
      t = setTimeout(() => setRender(false), DURATION);
    }
    return () => t && clearTimeout(t);
  }, [open]);

  if (!render) return null;

  const content = (
    <div aria-hidden={!visible} className={`fixed inset-0 z-50`} role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Right-aligned container and panel */}
      <div className="absolute inset-0 flex justify-end items-stretch pointer-events-none">
        <div
          className={`h-full glass glass-ultra glass-interactive border-l border-white/20 pointer-events-auto`}
          style={{
            width: typeof width === 'number' ? `${width}px` : width,
            maxWidth: '100vw',
            transform: `translateX(${visible ? '0%' : '100%'})`,
            transition: `transform ${DURATION}ms ease`,
            willChange: 'transform',
          }}
          ref={panelRef}
        >
          <div className="glass-hdr"></div>
          <div className="glass-lens"></div>
          <div className="glass-tint"></div>
          <div className="glass-reflect"></div>
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="text-lg font-semibold">{title}</div>
            <div className="flex items-center gap-2">
              {actions}
              <button onClick={onClose} className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20">Закрити</button>
            </div>
          </div>
          <div className="p-4 overflow-auto h-[calc(100%-56px)] glass-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
}

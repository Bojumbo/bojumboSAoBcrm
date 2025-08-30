import { ButtonHTMLAttributes, PropsWithChildren, useRef } from 'react';
import usePointerLight from '../hooks/usePointerLight';

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    size?: 'sm' | 'md';
    rounded?: 'md' | 'full';
  }
>;

export default function GlassIconButton({ children, className = '', size = 'sm', rounded = 'md', ...rest }: Props) {
  const ref = useRef<HTMLButtonElement | null>(null);
  usePointerLight(ref);
  const pad = size === 'sm' ? 'p-1.5' : 'p-2';
  const radius = rounded === 'full' ? 'rounded-full' : 'rounded-lg';
  return (
    <button ref={ref}
      className={`glass glass-interactive ${pad} ${radius} text-sm hover:scale-[1.01] active:scale-[0.995] ${className}`}
      {...rest}
    >
      <div className="glass-hdr"></div>
      <div className="glass-lens"></div>
      <div className="glass-tint"></div>
      <div className="glass-reflect"></div>
      <div className="glass-content flex items-center justify-center">{children}</div>
    </button>
  );
}

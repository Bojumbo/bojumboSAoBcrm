import { ButtonHTMLAttributes, PropsWithChildren, useRef } from 'react';
import usePointerLight from '../hooks/usePointerLight';

type Props = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export default function GlassButton({ children, className = '', ...rest }: Props) {
  const ref = useRef<HTMLButtonElement | null>(null);
  usePointerLight(ref);
  return (
    <button ref={ref}
      className={`glass glass-interactive px-4 py-2 rounded-xl text-sm font-medium hover:scale-[1.01] active:scale-[0.995] ${className}`}
      {...rest}
    >
      <div className="glass-hdr"></div>
      <div className="glass-lens"></div>
      <div className="glass-tint"></div>
      <div className="glass-reflect"></div>
      <div className="glass-content">{children}</div>
    </button>
  );
}

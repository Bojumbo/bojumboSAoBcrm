import { PropsWithChildren, useRef } from 'react';
import usePointerLight from '../hooks/usePointerLight';

type Props = PropsWithChildren<{
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}> & React.HTMLAttributes<HTMLElement>;

export default function GlassCard({ children, className = '', as: Tag = 'div', ...rest }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  usePointerLight(ref);
  const Component: any = Tag as any;
  return (
    <Component ref={ref as any} className={`glass glass-interactive ${className}`} {...rest}>
      <div className="glass-hdr"></div>
      <div className="glass-lens"></div>
      <div className="glass-tint"></div>
      <div className="glass-reflect"></div>
      <div className="glass-content">{children}</div>
    </Component>
  );
}

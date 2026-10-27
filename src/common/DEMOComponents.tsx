import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, Sparkles } from 'lucide-react'
import { DEMO_THEME_TOKENS, type DEMOThemeName } from './DEMOTokens'
import './DEMO.css'

export type DEMOPageState = 'normal' | 'loading' | 'empty' | 'error'

type DEMOThemeFrameProps = {
  theme: DEMOThemeName
  children: ReactNode
}

export function DEMOThemeFrame({ theme, children }: DEMOThemeFrameProps) {
  const tokens = DEMO_THEME_TOKENS[theme]
  const style = {
    '--demo-accent': tokens.accent,
    '--demo-accent-contrast': tokens.accentContrast,
    '--demo-bg': tokens.bg,
    '--demo-surface': tokens.surface,
    '--demo-surface-strong': tokens.surfaceStrong,
    '--demo-ink': tokens.ink,
    '--demo-muted': tokens.muted,
    '--demo-border': tokens.border,
    '--demo-alt': tokens.alt,
    '--demo-danger': tokens.danger,
    '--demo-radius': tokens.radius,
    '--demo-font-body': tokens.bodyFont,
    '--demo-font-display': tokens.displayFont,
  } as CSSProperties

  return (
    <div className="prototype-demo" style={style}>
      {children}
    </div>
  )
}

type DEMOButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'primary' | 'secondary' | 'ghost' | 'danger' }

export function DEMOButton({ tone = 'primary', className = '', children, ...props }: DEMOButtonProps) {
  const styles = {
    primary: { background: 'var(--demo-accent)', color: 'var(--demo-accent-contrast)', borderColor: 'var(--demo-accent)' },
    secondary: { background: 'var(--demo-alt)', color: 'var(--demo-ink)', borderColor: 'var(--demo-alt)' },
    ghost: { background: 'transparent', color: 'var(--demo-ink)', borderColor: 'var(--demo-border)' },
    danger: { background: 'var(--demo-danger)', color: '#ffffff', borderColor: 'var(--demo-danger)' },
  }[tone]
  return <button type="button" className={`prototype-demo-control inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--demo-radius)] border px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${className}`} style={styles} {...props}>{children}</button>
}

export function DEMOIconButton({ icon: Icon, label, className = '', ...props }: { icon: LucideIcon; label: string; className?: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" aria-label={label} title={label} className={`prototype-demo-control inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border ${className}`} style={{ borderColor: 'var(--demo-border)', color: 'var(--demo-ink)', background: 'var(--demo-surface)' }} {...props}><Icon size={18} /></button>
}

export function DEMOBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'accent' | 'success' | 'warning' | 'neutral' | 'danger' }) {
  const styles = {
    accent: { background: 'color-mix(in srgb, var(--demo-accent) 12%, transparent)', color: 'var(--demo-accent)' },
    success: { background: 'color-mix(in srgb, var(--demo-alt) 18%, transparent)', color: 'var(--demo-alt)' },
    warning: { background: 'color-mix(in srgb, #f59e0b 18%, transparent)', color: '#a16207' },
    neutral: { background: 'var(--demo-surface-strong)', color: 'var(--demo-muted)' },
    danger: { background: 'color-mix(in srgb, var(--demo-danger) 12%, transparent)', color: 'var(--demo-danger)' },
  }[tone]
  return <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold" style={styles}>{children}</span>
}

export function DEMOCard({ children, className = '', ...props }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`prototype-demo-card ${className}`} {...props}>{children}</div>
}

export function DEMOSectionHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-4 flex items-end justify-between gap-4"><div><p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--demo-accent)' }}>{eyebrow}</p><h2 className="font-[var(--demo-font-display)] text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>{description && <p className="mt-1 max-w-2xl text-sm" style={{ color: 'var(--demo-muted)' }}>{description}</p>}</div>{action}</div>
}

export function DEMOStat({ label, value, change, icon: Icon }: { label: string; value: string; change?: string; icon?: LucideIcon }) {
  return <DEMOCard className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs" style={{ color: 'var(--demo-muted)' }}>{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>{change && <p className="mt-1 text-xs font-semibold" style={{ color: change.startsWith('-') ? 'var(--demo-danger)' : 'var(--demo-alt)' }}>{change}</p>}</div>{Icon && <div className="rounded-xl p-2" style={{ background: 'color-mix(in srgb, var(--demo-accent) 10%, transparent)', color: 'var(--demo-accent)' }}><Icon size={18} /></div>}</div></DEMOCard>
}

export function DEMOProgress({ value, label, color = 'var(--demo-accent)' }: { value: number; label?: string; color?: string }) {
  return <div>{label && <div className="mb-1 flex justify-between text-xs" style={{ color: 'var(--demo-muted)' }}><span>{label}</span><span>{value}%</span></div>}<div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--demo-surface-strong)' }}><div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.max(0, Math.min(value, 100))}%`, background: color }} /></div></div>
}

export function DEMOEmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="flex min-h-56 flex-col items-center justify-center rounded-[var(--demo-radius)] border border-dashed p-8 text-center" style={{ borderColor: 'var(--demo-border)', background: 'color-mix(in srgb, var(--demo-surface) 70%, transparent)' }}><Sparkles size={26} style={{ color: 'var(--demo-accent)' }} /><h3 className="mt-3 font-semibold">{title}</h3><p className="mt-1 max-w-sm text-sm" style={{ color: 'var(--demo-muted)' }}>{description}</p>{action && <div className="mt-4">{action}</div>}</div>
}

export function DEMOErrorState({ onRetry }: { onRetry: () => void }) {
  return <div className="flex min-h-56 flex-col items-center justify-center rounded-[var(--demo-radius)] border p-8 text-center" style={{ borderColor: 'color-mix(in srgb, var(--demo-danger) 35%, var(--demo-border))', background: 'var(--demo-surface)' }}><AlertTriangle size={26} style={{ color: 'var(--demo-danger)' }} /><h3 className="mt-3 font-semibold">暂时无法加载内容</h3><p className="mt-1 text-sm" style={{ color: 'var(--demo-muted)' }}>请检查网络或稍后重试。</p><DEMOButton tone="ghost" className="mt-4" onClick={onRetry}>重新加载</DEMOButton></div>
}

export function DEMOLoadingState() {
  return <div className="grid gap-4 sm:grid-cols-2"><div className="prototype-demo-loading h-32 rounded-[var(--demo-radius)]" style={{ background: 'var(--demo-surface-strong)' }} /><div className="prototype-demo-loading h-32 rounded-[var(--demo-radius)]" style={{ background: 'var(--demo-surface-strong)' }} /></div>
}

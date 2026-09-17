/**
 * Glass form field: label + leading lucide icon + cyan focus ring.
 * `trailing` lets callers slot in a control (e.g. a password toggle).
 * All standard <input> props (value, onChange, placeholder, onKeyDown…)
 * are forwarded, so binding to the shared `user` context object works
 * exactly as it did with the plain inputs.
 */
export default function Field({
  icon: Icon,
  label,
  type = "text",
  trailing,
  ...rest
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      )}
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type={type}
          {...rest}
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-cyan-400/20"
        />
        {trailing && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {trailing}
          </div>
        )}
      </div>
    </label>
  );
}

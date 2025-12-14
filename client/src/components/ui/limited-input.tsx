import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface LimitedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength: number;
  label?: string;
}

export function LimitedInput({
  value,
  onChange,
  maxLength,
  label,
  className,
  ...props
}: LimitedInputProps) {
  const currentLength = value?.length || 0;
  const isNearLimit = currentLength > maxLength * 0.8;
  const isAtLimit = currentLength >= maxLength;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= maxLength) {
      onChange(e);
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm text-muted-foreground block">{label}</label>
      )}
      <Input
        value={value}
        onChange={handleChange}
        className={cn(className, isAtLimit && "border-orange-500")}
        {...props}
      />
      <div className={cn(
        "text-xs text-right transition-colors",
        isAtLimit ? "text-orange-600 font-semibold" :
        isNearLimit ? "text-orange-500" :
        "text-muted-foreground"
      )}>
        {currentLength} / {maxLength}
      </div>
    </div>
  );
}

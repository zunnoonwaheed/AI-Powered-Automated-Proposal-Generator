import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface LimitedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  maxLength: number;
  label?: string;
}

export function LimitedTextarea({
  value,
  onChange,
  maxLength,
  label,
  className,
  ...props
}: LimitedTextareaProps) {
  const currentLength = value?.length || 0;
  const isNearLimit = currentLength > maxLength * 0.8;
  const isAtLimit = currentLength >= maxLength;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxLength) {
      onChange(e);
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm text-muted-foreground block">{label}</label>
      )}
      <Textarea
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
        {currentLength} / {maxLength} characters
      </div>
    </div>
  );
}

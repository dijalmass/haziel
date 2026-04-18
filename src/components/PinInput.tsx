import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from "./ui/input-otp";
import { PIN_LENGTH } from "../lib/constants";

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (pin: string) => void;
  disabled?: boolean;
  error?: string | null;
}

export function PinInput({ value, onChange, onComplete, disabled, error }: PinInputProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <InputOTP
        maxLength={PIN_LENGTH}
        value={value}
        onChange={onChange}
        onComplete={onComplete}
        disabled={disabled}
      >
        <InputOTPGroup>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <InputOTPSlot key={i} index={i} className="h-14 w-14 text-xl" />
          ))}
        </InputOTPGroup>
      </InputOTP>
      
      {error && (
        <p className="text-sm font-medium text-destructive animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}

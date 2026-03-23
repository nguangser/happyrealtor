import { cn } from "@/lib/utils/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black",
        className
      )}
      {...props}
    />
  );
}
import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-sm ${className}`}
      {...props}
    />
  );
}

function CardHeader({ className = "", ...props }: CardProps) {
  return <div className={`flex flex-col gap-2 p-6 ${className}`} {...props} />;
}

function CardTitle({ className = "", ...props }: CardProps) {
  return (
    <h2
      className={`text-2xl font-bold tracking-tight text-slate-900 ${className}`}
      {...props}
    />
  );
}

function CardDescription({ className = "", ...props }: CardProps) {
  return (
    <p className={`text-sm leading-6 text-slate-500 ${className}`} {...props} />
  );
}

function CardContent({ className = "", ...props }: CardProps) {
  return <div className={`p-6 pt-0 ${className}`} {...props} />;
}

function CardFooter({ className = "", ...props }: CardProps) {
  return (
    <div className={`flex items-center p-6 pt-0 ${className}`} {...props} />
  );
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };

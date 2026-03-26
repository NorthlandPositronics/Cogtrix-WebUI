import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-6">
      <h1 className="text-2xl font-semibold text-zinc-900">{title}</h1>
      {children && <div>{children}</div>}
    </div>
  );
}

export default PageHeader;

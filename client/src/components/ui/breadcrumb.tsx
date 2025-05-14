import React from "react";
import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
  items: BreadcrumbItem[];
  homeHref?: string;
}

const Breadcrumb = ({
  items,
  homeHref = "/",
  className,
  ...props
}: BreadcrumbProps) => {
  return (
    <nav
      className={cn(
        "flex items-center text-sm font-medium text-neutral-500 mb-4",
        className
      )}
      {...props}
    >
      <ol className="flex items-center space-x-2">
        <li>
          <Link href={homeHref}>
            <span className="flex items-center hover:text-primary transition-colors">
              <Home className="h-4 w-4" />
            </span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4 text-neutral-400" />
            {item.href ? (
              <Link href={item.href}>
                <span className="hover:text-primary transition-colors">
                  {item.label}
                </span>
              </Link>
            ) : (
              <span className="text-neutral-900 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export { Breadcrumb };
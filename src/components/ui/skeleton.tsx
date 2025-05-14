import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  animated?: boolean;
  children?: React.ReactNode;
}

export function Skeleton({
  className,
  animated = true,
  children,
  ...props
}: SkeletonProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-dark-space/50 relative overflow-hidden",
        animated && "after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-nebula-veil/10 after:to-transparent",
        className
      )}
      {...props}
      aria-busy="true"
      aria-live="polite"
    >
      {children}
    </div>
  );
}

// Pre-built skeletons for common content patterns
export function TextLineSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton 
      className={cn("h-4 w-full", className)} 
      {...props}
    />
  );
}

export function AvatarSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton 
      className={cn("h-10 w-10 rounded-full", className)} 
      {...props}
    />
  );
}

export function CardSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton 
      className={cn("h-[180px] w-full rounded-lg", className)} 
      {...props}
    >
      <div className="p-4 space-y-4">
        <TextLineSkeleton className="w-3/4 h-6" />
        <div className="space-y-2">
          <TextLineSkeleton />
          <TextLineSkeleton />
          <TextLineSkeleton className="w-4/5" />
        </div>
      </div>
    </Skeleton>
  );
}

export function ProfileSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("flex items-center space-x-4", className)} {...props}>
      <AvatarSkeleton />
      <div className="space-y-2 flex-1">
        <TextLineSkeleton className="h-5 w-1/3" />
        <TextLineSkeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function DashboardSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <div 
      className={cn("space-y-6", className)}
      role="status"
      aria-label="Loading dashboard"
      {...props}
    >
      <div className="flex justify-between items-center">
        <TextLineSkeleton className="h-8 w-1/3" />
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton className="hidden lg:block" />
      </div>
      
      <div className="space-y-4">
        <TextLineSkeleton className="h-6 w-1/4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg hidden md:block" />
          <Skeleton className="h-24 rounded-lg hidden lg:block" />
          <Skeleton className="h-24 rounded-lg hidden lg:block" />
        </div>
      </div>
    </div>
  );
}

export function ChatSkeleton({ className, messageCount = 3, ...props }: SkeletonProps & { messageCount?: number }) {
  return (
    <div 
      className={cn("space-y-6", className)}
      role="status"
      aria-label="Loading chat" 
      {...props}
    >
      {Array.from({ length: messageCount }).map((_, i) => (
        <div key={i} className={cn("flex", i % 2 === 0 ? "justify-end" : "")}>
          <div className={cn("max-w-[80%]", i % 2 === 0 ? "order-1" : "order-none")}>
            <AvatarSkeleton className={cn("mb-2", i % 2 === 0 ? "ml-auto" : "")} />
            <Skeleton className="h-24 w-64 md:w-96 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
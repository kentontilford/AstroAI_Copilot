'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  isExternal?: boolean;
  requiresAuth?: boolean;
  matchPattern?: RegExp;
}

interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

type NavigationItems = (NavigationItem | NavigationGroup)[];

interface AccessibleNavProps {
  items: NavigationItems;
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'sidebar' | 'mobile';
  isUserAuthenticated?: boolean;
  mobileMenuOpen?: boolean;
  onMobileMenuToggle?: (isOpen: boolean) => void;
}

/**
 * AccessibleNav component provides consistent, accessible navigation
 * with support for keyboard navigation, screen readers, and responsive design
 */
export function AccessibleNav({
  items,
  className,
  variant = 'horizontal',
  isUserAuthenticated = false,
  mobileMenuOpen,
  onMobileMenuToggle,
}: AccessibleNavProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(mobileMenuOpen || false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Sync mobile menu state with props
  useEffect(() => {
    if (mobileMenuOpen !== undefined) {
      setIsMobileMenuOpen(mobileMenuOpen);
    }
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    if (onMobileMenuToggle) {
      onMobileMenuToggle(false);
    }
  }, [pathname, onMobileMenuToggle]);

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    if (onMobileMenuToggle) {
      onMobileMenuToggle(newState);
    }
  };

  // Helper to check if an item is active based on current path
  const isActive = (item: NavigationItem): boolean => {
    if (item.matchPattern) {
      return item.matchPattern.test(pathname);
    }
    return pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
  };

  // Process items to filter out those requiring auth if user is not authenticated
  const filteredItems = items.filter((item) => {
    if ('items' in item) {
      // For groups, filter their items
      item.items = item.items.filter(
        (subItem) => !subItem.requiresAuth || isUserAuthenticated
      );
      return item.items.length > 0; // Only keep groups with items
    }
    return !item.requiresAuth || isUserAuthenticated;
  });

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    }
  };

  // Base nav classes for different variants
  const variantClasses = {
    horizontal: 'flex space-x-4 items-center',
    vertical: 'flex flex-col space-y-2',
    sidebar: 'flex flex-col space-y-6 w-64 p-4 border-r border-nebula-veil/20',
    mobile: 'flex lg:hidden',
  };

  // Item classes for different variants
  const itemClasses = {
    horizontal:
      'px-3 py-2 text-nebula-veil hover:text-starlight-white hover:bg-dark-space/50 rounded-md transition-colors',
    vertical:
      'px-3 py-2 text-nebula-veil hover:text-starlight-white hover:bg-dark-space/50 rounded-md transition-colors',
    sidebar:
      'px-4 py-3 flex items-center space-x-3 text-nebula-veil hover:text-starlight-white hover:bg-dark-space/50 rounded-md transition-colors',
    mobile:
      'px-4 py-3 flex items-center space-x-3 text-nebula-veil hover:text-starlight-white hover:bg-dark-space/50 rounded-md transition-colors w-full',
  };

  const activeClasses = {
    horizontal: 'text-starlight-white bg-cosmic-purple',
    vertical: 'text-starlight-white bg-cosmic-purple',
    sidebar: 'text-starlight-white bg-cosmic-purple',
    mobile: 'text-starlight-white bg-cosmic-purple',
  };

  // Skip link for keyboard users
  const SkipLink = () => (
    <a
      href="#main-content"
      className="absolute left-0 top-0 p-2 -translate-y-full focus:translate-y-0 bg-cosmic-purple text-starlight-white z-50 transition-transform"
    >
      Skip to main content
    </a>
  );

  // Mobile menu button
  const MobileMenuButton = () => (
    <button
      onClick={toggleMobileMenu}
      className="lg:hidden p-2 text-nebula-veil hover:text-starlight-white"
      aria-expanded={isMobileMenuOpen}
      aria-label="Toggle mobile menu"
    >
      {isMobileMenuOpen ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      )}
    </button>
  );

  // Render each navigation item or group
  const renderItem = (item: NavigationItem | NavigationGroup, index: number) => {
    if ('items' in item) {
      // Render a navigation group
      return (
        <div key={`group-${item.label}`} className="nav-group">
          <div className="text-stardust-silver text-sm font-medium mb-2">{item.label}</div>
          <div className={variant === 'horizontal' ? 'flex space-x-2' : 'space-y-1'}>
            {item.items.map((subItem, subIndex) => renderNavItem(subItem, `${index}-${subIndex}`))}          
          </div>
        </div>
      );
    }
    // Render a single navigation item
    return renderNavItem(item, index.toString());
  };

  // Render an individual navigation link
  const renderNavItem = (item: NavigationItem, key: string | number) => {
    const active = isActive(item);
    
    const itemContent = (
      <>
        {item.icon && <span className="nav-icon">{item.icon}</span>}
        <span className="nav-label">{item.label}</span>
      </>
    );

    return item.isExternal ? (
      <a
        key={`nav-${key}`}
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'nav-item',
          itemClasses[variant],
          active && activeClasses[variant]
        )}
        aria-current={active ? 'page' : undefined}
        onKeyDown={(e) => handleKeyDown(e, Number(key))}
      >
        {itemContent}
        <svg
          className="inline-block ml-1 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    ) : (
      <Link
        key={`nav-${key}`}
        href={item.href}
        className={cn(
          'nav-item',
          itemClasses[variant],
          active && activeClasses[variant]
        )}
        aria-current={active ? 'page' : undefined}
        onKeyDown={(e) => handleKeyDown(e, Number(key))}
      >
        {itemContent}
      </Link>
    );
  };

  // Main component rendering
  return (
    <>
      <SkipLink />
      
      {variant === 'mobile' && <MobileMenuButton />}
      
      <nav
        className={cn(
          variantClasses[variant],
          (variant === 'mobile' && !isMobileMenuOpen) && 'hidden',
          className
        )}
        role="navigation"
        aria-label="Main Navigation"
      >
        {variant === 'mobile' && (
          <div className="flex justify-between items-center w-full p-4 border-b border-nebula-veil/20 mb-4">
            <span className="text-starlight-white font-medium">Menu</span>
            <button
              onClick={toggleMobileMenu}
              className="text-nebula-veil hover:text-starlight-white"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>  
        )}
        
        {filteredItems.map((item, index) => renderItem(item, index))}
      </nav>
    </>
  );
}

/**
 * AppNav component provides the main application navigation
 * Pre-configured with common app routes
 */
export function AppNav(props: Omit<AccessibleNavProps, 'items'>) {
  const navItems: NavigationItems = [
    { label: 'Home', href: '/', icon: '🏠' },
    { label: 'Dashboard', href: '/dashboard', requiresAuth: true, icon: '📊' },
    { label: 'Chart', href: '/dashboard/personal', requiresAuth: true, icon: '🔭' },
    { label: 'Relationships', href: '/dashboard/relationships', requiresAuth: true, icon: '💞' },
    { label: 'Chat', href: '/chat', requiresAuth: true, icon: '💬' },
    { label: 'Settings', href: '/settings', requiresAuth: true, icon: '⚙️' },
  ];

  return <AccessibleNav items={navItems} {...props} />;
}

/**
 * DashboardNav component specifically for dashboard navigation
 */
export function DashboardNav(props: Omit<AccessibleNavProps, 'items'>) {
  const navItems: NavigationItems = [
    {
      label: 'Dashboard',
      items: [
        { label: 'Overview', href: '/dashboard', icon: '🏠' },
        { label: 'Personal', href: '/dashboard/personal', icon: '🔭' },
        { label: 'Relationships', href: '/dashboard/relationships', icon: '💞' },
      ],
    },
    {
      label: 'Analysis',
      items: [
        { label: 'Transit Report', href: '/dashboard/transits', icon: '🌠' },
        { label: 'Compatibility', href: '/dashboard/compatibility', icon: '❤️' },
      ],
    },
  ];

  return <AccessibleNav items={navItems} variant="sidebar" {...props} />;
}
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface RouterContextValue {
  pathname: string;
  navigate: (to: string) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextValue>({
  pathname: "/",
  navigate: () => {},
  params: {},
});

export function BrowserRouter({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState<string>(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      return window.location.hash.slice(1) || "/";
    }
    return "/";
  });

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.hash ? window.location.hash.slice(1) || "/" : "/");
    };
    handlePopState();
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handlePopState);
    };
  }, []);

  const navigate = (to: string) => {
    const normalized = to.startsWith("/") ? to : `/${to}`;
    window.location.hash = normalized;
    setPathname(normalized);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <RouterContext.Provider value={{ pathname, navigate, params: {} }}>
      {children}
    </RouterContext.Provider>
  );
}

export const Router = BrowserRouter;

function matchRoute(pattern: string, pathname: string): Record<string, string> | null {
  const cleanPattern = decodeURIComponent(pattern).replace(/\/+$/, "") || "/";
  const pathWithoutQuery = pathname.split("?")[0];
  const cleanPath = decodeURIComponent(pathWithoutQuery).replace(/\/+$/, "") || "/";

  if (cleanPattern === cleanPath) return {};

  const patternParts = cleanPattern.split("/");
  const pathParts = cleanPath.split("/");

  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const pPart = patternParts[i];
    const uPart = pathParts[i];
    if (pPart.startsWith(":")) {
      params[pPart.slice(1)] = uPart;
    } else if (pPart !== uPart) {
      return null;
    }
  }
  return params;
}

export function Routes({ children }: { children: React.ReactNode }) {
  const { pathname, navigate } = useContext(RouterContext);
  const childArray = React.Children.toArray(children);

  for (const child of childArray) {
    if (!React.isValidElement<{ path?: string; element?: React.ReactNode }>(child)) continue;
    const routePath = child.props.path;
    if (!routePath) continue;
    const matchedParams = matchRoute(routePath, pathname);
    if (matchedParams !== null) {
      return (
        <RouterContext.Provider value={{ pathname, navigate, params: matchedParams }}>
          {child.props.element}
        </RouterContext.Provider>
      );
    }
  }

  // Fallback to "/"
  for (const child of childArray) {
    if (React.isValidElement<{ path?: string; element?: React.ReactNode }>(child) && child.props.path === "/") {
      return <>{child.props.element}</>;
    }
  }

  return null;
}

export function Route(_props: { path: string; element: React.ReactNode }) {
  return null;
}

export function Link({
  to,
  children,
  className,
  onClick,
  ...rest
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const { navigate } = useContext(RouterContext);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) onClick(e);
    navigate(to);
  };

  return (
    <a href={`#${to}`} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  );
}

export function useLocation() {
  const { pathname } = useContext(RouterContext);
  return { pathname };
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>(): T {
  const { params } = useContext(RouterContext);
  return params as unknown as T;
}

export function useNavigate() {
  const { navigate } = useContext(RouterContext);
  return navigate;
}

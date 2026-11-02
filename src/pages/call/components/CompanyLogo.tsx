import React, { useState, useEffect } from "react";

// Global cache for fetched company logos so we don't refetch on every render
const globalLogoCache = new Map<string, string | null>();
const pendingLogoRequests = new Map<string, Promise<string | null>>();

// Extract domain if company name is a domain (e.g. "HGS.com" -> "hgs.com", "operative.ai" -> "operative.ai")
const extractDomain = (str: string): string | null => {
  if (!str) return null;
  const clean = str.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "");
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(clean)) {
    return clean.split("/")[0].split("?")[0];
  }
  return null;
};

export const fetchCompanyLogoUrl = async (companyName: string): Promise<string | null> => {
  if (!companyName || !companyName.trim()) return null;
  const key = companyName.trim().toLowerCase();

  if (globalLogoCache.has(key)) {
    return globalLogoCache.get(key) || null;
  }

  if (pendingLogoRequests.has(key)) {
    return pendingLogoRequests.get(key)!;
  }

  const promise = (async () => {
    // 1. Try Logo.dev API if API key is present
    const apiKey = import.meta.env.VITE_LOGO_DEV_API_KEY;
    if (apiKey) {
      try {
        const res = await fetch(
          `https://api.logo.dev/search?q=${encodeURIComponent(companyName.trim())}`,
          {
            headers: { Authorization: `Bearer ${apiKey}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          const logoUrl = Array.isArray(data) && data.length > 0 ? data[0]?.logo_url || null : null;
          if (logoUrl) {
            globalLogoCache.set(key, logoUrl);
            return logoUrl;
          }
        }
      } catch (err) {
        // Fall through to domain fallback
      }
    }

    // 2. If company name is or contains a domain (e.g. HGS.com, Trantor.com, Operative.ai),
    // use Google's high-res favicon/logo service which requires zero API keys and works reliably everywhere
    const domain = extractDomain(companyName);
    if (domain) {
      const googleLogoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      globalLogoCache.set(key, googleLogoUrl);
      return googleLogoUrl;
    }

    globalLogoCache.set(key, null);
    return null;
  })();

  pendingLogoRequests.set(key, promise);
  try {
    const result = await promise;
    return result;
  } finally {
    pendingLogoRequests.delete(key);
  }
};

interface CompanyLogoProps {
  name: string;
  logoUrl?: string | null;
  className?: string;
  sizeClassName?: string;
  textClassName?: string;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  name,
  logoUrl: propLogoUrl,
  className = "",
  sizeClassName = "w-6 h-6",
  textClassName = "text-[11px]",
}) => {
  const cleanName = (name || "").trim();
  const cacheKey = cleanName.toLowerCase();
  const [logo, setLogo] = useState<string | null>(() => {
    if (propLogoUrl !== undefined) return propLogoUrl;
    return globalLogoCache.get(cacheKey) || null;
  });
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    if (propLogoUrl !== undefined) {
      setLogo(propLogoUrl);
      return;
    }

    if (!cleanName) {
      setLogo(null);
      return;
    }

    if (globalLogoCache.has(cacheKey)) {
      setLogo(globalLogoCache.get(cacheKey) || null);
      return;
    }

    let isMounted = true;
    fetchCompanyLogoUrl(cleanName).then((url) => {
      if (isMounted) {
        setLogo(url);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [cleanName, cacheKey, propLogoUrl]);

  const initial = cleanName ? cleanName.charAt(0).toUpperCase() : "?";

  return (
    <div
      className={`${sizeClassName} rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-gray-50 border border-gray-100 ${className}`}
    >
      {logo && !hasError ? (
        <img
          src={logo}
          alt={cleanName}
          className="w-full h-full object-contain"
          onError={() => setHasError(true)}
          loading="lazy"
        />
      ) : (
        <span className={`font-semibold text-[#8E8E93] leading-none ${textClassName}`}>
          {initial}
        </span>
      )}
    </div>
  );
};

export default CompanyLogo;

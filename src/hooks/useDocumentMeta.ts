import { useEffect } from "react";

interface DocumentMeta {
  title: string;
  description?: string;
  ogImage?: string;
  canonicalPath?: string;
  jsonLd?: Record<string, unknown>;
}

const TITLE_SUFFIX = " — OneApp";

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  if (typeof document === "undefined") return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  if (typeof document === "undefined") return;
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function useDocumentMeta({ title, description, ogImage, canonicalPath, jsonLd }: DocumentMeta) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const previousTitle = document.title;
    const finalTitle = title.endsWith(TITLE_SUFFIX) ? title : `${title}${TITLE_SUFFIX}`;
    document.title = finalTitle;

    if (description) {
      setMeta("description", description);
      setMeta("og:description", description, "property");
      setMeta("twitter:description", description);
    }
    setMeta("og:title", finalTitle, "property");
    setMeta("twitter:title", finalTitle);
    if (ogImage) {
      setMeta("og:image", ogImage, "property");
      setMeta("twitter:image", ogImage);
    }
    if (canonicalPath && typeof window !== "undefined") {
      const url = `${window.location.origin}${canonicalPath}`;
      setLink("canonical", url);
      setMeta("og:url", url, "property");
    }

    let jsonLdEl: HTMLScriptElement | null = null;
    if (jsonLd) {
      jsonLdEl = document.createElement("script");
      jsonLdEl.type = "application/ld+json";
      jsonLdEl.text = JSON.stringify(jsonLd);
      jsonLdEl.dataset.oneappJsonld = "true";
      document.head.appendChild(jsonLdEl);
    }

    return () => {
      document.title = previousTitle;
      if (jsonLdEl?.parentNode) jsonLdEl.parentNode.removeChild(jsonLdEl);
    };
  }, [title, description, ogImage, canonicalPath, jsonLd]);
}

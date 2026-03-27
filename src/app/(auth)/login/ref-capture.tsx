"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function RefCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      document.cookie = `peeeky_ref=${ref};max-age=${90 * 24 * 60 * 60};path=/`;
    }
  }, [searchParams]);

  return null;
}

"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function SiteNavbar() {
  const pathname = usePathname();

  // The editor has its own purpose-built toolbar and dashboard exit control.
  if (pathname === "/editor" || pathname.startsWith("/editor/")) {
    return null;
  }

  return <Navbar />;
}

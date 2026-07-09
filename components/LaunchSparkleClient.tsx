"use client";

import dynamic from "next/dynamic";

const LaunchSparkle = dynamic(() => import("@/components/LaunchSparkle"), { ssr: false });

export default function LaunchSparkleClient() {
  return <LaunchSparkle />;
}

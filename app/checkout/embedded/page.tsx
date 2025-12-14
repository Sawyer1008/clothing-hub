import { Suspense } from "react";
import EmbeddedCheckoutClient from "./EmbeddedCheckoutClient";

export default function EmbeddedCheckoutPage() {
  return (
    <Suspense fallback={null}>
      <EmbeddedCheckoutClient />
    </Suspense>
  );
}

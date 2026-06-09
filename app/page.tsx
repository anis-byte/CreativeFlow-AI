import { redirect } from "next/navigation";

// The root simply routes into the client portal. The proxy (auth) layer
// bounces unauthenticated users to /login.
export default function RootPage() {
  redirect("/dashboard");
}

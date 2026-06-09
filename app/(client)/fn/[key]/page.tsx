import { notFound } from "next/navigation";
import { getFunction } from "@/lib/functions/registry";
import { Fn1Screen } from "@/components/screens/Fn1Screen";
import { Fn2Screen } from "@/components/screens/Fn2Screen";
import { Fn3Screen } from "@/components/screens/Fn3Screen";

// Generic chain screen: looks the function up in the registry and renders its
// screen component. Add a function -> add its screen to this map + registry.
const SCREENS: Record<string, React.ComponentType> = {
  fn1: Fn1Screen,
  fn2: Fn2Screen,
  fn3: Fn3Screen,
};

export default async function FnPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const Screen = SCREENS[key];
  if (!getFunction(key) || !Screen) notFound();
  return <Screen />;
}

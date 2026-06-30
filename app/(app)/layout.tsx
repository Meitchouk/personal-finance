import { redirect } from "next/navigation";
import { getUser, getPreferences } from "@/lib/supabase/queries";
import { PreferencesProvider } from "@/components/providers/PreferencesProvider";
import { ConfirmProvider } from "@/components/shared/ConfirmDialog";
import BottomNav from "@/components/shared/BottomNav";
import Sidebar from "@/components/shared/Sidebar";
import MobileTopBar from "@/components/shared/MobileTopBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");

  const preferences = await getPreferences();

  return (
    <PreferencesProvider initial={preferences}>
      <ConfirmProvider>
        <div className="flex min-h-screen bg-background">
          <aside className="fixed inset-y-0 hidden w-64 flex-col md:flex">
            <Sidebar email={user.email ?? ""} />
          </aside>

          <main className="flex-1 pb-24 md:pb-0 md:pl-64">
            <MobileTopBar />
            <div className="mx-auto max-w-3xl px-4 py-6">{children}</div>
          </main>

          <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
            <BottomNav />
          </div>
        </div>
      </ConfirmProvider>
    </PreferencesProvider>
  );
}

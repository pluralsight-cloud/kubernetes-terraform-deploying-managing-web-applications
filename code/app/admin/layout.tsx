import { auth } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";
import Providers from "@/components/admin/Providers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <Providers session={session}>
      <div className="min-h-screen bg-gray-100 text-gray-900">
        {session?.user ? (
          <div className="flex min-h-screen">
            <AdminNav />
            <div className="flex-1 p-6 md:p-8">{children}</div>
          </div>
        ) : (
          children
        )}
      </div>
    </Providers>
  );
}

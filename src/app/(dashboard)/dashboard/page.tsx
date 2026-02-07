import { getDashboardData } from "@/services/dashboard";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic"; // Ensure we always fetch fresh data

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    year?: string;
    userId?: string;
    scope?: "ALL" | "SHARED" | "INDIVIDUAL";
  }>;
}) {
  try {
    const {
      month: monthParam,
      year: yearParam,
      userId,
      scope,
    } = await searchParams;
    const month = monthParam ? parseInt(monthParam) : undefined;
    const year = yearParam ? parseInt(yearParam) : undefined;

    const data = await getDashboardData(month, year, userId, scope);
    return (
      <DashboardClient
        initialData={data}
        filterUser={userId}
        filterScope={scope}
      />
    );
  } catch (error: any) {
    return (
      <div className="p-8 text-red-500">
        <h1 className="text-xl font-bold">Error loading dashboard</h1>
        <pre className="mt-4 bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}
        </pre>
      </div>
    );
  }
}

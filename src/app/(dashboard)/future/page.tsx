import { prisma } from "@/lib/db";
import FuturePageClient from "@/components/future/FuturePageClient";

export const dynamic = "force-dynamic";

export default async function FuturePage() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // We want to forecast the next 30 days
  const futureLimit = new Date(now);
  futureLimit.setDate(futureLimit.getDate() + 30);

  // Fetch all questions that are not mastered, not todo (should be reviewing/solved)
  // and nextReview is within our 30 day window.
  // Note: Since we want a histogram of the FUTURE, we could also include overdue tasks on Day 1 (today).
  const questions = await prisma.progress.findMany({
    where: {
      status: { not: "Todo" },
      nextReview: {
        lte: futureLimit,
      },
    },
    select: {
      id: true,
      nextReview: true,
      masteryLevel: true,
    },
  });

  // Group by date string (YYYY-MM-DD)
  const distribution: Record<string, number> = {};

  // Initialize the next 30 days to 0 so the chart has a continuous timeline
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    // Format YYYY-MM-DD local time
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    distribution[dateStr] = 0;
  }

  // Count items
  questions.forEach((q) => {
    // If it's overdue (before today), we bucket it into today (index 0)
    const reviewDate = new Date(q.nextReview);
    if (reviewDate < now) {
      reviewDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const dateStr = `${reviewDate.getFullYear()}-${String(reviewDate.getMonth() + 1).padStart(2, "0")}-${String(reviewDate.getDate()).padStart(2, "0")}`;
    
    // Only increment if it falls within the 30-day window we initialized
    if (distribution[dateStr] !== undefined) {
      distribution[dateStr]++;
    }
  });

  // Convert to array for Recharts
  const chartData = Object.keys(distribution).map((date) => ({
    date,
    count: distribution[date],
  }));

  // Now, calculate today's local boundaries for statistics
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  // Queries for "Reviewed Today" and "Added Today"
  const [reviewedTodayCount, addedTodayCount] = await Promise.all([
    prisma.progress.count({
      where: {
        lastReview: {
          gte: todayStart,
          lte: todayEnd,
        },
        createdAt: {
          lt: todayStart,
        },
      },
    }),
    prisma.progress.count({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    }),
  ]);

  return (
    <FuturePageClient
      data={chartData}
      todayStats={{
        reviewedCount: reviewedTodayCount,
        addedCount: addedTodayCount,
      }}
    />
  );
}

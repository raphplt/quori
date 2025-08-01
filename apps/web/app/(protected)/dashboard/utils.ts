import { authenticatedFetch } from "@/lib/api-client";
import { useEffect, useState } from "react";

export const useGetKpis = () => {
  const [monthlyEventsLength, setMonthlyEventsLength] = useState<number>(0);
  const [monthlyPostsLength, setMonthlyPostsLength] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const events = await authenticatedFetch(
          "github/events/current-month/length"
        );
        if (!events.ok) {
          throw new Error("Failed to fetch monthly events length");
        }

        const data = await events.json();
        setMonthlyEventsLength(data.length);
        const posts = await authenticatedFetch(
          "github/posts/current-month/length"
        );
        if (!posts.ok) {
          throw new Error("Failed to fetch monthly posts length");
        }
        const postsData = await posts.json();
        setMonthlyPostsLength(postsData.length);
      } catch (error) {
        console.error("Error fetching monthly events:", error);
      }
    };

    fetchData();
  }, []);

  return {
    monthlyEventsLength,
    monthlyPostsLength,
  };
};

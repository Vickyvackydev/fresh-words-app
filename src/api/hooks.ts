import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { devotionalService } from "./services";

export function useTodayDevotional(category: string, timezone?: string) {
  return useQuery({
    queryKey: ["devotional", "today", category, timezone],
    queryFn: () => devotionalService.getToday(category, timezone),
    enabled: !!category,
    staleTime: 1000 * 60 * 15, // 15 minutes cache
  });
}

export function useDevotionalByDate(category: string, date: string) {
  return useQuery({
    queryKey: ["devotional", "date", category, date],
    queryFn: () => devotionalService.getByDate(category, date),
    enabled: !!category && !!date,
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}

export function useCalendarDevotionals(
  category: string,
  year: number,
  month: number,
) {
  return useQuery({
    queryKey: ["devotionals", "calendar", category, year, month],
    queryFn: () => devotionalService.getCalendar(category, year, month),
    enabled: !!category && !!year && !!month,
  });
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      email,
      message,
    }: {
      name: string;
      email: string;
      message: string;
    }) => devotionalService.submitFeedback(name, email, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
    },
  });
}

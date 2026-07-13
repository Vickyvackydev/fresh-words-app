import { api } from "./client";

export interface Devotional {
  id: string;
  category: string;
  title: string;
  scriptureQuote: string;
  scriptureReference: string;
  body: string;
  prayer?: string;
  reflection?: string;
  actionPoints?: string; // JSON array string
  defaultDay: number;
}

export interface CalendarItem {
  day_of_year: number;
  date: string;
  title: string;
  done: boolean;
}

export interface FeedbackResponse {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const devotionalService = {
  getToday: async (category: string, timezone?: string): Promise<Devotional> => {
    const response = await api.get("/devotionals/today", {
      params: { category, timezone },
    });
    return response.data.data;
  },

  getByDate: async (category: string, date: string): Promise<Devotional> => {
    const response = await api.get("/devotionals/date", {
      params: { category, date },
    });
    return response.data.data;
  },

  getCalendar: async (
    category: string,
    year: number,
    month: number
  ): Promise<CalendarItem[]> => {
    const response = await api.get("/devotionals/calendar", {
      params: { category, year, month },
    });
    return response.data.data;
  },

  submitFeedback: async (
    name: string,
    email: string,
    message: string
  ): Promise<FeedbackResponse> => {
    const response = await api.post("/feedback", { name, email, message });
    return response.data.data;
  },
};

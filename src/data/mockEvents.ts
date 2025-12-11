export interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  date: string;
  attendee: string;
  avatarImageUrl?: string;
  confirmed?: boolean;
  roundName?: string;
}

export const mockEvents: CalendarEvent[] = [];


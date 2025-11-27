export interface CalendarEvent {
  id: string;
  title: string;
  type: 'first-round' | 'face-to-face' | 'hr-round' | 'f2f1';
  startTime: string;
  endTime: string;
  date: string;
  attendee: string;
  attendeeImage?: string;
  confirmed?: boolean;
}

export const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Max Verstappen',
    type: 'first-round',
    startTime: '09:00',
    endTime: '11:00',
    date: '2025-11-26',
    attendee: 'Max Verstappen',
    attendeeImage: '/avatar1.png',
    confirmed: true,
  },
  {
    id: '2',
    title: 'Shruti Nair',
    type: 'face-to-face',
    startTime: '12:00',
    endTime: '13:00',
    date: '2025-11-26',
    attendee: 'Shruti Nair',
    attendeeImage: '/avatar2.png',
    confirmed: true,
  },
  {
    id: '3',
    title: 'Chaman Chacko',
    type: 'face-to-face',
    startTime: '13:00',
    endTime: '13:30',
    date: '2025-11-26',
    attendee: 'Chaman Chacko',
    attendeeImage: '/avatar3.png',
    confirmed: true,
  },
  {
    id: '4',
    title: 'Naveen Polishetty',
    type: 'face-to-face',
    startTime: '13:00',
    endTime: '13:30',
    date: '2025-11-27',
    attendee: 'Naveen Polishetty',
    attendeeImage: '/avatar4.png',
    confirmed: true,
  },
  {
    id: '5',
    title: 'Sarah Johnson',
    type: 'hr-round',
    startTime: '10:00',
    endTime: '11:00',
    date: '2025-11-28',
    attendee: 'Sarah Johnson',
    attendeeImage: '/avatar5.png',
    confirmed: true,
  },
  {
    id: '6',
    title: 'Michael Chen',
    type: 'first-round',
    startTime: '14:00',
    endTime: '15:30',
    date: '2025-11-28',
    attendee: 'Michael Chen',
    attendeeImage: '/avatar6.png',
    confirmed: false,
  },
  {
    id: '7',
    title: 'Emma Williams',
    type: 'f2f1',
    startTime: '09:30',
    endTime: '10:30',
    date: '2025-11-29',
    attendee: 'Emma Williams',
    attendeeImage: '/avatar7.png',
    confirmed: true,
  },
  {
    id: '8',
    title: 'David Brown',
    type: 'hr-round',
    startTime: '15:00',
    endTime: '16:00',
    date: '2025-11-29',
    attendee: 'David Brown',
    attendeeImage: '/avatar8.png',
    confirmed: true,
  },
];

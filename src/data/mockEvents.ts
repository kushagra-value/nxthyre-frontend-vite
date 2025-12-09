export interface CalendarEvent {
  id: string;
  title: string;
  type: 'first-round' | 'face-to-face' | 'hr-round' | 'f2f1';
  startTime: string;
  endTime: string;
  date: string;
  attendee: string;
  avatarImageUrl?: string;
  confirmed?: boolean;
}

export const mockEvents: CalendarEvent[] = [];


// [
//   {
//     id: '1',
//     title: 'Max Verstappen',
//     type: 'first-round',
//     startTime: '09:00',
//     endTime: '11:00',
//     date: '2025-11-26',
//     attendee: 'Max Verstappen',
//     avatarImageUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?cs=srgb&dl=pexels-pixabay-220453.jpg&fm=jpg',
//     confirmed: true,
//   },
//   {
//     id: '2',
//     title: 'Shruti Nair',
//     type: 'face-to-face',
//     startTime: '12:00',
//     endTime: '13:00',
//     date: '2025-11-26',
//     attendee: 'Shruti Nair',
//     avatarImageUrl: 'https://www.profilebakery.com/wp-content/uploads/2023/04/LINKEDIN-Profile-Picture-AI.jpg',
//     confirmed: true,
//   },
//   {
//     id: '3',
//     title: 'Chaman Chacko',
//     type: 'face-to-face',
//     startTime: '13:00',
//     endTime: '13:30',
//     date: '2025-11-26',
//     attendee: 'Chaman Chacko',
//     avatarImageUrl: 'https://cdn.pixabay.com/photo/2023/06/16/15/10/man-ai-8068201_960_720.jpg',
//     confirmed: true,
//   },
//   {
//     id: '4',
//     title: 'Naveen Polishetty',
//     type: 'face-to-face',
//     startTime: '13:00',
//     endTime: '13:30',
//     date: '2025-11-27',
//     attendee: 'Naveen Polishetty',
//     avatarImageUrl: 'https://pics.craiyon.com/2023-07-01/aaae17e348474bc3843c3d40ca53c15f.webp',
//     confirmed: true,
//   },
//   {
//     id: '5',
//     title: 'Sarah Johnson',
//     type: 'hr-round',
//     startTime: '10:00',
//     endTime: '11:00',
//     date: '2025-11-28',
//     attendee: 'Sarah Johnson',
//     avatarImageUrl: 'https://i.pinimg.com/originals/f4/d2/ba/f4d2ba04f9c8af5a60bbce025b454139.jpg',
//     confirmed: true,
//   },
//   {
//     id: '6',
//     title: 'Michael Chen',
//     type: 'first-round',
//     startTime: '14:00',
//     endTime: '15:30',
//     date: '2025-11-28',
//     attendee: 'Michael Chen',
//     avatarImageUrl: 'https://tse4.mm.bing.net/th/id/OIP.rqP30nn4mA4oDzm0T-wdRwHaHa?pid=Api&h=220&P=0',
//     confirmed: true,
//   },
//   {
//     id: '7',
//     title: 'Emma Williams',
//     type: 'f2f1',
//     startTime: '09:30',
//     endTime: '10:30',
//     date: '2025-11-29',
//     attendee: 'Emma Williams',
//     avatarImageUrl: 'https://avatarfiles.alphacoders.com/375/375542.png',
//     confirmed: true,
//   },
//   {
//     id: '8',
//     title: 'David Brown',
//     type: 'hr-round',
//     startTime: '15:00',
//     endTime: '16:00',
//     date: '2025-11-29',
//     attendee: 'David Brown',
//     avatarImageUrl: 'https://i.pinimg.com/736x/be/00/4e/be004e92b613e16a561ca7974f2ac8c5.jpg',
//     confirmed: true,
//   },
// ];

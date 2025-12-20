// Central application state exported for modules
export const state = {
  view: 'booking',
  bookings: [],
  loading: true,
  coach: 'Iskander Karimov',
  date: '',
  duration: '60',
  selectedSlot: null,
  showSlots: false,
  name: '',
  email: '',
  phone: '',
  notes: '',
  message: { type: '', text: '' },
  sending: false,
  filter: 'all',
  isAuthenticated: false,
  currentCoach: null,
  loginError: '',
  weather: null,
  lastBooking: null,
  showPolicy: null,
  lessonType: 'private',
  lessonTypes: {
    'private': { name: 'Private Lesson', price: 80, duration: 60, times: ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM'] },
    'semi-private': { name: 'Semi-Private', price: 50, duration: 60, times: ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM'] },
    'clinic': { name: 'Clinic', price: 35, duration: 90, times: ['Mon 6:00 PM','Wed 6:00 PM','Sat 9:00 AM','Sat 2:00 PM'] }
  },
  calendarEvents: []
};

// Expose to window for legacy inline code
if (typeof window !== 'undefined') window.state = state;

export default state;

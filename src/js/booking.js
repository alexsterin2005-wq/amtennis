import { state } from './state.js';

async function loadBookings() {
  try {
    const loadedBookings = await (window.storage ? window.storage.getAll() : []);
    state.bookings = (loadedBookings || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (err) {
    console.error('Error loading bookings:', err);
    state.bookings = [];
  }
  try {
    const loadedEvents = await (window.calendarEventStorage ? window.calendarEventStorage.getAll() : []);
    state.calendarEvents = (loadedEvents || []).sort((a, b) => {
      if (a.date === b.date) return a.time.localeCompare(b.time);
      return a.date.localeCompare(b.date);
    });
  } catch (err) {
    console.error('Error loading calendar events:', err);
    state.calendarEvents = [];
  }
  state.loading = false;
  if (typeof window.render === 'function') window.render();
}

function generateTimeSlots() {
  const slots = [];
  for (let h = 8; h <= 20; h++) {
    const suffix = h >= 12 ? 'PM' : 'AM';
    let hour12 = h % 12;
    if (hour12 === 0) hour12 = 12;
    slots.push(`${hour12}:00 ${suffix}`);
  }
  return slots;
}

function generateCalendarFile(bookingData) {
  const startDate = new Date(`${bookingData.date} ${bookingData.time}`);
  const endDate = new Date(startDate.getTime() + parseInt(bookingData.duration) * 60000);
  const formatDate = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AM Tennis Academy//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${bookingData.id}@amtennis.netlify.app`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:Tennis Lesson with Coach ${bookingData.coach}`,
    `DESCRIPTION:Tennis lesson at AM Tennis Academy\\n\\nCoach: ${bookingData.coach}\\nDuration: ${bookingData.duration} minutes\\nPrice: $${bookingData.price}\\n\\nLocation: Council Rock North High School Tennis Courts, 62 Swamp Rd, Newtown, PA 18940`,
    'LOCATION:Council Rock North High School Tennis Courts, 62 Swamp Rd, Newtown, PA 18940',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  return icsContent;
}

function downloadCalendar(bookingData) {
  const icsContent = generateCalendarFile(bookingData);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tennis-lesson-${bookingData.date}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function fetchWeather(date) {
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=40.23&longitude=-74.99&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&temperature_unit=fahrenheit&timezone=America/New_York&start_date=${date}&end_date=${date}`);
    const data = await response.json();
    if (data && data.daily) {
      const weatherCode = data.daily.weather_code[0];
      const tempMax = Math.round(data.daily.temperature_2m_max[0]);
      const tempMin = Math.round(data.daily.temperature_2m_min[0]);
      const rainChance = data.daily.precipitation_probability_max[0];
      let weatherEmoji = '☀️';
      let weatherDesc = 'Clear';
      if (weatherCode === 0) { weatherEmoji = '☀️'; weatherDesc = 'Clear'; }
      else if (weatherCode <= 3) { weatherEmoji = '⛅'; weatherDesc = 'Partly Cloudy'; }
      else if (weatherCode <= 49) { weatherEmoji = '☁️'; weatherDesc = 'Cloudy'; }
      else if (weatherCode <= 69) { weatherEmoji = '🌧️'; weatherDesc = 'Rainy'; }
      else if (weatherCode <= 79) { weatherEmoji = '❄️'; weatherDesc = 'Snow'; }
      else { weatherEmoji = '⛈️'; weatherDesc = 'Stormy'; }
      return { emoji: weatherEmoji, description: weatherDesc, tempMax, tempMin, rainChance };
    }
  } catch (error) {
    console.error('Weather fetch error:', error);
  }
  return null;
}

function isSlotBooked(timeSlot) {
  return state.bookings.some(
    b => b.coach === state.coach && b.date === state.date && b.time === timeSlot && b.status !== 'cancelled'
  );
}

async function sendEmail(bookingData) {
  const cancellationFee = bookingData.duration === '60' ? '$15' : '$20';
  const templateParams = {
    coach: bookingData.coach,
    date: bookingData.date,
    time: bookingData.time,
    duration: bookingData.duration,
    price: bookingData.price,
    name: bookingData.name,
    email: bookingData.email,
    phone: bookingData.phone,
    notes: bookingData.notes,
    booking_id: bookingData.id,
    location: 'Council Rock North High School Tennis Courts, 62 Swamp Rd, Newtown, PA 18940',
    payment_info: 'Payment Options: Venmo: @AMTennis | Zelle: isa2005@gmail.com | Card | Cash/Check accepted at lesson',
    cancellation_policy: `Cancellation Policy: ${cancellationFee} cancellation fee applies if cancelled within 24 hours of the scheduled lesson time.`
  };
  try {
    if (window.emailjs && emailjs.send) {
      await emailjs.send('service_38t1lwl', 'template_op0e8ca', templateParams);
      const businessParams = { ...templateParams, email: 'isa2005@gmail.com' };
      await emailjs.send('service_38t1lwl', 'template_op0e8ca', businessParams);
      return true;
    }
  } catch (err) {
    console.error('Email error:', err);
  }
  return false;
}

async function handleBooking() {
  if (!state.date || !state.selectedSlot || !state.name || !state.email) {
    state.message = { type: 'error', text: 'Please fill in all required fields and select a time slot.' };
    if (typeof window.render === 'function') window.render();
    return;
  }

  if (isSlotBooked(state.selectedSlot)) {
    state.message = { type: 'error', text: 'This time slot is no longer available. Please select another.' };
    if (typeof window.render === 'function') window.render();
    return;
  }

  state.sending = true; state.message = { type: '', text: '' };
  if (typeof window.render === 'function') window.render();

  const price = state.lessonTypes[state.lessonType].price;
  const bookingNumber = 1000 + state.bookings.length + 1;
  const bookingId = `#${bookingNumber}`;
  const bookingData = {
    id: bookingId,
    coach: state.coach,
    date: state.date,
    time: state.selectedSlot,
    duration: state.duration,
    price: price.toFixed(2),
    name: state.name,
    email: state.email,
    phone: state.phone,
    notes: state.notes,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  try {
    await (window.storage ? window.storage.add(bookingData) : Promise.resolve(false));
    const emailSent = await sendEmail(bookingData);
    state.message = {
      type: 'success',
      text: `Booking confirmed ${bookingId}`
    };
    state.lastBooking = bookingData;
    state.selectedSlot = null; state.showSlots = false; state.name = ''; state.email = ''; state.phone = ''; state.notes = '';
    await loadBookings();
  } catch (err) {
    console.error('handleBooking error:', err);
    state.message = { type: 'error', text: 'Failed to save booking. Please try again.' };
  }
  state.sending = false;
  if (typeof window.render === 'function') window.render();
}

async function updateBookingStatus(bookingId, newStatus) {
  try {
    await (window.storage ? window.storage.update(bookingId, { status: newStatus }) : Promise.resolve(false));
    await loadBookings();
  } catch (err) {
    console.error('Failed to update booking:', err);
  }
}

async function deleteBooking(bookingId) {
  if (!confirm('Are you sure you want to delete this booking?')) return;
  try {
    await (window.storage ? window.storage.delete(bookingId) : Promise.resolve(false));
    await loadBookings();
  } catch (err) {
    console.error('Failed to delete booking:', err);
  }
}

// Expose public functions for legacy inline handlers
const booking = {
  loadBookings,
  generateTimeSlots,
  generateCalendarFile,
  downloadCalendar,
  fetchWeather,
  isSlotBooked,
  sendEmail,
  handleBooking,
  updateBookingStatus,
  deleteBooking
};

if (typeof window !== 'undefined') window.booking = booking;

export default booking;

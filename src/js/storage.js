// Module to initialize EmailJS and Firebase and provide storage helpers
export function initStorage(firebaseConfig, emailJsKey) {
  try {
    if (window.emailjs && emailJsKey) {
      try { window.emailjs.init(emailJsKey); } catch (e) { console.warn('emailjs init failed', e); }
    }
  } catch (e) {
    console.warn('emailjs not available', e);
  }

  try {
    if (window.firebase && firebase.initializeApp) {
      try { firebase.initializeApp(firebaseConfig); } catch (e) { /* may already be initialized */ }
    }
  } catch (e) {
    console.warn('firebase not available', e);
  }

  const db = firebase.firestore();

  const storage = {
    async getAll() {
      try {
        const snapshot = await db.collection('bookings').get();
        const bookings = [];
        snapshot.forEach(doc => { bookings.push({ id: doc.id, ...doc.data() }); });
        return bookings;
      } catch (error) {
        console.error('Error getting bookings:', error);
        return [];
      }
    },
    async add(bookingData) {
      try {
        await db.collection('bookings').doc(bookingData.id).set(bookingData);
        return true;
      } catch (error) {
        console.error('Error adding booking:', error);
        return false;
      }
    },
    async update(bookingId, updates) {
      try {
        await db.collection('bookings').doc(bookingId).update(updates);
        return true;
      } catch (error) {
        console.error('Error updating booking:', error);
        return false;
      }
    },
    async delete(bookingId) {
      try {
        await db.collection('bookings').doc(bookingId).delete();
        return true;
      } catch (error) {
        console.error('Error deleting booking:', error);
        return false;
      }
    }
  };

  const calendarEventStorage = {
    async getAll() {
      try {
        const snapshot = await db.collection('calendarEvents').get();
        const events = [];
        snapshot.forEach(doc => { events.push({ id: doc.id, ...doc.data() }); });
        return events;
      } catch (error) {
        console.error('Error getting calendar events:', error);
        return [];
      }
    },
    async add(eventData) {
      try {
        const ref = db.collection('calendarEvents').doc();
        await ref.set({ ...eventData, id: ref.id });
        return ref.id;
      } catch (error) {
        console.error('Error adding calendar event:', error);
        return null;
      }
    },
    async delete(eventId) {
      try {
        await db.collection('calendarEvents').doc(eventId).delete();
        return true;
      } catch (error) {
        console.error('Error deleting calendar event:', error);
        return false;
      }
    }
  };

  // Expose to window for legacy code compatibility
  window.db = db;
  window.storage = storage;
  window.calendarEventStorage = calendarEventStorage;

  return { db, storage, calendarEventStorage };
}

export default initStorage;

import initStorage from './storage.js';
import './utils.js';
import './state.js';
import './booking.js';

const firebaseConfig = {
  apiKey: "AIzaSyBTxeuqswDst4Gh4OMvswTDaqG2llQ0ivY",
  authDomain: "am-tennis.firebaseapp.com",
  projectId: "am-tennis",
  storageBucket: "am-tennis.firebasestorage.app",
  messagingSenderId: "302418385368",
  appId: "1:302418385368:web:8b8e505efc68899cf6baad"
};

const EMAILJS_KEY = "ianNIvcpna6GOLZAi";

// Initialize storage layer and expose globals for remaining legacy code
initStorage(firebaseConfig, EMAILJS_KEY);

// Optional: confirm initialization in console
console.log('Storage module initialized.');

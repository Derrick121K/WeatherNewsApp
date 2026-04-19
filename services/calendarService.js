
import { Platform } from 'react-native';
// Check if running on native
const isNative = () => {
  return !(typeof window !== 'undefined' && window.document && window.document.body);
};

let Calendar = null;
let calendarInitialized = false;

const loadCalendar = async () => {
  if (!isNative() || calendarInitialized) return true;
  try {
    Calendar = await import('expo-calendar');
    calendarInitialized = true;
    return true;
  } catch (error) {
    console.error('Failed to load expo-calendar:', error);
    return false;
  }
};

export const requestCalendarPermissions = async () => {
  if (!isNative()) return 'granted';
  await loadCalendar();
  if (!Calendar) return 'denied';

  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status;
  } catch (error) {
    console.error('Calendar permission error:', error);
    return 'denied';
  }
};

export const requestReminderPermissions = async () => {
  if (!isNative()) return 'granted';
  await loadCalendar();
  if (!Calendar) return 'denied';

  try {
    const { status } = await Calendar.requestRemindersPermissionsAsync();
    if (status !== 'granted') throw new Error('Reminders permission denied');
    return status;
  } catch (error) {
    console.error('Reminder permission error:', error);
    throw error;
  }
};

export const getCalendars = async () => {
  if (!isNative()) return [];
  await loadCalendar();
  if (!Calendar) return [];

  try {
    return await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  } catch (error) {
    console.error('Error getting calendars:', error);
    return [];
  }
};

export const getDefaultCalendar = async () => {
  if (!isNative()) {
    return { id: 'web', title: 'Calendar', isPrimary: true };
  }
  await loadCalendar();
  if (!Calendar) return null;

  try {
    const calendars = await getCalendars();
    const primary = calendars.find(cal => cal.isPrimary);
    if (primary) return primary;

    const defaultCal = calendars.find(
      cal => cal.title === 'Personal' || cal.title === 'Home' || cal.title === 'Calendar'
    );
    if (defaultCal) return defaultCal;

    if (calendars.length > 0) return calendars[0];

    try {
      let source = null;
      if (Platform.OS === 'android') {
        // On Android, use the first writable calendar as the source
        const calendarsList = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        source = calendarsList.find(cal => cal.accessLevel === Calendar.CalendarAccessLevel.OWNER || cal.accessLevel === Calendar.CalendarAccessLevel.WRITER);
        if (!source) throw new Error('No writable calendar source found');
      } else if (Platform.OS === 'ios') {
        // On iOS, use a local source
        source = { id: undefined, name: 'iCloud', type: 'local' };
      } else {
        throw new Error('Unsupported platform for calendar creation');
      }
      return await Calendar.createCalendarAsync({
        title: 'WeatherNews App',
        entityType: Calendar.EntityTypes.EVENT,
        name: 'WeatherNews App',
        color: '#E94560',
        sourceId: source.id,
        source,
        ownerAccount: source.ownerAccount || undefined,
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });
    } catch (err) {
      console.error('Failed to create calendar:', err);
      return null;
    }
  } catch (error) {
    console.error('Error getting default calendar:', error);
    return null;
  }
};

export const createCalendarEvent = async (eventData) => {
  if (!isNative()) {
    console.log('Calendar events not available in web/Expo Snack mode');
    return 'web-event-id';
  }
  await loadCalendar();
  if (!Calendar) throw new Error('Calendar not available');

  try {
    const defaultCalendar = await getDefaultCalendar();
    if (!defaultCalendar) throw new Error('No calendar available');

    const startDate = new Date(eventData.startDate);
    const endDate = eventData.endDate ? new Date(eventData.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000);

    const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
      title: eventData.title,
      description: eventData.description || '',
      startDate,
      endDate,
      allDay: eventData.allDay || false,
      location: eventData.location || '',
      timeZone: Calendar.getTimeZoneAsync(),
    });

    if (eventData.reminderOffset) {
      try {
        await Calendar.createReminderAsync(eventId, {
          minutes: eventData.reminderOffset,
        });
      } catch (err) {
        console.error('Failed to create reminder:', err);
      }
    }

    return eventId;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};

export const getUpcomingEvents = async (daysAhead = 7) => {
  if (!isNative()) return [];
  await loadCalendar();
  if (!Calendar) return [];

  try {
    const defaultCalendar = await getDefaultCalendar();
    if (!defaultCalendar) return [];

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + daysAhead);

    const events = await Calendar.getEventsAsync([defaultCalendar.id], startDate, endDate);
    return events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description || '',
      startDate: event.startDate,
      endDate: event.endDate,
      allDay: event.allDay,
      location: event.location || '',
    }));
  } catch (error) {
    console.error('Error getting calendar events:', error);
    return [];
  }
};

export const deleteEvent = async (id) => {
  if (!isNative()) return true;
  await loadCalendar();
  if (!Calendar) return false;

  try {
    await Calendar.deleteEventAsync(id);
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
};

export const openCalendarApp = async () => {
  if (!isNative()) return;
  await loadCalendar();
  if (Calendar) {
    await Calendar.openCalendarAsync();
  }
};

export default {
  requestCalendarPermissions,
  requestReminderPermissions,
  getCalendars,
  getDefaultCalendar,
  createCalendarEvent,
  getUpcomingEvents,
  deleteEvent,
  openCalendarApp,
};

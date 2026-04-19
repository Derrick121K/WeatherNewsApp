import DateTimePicker from '@react-native-community/datetimepicker';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { createCalendarEvent, deleteEvent, getUpcomingEvents } from '../../services/calendarService';
import { requestNotificationPermissions, sendNotification } from '../../services/notificationService';
import { COLORS } from '../../utils/constants';

const EventCard = ({ event, index, onDelete }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isAllDay = event.allDay;

  return (
    <Animated.View entering={FadeInUp.delay(index * 80).duration(400)} style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.dateContainer}>
          <Text style={styles.day}>
            {new Date(event.startDate).getDate()}
          </Text>
          <Text style={styles.month}>
            {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
          </Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>

          {event.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {event.description}
            </Text>
          ) : null}

          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🕐</Text>
              <Text style={styles.metaText}>
                {isAllDay ? 'All day' : `${formatTime(event.startDate)}`}
                {event.endDate && !isAllDay && ` - ${formatTime(event.endDate)}`}
              </Text>
            </View>

            {event.location ? (
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>📍</Text>
                <Text style={styles.metaText} numberOfLines={1}>
                  {event.location}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(event.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const AddEventModal = ({ visible, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 60 * 60 * 1000)); // +1 hour
  const [allDay, setAllDay] = useState(false);
  const [reminderOffset, setReminderOffset] = useState(30); // minutes
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setStartDate(new Date());
    setEndDate(new Date(Date.now() + 60 * 60 * 1000));
    setAllDay(false);
    setReminderOffset(30);
  };

  const handleAdd = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    onAdd({
      title: title.trim(),
      description: description.trim(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      allDay,
      location: location.trim(),
      reminderOffset,
    });

    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>New Event</Text>
          <TouchableOpacity onPress={handleAdd}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Event title"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add description"
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start Date & Time</Text>
            <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.dateButton}>
              <Text style={styles.dateText}>
                {startDate.toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>End Date & Time</Text>
            <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.dateButton}>
              <Text style={styles.dateText}>
                {endDate.toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>All Day Event</Text>
            <TouchableOpacity
              style={[styles.switch, allDay && styles.switchActive]}
              onPress={() => setAllDay(!allDay)}
            >
              <View style={[styles.switchThumb, allDay && styles.switchThumbActive]} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location (optional)</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Add location"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reminder (minutes before)</Text>
            <View style={styles.reminderOptions}>
              {[0, 15, 30, 60].map((mins) => (
                <TouchableOpacity
                  key={mins}
                  style={[
                    styles.reminderButton,
                    reminderOffset === mins && styles.reminderButtonActive,
                  ]}
                  onPress={() => setReminderOffset(mins)}
                >
                  <Text
                    style={[
                      styles.reminderButtonText,
                      reminderOffset === mins && styles.reminderButtonTextActive,
                    ]}
                  >
                    {mins === 0 ? 'None' : `${mins}m`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {(showStartPicker || showEndPicker) && (
        <DateTimePicker
          value={showStartPicker ? startDate : endDate}
          mode="datetime"
          display="default"
          onChange={(event, selectedDate) => {
            if (showStartPicker) {
              setStartDate(selectedDate || startDate);
            } else {
              setEndDate(selectedDate || endDate);
            }
            setShowStartPicker(false);
            setShowEndPicker(false);
          }}
        />
      )}
    </Modal>
  );
};

export default function CalendarScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      const data = await getUpcomingEvents(30); // 30 days ahead
      setEvents(data);
    } catch (err) {
      setError('Failed to load calendar events. Ensure calendar permissions are granted.');
      console.error('Calendar fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleAddEvent = async (eventData) => {
    try {
      await createCalendarEvent(eventData);
      await fetchEvents();

      // Send notification confirmation
      const hasPermission = await requestNotificationPermissions();
      if (hasPermission) {
        sendNotification('Event Created', `${eventData.title} has been added to your calendar`);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to create event. Please try again.');
    }
  };

  const handleDeleteEvent = async (id) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteEvent(id);
            await fetchEvents();
          },
        },
      ]
    );
  };

  const renderEmpty = () => (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📅</Text>
      <Text style={styles.emptyText}>No upcoming events</Text>
      <Text style={styles.emptySubtext}>Add your first event to get started</Text>
    </Animated.View>
  );

  if (error && events.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage message={error} onRetry={fetchEvents} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <Text style={styles.headerSubtitle}>Manage your upcoming events</Text>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <EventCard event={item} index={index} onDelete={handleDeleteEvent} />
        )}
        ListHeaderComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>+ Add Event</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={loading ? <LoadingSpinner message="Loading events..." /> : renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <AddEventModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddEvent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  addButton: {
    backgroundColor: COLORS.accent,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  dateContainer: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 8,
    marginRight: 16,
  },
  day: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.accent,
  },
  month: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  meta: {
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  deleteButton: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
  deleteIcon: {
    fontSize: 20,
    opacity: 0.7,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cancelButton: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  switch: {
    width: 50,
    height: 28,
    backgroundColor: COLORS.border,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: COLORS.accent,
  },
  switchThumb: {
    width: 24,
    height: 24,
    backgroundColor: COLORS.textPrimary,
    borderRadius: 12,
  },
  switchThumbActive: {
    backgroundColor: COLORS.textPrimary,
    transform: [{ translateX: 22 }],
  },
  reminderOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  reminderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  reminderButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  reminderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  reminderButtonTextActive: {
    color: COLORS.textPrimary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});

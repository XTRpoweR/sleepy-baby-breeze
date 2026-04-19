// Profile change event system to coordinate data clearing across components
type ProfileChangeListener = (profileId: string | null) => void;

class ProfileEventManager {
  private listeners: Set<ProfileChangeListener> = new Set();

  subscribe(listener: ProfileChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(profileId: string | null) {
    console.log('ProfileEventManager: Emitting profile change event for:', profileId);
    this.listeners.forEach(listener => {
      try {
        listener(profileId);
      } catch (error) {
        console.error('Error in profile change listener:', error);
      }
    });
  }
}

export const profileEventManager = new ProfileEventManager();

// ---------- Generic data refresh bus ----------
// Used by the chat assistant (and other features) to tell pages
// "your data may have changed — refetch now" without a full page reload.
export type DataRefreshTopic =
  | 'activities'
  | 'notification_settings'
  | 'sleep_schedule'
  | 'profiles'
  | 'all';

type DataRefreshListener = (topic: DataRefreshTopic) => void;

class DataRefreshBus {
  private listeners: Set<DataRefreshListener> = new Set();

  subscribe(listener: DataRefreshListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(topic: DataRefreshTopic) {
    this.listeners.forEach((l) => {
      try {
        l(topic);
      } catch (e) {
        console.error('DataRefreshBus listener error:', e);
      }
    });
  }
}

export const dataRefreshBus = new DataRefreshBus();

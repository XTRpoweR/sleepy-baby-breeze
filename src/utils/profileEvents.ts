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
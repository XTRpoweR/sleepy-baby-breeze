// Profile change event system to coordinate data clearing across components
type ProfileChangeListener = (profileId: string | null, isImmediate?: boolean) => void;
type ProfileSwitchingListener = () => void;

class ProfileEventManager {
  private listeners: Set<ProfileChangeListener> = new Set();
  private switchingListeners: Set<ProfileSwitchingListener> = new Set();

  subscribe(listener: ProfileChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeToSwitching(listener: ProfileSwitchingListener): () => void {
    this.switchingListeners.add(listener);
    return () => this.switchingListeners.delete(listener);
  }

  emitSwitchingStart() {
    console.log('ProfileEventManager: Profile switching started');
    this.switchingListeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in profile switching listener:', error);
      }
    });
  }

  emit(profileId: string | null, isImmediate: boolean = false) {
    console.log('ProfileEventManager: Emitting profile change event for:', profileId, 'isImmediate:', isImmediate);
    this.listeners.forEach(listener => {
      try {
        listener(profileId, isImmediate);
      } catch (error) {
        console.error('Error in profile change listener:', error);
      }
    });
  }
}

export const profileEventManager = new ProfileEventManager();
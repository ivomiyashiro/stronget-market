export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  // Add other profile fields as needed
}

export interface ProfileState {
  data: Profile | null;
  isLoading: boolean;
  error: string | null;
} 
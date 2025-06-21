export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  surname: string;
  birthDay: string;
  profileImage: string;
  role: string;
}

export interface ProfileState {
  data: Profile | null;
  isLoading: boolean;
  error: string | null;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  surname: string;
  birthDay: string;
  role: string;
  evaluations?: Evaluation[];
}

export interface Evaluation {
  user: string;
  date: string;
  comment: string;
  rating: number;
}

export interface ProfileState {
  data: Profile | null;
  isLoading: boolean;
  error: string | null;
}

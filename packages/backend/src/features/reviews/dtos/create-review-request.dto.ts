export type CreateReviewRequestDTO = {
  serviceId: string;
  trainerId: string;
  calification: number;
  comments: string;
};

export type CreateReviewResponseDTO = {
  id: string;
  servicesId: string;
  trainerId: string;
  calification: number;
  comments: string;
  date: Date;
  user: {
    id: string;
    name: string;
    surname: string;
    avatar?: string;
  };
};

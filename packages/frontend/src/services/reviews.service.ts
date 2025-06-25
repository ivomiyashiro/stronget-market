import { BaseService } from "./base.service";

export interface CreateReviewRequest {
  serviceId: string;
  trainerId: string;
  calification: number;
  comments: string;
}

export interface ReviewResponse {
  _id: string;
  servicesId: string;
  trainerId: string;
  calification: number;
  comments: string;
  date: string;
  user: {
    id: string;
    name: string;
  };
}

export interface Review {
  _id: string;
  serviceId: string;
  trainerId: string;
  calification: number;
  comments: string;
  date: string;
  user: {
    _id: string;
    name: string;
    surname: string;
    avatar?: string;
  };
  response?: string;
}

export class ReviewsService extends BaseService {
  private readonly endpoint = "/reviews";

  /**
   * Create a new review
   */
  async createReview(data: CreateReviewRequest): Promise<ReviewResponse> {
    return this.post<ReviewResponse>(this.endpoint, data);
  }

  /**
   * Get reviews by service ID
   */
  async getReviewsByService(serviceId: string): Promise<Review[]> {
    return this.get<Review[]>(`${this.endpoint}/service/${serviceId}`);
  }

  /**
   * Get reviews by trainer ID
   */
  async getReviewsByTrainer(trainerId: string): Promise<Review[]> {
    return this.get<Review[]>(`${this.endpoint}/trainer/${trainerId}`);
  }

  /**
   * Get review by ID
   */
  async getReviewById(id: string): Promise<Review> {
    return this.get<Review>(`${this.endpoint}/${id}`);
  }

  /**
   * Update review
   */
  async updateReview(
    id: string,
    data: Partial<CreateReviewRequest>
  ): Promise<Review> {
    return this.put<Review>(`${this.endpoint}/${id}`, data);
  }

  /**
   * Delete review
   */
  async deleteReview(id: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`${this.endpoint}/${id}`);
  }

  /**
   * Respond to a review (trainer only)
   */
  async respondToReview(
    reviewId: string,
    responseText: string
  ): Promise<Review> {
    return this.patch<Review>(`${this.endpoint}/${reviewId}/response`, {
      response: responseText,
    });
  }
}

export const reviewsService = new ReviewsService();

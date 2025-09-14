export interface Service {
  service_id: number;
  name: string;
  description?: string | null;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceInput {
  name: string;
  description?: string | null;
  price: number;
}

export interface ServiceFormData extends ServiceInput {}

export interface ServiceWithRelations extends Service {
  // Можна додати пов'язані дані при необхідності
}

export interface ServiceResponse {
  success: boolean;
  data: Service;
}

export interface ServicesResponse {
  success: boolean;
  data: Service[];
}

export interface DeleteServiceResponse {
  success: boolean;
  message: string;
}
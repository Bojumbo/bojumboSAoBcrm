
export interface Manager {
  manager_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

export enum CounterpartyType {
  INDIVIDUAL = 'Фізична особа',
  LEGAL_ENTITY = 'Юридична особа',
}

export interface Counterparty {
  counterparty_id: number;
  name: string;
  counterparty_type: CounterpartyType;
  responsible_manager_id: number | null;
  responsible_manager?: Manager;
}

export interface Unit {
    unit_id: number;
    name: string;
}

export interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  unit_id?: number | null;
  unit?: Unit;
}

export interface Service {
  service_id: number;
  name: string;
  description: string;
  price: number;
}

export interface Warehouse {
  warehouse_id: number;
  name: string;
  location: string;
}

export interface SaleStatusType {
    sale_status_id: number;
    name: string;
}
export interface ProjectStatusType {
    project_status_id: number;
    name: string;
}
export interface SubProjectStatusType {
    sub_project_status_id: number;
    name: string;
}


export interface Sale {
  sale_id: number;
  counterparty_id: number;
  responsible_manager_id: number;
  sale_date: string;
  status: string;
  deferred_payment_date?: string | null;
  counterparty?: Counterparty;
  responsible_manager?: Manager;
  products?: { product: Product; quantity: number }[];
  services?: Service[];
  total_price?: number;
}


export interface Project {
  project_id: number;
  name: string;
  responsible_manager_id: number | null;
  counterparty_id: number | null;
  status?: string;
  responsible_manager?: Manager;
  counterparty?: Counterparty;
  subprojects?: SubProject[];
  tasks?: Task[];
}

export interface SubProject {
  subproject_id: number;
  name: string;
  project_id: number;
  status?: string;
}

export interface Task {
  task_id: number;
  title: string;
  description: string;
  responsible_manager_id: number | null;
  creator_manager_id: number | null;
  project_id: number | null;
  subproject_id: number | null;
  due_date: string | null;
  responsible_manager?: Manager;
  creator_manager?: Manager;
  project?: Project;
  subproject?: SubProject;
}
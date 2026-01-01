/**
 * Interface que representa um usuário do sistema
 * @interface User
 */
export interface User {
  /** ID único do usuário */
  id: number;
  /** Nome completo do usuário */
  name: string;
  /** E-mail do usuário */
  email: string;
  /** Data de nascimento (formato ISO) */
  birth_date?: string;
  /** CPF formatado (XXX.XXX.XXX-XX) */
  cpf?: string;
  /** ID do Google OAuth */
  google_id?: string;
  /** URL do avatar do Google */
  avatar?: string;
  /** Se o cadastro está completo */
  registration_completed: boolean;
  /** Idade calculada (readonly) */
  age?: number;
  /** Data de criação */
  created_at?: string;
  /** Data de atualização */
  updated_at?: string;
}

/**
 * Interface para completar registro
 * @interface UserRegistrationComplete
 */
export interface UserRegistrationComplete {
  user_id: number;
  name: string;
  birth_date: string;
  cpf: string;
}

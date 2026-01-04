/**
 * Interface que representa um usuário do sistema
 * @interface User
 * @property {number} id - ID único do usuário
 * @property {string} name - Nome completo do usuário
 * @property {string} email - E-mail do usuário
 * @property {string} birth_date - Data de nascimento (formato ISO)
 * @property {string} cpf - CPF formatado (XXX.XXX.XXX-XX)
 * @property {string} google_id - ID do Google OAuth
 * @property {string} avatar - URL do avatar do Google
 * @property {boolean} registration_completed - Se o cadastro está completo
 * @property {number} age - Idade calculada (readonly)
 * @property {string} created_at - Data de criação
 * @property {string} updated_at - Data de atualização
 */
export interface User {
  id: number;
  name: string;
  email: string;
  birth_date?: string;
  cpf?: string;
  google_id?: string;
  avatar?: string;
  registration_completed: boolean;
  age?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface para completar registro
 * @interface UserRegistrationComplete
 * @property {number} user_id - ID do usuário
 * @property {string} name - Nome completo do usuário
 * @property {string} birth_date - Data de nascimento (formato ISO)
 * @property {string} cpf - CPF formatado (XXX.XXX.XXX-XX)
 */
export interface UserRegistrationComplete {
  user_id: number;
  name: string;
  birth_date: string;
  cpf: string;
}

export interface CurrentUser {
  userId: string;
  email: string;
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'OPERATOR';
  companyId?: string | null;
}
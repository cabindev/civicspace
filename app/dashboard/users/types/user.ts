export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
    image: string | null;
  }
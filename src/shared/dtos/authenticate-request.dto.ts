export class AuthenticatedRequestDto extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

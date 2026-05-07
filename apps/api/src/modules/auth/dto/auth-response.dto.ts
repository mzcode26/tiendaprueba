export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: Array<{ id: string; name: string }>;
  };
}

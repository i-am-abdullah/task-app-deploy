export class CreateUserDto {
    username: string;
    email: string;
    passwordHash: string;
    fullName: string;
    phoneNumber?: string;
  }
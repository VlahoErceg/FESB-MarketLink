import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  register(dto: any) {
    return `This action registers a new user`;
  }

  login(dto: any) {
    return `This action logs in a user`;
  }
}

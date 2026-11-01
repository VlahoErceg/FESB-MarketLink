import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getProfile(id: number) {
    return `This action returns the user profile with id: ${id}`;
  }

  updateProfile(id: number, dto: any) {
    return `This action updates the user profile with id: ${id}`;
  }
}

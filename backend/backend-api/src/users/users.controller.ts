import { Controller, Get, Put, Param, Body, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile() {
    return this.usersService.getProfile(1);
  }

  @Put('me')
  updateProfile(@Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(1, dto);
  }
}

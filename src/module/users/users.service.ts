import { Body, HttpException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/common/database/prisma.service';
import { ERRORS } from 'src/constants/errors';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  private defaultSelect: Prisma.UsersSelect = {
    id: true,
    fullName: true,
    email: true,
    phone: true,
    role: true,
    office: true,
  };

  async create(@Body() createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    const isUserEmailExist = await this.prismaService.users.findUnique({
      where: {
        email: email,
      },
    });

    if (isUserEmailExist) {
      throw new HttpException(ERRORS.EMAIL_ALREADY_EXISTS, 400);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await this.prismaService.users.create({
      data: {
        ...createUserDto,
        email: email.toLowerCase(),
        password: hashedPassword,
        roleId: 3,
      },
      select: this.defaultSelect,
    });
    return user;
  }

  async findAll() {
    const users = await this.prismaService.users.findMany({
      select: this.defaultSelect,
    });
    return users;
  }

  async findOne(id: number) {
    const user = await this.prismaService.users.findUnique({
      where: { id },
      select: this.defaultSelect,
    });
    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.prismaService.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const getUser = await this.prismaService.users.findUnique({
      where: {
        id,
      },
    });

    if (!getUser) {
      throw new HttpException(ERRORS.USER_NOT_FOUND, 404);
    }

    const updatedUser = await this.prismaService.users.update({
      where: { id },
      data: { ...updateUserDto },
      select: this.defaultSelect,
    });
    return updatedUser;
  }

  async remove(id: number) {
    const getUser = await this.prismaService.users.findUnique({
      where: {
        id,
      },
    });

    if (!getUser) {
      throw new HttpException(ERRORS.USER_NOT_FOUND, 404);
    }

    await this.prismaService.users.delete({
      where: {
        id,
      },
    });
    return {
      message: 'Successfully deleted user',
    };
  }
}

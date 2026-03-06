import { HttpException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/common/database/prisma.service';
import { ERRORS } from './constants/errors';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  private defaultSelect: Prisma.UsersSelect = {
    id: true,
    companyId: true,
    officeId: true,
    departmentId: true,
    scheduleId: true,
    email: true,
    employeeCode: true,
    username: true,
    fullName: true,
    phone: true,
    role: true,
    profileUrl: true,
    jobTitle: true,
    isFlexible: true,
    status: true,
    joinedAt: true,
    createdAt: true,
  };

  async create(createUserDto: CreateUserDto) {
    const { companyId, password, employeeCode } = createUserDto;
    const email = createUserDto.email.toLowerCase();
    const username = createUserDto.username.toLowerCase();

    const isUserEmailExist = await this.prismaService.users.findFirst({
      where: {
        companyId: companyId,
        email: email,
        deletedAt: null,
      },
    });

    if (isUserEmailExist) {
      throw new HttpException(ERRORS.EMAIL_ALREADY_EXISTS, 400);
    }

    const isUserUsernameExist = await this.prismaService.users.findFirst({
      where: {
        companyId: companyId,
        username: username,
        deletedAt: null,
      },
    });

    if (isUserUsernameExist) {
      throw new HttpException(ERRORS.USERNAME_ALREADY_EXISTS, 400);
    }

    if (employeeCode) {
      const isUserEmployeeCodeExist = await this.prismaService.users.findFirst({
        where: {
          companyId: companyId,
          employeeCode: employeeCode,
          deletedAt: null,
        },
      });

      if (isUserEmployeeCodeExist) {
        throw new HttpException(ERRORS.EMPLOYEE_CODE_ALREADY_EXISTS, 400);
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.prismaService.users.create({
      data: {
        ...createUserDto,
        email: email,
        password: hashedPassword,
        username: username,
      },
      select: this.defaultSelect,
    });
    return user;
  }

  async findAll() {
    const users = await this.prismaService.users.findMany({
      where: {
        deletedAt: null,
      },
      select: this.defaultSelect,
    });
    return users;
  }

  async findOne(id: string) {
    const user = await this.prismaService.users.findFirst({
      where: { id, deletedAt: null },
      select: this.defaultSelect,
    });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const getUser = await this.prismaService.users.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!getUser) {
      throw new HttpException(ERRORS.USER_NOT_FOUND, 404);
    }

    if (updateUserDto.email) {
      const email = updateUserDto.email.toLowerCase();
      const isUserEmailExist = await this.prismaService.users.findFirst({
        where: {
          companyId: getUser.companyId,
          email: email,
          deletedAt: null,
          NOT: {
            id: id,
          },
        },
      });

      if (isUserEmailExist) {
        throw new HttpException(ERRORS.EMAIL_ALREADY_EXISTS, 400);
      }
    }

    if (updateUserDto.username) {
      const username = updateUserDto.username.toLowerCase();
      const isUserUsernameExist = await this.prismaService.users.findFirst({
        where: {
          companyId: getUser.companyId,
          username: username,
          deletedAt: null,
          NOT: {
            id: id,
          },
        },
      });

      if (isUserUsernameExist) {
        throw new HttpException(ERRORS.USERNAME_ALREADY_EXISTS, 400);
      }
    }

    if (updateUserDto.employeeCode) {
      const isUserEmployeeCodeExist = await this.prismaService.users.findFirst({
        where: {
          companyId: getUser.companyId,
          employeeCode: updateUserDto.employeeCode,
          deletedAt: null,
          NOT: {
            id: id,
          },
        },
      });

      if (isUserEmployeeCodeExist) {
        throw new HttpException(ERRORS.EMPLOYEE_CODE_ALREADY_EXISTS, 400);
      }
    }

    const updateData = { ...updateUserDto };

    // Hash password if the user wants to update it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12);
    }

    const updatedUser = await this.prismaService.users.update({
      where: { id },
      data: updateData,
      select: this.defaultSelect,
    });
    return updatedUser;
  }

  async remove(id: string) {
    const getUser = await this.prismaService.users.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!getUser) {
      throw new HttpException(ERRORS.USER_NOT_FOUND, 404);
    }

    await this.prismaService.users.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
    return {
      message: 'Successfully deleted user',
    };
  }
}

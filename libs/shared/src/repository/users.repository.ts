import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  BaseAbstractRepository,
  UserEntity,
  UsersRepositoryInterface,
} from '@app/shared';
import { USER, USER_ADMIN } from '@app/shared/models/seeds/base';
import { Role } from '@app/shared/models/enum';

@Injectable()
export class UsersRepository
  extends BaseAbstractRepository<UserEntity>
  implements UsersRepositoryInterface
{
  constructor(
    @InjectRepository(UserEntity)
    private readonly UsersRepository: Repository<UserEntity>,
  ) {
    super(UsersRepository);
  }
  async onModuleInit() {
    const adminUser = await this.UsersRepository.findOne({
      where: { email: USER_ADMIN.email },
    });

    if (!adminUser) {
      await this.Admin();
    }
  }
  async Admin() {
    try {
      // Hash the password using bcrypt.
      const password = await bcrypt.hash('123456', 10);
      // Create a new user entity.
      const newUser = new UserEntity();
      // newUser.id = USER_ADMIN.id;
      newUser.firstName = USER_ADMIN.firstName;
      newUser.lastName = USER_ADMIN.lastName;
      newUser.email = USER_ADMIN.email;
      newUser.phone = USER_ADMIN.phone;
      newUser.createdTime = new Date();
      newUser.isActive = USER_ADMIN.isActive;
      newUser.isEmailValidated = USER_ADMIN.isEmailValidated;
      newUser.address = USER_ADMIN.address;
      newUser.sex = USER_ADMIN.sex;
      newUser.profilePicture = USER_ADMIN.profilePicture;
      newUser.role = Role.ADMIN;
      newUser.password = password; // Set the hashed password.

      // Save the user entity to the database.
      await this.UsersRepository.save(newUser);
      console.log('User inserted successfully.');
    } catch (error) {
      console.error('Error inserting user:', error);
    }
  }
}

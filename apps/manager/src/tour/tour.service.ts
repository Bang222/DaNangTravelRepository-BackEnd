import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import {
  CartEntity,
  CartRepositoryInterface,
  CommentEntity,
  CommentRepositoryInterface,
  OrderDetailRepositoryInterface,
  OrderRepositoryInterface,
  PassengerRepositoryInterface,
  RedisCacheService,
  ScheduleEntity,
  ScheduleRepositoryInterface,
  ShareExperienceEntity,
  ShareExperienceRepositoryInterface,
  TourEntity,
  TourRepositoryInterface,
  UserEntity,
  UsersRepositoryInterface,
} from '@app/shared';

import {
  BookingTourDto,
  CartDto,
  CreateExperienceDto,
  ExperienceCommentDto,
  NewTouristDTO,
  TourCommentDto,
  UpdateTouristDTO,
} from './dtos';

import { StoreStatus, TourStatus } from '@app/shared/models/enum';
import { SellerService } from '../seller/seller.service';
import { Cron } from '@nestjs/schedule';
import { ClientProxy } from '@nestjs/microservices';
import { NotFoundError } from 'rxjs';
import { SendMailServiceInterface } from '../../../third-party-service/src/interface/email/send-mail.service.interface';
import { Between, ILike } from 'typeorm';
import {ERROR, OKE, StatusCodeDTO} from "../statusCode/statusCode";

@Injectable()
export class TourService {
  constructor(
    @Inject('UsersRepositoryInterface')
    private readonly usersRepository: UsersRepositoryInterface,
    @Inject('TourRepositoryInterface')
    private readonly tourRepository: TourRepositoryInterface,
    @Inject('CartRepositoryInterface')
    private readonly cartRepository: CartRepositoryInterface,
    @Inject('ShareExperienceRepositoryInterface')
    private readonly usedTourExperienceOfUserRepository: ShareExperienceRepositoryInterface,
    @Inject('OrderDetailRepositoryInterface')
    private readonly orderDetailRepository: OrderDetailRepositoryInterface,
    @Inject('OrderRepositoryInterface')
    private readonly orderRepository: OrderRepositoryInterface,
    @Inject('CommentRepositoryInterface')
    private readonly commentRepository: CommentRepositoryInterface,
    @Inject('ScheduleRepositoryInterface')
    private readonly scheduleRepository: ScheduleRepositoryInterface,
    @Inject('PassengerRepositoryInterface')
    private readonly passengerRepository: PassengerRepositoryInterface,
    @Inject('SendMailServiceInterface')
    private readonly sendMailServiceInterface: SendMailServiceInterface,
    @Inject('MAIL_SERVICE') private emailService: ClientProxy,
    private readonly sellerService: SellerService,
    private readonly redisService: RedisCacheService,
  ) {}

  async tourHello(id: number) {
    return 'tourHello';
  }

  async getAllTours(currentPage: number): Promise<TourEntity[]> {
    const itemsPerPage = 4;
    const skip = (currentPage - 1) * itemsPerPage;
    return await this.tourRepository.findAll({
      where: { status: TourStatus.AVAILABLE },
      skip: skip,
      order: { createdAt: 'DESC' },
      relations: { store: true, comments: { user: true } },
      take: itemsPerPage,
    });
  }

  async findOneByTourId(id: string): Promise<TourEntity> {
    return await this.tourRepository.findOneById(id);
  }

  async findTourDetail(id: string): Promise<TourEntity> {
    try {
      return await this.tourRepository.findByCondition({
        where: { id: id },
        relations: { schedules: true, store: true, comments: true },
      });
    } catch (err) {
      throw new BadRequestException(err);
    }
  }
  async deleteTour(tourId: string, userId: string) {
    const findTourById = await this.findOneByTourId(tourId);
    if (!findTourById) return new BadRequestException('can not found Tour');
    if (findTourById.baseQuantity !== findTourById.quantity) {
      return new BadRequestException('user bought can not delete');
    }
    const findTourOfStore = await this.sellerService.findTourOfStore(userId);
    const tourExists = findTourOfStore.some(
      (tour) => tour.id === findTourById.id,
    );
    if (!tourExists) throw new BadRequestException('You have not a owner');
    try {
      const updateStatus = await this.tourRepository.save({
        ...findTourById,
        status: TourStatus.Delete,
      });
      return updateStatus;
    } catch (errors) {
      return errors;
    }
  }
  async getCommentOfTour(tourId: string): Promise<CommentEntity[]> {
    try {
      const findCommentsByTourId = await this.tourRepository.findByCondition({
        where: { id: tourId },
        relations: { comments: { user: true } },
      });
      if (!findCommentsByTourId) throw new BadRequestException('Can not found');
      return findCommentsByTourId.comments;
    } catch (e) {
      return e;
    }
  }

  // Readonly<NewTouristDTO>
  async createTour(
    newTourDTO: Readonly<NewTouristDTO>,
    storeOfUserOwner,
  ): Promise<TourEntity> {
    try {
      if (
        newTourDTO.baseQuantity * newTourDTO.price === 0 ||
        newTourDTO.startDate >= new Date(Date.now())
      ) {
        throw new BadRequestException('you can not create Tour');
      }
      const createTour = await this.tourRepository.create({
        ...newTourDTO,
        quantity: 0,
        store: storeOfUserOwner,
      });
      const saveTour = await this.tourRepository.save({ ...createTour });
      const findNewTour = await this.findOneByTourId(saveTour.id);
      for (const scheduleDto of newTourDTO.schedules) {
        const schedule = new ScheduleEntity();
        schedule.day = scheduleDto.day;
        schedule.title = scheduleDto.title;
        schedule.description = scheduleDto.description;
        schedule.imgUrl = scheduleDto.imgUrl;
        schedule.tourId = saveTour.id;
        await this.scheduleRepository.save({ ...schedule });
      }
      const findTourById = await this.tourRepository.findByCondition({
        where: { id: saveTour.id },
        relations: { store: true, comments: { user: true } },
      });
      return findTourById;
    } catch (e) {
      return e;
    }
  }

  async updateTour(
    tourId: string,
    userId: string,
    updateTouristDto: UpdateTouristDTO,
  ): Promise<string> {
    try {
      const findTourNeedUpdate = await this.findOneByTourId(tourId);
      const findSchedule = await this.scheduleRepository.findWithRelations({
        where: { tourId: tourId },
        order: { day: 'ASC' },
      });
      let scheduleCount = 0;
      if (!findTourNeedUpdate || !findSchedule) {
        throw new BadRequestException('Tour Not Exists');
      }
      const checkTourOfStore = await this.sellerService.getTourEachStore(
        userId,
      );
      if (
        checkTourOfStore.tours.every(
          (tour) => tour.id !== findTourNeedUpdate.id,
        )
      ) {
        throw new BadRequestException('You not A Store owner');
      }
      if (updateTouristDto.baseQuantity < findTourNeedUpdate.quantity) {
        throw new BadRequestException('can not smalless bought');
      } else {
        const updateTour = await this.tourRepository.save({
          ...findTourNeedUpdate,
          baseQuantity: updateTouristDto.baseQuantity,
          lastRegisterDate: updateTouristDto.lastRegisterDate,
          name: updateTouristDto.name,
          description: updateTouristDto.description,
          status: TourStatus.AVAILABLE,
        });
      }
      for (const scheduleDto of updateTouristDto.schedules) {
        const scheduleUpdate = new ScheduleEntity();
        scheduleUpdate.day = scheduleDto.day;
        scheduleUpdate.title = scheduleDto.title;
        scheduleUpdate.description = scheduleDto.description;
        scheduleUpdate.imgUrl = scheduleDto.imgUrl;
        scheduleUpdate.tourId = findTourNeedUpdate.id;
        await this.scheduleRepository.save({
          ...findSchedule[scheduleCount],
          ...scheduleUpdate,
        });
        scheduleCount++;
      }
      return 'oke';
    } catch (e) {
      return e;
    }
  }

  async getCartByUserId(userId: string) {
    return await this.cartRepository.findWithRelations({
      where: { userId: userId },
      relations: { tour: true },
    });
  }
  async deleteCartByUserId(userId: string) {
    const findCart = await this.cartRepository.findWithRelations({
      where: { userId: userId },
    });
    if (!findCart) return 'can not found';
    return await this.cartRepository.removeCondition({
      where: { userId: userId },
    });
  }
  async deleteAElementCartByUserIdAndTourId(userId: string, tourId: string) {
    try {
      const findTourById = await this.findOneByTourId(tourId);
      if (!findTourById) return { msg: 'can not found' };
      const cart = await this.cartRepository.findByCondition({
        relations: { tour: true },
        where: { userId: userId, tourId: tourId },
      });
      if (!cart) return { msg: 'can not found' };
      return await this.cartRepository.remove(cart);
    } catch (e) {
      throw new Error(e);
    }
  }

  async createCart(
    cartDto: CartDto,
    user: Readonly<UserEntity>,
  ): Promise<CartEntity> {
    try {
      const tour = await this.findOneByTourId(cartDto.tourId);
      if (!tour) throw new BadRequestException('can not found Tour');
      const cartFromDb = await this.cartRepository.findByCondition({
        relations: ['tour', 'user'],
        where: [{ tour: { id: cartDto?.tourId }, user: { id: user?.id } }],
      });
      // if (cartFromDb.tourId === cartDto.tourId)
      //   throw new BadRequestException('You Added to Cart');
      if (!cartFromDb) {
        return await this.cartRepository.save({
          tour: tour,
          user: user,
        });
      } else {
        throw new BadRequestException('This tour having in cart');
      }
    } catch (e) {
      return e;
    }
  }

  // async implementStrategyPattern(status: string) {
  //
  // }
  async bookingTour(
    tourId: string,
    userId: string,
    bookingTourDto: Readonly<BookingTourDto>,
  ) {
    try {
      const findTourById = await this.findOneByTourId(tourId);
      if (!findTourById) {
        throw new BadRequestException('can not found');
      }
      if (findTourById.status !== TourStatus.AVAILABLE)
        throw new BadRequestException('Time Registration is over');
      const price: number = findTourById.price;
      const findUserById = await this.usersRepository.findOneById(userId);
      const quantity =
        bookingTourDto.adultPassengers +
        bookingTourDto.infantPassengers +
        bookingTourDto.toddlerPassengers +
        bookingTourDto.childPassengers;
      if (+findTourById.baseQuantity - +findTourById.quantity < quantity) {
        console.log(+findTourById.baseQuantity - +findTourById.quantity);
        throw new BadRequestException('not Enough slot');
      }

      const totalPrice =
        bookingTourDto.adultPassengers * price +
        bookingTourDto.childPassengers * price +
        bookingTourDto.toddlerPassengers * 0.7 * price +
        bookingTourDto.infantPassengers * 0.15 * price;

      const createOrder = await this.orderRepository.create({
        firstName: bookingTourDto.firstName,
        fullName: bookingTourDto.fullName,
        email: bookingTourDto.email,
        address: bookingTourDto.address,
        phone: bookingTourDto.phone,
        totalPrice: totalPrice,
        participants: quantity,
        userId: userId,
        storeId: findTourById.storeId,
        status: 'CONFIRMED',
      });
      if (!findTourById.status.includes(TourStatus.AVAILABLE))
        throw new BadRequestException('Err');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      const {
        firstName,
        fullName,
        email,
        address,
        passenger,
        phone,
        ...orderDetailFilter
      } = bookingTourDto;
      const createOrderDetail = await this.orderDetailRepository.create({
        ...orderDetailFilter,
        tourId: tourId,
      });
      const saveOder = await this.orderRepository.save({ ...createOrder });
      const saveOrderDetail = await this.orderDetailRepository.save({
        ...createOrderDetail,
        orderId: saveOder.id,
      });
      const updateOrderId = await this.orderRepository.save({
        ...saveOder,
        orderDetailId: saveOrderDetail.id,
      });
      for (const data of bookingTourDto.passenger) {
        if (data.type === 'Adult') {
          await this.passengerRepository.save({
            name: data.name,
            type: 'Adult',
            sex: data.sex,
            orderDetail: saveOrderDetail,
            dayOfBirth: data.dayOfBirth ? data.dayOfBirth : Number(''),
          });
        }
        if (data.type === 'Child') {
          await this.passengerRepository.save({
            name: data.name,
            type: 'Child',
            sex: data.sex,
            orderDetail: saveOrderDetail,
            dayOfBirth: data.dayOfBirth ? data.dayOfBirth : Number(''),
          });
        }
        if (data.type === 'Toddler') {
          await this.passengerRepository.save({
            name: data.name,
            type: 'Toddler',
            sex: data.sex,
            orderDetail: saveOrderDetail,
            dayOfBirth: data.dayOfBirth,
          });
        }
        if (data.type === 'Infant') {
          await this.passengerRepository.save({
            name: data.name,
            type: 'Infant',
            sex: data.sex,
            orderDetail: saveOrderDetail,
            dayOfBirth: data.dayOfBirth,
          });
        }
      }
      const updateQuantity = await this.tourRepository.save({
        ...findTourById,
        quantity: +findTourById.quantity + Number(quantity),
      });
      if (updateQuantity.baseQuantity - updateQuantity.quantity < 1) {
        await this.tourRepository.save({
          ...updateQuantity,
          status: TourStatus.FULL,
        });
      }
      const findTourInCart = await this.cartRepository.findByCondition({
        where: { tourId, userId },
      });
      if (findTourInCart) {
        await this.cartRepository.remove({ ...findTourInCart });
      }
      const configData = {
        id: findTourById.id,
        tourName: findTourById.name,
        TotalPrice: saveOder.totalPrice,
        participants: saveOder.participants,
        startDay: findTourById.startDate,
        endDate: findTourById.endDate,
      };
      await this.emailService
        .send(
          { email: 'send-booking' },
          { email: bookingTourDto.email, data: configData },
        )
        .toPromise();
      await this.redisService.del('getAllTourOfStore');
      return 'booking success';
    } catch (e) {
      return { message: e };
    }
  }

  async createContentExperienceOfUser(
    userId: string,
    createExperienceDto: CreateExperienceDto,
  ): Promise<ShareExperienceEntity> {
    try {
      return await this.usedTourExperienceOfUserRepository.save({
        ...createExperienceDto,
        anonymous: Boolean(createExperienceDto.anonymous),
        userId,
      });
    } catch (e) {
      return e;
    }
  }

  async createCommentOfTour(
    userId: string,
    tourCommentDto: TourCommentDto,
  ): Promise<CommentEntity> {
    try {
      const comment = await this.commentRepository.save({
        ...tourCommentDto,
        userId,
      });
      return await this.commentRepository.findByCondition({
        where: { id: comment.id },
        relations: { user: true },
      });
    } catch (e) {
      return e;
    }
  }

  async createCommentOfExperienceOfUser(
    userId: string,
    experienceCommentDto: ExperienceCommentDto,
  ): Promise<CommentEntity> {
    try {
      return await this.commentRepository.save({
        ...experienceCommentDto,
        userId,
      });
    } catch (e) {
      return e;
    }
  }

  async getExperienceOfUser() {
    try {
      const findExperienceOfUser =
        await this.usedTourExperienceOfUserRepository.findAll({
          relations: { comments: { user: true }, user: true },
          order: { createdAt: 'DESC' },
        });
      return findExperienceOfUser;
    } catch (e) {
      return e;
    }
  }
  async getExperienceOfUserPage(currentPage: number) {
    try {
      const itemsPerPage = 4;
      const skip = (currentPage - 1) * itemsPerPage;
      const findExperienceOfUser =
        await this.usedTourExperienceOfUserRepository.findAll({
          relations: { comments: { user: true }, user: true },
          skip: skip,
          order: { createdAt: 'DESC' },
          take: itemsPerPage,
        });
      return findExperienceOfUser;
    } catch (e) {
      return e;
    }
  }
  async upvoteOfTour(userId: string, tourId: string) {
    try {
      const findTourById = await this.findOneByTourId(tourId);
      if (!findTourById) throw new NotFoundError('Can not found Tour');
      if (findTourById.upVote.includes(userId)) {
        const updateUpVoteExistUserId = findTourById.upVote.filter(
          (item) => item !== userId,
        );
        const findTour = await this.tourRepository.save({
          ...findTourById,
          upVote: [...updateUpVoteExistUserId],
        });
        return { ...OKE,status: findTour.upVote, total: -1 };
      } else {
        const findTour = await this.tourRepository.save({
          ...findTourById,
          upVote: [...findTourById.upVote, userId],
        });
        return { ...OKE,status: findTour.upVote, total: 1 };
      }
    } catch (e) {
      return {...ERROR,message: e.message};
    }
  }

  async upvoteOfExperienceOfUser(userId: string, experienceId: string) {
    try {
      const findExperienceOfUserById =
        await this.usedTourExperienceOfUserRepository.findByCondition({
          where: { id: experienceId },
        });
      if (!findExperienceOfUserById) {
        return new BadRequestException('can not found');
      }
      if (findExperienceOfUserById.upVote.includes(userId)) {
        const updateUpVoteExistUserId = findExperienceOfUserById.upVote.filter(
          (item) => item !== userId,
        );
        const totalUpvote = await this.usedTourExperienceOfUserRepository.save({
          ...findExperienceOfUserById,
          upVote: [...updateUpVoteExistUserId],
        });
        return {...OKE,status: totalUpvote.upVote, total: -1 };
      } else {
        const updateUpvote = await this.usedTourExperienceOfUserRepository.save(
          {
            ...findExperienceOfUserById,
            upVote: [...findExperienceOfUserById.upVote, userId],
          },
        );
        return {...OKE,status: updateUpvote.upVote, total: 1 };
      }
    } catch (e) {
      return e;
    }
  }
  // @Cron('2 * * * * *')
  // titleTour: string
  async searchTour(
    tourName: string | null = null,
    startAddress: string | null = null,
    minPrice: number | null = 1,
    maxPrice: number | null = 99999999,
    startDay: Date | null = null,
    endDay: Date | null = null,
    currentPage: number,
  ) {
    try {
      const itemsPerPage = 4;
      const skip = (currentPage - 1) * itemsPerPage;

      const whereCondition: any = {
        status: TourStatus.AVAILABLE,
        store: {
          isActive: StoreStatus.ACTIVE,
        },
      };
      if (tourName) {
        whereCondition.name = ILike(`%${tourName}%`);
      }
      if (startAddress) {
        whereCondition.startAddress = ILike(`%${startAddress}%`);
      }
      if (startDay) {
        whereCondition.startDate = startDay;
      }
      if (endDay) {
        whereCondition.endDate = endDay;
      }
      if (minPrice && maxPrice) {
        whereCondition.price = Between(minPrice ?? 1, maxPrice ?? 99999999999);
      }
      const tours = await this.tourRepository.findAll({
        skip: skip,
        order: { createdAt: 'DESC' },
        relations: { store: true, comments: { user: true } },
        where: whereCondition,
        take: itemsPerPage,
      });

      return tours;
    } catch (e) {
      console.error(e);
      return 'failed';
    }
  }
  async searchExperience(title: string | null = null, page: number) {
    const itemsPerPage = 3;
    const skip = (page - 1) * itemsPerPage;
    const whereCondition: any = {};
    try {
      if (title) {
        whereCondition.title = ILike(`%${title}%`);
      }
      const getExperience = await this.usedTourExperienceOfUserRepository.findAll(
          {
            where: whereCondition,
            relations: {comments: {user: true}, user: true},
            order: {createdAt: 'DESC'},
            skip: skip,
            take: itemsPerPage,
          },
      );
      return {...OKE,getExperience};
    }catch(e){
      return {statusCode: 400, message: e.message}
    }
  }
  @Cron('* 0 * * *')
  async updateStatusTourAutomatic(): Promise<void> {
    const currentDate = new Date();
    try {
      const getAllTour = await this.tourRepository.findAll({
        where: [
          { status: TourStatus.LAST },
          { status: TourStatus.TRAVELING },
          { status: TourStatus.FULL },
          { status: TourStatus.AVAILABLE },
        ],
      });
      for (const x of getAllTour) {
        // nằm trong khoảng thời gian từ cuối đăng kí đến khi bắt đầu
        if (x.lastRegisterDate <= currentDate && currentDate < x.startDate) {
          await this.tourRepository.save({ ...x, status: TourStatus.LAST });
        }
        //traveling
        if (x.startDate <= currentDate && currentDate <= x.endDate) {
          await this.tourRepository.save({
            ...x,
            status: TourStatus.TRAVELING,
          });
        }
        if (currentDate > x.endDate) {
          await this.tourRepository.save({ ...x, status: TourStatus.DONE });
        }
      }
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
  @Cron('0 14 * * *')
  // @Cron('12 * * * * *')
  async autoSendMailingToOrder(): Promise<void> {
    const currentDate = new Date();
    const getAllTourOutOfRegister = await this.tourRepository.findWithRelations(
      {
        where: { status: TourStatus.LAST },
        relations: {
          orderDetails: { order: true },
        },
      },
    );
    if (!currentDate) {
      throw new BadRequestException('can not found');
    }
    // Array to store promises
    const sendMailPromises: Promise<void>[] = [];

    for (const tour of getAllTourOutOfRegister) {
      const startDay = new Date(tour.startDate);
      const differenceInMilliseconds: number =
        Number(startDay) - Number(currentDate);
      const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
      if (Math.floor(differenceInDays) <= 3) {
        tour.orderDetails.map((orderDetail) => {
          const data = {
            tourName: tour.name,
            tourId: tour.id,
            email: orderDetail.order.email,
            particular: orderDetail.order.participants,
            startDay: tour.startDate,
            endDate: tour.endDate,
          };
          // Push the promise to the array
          sendMailPromises.push(
            this.sendMailServiceInterface.sendMailUserBefore3Days(
              data.tourId,
              data.tourName,
              data.email,
              data.particular,
              data.startDay,
              data.endDate,
            ),
          );
        });
      }
    }

    // Wait for all email sending promises to complete
    await Promise.all(sendMailPromises);

    // The emails have been sent
    console.log('All emails sent successfully');
  }
}

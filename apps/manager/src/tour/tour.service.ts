import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import {
  CartEntity,
  CartRepositoryInterface,
  CommentEntity,
  CommentRepositoryInterface,
  OrderDetailRepositoryInterface,
  OrderRepositoryInterface,
  RedisCacheService,
  ShareExperienceEntity,
  ShareExperienceRepositoryInterface,
  TourEntity,
  TourRepositoryInterface,
  UserEntity,
  UserRegisteredTourRepositoryInterface,
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

import { TourStatus } from '@app/shared/models/enum';
import { SellerService } from '../seller/seller.service';
import { Cron } from '@nestjs/schedule';

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
    @Inject('UserRegisteredTourRepositoryInterface')
    private readonly userRegisteredTourRepository: UserRegisteredTourRepositoryInterface,
    @Inject('OrderDetailRepositoryInterface')
    private readonly orderDetailRepository: OrderDetailRepositoryInterface,
    @Inject('OrderRepositoryInterface')
    private readonly orderRepository: OrderRepositoryInterface,
    @Inject('CommentRepositoryInterface')
    private readonly commentRepository: CommentRepositoryInterface,
    private readonly sellerService: SellerService,
    private readonly redisService: RedisCacheService,
  ) {}
  async tourHello(id: number) {
    console.log(id);
    return 'tourHello';
  }
  async getAllTours(): Promise<TourEntity[]> {
    // const currentDate = new Date();
    return await this.tourRepository.findAll({
      where: { status: TourStatus.AVAILABLE },
      order: { createdAt: 'DESC' },
      relations: { comments: { user: true }, store: true },
      cache: true,
    });
  }
  //   const kaka = await this.findOneByTourId('595dda98-c6fd-4687-9307-b88f7cc911fe')
  //   return (
  //     kaka.lastRegisterDate <= currentDate && currentDate <= kaka.startDate
  //   );
  // }
  async findTourOfUserRegistered(tourId: string) {
    return await this.userRegisteredTourRepository.findOneById(tourId);
  }
  async createTour(
    newTourDTO: Readonly<NewTouristDTO>,
    storeOfUserOwner,
  ): Promise<TourEntity> {
    try {
      if (
        newTourDTO.quantity * newTourDTO.price === 0 &&
        newTourDTO.startDate >= new Date(Date.now())
      ) {
        throw new BadRequestException('you can not create Tour');
      }
      const newTour = await this.tourRepository.save({
        ...newTourDTO,
        store: storeOfUserOwner,
      });
      const findNewTour = await this.tourRepository.findOneById(newTour.id);
      await this.userRegisteredTourRepository.save({
        tour: findNewTour,
      });
      return newTour;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async updateTour(
    tourId: string,
    userId: string,
    updateTouristDto: UpdateTouristDTO,
  ): Promise<TourEntity> {
    try {
      const findTourNeedUpdate = await this.findOneByTourId(tourId);
      if (!findTourNeedUpdate) {
        throw new BadRequestException('Tour Not Exists');
      }
      const checkTourOfStore = await this.sellerService.getTourEachStore(
        userId,
      );
      if (!checkTourOfStore.tours.includes(findTourNeedUpdate)) {
        throw new BadRequestException('You not A Store owner');
      }
      const updateTour = await this.tourRepository.save({
        ...findTourNeedUpdate,
        ...updateTouristDto,
      });
      return updateTour;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async findOneByTourId(id: string): Promise<TourEntity> {
    return await this.tourRepository.findOneById(id);
  }
  async createCart(
    cartDto: CartDto,
    user: Readonly<UserEntity>,
  ): Promise<CartEntity> {
    try {
      const tour = await this.findOneByTourId(cartDto.tourId);
      const cartFromDb = await this.cartRepository.findByCondition({
        relations: ['tour', 'user'],
        where: [{ tour: { id: cartDto?.tourId }, user: { id: user?.id } }],
      });
      if (!cartFromDb) {
        return await this.cartRepository.save({
          tour: tour,
          user: user,
        });
      } else {
        return await this.cartRepository.save({
          ...cartFromDb,
        });
      }
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
  async bookingTour(
    tourId: string,
    userId: string,
    bookingTourDto: BookingTourDto,
  ) {
    try {
      const createOrder = await this.orderRepository.save({ userId: userId });
      const findOrder = await this.orderRepository.findOneById(createOrder.id);
      const findTourById = await this.findOneByTourId(tourId);
      const findUserById = await this.usersRepository.findOneById(userId);
      const price: number = findTourById.price;
      if (!findTourById.status.includes(TourStatus.AVAILABLE))
        throw new BadRequestException('can not booking');
      const createOrderDetail = await this.orderDetailRepository.save({
        ...bookingTourDto,
        orderId: findOrder.id,
        tourId: tourId,
      });
      const {
        adultPassengers,
        childPassengers,
        toddlerPassengers,
        infantPassengers,
      } = createOrderDetail;
      const totalPrice =
        adultPassengers * price +
        childPassengers * price +
        toddlerPassengers * 0.7 * price;

      const quantity =
        adultPassengers +
        childPassengers +
        toddlerPassengers +
        infantPassengers;
      if (findTourById.quantity < quantity)
        throw new BadRequestException('Not Enough slot');
      const updateQuantity = await this.tourRepository.save({
        ...findTourById,
        quantity: +findTourById.quantity - Number(quantity),
      });
      if (updateQuantity.quantity < 1) {
        await this.tourRepository.save({
          ...updateQuantity,
          status: TourStatus.FULL,
        });
      }
      await this.orderRepository.save({
        ...findOrder,
        totalPrice: totalPrice,
        orderDetailId: createOrderDetail.id,
      });
      const findUserRegisteredTour =
        await this.userRegisteredTourRepository.findByCondition({
          where: { tourId },
          relations: { users: true },
        });
      if (!findUserRegisteredTour.users.includes(findUserById)) {
        await this.userRegisteredTourRepository.save({
          ...findUserRegisteredTour,
          users: [...findUserRegisteredTour.users, findUserById],
        });
      }
      const findTourInCart = await this.cartRepository.findByCondition({
        where: { tourId },
      });
      if (findTourInCart) {
        await this.cartRepository.remove({ ...findTourInCart });
      }
      return 'booking success';
    } catch (e) {
      throw new BadRequestException(e);
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
      throw new BadRequestException(e);
    }
  }
  async createCommentOfTour(
    userId: string,
    tourCommentDto: TourCommentDto,
  ): Promise<CommentEntity> {
    try {
      return await this.commentRepository.save({
        ...tourCommentDto,
        userId,
      });
    } catch (e) {
      throw new BadRequestException(e);
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
      throw new BadRequestException(e);
    }
  }
  async getExperienceOfUser() {
    try {
      const findExperienceOfUser =
        await this.usedTourExperienceOfUserRepository.findAll({
          relations: { comments: { user: true }, user: true },
        });
      return findExperienceOfUser;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
  async upvoteOfTour(userId: string, tourId: string) {
    const findTourById = await this.findOneByTourId(tourId);
    if (findTourById.upVote.includes(userId)) {
      const updateUpVoteExistUserId = findTourById.upVote.filter(
        (item) => item !== userId,
      );
      return (
        (
          await this.tourRepository.save({
            ...findTourById,
            upVote: [...updateUpVoteExistUserId],
          })
        ).upVote.length - 1
      );
    } else {
      const updateUpvoteExistUser = await this.tourRepository.save({
        ...findTourById,
        upVote: [...findTourById.upVote, userId],
      });
      return updateUpvoteExistUser.upVote.length - 1;
    }
  }
  async upvoteOfExperienceOfUser(userId: string, experienceId: string) {
    try {
      const findExperienceOfUserById =
        await this.usedTourExperienceOfUserRepository.findOneById(experienceId);
      console.log(findExperienceOfUserById.upVote.includes(userId));
      if (findExperienceOfUserById.upVote.includes(userId)) {
        const updateUpVoteExistUserId = findExperienceOfUserById.upVote.filter(
          (item) => item !== userId,
        );
        const totalUpvote = await this.usedTourExperienceOfUserRepository.save({
          ...findExperienceOfUserById,
          upVote: [...updateUpVoteExistUserId],
        });
        return totalUpvote.upVote.length - 1;
      } else {
        const updateUpvote = await this.usedTourExperienceOfUserRepository.save(
          {
            ...findExperienceOfUserById,
            upVote: [...findExperienceOfUserById.upVote, userId],
          },
        );
        return updateUpvote.upVote.length - 1;
      }
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
  // automatic update Status
  // @Cron('0 14 * * *')
  @Cron(' 0 14 * * *')
  async updateStatusTourAutomatic() {
    const currentDate = new Date();
    // eslint-disable-next-line prefer-const
    let getAllTour;
    try {
      let tourCache = await this.redisService.get('tourView');
      if (tourCache) {
        tourCache = getAllTour;
      }
      getAllTour = await this.tourRepository.findAll({
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
        //Ending
        if (currentDate > x.endDate) {
          await this.tourRepository.save({ ...x, status: TourStatus.DONE });
        }
      }
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
  // @Cron('0 14 * * *')
}

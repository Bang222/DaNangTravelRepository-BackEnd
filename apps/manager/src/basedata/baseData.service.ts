import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  CartRepositoryInterface,
  CommentRepositoryInterface,
  OrderDetailRepositoryInterface,
  OrderRepositoryInterface,
  PassengerRepositoryInterface,
  ScheduleRepositoryInterface,
  ShareExperienceRepositoryInterface,
  StoreEntity,
  StoreRepositoryInterface,
  TourRepositoryInterface,
  UsersRepositoryInterface,
} from '@app/shared';
import * as bcrypt from 'bcrypt';
import { USER } from '@app/shared/models/seeds/base';
import { Role, TourStatus } from '@app/shared/models/enum';
import * as process from "process";

@Injectable()
export class BaseDataService {
  // private initializationFlag = false;
  constructor(
    @Inject('StoreRepositoryInterface')
    private readonly storeRepository: StoreRepositoryInterface,
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
  ) {}
  async onModuleInit() {
    try {
      console.log('Data seeding started');
      await Promise.all([this.userData(), this.store()]);
      console.log('Data seeding completed');
    } catch (error) {
      console.error('Data seeding error:', error);
    }
  }
  async userData():Promise<any> {
    try {
      const password = await bcrypt.hash('123', 10);
      for (let i = 0; i < 500; i++) {
        const randomMonthUser = Math.floor(Math.random() * 12);

        // Generate a random day within the month (1-28 to simplify)
        const randomDayUser = Math.floor(Math.random() * 28) + 1;

        // Create a new Date object with the random month and day
        const createdAtDataUser = new Date();
        createdAtDataUser.setFullYear(
          createdAtDataUser.getFullYear(),
          randomMonthUser,
          randomDayUser,
        );
        const user = await this.usersRepository.save({
          firstName: USER.firstName,
          lastName: USER.lastName,
          password: password,
          email: `user${i}@gmail.com`,
          phone: '1234567890',
          createdTime: createdAtDataUser,
          isActive: USER.isActive,
          isEmailValidated: true,
          address: USER.address,
          profilePicture: USER.profilePicture,
          role: Role.USER,
        });
        const imageURL = [
          'https://owa.bestprice.vn/images/articles/uploads/review-kinh-nghiem-tham-quan-khu-du-lich-hoa-bac-da-nang-tu-a-z-5f452e4006739.jpg',
          'https://banahills.sunworld.vn/wp-content/uploads/2018/08/lam-mua-lam-gio-tai-viet-nam-chua-du-cau-vang-tiep-tuc-chinh-phuc-the-gioi-1206-768x432.jpg',
          'https://thuathienhue.gov.vn/Portals/0/Medias/Nam2018/T11/tuduc4.jpg',
          'https://statics.vinpearl.com/khu-du-lich-sinh-thai-suoi-hoa-2_1634368484.jpg',
          'https://res.klook.com/image/upload/c_fill,w_1265,h_712/q_80/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/hsnmkdasrhwmvng1yrht.webp',
          'https://res.klook.com/image/upload/c_fill,w_1265,h_712/q_80/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/hsnmkdasrhwmvng1yrht.webp',
          'https://vietravelasia.com/api/files/d-0103210722-HUE%20(2)_1.jpg',
        ];
        const content = [
          'Hồ Điệp Khê hay còn có tên gọi quen thuộc là Điệp Khê Hải Tử, là một trong những danh lam thắng cảnh cấp tỉnh ở Tứ Xuyên, Trung Quốc. Nằm ở huyện Mao, thuộc khu tự trị người Tạng và người Khương Aba lớn nhất ở Trung Quốc. Và tọa lạc dưới chân núi Minshan ở thượng nguồn sông Minjiang. Vậy nên nới đây hội tụ biết bao thắng cảnh của núi non, sông nước và đất trời Tứ Xuyên.\n' +
            'Đối với người dân địa phương cũng như khách du lịch nội địa và quốc tế từng có dịp ghé thăm. Thì hồ Điệp Khê chính là một cảnh quan độc đáo có 1-0-2. Cũng là di sản thiên nhiên thế giới thuộc Thung lũng Cửu Trại Câu và khu du lịch Hoàng Long nổi danh khắp vùng ai ai cũng biết. Vậy nên, nếu bạn đang có ý định du lịch Trung Quốc nói chung hay Tứ Xuyên nói riêng thì đừng bỏ qua thắng cảnh tuyệt đẹp này nhé.',
          'Trường THPT chuyên Quốc Học Huế là một trong những trường trung học lâu đời nhất của Việt Nam.   Trường tự hào là mái nhà chung của rất nhiều học sinh của tỉnh Thừa Thiên Huế và một số tỉnh lân cận. Trường Quốc học có lịch sử lâu đời, đã đào tạo ra nhiều danh tài cho đất nước. Từng là nơi theo học và giảng dạy của chủ tich Hồ Chí Minh. \n' +
            'Tháng 3/1990, trường được công nhận là Di tích lịch sử văn hóa cấp quốc gia. Đến năm 2021, trường tiếp tục được',
          'Không chỉ là ngôi làng về văn hóa, mà còn là cảm xúc của những người đi, người ở lại. Đâu đó cách Hà Nội khoảng 50km, có sự xuất hiện của một nơi mà chúng ta có thể nhìn - cảm - thấu được những nét văn hóa đặc trưng của từng vùng miền, từng dân tộc, về những câu chuyện, về những nghề.\n' +
            '  Dạo bước qua từng khu vực, tôi được chứng kiến những buổi biểu diễn văn nghệ truyền thống, cảm nhận không gian sống văn hóa độc đáo của từng bộ lạc. Những ngôi nh',
          'Sài Gòn là một thành phố năng động và sôi động với nhiều điểm tham quan hấp dẫn. Mùa cuối năm là thời điểm lý tưởng để du lịch Sài Gòn, khi thời tiết mát mẻ, dễ chịu, thích hợp cho các hoạt động ngoài trời. Dưới đây là một số gợi ý địa điểm du lịch Sài Gòn mùa cuối năm dành cho người lần đầu đến thành phố này.\n' +
            '\n' +
            'Thảo Cầm Viên\n' +
            'Thảo Cầm Viên Sài Gòn là một trong những vườn thú lâu đời và lớn nhất ở Việt...',
          'Được biết là một thành phố lịch sử - văn hóa nổi tiếng, Tô Châu “cất giữ” nhiều di sản có giá trị cao của Trung Hoa đại lục và xem đó như là một sự kế thừa vinh quang của lịch sử dân tộc. Trong đó phải kể đến Lụa Tô Châu – Một trong những di sản văn hóa phi vật thể nổi tiếng khắp muôn nơi. Nhắc đến Tô Châu không ai không nghĩ tới Lụa và người lại. Vậy nên thật không nói quá khi sử sách chép lại nơi...',
        ];
        const title = [
          'Ho diep khe',
          'Trường THPT chuyên Quốc Học Huế',
          'ngoi lang van hoa',
          'sai gon cuoi nam',
          'lua to chau',
        ];
        const randomContent = this.getRandomIndex(content.length);
        const random = this.getRandomIndex(imageURL.length);
        for (let j = 0; j < 3; j++) {
          await this.usedTourExperienceOfUserRepository.save({
            imgUrl: imageURL[random],
            title: title[randomContent],
            content: content[randomContent],
            userId: user.id,
            anonymous: false,
          });
        }
      }
    } catch (e) {
      return e;
    }
  }
  getRandomIndex(max): number {
    return Math.floor(Math.random() * max);
  }
  async store() {
    try {
      const password = await bcrypt.hash('123', 10);
      for (let i = 0; i < 100; i++) {
        const randomMonthStore = Math.floor(Math.random() * 12);

        // Generate a random day within the month (1-28 to simplify)
        const randomDayStore = Math.floor(Math.random() * 28) + 1;

        const createdAtDataStore = new Date();
        createdAtDataStore.setFullYear(
          createdAtDataStore.getFullYear(),
          randomMonthStore,
          randomDayStore,
        );
        const user = await this.usersRepository.save({
          firstName: USER.firstName,
          lastName: USER.lastName,
          password: password,
          email: `store${i}@gmail.com`,
          phone: '1234567890',
          isActive: USER.isActive,
          isEmailValidated: true,
          createdTime: createdAtDataStore,
          address: USER.address,
          profilePicture: USER.profilePicture,
          role: Role.SELLER,
        });
        const nameStore = [
          'Dong Giang',
          'Viet Travel',
          'Dumbledore',
          'Harry Porter',
        ];
        const slogan = [
          'We feel travel',
          'Travel’s in our blood',
          'Time to travel',
          'Let’s go',
        ];
        const randomNameStore = this.getRandomIndex(nameStore.length);
        const randomSlogan = this.getRandomIndex(slogan.length);
        const store = new StoreEntity();
        store.userId = user.id;
        store.name = nameStore[randomNameStore];
        store.slogan = slogan[randomSlogan];
        store.createdAt = createdAtDataStore;
        store.paymentId = "ATtq4NPFbuB8-MlfYR1n9avUvBiVlv2bcb0_GSst9HP3eKiJ9r5lXjOsQKI1sALqUV0TXN_85l9KuddV"
        const storeCreated = await this.storeRepository.save(store);

        const nameTour = [
          'DA NANG – HUE',
          'HUE–OLD CITADEL–HOIAN',
          'HOI AN ANCIENT TOWN–DANANG',
          'BANA-HOIAN',
          'HOA BAC CAMP',
          'DONG GIANG-TAY GIANG',
          'NUI THAN TAI-SUOI HOA',
        ];
        const description = [
          'Upon arrival at Danang International Airport, our representative will meet the group at the airport.\n' +
            '\n' +
            '\n' +
            'Lunch at a local restaurant.\n' +
            '\n' +
            '\n' +
            "Transfer to Hue via Hai Van, en route stopover on top of Hai Van Pass for photo shooting. Hai Van pass is the harmony of clouds & ocean, where the mountains meet the East Ocean and the view are spectacular. On Hue's arrival, Visit Dong Ba market.\n" +
            '\n' +
            '\n' +
            'Visit Thien Mu pagoda – Hue’s symbol. From Thien Mu take a boat trip downstream to Trang Tien Bridge.\n' +
            '\n' +
            '\n' +
            'Check-in hotel and overnight at Hue.\n' +
            '\n',
          'Breakfast at the hotel\n' +
            '\n' +
            '\n' +
            'Take jaunt to discover Hue Citadel: Imperial Citadel including Flag Tower, Ngo Mon Gate, Nine Dynastic Urns, Nine Holy Cannons, Thai Hoa Palace, Forbidden Purple City.\n' +
            '\n' +
            '\n' +
            'Afternoon, visit the tombs of Khai Dinh King.\n' +
            '\n' +
            '\n' +
            'Lunch at a local restaurant.\n' +
            '\n' +
            '\n' +
            'Proceed to Hoi An and check in at hotel for relaxation \n' +
            '\n' +
            '\n' +
            'Overnight in Hoi An.',
          'Breakfast at hotel\n' +
            '\n' +
            '\n' +
            'Visit Hoi An Ancient Town, stroll around the charming old town, and visit ancient houses, local markets, traditional handicraft workshops, the Chinese community’s assembly halls, and the Japanese Bridge Pagoda. \n' +
            '\n' +
            '\n' +
            'After lunch, transfer back to Danang for check-in and relaxation.\n' +
            '\n' +
            '\n' +
            'Overnight in Danang.\n' +
            '\n' +
            'Included meals:\n' +
            ' \n' +
            'Breakfast\n' +
            'Accommodation:\n' +
            ' \n' +
            'Hotel\n' +
            'Included activities:\n' +
            'Visit Hoi An Ancient Town: visit ancient houses, local markets, traditional handicraft workshops, the Chinese community’s assembly halls, and the Japanese Bridge Pagoda\n' +
            'Pick-up point:\n' +
            ' \n' +
            'Hotel',
          'Hoi An Ancient town is located in Viet Nam’s central Quang Nam Province, on the north bank near the mouth of the Thu Bon River. The inscribed property comprises 30 ha and it has a buffer zone of 280 ha. It  is an exceptionally well-preserved example of a small-scale trading port active the 15th to 19th centuries  which traded widely, both with the countries of Southeast and East Asia and with the rest of the world. Its decline in the later 19th century ensured that it has retained its traditional urban tissue to a remarkable degree.\n' +
            '\n' +
            'The town reflects a fusion of indigenous and foreign cultures (principally Chinese and Japanese with later European influences) that combined to produce this unique survival. ',
          'Breakfast at hotel\n' +
            '\n' +
            '\n' +
            'Enjoy a trip on the cable car which has received many Guinness World Records such as the longest single-wire cable car system (5,771.61m), and the highest difference between departure and arrival terminals (1,368.93m)… Contemplate the grandeur of the mountain and the green forests below. \n' +
            '\n' +
            ' \n' +
            '\n' +
            'Free to take part in games at Fantasy Park - the indoor theme park which satisfies the entertainment demands of all ages, featuring amusing games for children to X-games for adults (except Wat Showroom & Carnival Skills). All will bring you the adventurous feeling as in the fairyland and wonderful experiences with four seasons in one day and an abundant fauna and flora system.\n' +
            '\n',
          'Khu du lịch Hòa Bắc cách trung tâm thành phố Đà Nẵng tầm 30km về hướng Tây Bắc. Một vùng đất đẹp và yên bình khép mình ở nơi khá xa trung tâm thành phố. Do vậy, trước kia, Hòa Bắc rất ít được các du khách để mắt đến. Tuy nhiên hiện nay, khi trào lưu du lịch bụi lên ngôi, các phượt thủ có xu hướng tìm về những nơi mang nét đẹp hoang sơ, thì Hòa Bắc lại là địa điểm ấn tượng thu hút bước chân con người đến thăm thú.\n' +
            '\n' +
            'Cung đường đến với khu du lịch nổi tiếng Đà Nẵng - Hòa Bắc như băng qua núi rừng rất đẹp và thú vị. Nên nếu bạn lựa chọn di chuyển bằng xe máy sẽ có cơ hội trải nghiệm nhiều nhất. Vừa chạy xe vừa ngắm cảnh, nếu thích có thể dừng lại check in vài kiểu ảnh.',
          'Ẩn mình giữa những cánh rừng bạt ngàn, ở nơi đây chúng ta thường bắt gặp những mái nhà Gươl vươn cao biểu hiện cho sự sung túc và thanh bình của làng. Vốn rất yêu nghệ thuật, kiến trúc nhà Gươl đã đạt đến đỉnh cao trong nghệ thuật tạo hình.Đến đây, bạn có thể cùng với dân làng học dệt thổ cẩm, học đan lát,… bạn còn có cơ hội được tận mắt chứng kiến những công đoạn để làm ra những tấm thảm dệt thổ cẩm rất là cầu kỳ.',
          "Tucked inside the Ba Na-Nui Chua Nature Reserve, Nui Than Tai Hot Springs Park is a nature and water park lover haven providing every guest with an exciting and relaxing experience. Surrounded by mountains, the park is blessed with a panoramic view of the lush green forest and various mineral-rich hot springs and streams. Heal and release the tensions in your body naturally in the mud bathing area or experience the unique traditional Japanese bath, Onsen, to discover its abundant health benefits. For fun and thrill-seekers, the park includes many exciting attractions like a mountainside wave pool, twisting swimming pool slides, and Long Tien Cave, to name a few! The complimentary 9D to 12D movie experience is something you shouldn't miss while staying in the park",
        ];
        const randomNameTour = this.getRandomIndex(nameTour.length);
        const price: number[] = [1.2, 20, 200, 50, 7, 9, 12];
        const AddressRandom = [
          'Ha Noi',
          'Ho Chi Minh',
          'Dong Nai',
          'Dong Thap',
          'Gia Lai',
          'Khanh Hoa',
          'Kien Giang',
        ];
        const imageURL = [
          'https://owa.bestprice.vn/images/articles/uploads/review-kinh-nghiem-tham-quan-khu-du-lich-hoa-bac-da-nang-tu-a-z-5f452e4006739.jpg',
          'https://banahills.sunworld.vn/wp-content/uploads/2018/08/lam-mua-lam-gio-tai-viet-nam-chua-du-cau-vang-tiep-tuc-chinh-phuc-the-gioi-1206-768x432.jpg',
          'https://thuathienhue.gov.vn/Portals/0/Medias/Nam2018/T11/tuduc4.jpg',
          'https://statics.vinpearl.com/khu-du-lich-sinh-thai-suoi-hoa-2_1634368484.jpg',
          'https://res.klook.com/image/upload/c_fill,w_1265,h_712/q_80/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/hsnmkdasrhwmvng1yrht.webp',
          'https://res.klook.com/image/upload/c_fill,w_1265,h_712/q_80/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/hsnmkdasrhwmvng1yrht.webp',
          'https://vietravelasia.com/api/files/d-0103210722-HUE%20(2)_1.jpg',
        ];
        const randomSecondPicture = this.getRandomIndex(imageURL.length);
        const randomThirdPicture = this.getRandomIndex(imageURL.length);
        // Generate a random month from 0 (January) to 11 (December)
        for (let j = 0; j < 50; j++) {
          const randomMonth = Math.floor(Math.random() * 11) + 1;

          // Generate a random day within the month (1-28 to simplify)
          const randomDay = Math.floor(Math.random() * 28) + 1;

          // Create a new Date object with the random month and day
          const createdAtData = new Date();
          createdAtData.setFullYear(
            createdAtData.getFullYear(),
            randomMonth,
            randomDay,
          );
          const day = this.getRandomIndex(20);
          const month = this.getRandomIndex(11);
          const totalDay = this.getRandomIndex(7);
          const year = 2023; // You can specify the year
          const tour = await this.tourRepository.save({
            storeId: storeCreated.id,
            name: nameTour[randomNameTour],
            description: description[randomNameTour],
            baseQuantity: 30,
            quantity: 0,
            lastRegisterDate: new Date(year, month, day),
            startDate: new Date(year, month, day + 2),
            endDate: new Date(year, month, day + 2 + totalDay),
            price: price[randomNameTour] * 1000000,
            address: 'Da Nang',
            createdAt: createdAtData,
            startAddress: AddressRandom[randomNameTour],
            endingAddress: AddressRandom[randomNameTour],
            imageUrl: [
              imageURL[randomNameTour],
              imageURL[randomSecondPicture],
              imageURL[randomThirdPicture],
            ],
          });
          const start: Date = new Date(tour.startDate);
          const end: Date = new Date(tour.endDate);
          const timeDifference: number = end.getTime() - start.getTime();
          const totalDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
          for (let sch = 0; sch < totalDays; sch++) {
            await this.scheduleRepository.save({
              day: sch + 1,
              title: nameTour[randomNameTour],
              description: description[randomNameTour],
              tourId: tour.id,
            });
          }
          const dataBooking = [
            {
              email: 'bang1@gmail.com',
              adultPassengers: 1,
              childPassengers: 2,
              phone: '+123456789',
              fullName: 'Mai',
              firstName: 'Thao',
              toddlerPassengers: 2,
              infantPassengers: 1,
              address: 'Da Nang',
              passenger: [
                {
                  name: 'Danh Cong Ly',
                  type: 'Adult',
                  sex: 'Men',
                  dayOfBirth: 20,
                },
                {
                  name: 'Danh Cong Ly',
                  type: 'Toddler',
                  sex: 'Women',
                  dayOfBirth: 12,
                },
                {
                  name: 'Danh ',
                  type: 'Child',
                  sex: 'Women',
                  dayOfBirth: 12,
                },
                {
                  name: 'Bang Danh ',
                  type: 'Child',
                  sex: 'Men',
                  dayOfBirth: 12,
                },
                {
                  name: 'Danh Cong',
                  type: 'Infant',
                  sex: 'Men',
                  dayOfBirth: 1,
                },
              ],
            },
            {
              email: 'bang2@gmail.com',
              adultPassengers: 1,
              childPassengers: 2,
              phone: '+123456789',
              fullName: 'Danh',
              firstName: 'Bang',
              toddlerPassengers: 2,
              infantPassengers: 1,
              address: 'Da Nang',
              passenger: [
                {
                  name: 'Bang Danh',
                  type: 'Adult',
                  sex: 'Men',
                  dayOfBirth: 20,
                },
                {
                  name: 'Tu Tinh',
                  type: 'Toddler',
                  sex: 'Women',
                  dayOfBirth: 12,
                },
                {
                  name: 'Name ',
                  type: 'Child',
                  sex: 'Women',
                  dayOfBirth: 12,
                },
                {
                  name: 'Hary potter ',
                  type: 'Child',
                  sex: 'Men',
                  dayOfBirth: 12,
                },
                {
                  name: 'Dumbledore',
                  type: 'Infant',
                  sex: 'Men',
                  dayOfBirth: 1,
                },
              ],
            },
            {
              email: 'bang3@gmail.com',
              adultPassengers: 1,
              childPassengers: 2,
              phone: '+1231',
              fullName: 'John',
              firstName: 'Wick',
              toddlerPassengers: 2,
              infantPassengers: 1,
              address: 'Da Nang',
              passenger: [
                {
                  name: 'Bang Danh',
                  type: 'Adult',
                  sex: 'Men',
                  dayOfBirth: 20,
                },
                {
                  name: 'Tu Tinh',
                  type: 'Toddler',
                  sex: 'Women',
                  dayOfBirth: 12,
                },
                {
                  name: 'Winston ',
                  type: 'Child',
                  sex: 'Women',
                  dayOfBirth: 12,
                },
                {
                  name: 'Hary potter ',
                  type: 'Child',
                  sex: 'Men',
                  dayOfBirth: 12,
                },
                {
                  name: 'Dumbledore',
                  type: 'Infant',
                  sex: 'Men',
                  dayOfBirth: 1,
                },
              ],
            },
          ];
          const randomDataBooking:number = this.getRandomIndex(dataBooking.length);
          const quantity =
            dataBooking[randomDataBooking].adultPassengers +
            dataBooking[randomDataBooking].childPassengers +
            dataBooking[randomDataBooking].toddlerPassengers +
            dataBooking[randomDataBooking].infantPassengers;
          const totalPrice =
            Number(dataBooking[randomDataBooking].adultPassengers) *
              Number(tour.price) +
            +dataBooking[randomDataBooking].childPassengers * +tour.price +
            +dataBooking[randomDataBooking].toddlerPassengers *
              0.7 *
              +tour.price +
            +dataBooking[randomDataBooking].infantPassengers *
              0.15 *
              +tour.price;
          const findAllUser = await this.usersRepository.findAll();
          const randomDataUser = this.getRandomIndex(findAllUser.length);
          const userId = findAllUser[randomDataUser].id;
          const dataOrder = await this.orderRepository.save({
            createdAt: createdAtData,
            firstName: dataBooking[randomDataBooking].firstName, // Use dot notation
            fullName: dataBooking[randomDataBooking].fullName, // Use dot notation
            email: dataBooking[randomDataBooking].email, // Use dot notation
            address: dataBooking[randomDataBooking].address, // Use dot notation
            phone: dataBooking[randomDataBooking].phone, // Use dot notation
            totalPrice: Number(totalPrice.toFixed(2)),
            participants: +quantity,
            userId: userId,
            storeId: tour.storeId,
            status: 'CONFIRMED',
          });
          const {
            firstName,
            fullName,
            email,
            address,
            passenger,
            phone,
            ...orderDetailFilter
          } = dataBooking[randomDataBooking];
          const orderDetailData = await this.orderDetailRepository.save({
            ...orderDetailFilter,
            tourId: tour.id,
            orderId: dataOrder.id,
          });
          const dataToSave = dataBooking[randomDataBooking].passenger.map(
            (passenger) => ({
              ...passenger,
              orderDetailId: orderDetailData.id, // Add the orderId to each passenger
            }),
          );
          await this.orderRepository.save({
            ...dataOrder,
            orderDetailId: orderDetailData.id,
          });

          await this.passengerRepository.saveMany(dataToSave);
          const updateQuantity = await this.tourRepository.save({
            ...tour,
            quantity: +tour.quantity + Number(quantity),
          });
          if (updateQuantity.baseQuantity - updateQuantity.quantity < 1) {
            await this.tourRepository.save({
              ...updateQuantity,
              status: TourStatus.FULL,
            });
          }
        }
      }
    } catch (e) {
      return e;
    }
  }
}

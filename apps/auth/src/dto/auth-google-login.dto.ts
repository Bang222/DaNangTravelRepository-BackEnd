import { IsNotEmpty } from 'class-validator';

// export class AuthGoogleLoginDto {
//   @IsNotEmpty()
//   idToken: string;
// }
export interface UserInfoGoogle {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  email: string;
  email_verified: boolean;
  picture: string;
  locale: string;
}

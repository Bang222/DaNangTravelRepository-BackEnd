// export const ERROR_TYPE:StatusCodeDTO = {
//     statusCode: 401,
//     message:"Failed"
// }
export const OKE:StatusCodeDTO = {
    statusCode: 200,
    message:"Success"
}
export interface StatusCodeDTO {
    statusCode:number,
    message:string
}
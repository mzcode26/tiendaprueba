import { SetMetadata } from '@nestjs/common';

export const API_RESPONSE_KEY = 'apiResponse';
export const ApiResponse = () => SetMetadata(API_RESPONSE_KEY, true);

import { JwtPayload } from '../../modules/auth/types/jwt-payload.type';
import 'multer';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        tenantId: string;
        permissions: string[];
        refreshToken?: string;
      };
    }
  }
}

declare global {
  namespace Express {
    interface Multer {
      File: import('multer').File;
    }
  }
}
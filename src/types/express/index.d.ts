import { TokenPayload } from "../../utils/auth/generateToken.js";

declare global {
  namespace Express {
    interface Request {
      user: TokenPayload;
    }
  }
}

export {};

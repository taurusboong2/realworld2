import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { env } from '../constants/env';
import type { OptionalAuthenticatedRequest } from '../types/auth';
import { extractCookieValue } from '../utils/cookie';

type JwtPayload = {
  sub?: unknown;
  exp?: unknown;
};

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<OptionalAuthenticatedRequest>();
    const token = extractCookieValue(request, env.authCookieName);

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    const userId = this.verifyToken(token);
    request.user = { id: userId };

    return true;
  }

  private verifyToken(token: string): number {
    const [header, payload, signature] = token.split('.');

    if (!header || !payload || !signature) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const expectedSignature = createHmac('sha256', env.jwtSecret)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (!this.isSameSignature(signature, expectedSignature)) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const verifiedPayload = this.parsePayload(payload);
    const userId =
      typeof verifiedPayload.sub === 'string'
        ? Number(verifiedPayload.sub)
        : verifiedPayload.sub;

    if (typeof userId !== 'number' || !Number.isInteger(userId)) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    if (
      typeof verifiedPayload.exp === 'number' &&
      verifiedPayload.exp < Math.floor(Date.now() / 1000)
    ) {
      throw new UnauthorizedException('Expired authentication token');
    }

    return userId;
  }

  private parsePayload(payload: string): JwtPayload {
    try {
      const parsed = JSON.parse(
        Buffer.from(payload, 'base64url').toString('utf8'),
      ) as unknown;

      if (typeof parsed !== 'object' || parsed === null) {
        throw new UnauthorizedException('Invalid authentication token');
      }

      return parsed as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid authentication token');
    }
  }

  private isSameSignature(signature: string, expectedSignature: string): boolean {
    const signatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    return (
      signatureBuffer.length === expectedSignatureBuffer.length &&
      timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
    );
  }
}

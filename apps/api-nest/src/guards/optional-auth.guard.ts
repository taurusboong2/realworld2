import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { env } from '../constants/env';
import type { OptionalAuthenticatedRequest } from '../types/auth';
import { extractCookieValue } from '../utils/cookie';

type JwtPayload = {
  sub?: unknown;
  exp?: unknown;
};

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<OptionalAuthenticatedRequest>();
    const token = extractCookieValue(request, env.authCookieName);

    if (!token) {
      return true;
    }

    const userId = this.verifyToken(token);

    if (userId !== undefined) {
      request.user = { id: userId };
    }

    return true;
  }

  private verifyToken(token: string): number | undefined {
    const [header, payload, signature] = token.split('.');

    if (!header || !payload || !signature) {
      return undefined;
    }

    const expectedSignature = createHmac('sha256', env.jwtSecret)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (!this.isSameSignature(signature, expectedSignature)) {
      return undefined;
    }

    const verifiedPayload = this.parsePayload(payload);
    if (!verifiedPayload) {
      return undefined;
    }

    const userId =
      typeof verifiedPayload.sub === 'string'
        ? Number(verifiedPayload.sub)
        : verifiedPayload.sub;

    if (typeof userId !== 'number' || !Number.isInteger(userId)) {
      return undefined;
    }

    if (
      typeof verifiedPayload.exp === 'number' &&
      verifiedPayload.exp < Math.floor(Date.now() / 1000)
    ) {
      return undefined;
    }

    return userId;
  }

  private parsePayload(payload: string): JwtPayload | undefined {
    try {
      const parsed = JSON.parse(
        Buffer.from(payload, 'base64url').toString('utf8'),
      ) as unknown;

      if (typeof parsed !== 'object' || parsed === null) {
        return undefined;
      }

      return parsed as JwtPayload;
    } catch {
      return undefined;
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

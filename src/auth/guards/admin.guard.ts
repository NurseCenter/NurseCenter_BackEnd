import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersDAO } from 'src/users/users.dao';

// 관리자 권한이 있는 회원만 접근 허용
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly usersDAO: UsersDAO) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request?.user?.userId;
    const user = await this.usersDAO.findUserByUserId(userId);

    if (!userId) {
      throw new NotFoundException('회원 ID가 없습니다. 로그인이 필요합니다.');
    }

    if (!user || !user.isAdmin) {
      throw new ForbiddenException('관리자 권한이 없습니다.');
    }

    return true;
  }
}

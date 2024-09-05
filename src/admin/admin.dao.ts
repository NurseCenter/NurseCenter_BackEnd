import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeletedUsersEntity, SuspendedUsersEntity } from './entities';
import { UsersEntity } from 'src/users/entities/users.entity';
import { EMembershipStatus } from 'src/users/enums';
import { PostsEntity } from 'src/posts/entities/base-posts.entity';
import { CommentsEntity } from 'src/comments/entities/comments.entity';
import { RepliesEntity } from 'src/replies/entities/replies.entity';

@Injectable()
export class AdminDAO {
  constructor(
    @InjectRepository(DeletedUsersEntity)
    private readonly deletedUsersRepository: Repository<DeletedUsersEntity>,
    @InjectRepository(SuspendedUsersEntity)
    private readonly suspendedUsersRepository: Repository<SuspendedUsersEntity>,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(PostsEntity)
    private readonly postsRepository: Repository<PostsEntity>,
    @InjectRepository(CommentsEntity)
    private readonly commentsRepository: Repository<PostsEntity>,
    @InjectRepository(RepliesEntity)
    private readonly repliesEntity: Repository<PostsEntity>,
  ) {}

  // 회원 탈퇴 시 DeletedUsersEntity에 새로운 객체를 생성
  async createDeletedUser(userId: number): Promise<DeletedUsersEntity> {
    const newDeletedUser = this.deletedUsersRepository.create({ userId });
    return newDeletedUser;
  }

  // DeletedUsersEntity에 저장
  async saveDeletedUser(deletedUserEntity: DeletedUsersEntity): Promise<DeletedUsersEntity> {
    return await this.deletedUsersRepository.save(deletedUserEntity);
  }

  // 회원 정지 시 SuspendedUsersEntity에 새로운 엔티티 객체를 생성
  async createSuspendedUser(userId: number): Promise<SuspendedUsersEntity> {
    const newSuspendedUser = this.suspendedUsersRepository.create({ userId });
    return newSuspendedUser;
  }

  // SuspendedUsersEntity에 저장
  async saveSuspendedUser(suspendedUserEntity: SuspendedUsersEntity): Promise<SuspendedUsersEntity> {
    return await this.suspendedUsersRepository.save(suspendedUserEntity);
  }

  // 페이지네이션 회원 조회
  async findUsersWithDetails(page: number, pageSize: number = 10): Promise<[any[], number]> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.posts', 'posts')
      .leftJoinAndSelect('user.comments', 'comments')
      .select([
        'user.userId',
        'user.nickname',
        'user.email',
        'user.createdAt',
        'COUNT(posts.id) AS postCount', // 게시물 수
        'COUNT(comments.id) AS commentCount', // 댓글 수
      ])
      .groupBy('user.userId')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [rawUsers, total] = await Promise.all([queryBuilder.getRawMany(), this.countTotalUsers()]);

    return [rawUsers, total];
  }

  // 정지된 회원 조회
  async findSuspendedUsers() {
    return this.suspendedUsersRepository.find();
  }

  // 탈퇴된 회원 조회
  async findDeletedUsers() {
    return this.deletedUsersRepository.find();
  }

  // 전체 사용자 수 계산
  async countTotalUsers(): Promise<number> {
    const result = await this.usersRepository
      .createQueryBuilder('user')
      .select('COUNT(user.userId)', 'total')
      .getRawOne();
    return Number(result.total);
  }

  // 승인 대기중, 승인 거절당한 회원 조회
  async findPendingAndRejectVerifications(pageNumber: number, pageSize: number = 10): Promise<[UsersEntity[], number]> {
    return this.usersRepository.findAndCount({
      where: [{ membershipStatus: EMembershipStatus.PENDING_VERIFICATION }, { rejected: false }],
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // 게시물 관리 페이지 데이터 조회
  async findAllPosts(pageNumber: number, pageSize: number): Promise<[PostsEntity[], number]> {
    return this.postsRepository.findAndCount({
      where: { deletedAt: null },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
  }

  // 특정 게시물 삭제
  async deletePost(postId: number): Promise<void> {
    await this.postsRepository.update(postId, { deletedAt: new Date() });
  }
}
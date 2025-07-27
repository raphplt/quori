import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../github/entities/post.entity';
import { LinkedinAuthService } from '../linkedin-auth/linkedin-auth.service';
import { LinkedInApi } from './linkedin.api';
import { UsersService } from '../users/users.service';

@Injectable()
export class LinkedinPublisherService {
  constructor(
    @InjectRepository(Post) private readonly posts: Repository<Post>,
    private readonly auth: LinkedinAuthService,
    @Inject('LinkedInApi') private readonly api: LinkedInApi,
    private readonly usersService: UsersService,
  ) {}

  async publish(userId: string, postId: number) {
    const post = await this.posts.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const token = await this.auth.getToken(userId);
    if (!token) {
      throw new Error('No LinkedIn token');
    }

    const user = await this.usersService.findById(userId);
    if (!user?.linkedInId) {
      throw new Error('No LinkedIn ID found for user');
    }

    try {
      const res = await this.api.createPost(
        token,
        post.postContent,
        user.linkedInId,
        'urn:li:person:',
      );

      post.statusLinkedin = 'published';
      post.externalId = res.id;
    } catch (err) {
      post.statusLinkedin = 'failed';
      throw new Error(`Failed to publish on LinkedIn: ${err.message}`);
    }

    await this.posts.save(post);
    return post;
  }
}

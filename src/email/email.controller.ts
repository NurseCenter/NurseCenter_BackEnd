import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('test-email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  // 테스트용 이메일 발송
  @ApiOperation({ summary: '이메일 인증 발송' })
  @ApiBody({
    description: '이메일 주소',
    type: String,
    examples: {
      example: { value: 'test@example.com' },
    },
  })
  @ApiResponse({
    status: 200,
    description: '이메일 발송 성공',
    schema: {
      example: { message: '이메일 발송이 완료되었습니다.', email: 'test@example.com' },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  @Post()
  async sendVerificationEmail(@Body() body: { email: string }): Promise<{ message: string; email: string }> {
    const { email } = body;
    await this.emailService.sendEmailForTest(email);
    console.log('email', email);
    return { message: '이메일 발송이 완료되었습니다.', email };
  }
}

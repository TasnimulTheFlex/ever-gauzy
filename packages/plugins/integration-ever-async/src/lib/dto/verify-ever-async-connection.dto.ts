import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

export class VerifyEverAsyncConnectionDto {
	@ApiProperty({ example: 'https://async.example.com' })
	@IsNotEmpty()
	@IsUrl({ protocols: ['https'], require_protocol: true })
	readonly serverUrl!: string;
}

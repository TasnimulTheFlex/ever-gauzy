import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, IsUUID, MaxLength, Matches } from 'class-validator';

/** A workspace-scoped chat identity mapped to an employee in this Gauzy organization. */
export class EverAsyncUserMappingDto {
	@ApiProperty({ enum: ['slack', 'discord'] })
	@IsIn(['slack', 'discord'])
	readonly channel!: 'slack' | 'discord';

	@ApiProperty({ description: 'Verified Slack workspace ID or Discord server ID from Base360 Async Connections' })
	@IsString()
	@Matches(/^[^\s]{1,200}$/)
	readonly workspace!: string;

	@ApiProperty({
		description: 'Chat platform user id (e.g. a Slack member id)',
		example: 'U0123ABC'
	})
	@IsNotEmpty()
	@IsString()
	@MaxLength(200)
	@Matches(/^[^\s]+$/)
	readonly chatUserId!: string;

	@ApiProperty({
		description: 'Base360 employee id the chat user maps to',
		example: 'b1f2c3d4-0000-0000-0000-000000000000'
	})
	@IsNotEmpty()
	@IsUUID()
	readonly employeeId!: string;
}

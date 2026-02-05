import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TrackState } from './track-response.dto';

export class UpdateTrackDto {
  @ApiProperty({ description: 'Estado atual da obra', enum: TrackState, required: false })
  @IsOptional()
  @IsEnum(TrackState)
  state?: TrackState;

  @ApiProperty({ description: 'Hash dos metadados (IPFS ou similar)', required: false })
  @IsOptional()
  @IsString()
  metadataHash?: string;
}

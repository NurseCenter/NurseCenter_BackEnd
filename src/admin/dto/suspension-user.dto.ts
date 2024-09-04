import { IsNotEmpty, IsString } from "class-validator";
import { ESuspensionDuration } from "../enums";

export class SuspensionUserDto {
    @IsString()
    @IsNotEmpty()
    readonly userId: number;

    @IsString()
    @IsNotEmpty()
    readonly suspensionReason: string;

    @IsString()
    @IsNotEmpty()
    readonly suspensionDuration: ESuspensionDuration;
}
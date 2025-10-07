import { Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(payload: any): Promise<{
        id: string;
        name: string;
        email: string;
        passwordHash: string | null;
        role: string;
        profileCompleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};

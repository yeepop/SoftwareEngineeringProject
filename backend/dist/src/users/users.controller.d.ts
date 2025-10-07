import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<any>;
    getUser(id: string): Promise<{
        id: string;
        name: string;
        email: string;
        role: string;
        profileCompleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}

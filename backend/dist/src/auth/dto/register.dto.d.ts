export declare enum UserRole {
    ADOPTER = "adopter",
    OWNER = "owner",
    ADMIN = "admin"
}
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}

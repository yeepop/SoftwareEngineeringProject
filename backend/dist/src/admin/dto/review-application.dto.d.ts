declare enum ReviewAction {
    approve = "approve",
    reject = "reject"
}
export declare class ReviewApplicationDto {
    action: ReviewAction;
    notes?: string;
}
export {};

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewApplicationDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var ReviewAction;
(function (ReviewAction) {
    ReviewAction["approve"] = "approve";
    ReviewAction["reject"] = "reject";
})(ReviewAction || (ReviewAction = {}));
class ReviewApplicationDto {
}
exports.ReviewApplicationDto = ReviewApplicationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ReviewAction, description: '審核動作' }),
    (0, class_validator_1.IsEnum)(ReviewAction),
    __metadata("design:type", String)
], ReviewApplicationDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '申請者符合領養條件', description: '審核備註', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewApplicationDto.prototype, "notes", void 0);
//# sourceMappingURL=review-application.dto.js.map
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
exports.CreateListingDto = exports.Gender = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var Gender;
(function (Gender) {
    Gender["MALE"] = "male";
    Gender["FEMALE"] = "female";
    Gender["UNKNOWN"] = "unknown";
})(Gender || (exports.Gender = Gender = {}));
class CreateListingDto {
}
exports.CreateListingDto = CreateListingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cat', description: '動物種類（cat/dog）' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateListingDto.prototype, "species", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '英國短毛貓', description: '品種', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateListingDto.prototype, "breed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2, description: '年齡估計（歲）', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(30),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], CreateListingDto.prototype, "ageEstimate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: Gender, example: 'female', description: '性別', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(Object.values(Gender)),
    __metadata("design:type", String)
], CreateListingDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: '是否已結紮', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], CreateListingDto.prototype, "spayedNeutered", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '非常親人的貓咪，喜歡跟人互動', description: '動物描述', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateListingDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '台北市大安區', description: '所在地區' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateListingDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['photo1.jpg', 'photo2.jpg'], description: '照片URL列表' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateListingDto.prototype, "photos", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '健康狀況良好', description: '健康狀況', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateListingDto.prototype, "healthStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: { vaccines: ['三合一', '狂犬病'] }, description: '疫苗接種紀錄', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateListingDto.prototype, "vaccinationRecords", void 0);
//# sourceMappingURL=create-listing.dto.js.map
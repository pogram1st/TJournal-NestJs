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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./entities/user.entity");
const typeorm_2 = require("typeorm");
const subscription_entity_1 = require("../subscriptions/entities/subscription.entity");
let UserService = class UserService {
    constructor(repository) {
        this.repository = repository;
    }
    async create(dto) {
        return await this.repository.save(dto);
    }
    async findAll() {
        const qb = await this.repository
            .createQueryBuilder("a")
            .select("a.id")
            .addSelect("a.fullName")
            .addSelect("a.email")
            .addSelect("a.createdAt")
            .addSelect("a.updatedAt")
            .leftJoinAndMapMany("a.subscriptions", subscription_entity_1.SubscriptionEntity, "subscriptions", "a.id = subscriptions.channel.id")
            .loadRelationCountAndMap("a.subscriptionsCount", "a.subscriptions", "subscriptions")
            .getMany();
        return qb.map((item) => {
            delete item.subscriptions;
            return item;
        });
    }
    findById(id) {
        return this.repository.findOne({
            where: {
                id,
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
            relations: ["subscriptions", "subscribe"],
        });
    }
    findByEmail(email) {
        return this.repository.findOne({
            where: { email },
            relations: ["subscriptions", "subscribe"],
        });
    }
    findByCond(cond) {
        return this.repository.findOneBy(cond);
    }
    async search(dto) {
        const qb = this.repository.createQueryBuilder("user");
        qb.limit(dto.limit || 0);
        qb.take(dto.take || 10);
        if (dto.email) {
            qb.andWhere(`user.email ILIKE :email`);
        }
        if (dto.fullName) {
            qb.andWhere(`user.fullName ILIKE :fullName`);
        }
        qb.setParameters({
            email: `%${dto.email}%`,
            fullName: `%${dto.fullName}%`,
        });
        const [items, total] = await qb.getManyAndCount();
        return {
            items: items,
            total,
        };
    }
    async update(id, dto) {
        console.log(dto);
        const { password, newPassword } = dto, data = __rest(dto, ["password", "newPassword"]);
        const newDto = Object.assign(Object.assign({}, data), { password: newPassword });
        const user = await this.repository.findOneBy({ id });
        if (password && password !== "") {
            if (dto.password === user.password) {
                if (newPassword.length < 6) {
                    return new common_1.BadRequestException("Длина нового пароля должна быть более 6 символов!!!");
                }
                return this.repository.update(id, newDto);
            }
            else {
                return new common_1.BadRequestException("Старый пароль введен не верно!!!");
            }
        }
        return this.repository.update(id, Object.assign({}, data));
    }
    remove(id) {
        return this.repository.delete(id);
    }
};
UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const post_entity_1 = require("./entities/post.entity");
const typeorm_2 = require("typeorm");
let PostService = class PostService {
    constructor(repository) {
        this.repository = repository;
    }
    create(dto, userId) {
        var _a;
        const firstParagraph = (_a = dto.body.find((obj) => obj.type === "paragraph")) === null || _a === void 0 ? void 0 : _a.data.text;
        return this.repository.save({
            title: dto.title,
            body: dto.body,
            user: { id: userId },
            tags: dto.tags,
            description: firstParagraph || "",
        });
    }
    async findAll() {
        const posts = await this.repository.find({
            order: { createdAt: "DESC" },
            relations: ["comments", "user.subscribe", "user.subscriptions"],
        });
        return posts.map((obj) => {
            delete obj.user.password;
            return obj;
        });
    }
    async findPostsUser(userId) {
        const posts = await this.repository.find({
            where: {
                user: {
                    id: userId,
                },
            },
            relations: ["comments"],
        });
        return posts.map((obj) => {
            delete obj.user.password;
            return obj;
        });
    }
    async popular() {
        const qb = await this.repository.createQueryBuilder();
        qb.orderBy("views", "DESC");
        qb.limit(10);
        const [posts, total] = await qb.getManyAndCount();
        return {
            items: posts,
            total,
        };
    }
    async search(dto) {
        const qb = this.repository.createQueryBuilder("p");
        qb.limit(dto.limit || 0);
        qb.take(dto.take || 10);
        if (dto.views === "ASK") {
            qb.orderBy("views", "ASC");
        }
        else {
            qb.orderBy("views", "DESC");
        }
        if (dto.title) {
            qb.andWhere(`p.title ILIKE :title`);
        }
        if (dto.body) {
            qb.andWhere(`p.body ILIKE :body`);
        }
        if (dto.tag) {
            qb.andWhere(`p.tags ILIKE :tag`);
        }
        qb.setParameters({
            title: `%${dto.title}%`,
            body: `%${dto.body}%`,
            tag: `%${dto.tag}%`,
        });
        const [items, total] = await qb.getManyAndCount();
        return {
            items: items,
            total,
        };
    }
    async findOne(id) {
        await this.repository
            .createQueryBuilder("posts")
            .whereInIds(id)
            .update()
            .set({ views: () => "views + 1" })
            .execute();
        const post = await this.repository.findOne({
            where: {
                id: id,
            },
            relations: ["comments", "user.subscribe", "user.subscriptions"],
        });
        delete post.user.password;
        return post;
    }
    async update(id, dto, userId) {
        var _a;
        const firstParagraph = (_a = dto.body.find((obj) => obj.type === "paragraph")) === null || _a === void 0 ? void 0 : _a.data.text;
        const find = await this.repository.findOneBy({ id });
        if (!find) {
            throw new common_1.NotFoundException("Статья не найдена");
        }
        if (find.user.id !== userId) {
            throw new common_1.ForbiddenException("Нет доступа к этой статье");
        }
        return this.repository.update(id, {
            title: dto.title,
            body: dto.body,
            tags: dto.tags,
            description: firstParagraph || "",
        });
    }
    async remove(id, userId) {
        const find = await this.repository.findOneBy({ id });
        console.log(find);
        if (!find) {
            throw new common_1.NotFoundException("Статья не найдена");
        }
        return this.repository.delete(id);
    }
};
PostService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(post_entity_1.PostEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PostService);
exports.PostService = PostService;
//# sourceMappingURL=post.service.js.map

/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
export class CreateCategoryInput {
    name: string;
    description?: string;
    extends?: ExtendInput[];
}

export class ExtendInput {
    key: string;
    value?: string;
}

export class UpdateCategoryInput {
    id?: ObjectId;
    name: string;
    description?: string;
    extends?: ExtendInput[];
}

export class Article {
    title?: string;
}

export class Category {
    id?: ObjectId;
    name: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
    extends?: Extend[];
}

export class Extend {
    id: ObjectId;
    key: string;
    value?: string;
}

export class Message {
    message: string;
}

export abstract class IMutation {
    abstract createCategory(input?: CreateCategoryInput): Category | Promise<Category>;

    abstract updateCategory(input?: UpdateCategoryInput): Category | Promise<Category>;

    abstract deleteCategory(id?: ObjectId): Message | Promise<Message>;

    abstract deleteAllCategories(): Message | Promise<Message>;
}

export class PageInfo {
    total: number;
    offset: number;
    limit: number;
}

export abstract class IQuery {
    abstract getArticles(offset?: number): Article | Promise<Article>;

    abstract getArticleById(id?: string): Article | Promise<Article>;

    abstract getCategories(): Category[] | Promise<Category[]>;

    abstract getCategoryById(id?: ObjectId): Category | Promise<Category>;
}

export type ObjectId = any;

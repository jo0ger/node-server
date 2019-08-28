
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
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

export abstract class IQuery {
    abstract getArticles(offset?: number): Article | Promise<Article>;

    abstract getArticleById(id?: string): Article | Promise<Article>;

    abstract getCategories(): Category[] | Promise<Category[]>;
}

export type ObjectId = any;

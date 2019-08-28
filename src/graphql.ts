
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
export class Article {
    title?: string;
}

export abstract class IQuery {
    abstract getArticles(offset?: number): Article | Promise<Article>;

    abstract getArticleById(id?: string): Article | Promise<Article>;
}

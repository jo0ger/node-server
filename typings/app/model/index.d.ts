// This file was auto created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import Article from '../../../app/model/article';
import Category from '../../../app/model/category';
import Tag from '../../../app/model/tag';

declare module 'sequelize' {
  interface Sequelize {
    Article: ReturnType<typeof Article>;
    Category: ReturnType<typeof Category>;
    Tag: ReturnType<typeof Tag>;
  }
}

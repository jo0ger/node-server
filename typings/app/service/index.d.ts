// This file was auto created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import Test from '../../../app/service/Test';
import Category from '../../../app/service/category';
import Proxy from '../../../app/service/proxy';

declare module 'egg' {
  interface IService {
    test: Test;
    category: Category;
    proxy: Proxy;
  }
}

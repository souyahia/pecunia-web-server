import { Request } from 'express';
import { FindManyOptions, Like } from 'typeorm';

export default function getQueryOptions(req: Request): FindManyOptions {
  const { sort, search, range } = req.query;
  const findOptions: FindManyOptions = {};
  if (sort) {
    const sortArray = JSON.parse(sort as string);
    findOptions.order = {};
    let key = null;
    for (let i = 0; i < sortArray.length; i++) {
      if (key) {
        findOptions.order[key] = sortArray[i];
        key = null;
      } else {
        key = sortArray[i];
      }
    }
  }
  if (search) {
    const searchArray = JSON.parse(search as string);
    findOptions.where = {};
    let key = null;
    for (let i = 0; i < searchArray.length; i++) {
      if (key) {
        findOptions.where[key] = Like(`%${searchArray[i] as string}%`);
        key = null;
      } else {
        key = searchArray[i];
      }
    }
  }
  if (range) {
    const rangeArray = JSON.parse(range as string);
    findOptions.skip = Number(rangeArray[0]);
    findOptions.take = Number(rangeArray[1]) - Number(rangeArray[0]) + 1;
  }
  return findOptions;
}

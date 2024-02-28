import { Database } from 'sqlite3';
import path from 'path';
import { Recipe } from '../common/types';
import { net } from 'electron';
import { getRecipe, insertRecipe, save } from './database';

export function connect() {
  return new Database(
    path.join(__dirname, 'database.db'),
  );
  /*
  return Database(
    path.join(__dirname, 'database.db'),
    { verbose: console.log, fileMustExist: true },
  );
  */
}

export type RequestResult = {
  result: string,
  display: string,
  emoji: string,
  depth: number,
  who_discovered: string,
  first: boolean,
  base: boolean
}

export type RequestErrorResult = {
  code: number,
  message: string
}

export async function combine(a: string, b: string): Promise<Recipe | undefined> {
  var exists: Recipe | undefined = undefined;
  try {
    exists = await getRecipe(a, b)
  } catch(e) {
    console.error('Cannot get recipe')
    console.error(e)
    exists = undefined
  }
  if (exists !== undefined) {
    return exists
  } else {
    const response = await net.fetch(`http://localhost:5001?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`);
    if (response.ok) {
      try {
        const body: RequestResult = (await response.json()) as RequestResult
        try {
          await insertRecipe({
            a: a,
            b: b,
            result: body.result,
            display: body.display,
            emoji: body.emoji,
            depth: body.depth,
            who_discovered: body.who_discovered,
            base: body.base ? 1 : 0
          })
          await save()
          return {
            a: a,
            b: b,
            result: body.result,
            display: body.display,
            emoji: body.emoji,
            depth: body.depth,
            who_discovered: body.who_discovered,
            base: body.base ? 1 : 0
          }
        } catch(e) {
          console.error('Failed to insert recipe')
          console.error(e)
          return {
            a: a,
            b: b,
            result: body.result,
            display: body.display,
            emoji: body.emoji,
            depth: body.depth,
            who_discovered: body.who_discovered,
            base: body.base ? 1 : 0
          }
        }
      } catch(e) {
        console.error('Failed to make api request')
        console.error(e)
        throw(e)
      }
    } else {
      console.error(`response error code ${response.status}`)
      var json = (await response.json()) as RequestErrorResult
      console.error(json)
      if (json.code === 2 || json.code === 3) {
        throw('Unknown issue with input a/b')
      } else if (json.code === 4) {
        throw('Items are not known, have these been synced with the server?')
      }
      return undefined
    }
  }
}
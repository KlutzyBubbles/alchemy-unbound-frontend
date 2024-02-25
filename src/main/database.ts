import { Database } from 'sqlite3';
import path from 'path';

export type Recipe = {
  a: string;
  b: string;
  result: string;
  display: string;
  emoji: string;
  depth: number;
  who_discovered: string;
  base: number;
};

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

export function createDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('CeateDatabase')
    const db = connect();
    const stm = db.prepare(
      `CREATE TABLE IF NOT EXISTS recipes (
            a TEXT NOT NULL,
            b TEXT NOT NULL,
            result TEXT NOT NULL,
            display TEXT NOT NULL,
            emoji TEXT NOT NULL,
            depth INTEGER DEFAULT 1,
            who_discovered TEXT NOT NULL,
            base INTEGER DEFAULT FALSE
        );`
    );
    stm.run((error) => {
      if (error !== null && error !== undefined) {
        return reject(error)
      }
      var records = [
        {
          name: 'Earth',
          emoji: '🌎'
        },
        {
          name: 'Fire',
          emoji: '🔥'
        },
        {
          name: 'Water',
          emoji: '💧'
        },
        {
          name: 'Air',
          emoji: '💨'
        }
      ]
  
      records.forEach(async (item) => {
        var result = item.name.toLowerCase()
        var hasItem = await getRecipesFor(result)
        if (hasItem === null || hasItem === undefined || hasItem.length === 0) {
          await insertRecipe({
            a: '',
            b: '',
            result,
            display: item.name,
            emoji: item.emoji,
            depth: 0,
            who_discovered: '',
            base: 1
          })
        }
      })
      return resolve()
    });
  });
}

function formatInput(input: any, prefix = '@'): any {
  var output: any = {};
  for (var key of Object.keys(input)) {
    output[`${prefix}${key}`] = input[key]
  }
  return output
}

export function insertRecipe(recipe: Recipe): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = connect();
    const stm = db.prepare(
      'INSERT INTO recipes (a, b, result, display, emoji, depth, who_discovered, base) VALUES (@a, @b, @result, @display, @emoji, @depth, @who_discovered, @base)',
    );

    stm.run(formatInput(recipe), (error) => {
      if (error) {
        return reject(error)
      }
      return resolve()
    });
  })
}

export function deleteRecipe(a: string, b: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = connect();

    const stm = db.prepare('DELETE FROM recipes WHERE (a = @a AND b = @b) OR (a = @b AND b = @a)');

    stm.run({ a, b }, (error) => {
      if (error) {
        return reject(error)
      }
      return resolve()
    });
  });
}

export function getRecipe(a: string, b: string): Promise<Recipe> {
  return new Promise((resolve, reject) => {
    const db = connect();
    const stm = db.prepare('SELECT * FROM recipes where (a = @a AND b = @b) OR (a = @b AND b = @a)');

    stm.get(formatInput({ a, b }), (err, val) => {
      if (err) {
        return reject(err)
      }
      return resolve(val as Recipe)
    });
  })
  // return stm.get({ a, b }) as Recipe;
}

export function getRecipesFor(result: string): Promise<Recipe[]> {
  return new Promise((resolve, reject) => {
    const db = connect();
    const stm = db.prepare('SELECT * FROM recipes where (result = @result)');

    stm.all(formatInput({ result }), (err, val) => {
      if (err) {
        return reject(err)
      }
      return resolve(val as Recipe[])
    });
  })
}

export function getAllRecipes(): Promise<Recipe[]> {
  return new Promise((resolve, reject) => {
    const db = connect();
    const stm = db.prepare('SELECT * FROM recipes');

    stm.all({}, (err, val) => {
      if (err) {
        return reject(err)
      }
      return resolve(val as Recipe[])
    });
  })
}
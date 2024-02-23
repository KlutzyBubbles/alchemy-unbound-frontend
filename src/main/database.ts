import { Database } from 'sqlite3';
import path from 'path';

export type Recipe = {
    a: string;
    b: string;
    result: string;
    display: string;
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

export function createDatabase() {
    const db = connect();
    const stm = db.prepare(
        `CREATE TABLE IF NOT EXISTS recipes (
            a TEXT NOT NULL,
            b TEXT NOT NULL,
            result TEXT NOT NULL,
            display TEXT NOT NULL,
            depth INTEGER DEFAULT 1,
            who_discovered TEXT NOT NULL,
            base INTEGER DEFAULT FALSE,
        )`
    );
    stm.run();
}

export function insertRecipe(recipe: Recipe) {
  const db = connect();
  const stm = db.prepare(
    'INSERT INTO recipes (a, b, result, display, depth, who_discovered, base) VALUES (@a, @b, @result, @display, @depth, @who_discovered, @base)',
  );

  stm.run(recipe);
}

export function deleteRecipe(a: string, b: string) {
  const db = connect();

  const stm = db.prepare('DELETE FROM recipes WHERE (a = @a AND b = @b) OR (a = @b AND b = @a)');

  stm.run({ a, b });
}

export function getRecipe(a: string, b: string): Promise<Recipe> {
  return new Promise((resolve, reject) => {
    const db = connect();
    const stm = db.prepare('SELECT * FROM recipes where (a = @a AND b = @b) OR (a = @b AND b = @a)');
  
    stm.get({ a, b }, (err, val) => {
      if (err) {
        return reject(err)
      }
      return resolve(val as Recipe)
    });
  })
  // return stm.get({ a, b }) as Recipe;
}
import { promises as fs } from 'fs';

export async function dirExists(path: string): Promise<boolean> {
    try
    {
        return (await fs.stat(path)).isDirectory();
    }
    catch (err)
    {
        return false;
    }
}

export async function fileExists(path: string): Promise<boolean> {
    try
    {
        return (await fs.stat(path)).isFile();
    }
    catch (err)
    {
        return false;
    }
}

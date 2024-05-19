import { promises as fs } from 'fs';
import { getFolder } from './libs/steam';

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

export async function verifyFolder(subFolder?: string): Promise<void> {
    let folder = getFolder();
    if (subFolder !== undefined) {
        folder += `${subFolder}/`;
    }
    if (!(await dirExists(folder))) {
        await fs.mkdir(folder, { recursive: true });
    }
}

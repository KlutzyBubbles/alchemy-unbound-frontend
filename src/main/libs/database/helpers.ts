import { promises as fs } from 'fs';
import { getFolder } from '../steam';

export async function saveToFile(filename: string, data: Record<string, unknown>, fullpath = false) {
    await fs.writeFile(fullpath ? filename : getFolder() + filename, JSON.stringify(data), 'utf-8');
}

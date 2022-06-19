import { PathLike, readdirSync } from 'fs';
import { Command } from '../types';

export default async (path: PathLike): Promise<Command[]> => {
	return await Promise.all(
		readdirSync(path)
			.filter(file => file.endsWith('.ts'))
			.map(path => import(path))
	);
};
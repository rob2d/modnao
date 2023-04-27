import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { promises as fs } from 'fs';

// @TODO deprecate this API when client parses
// source binary files

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const dir = path.join(process.cwd());
  const fileContents = await fs.readFile(`${dir}/STG0CPOL.BIN.json`, 'utf8');
  res.status(200).json(fileContents);
}

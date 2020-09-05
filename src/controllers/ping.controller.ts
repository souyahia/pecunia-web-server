import { Request, Response } from 'express';
// import { getManager } from 'typeorm';
// import { Keyword } from '../entities';

/**
 * Ping the web server and get a greeting message.
 * @route GET /ping
 */
export function ping(req: Request, res: Response): void {
  res.status(200).send({
    message: 'Greetings from the Pecunia web server.',
    date: new Date().toISOString(),
    url: req.url,
  });
}

// /**
//  * Ping the web server and get a greeting message.
//  * @route GET /ping
//  */
// export async function ping(req: Request, res: Response): Promise<void> {
//   const result = await getManager().getRepository(Keyword).find({ relations: [ 'category' ] });
//   res.status(200).send({
//     message: 'Greetings from the Pecunia web server.',
//     date: new Date().toISOString(),
//     url: req.url,
//     result
//   });
// }


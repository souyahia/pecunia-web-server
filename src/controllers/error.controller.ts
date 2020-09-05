import { Request, Response } from 'express';

/**
 * Catch requests on wrong end points.
 * @route ALL *
 */
export function badEndPoint(req: Request, res: Response): void {
  res.status(400).send({
    message: `Cannot ${req.method} ${req.url}`,
  });
}

// /**
//  * Catch requests on wrong end points.
//  * @route ALL *
//  */
// export async function badEndPoint(req: Request, res: Response): Promise<void> {
//   const repository = getManager().getRepository(User);
//   const newUser = repository.create({
//     email: 'bob@mail.com',
//     id: 'testoooo-id',
//     password: 'my-pass'
//   });

//   const created = await repository.save(newUser);
//   res.status(400).send({
//     message: `Cannot ${req.method} ${req.url}`,
//     created
//   });
// }

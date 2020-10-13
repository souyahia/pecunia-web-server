/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';

export default function mockRequestResponse(
  statusMock?: (code: number) => void,
  jsonMock?: (body?: any) => void,
): { req: Request; res: Response } {
  return {
    req: {} as Request,
    res: {
      status: (code) => {
        if (statusMock) {
          statusMock(code);
        }
        return {
          json: (body?: any) => {
            if (jsonMock) {
              jsonMock(body);
            }
            return {} as Response;
          },
        } as Response;
      },
    } as Response,
  };
}

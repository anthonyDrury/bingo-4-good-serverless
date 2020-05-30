import authHandler, { ClaimVerifyResult } from "./auth";
import { isDefined } from "./support";

export function isAuthValid(
  token: string | undefined = undefined
): Promise<ClaimVerifyResult> {
  if (!isDefined(token)) {
    return Promise.resolve({ isValid: false } as any);
  }
  return authHandler(token).then(
    (claim: ClaimVerifyResult): ClaimVerifyResult => claim
  );
}

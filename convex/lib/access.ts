export function assertOwner(resourceUserId: string, actorUserId: string) {
    if (String(resourceUserId) !== String(actorUserId)) {
      throw new Error("Not allowed");
    }
  }
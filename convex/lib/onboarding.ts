export function assertActiveAccount(accountStatus: string) {
    if (accountStatus !== "active") {
      throw new Error("Account is not active");
    }
  }
  
  export function assertOnboardingStage(
    currentStage: string,
    expectedStage: string,
  ) {
    if (currentStage !== expectedStage) {
      throw new Error(`User is not in ${expectedStage} stage`);
    }
  }
  
  export function assertReadyForProfileSetup(args: {
    isCeaVerified: boolean;
    isMobileVerified: boolean;
  }) {
    if (!args.isCeaVerified) {
      throw new Error("CEA verification required");
    }
  
    if (!args.isMobileVerified) {
      throw new Error("Mobile verification required");
    }
  }
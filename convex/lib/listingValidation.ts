import { isValidSingaporeMobile } from "./validation";

export function validateListingPricing(args: {
  isNewProject: boolean;
  isPriceOnAsk: boolean;
  askPrice?: number;
}) {
  if (args.isPriceOnAsk && !args.isNewProject) {
    throw new Error("Price on ask is only allowed for new projects");
  }

  if (!args.isPriceOnAsk && !args.askPrice) {
    throw new Error("Ask price is required unless price on ask is enabled");
  }
}

export function validateListingContactNumbers(args: {
  contactMobileNumber?: string;
  contactWhatsappNumber?: string;
}) {
  if (!isValidSingaporeMobile(args.contactMobileNumber)) {
    throw new Error("Invalid contact mobile number");
  }

  if (!isValidSingaporeMobile(args.contactWhatsappNumber)) {
    throw new Error("Invalid WhatsApp number");
  }
}
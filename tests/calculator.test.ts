import { describe, expect, it } from "vitest";
import { calculateIpo, validateInput } from "../lib/calculator";
import { InputError } from "../lib/money";
import { DANGOTE_IPO } from "../lib/ipo-data";
describe("Dangote deterministic calculation engine", () => {
  it("calculates a share scenario in integer kobo", () => { const result = calculateIpo({ mode: "shares", shares: "100", expectedSellingPrice: "600", feePercent: "1", flatFee: "100" }); expect(result.investmentCost).toBe("52500.00"); expect(result.fees).toBe("625.00"); expect(result.totalCashRequired).toBe("53125.00"); expect(result.estimatedPositionValue).toBe("60000.00"); expect(result.potentialGainLoss).toBe("6875.00"); expect(result.breakEvenPrice).toBe("531.25"); });
  it("rounds an amount down to the verified 10-share lot", () => { const result = calculateIpo({ mode: "amount", investmentAmount: "11000", feePercent: "0", flatFee: "0" }); expect(result.shares).toBe("20"); expect(result.remainingCash).toBe("500.00"); });
  it("rejects invalid inputs", () => { expect(() => calculateIpo(validateInput({ mode: "amount", investmentAmount: "-1" }))).toThrow(InputError); expect(() => calculateIpo({ mode: "amount", investmentAmount: "0" })).toThrow("positive"); expect(() => calculateIpo({ mode: "shares", shares: "11" })).toThrow("multiples"); expect(() => calculateIpo({ mode: "amount", investmentAmount: "1.999" })).toThrow("two decimal"); expect(() => calculateIpo({ mode: "amount", investmentAmount: "5000" })).toThrow("minimum"); });
  it("does not invent unavailable verified fields", () => { expect(DANGOTE_IPO.fees).toBeNull(); expect(DANGOTE_IPO.dividend).toBeNull(); });
});

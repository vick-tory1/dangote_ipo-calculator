"use client";
import { useState } from "react";

const questions = [
  {
    question: "What does this Dangote Refinery IPO calculator estimate?",
    answer: "Use amount mode to enter the naira budget you plan to apply with. The calculator uses the published Dangote Refinery IPO offer price and share-lot rules to estimate the largest eligible share quantity that fits after the fee assumptions you entered. Use share mode if you already have a quantity in mind; the calculator checks it against the minimum and lot increment.\n\nEnter a personal selling-price assumption to compare the estimated value of those shares with your modeled cash cost. This page does not submit an application, accept payment, reserve shares, or confirm allotment. Apply only through a current, SEC-approved channel listed by the issuer.",
  },
  {
    question: "How does the calculator turn my budget into a share quantity?",
    answer: "In amount mode, your entry is the maximum cash budget for offer shares and the fees you enter. The calculator finds the largest eligible share lot that stays within that amount; it does not round up beyond your budget. If your budget cannot cover the minimum quantity and modeled fees, the calculator reports that the amount is insufficient.\n\nIn share mode, enter the number of shares you plan to request. It must meet the displayed minimum and lot increment. Because share mode does not ask for a cash budget, it does not calculate leftover cash.",
  },
  {
    question: "What counts as a fee here, and are the fee fields official?",
    answer: "Both fee fields are assumptions you supply. The percentage is applied to the offer-share cost, then the flat amount is added. These modeled charges affect the cash needed, the number of shares that fit a budget, and the estimated gain or loss and break-even price. Enter 0 only when you want the calculation to exclude that fee; zero is not confirmation that your application has no charge.\n\nThe offer snapshot contains no verified application-fee schedule. Check the current prospectus and ask your receiving agent about actual charges, taxes, and payment costs. Selling fees are not included in the results.",
  },
  {
    question: "What does the expected selling price do?",
    answer: "This is a price you enter for comparison, not a value supplied by the issuer. The calculator multiplies it by your estimated share quantity to show an estimated position value, then compares that amount with the offer cost and modeled fees. If you leave the field blank, the calculator leaves value and gain-or-loss outputs blank.\n\nThe input is not a live quote, a forecast, an IPO term, or a promise that a buyer will pay that price. A market may not be available when you want to sell, and an executed sale price could be different.",
  },
  {
    question: "What is break-even per share, and what is not included in it?",
    answer: "Break-even per share is the total application cash estimated by this calculator divided by your share quantity, rounded up to the next kobo. At that assumed sale price, the estimated share value matches the offer cost plus the fees you entered. It is a cost-recovery calculation, not a market target.\n\nIt excludes selling fees, taxes, and any costs not entered in the calculator. Your actual break-even may therefore be higher. Check the assumptions shown with your result.",
  },
  {
    question: "Why can my final allotment be different from the quantity I model?",
    answer: "The share quantity on this page is an estimate of what your budget could cover at the offer price; it is not an allotment. The issuer or offer administrator determines allocations under the prospectus. Eligibility checks, payment verification, demand, and any scale-back can affect the number ultimately allotted.\n\nSubmit an application only through an official approved channel and wait for the authorised allotment confirmation. A calculation or saved scenario is not proof that you applied or received shares.",
  },
  {
    question: "Does the calculator estimate dividends or investment performance?",
    answer: "No dividend amount or policy is included because verified dividend information is unavailable in this offer snapshot. The calculator does not estimate dividends, forecast a future share price, or assess whether this IPO is suitable for you.\n\nA displayed gain or loss is only the arithmetic result of your chosen selling price and fee inputs. It is not a likely return or guarantee; the eventual value may be lower, and you could lose some or all of your investment. Read the prospectus risk factors and seek authorised professional advice for personal guidance.",
  },
  {
    question: "Where does the offer information come from, and how current is it?",
    answer: "The offer price, minimum quantity, share increment, and dates shown here come from a versioned snapshot reviewed against the Dangote IPO site, SEC Nigeria notice, and NGX announcement linked below. “Official sources reviewed” is the date those sources were last checked. “Snapshot loaded” is when this page last fetched the site's copy of that snapshot.\n\nThe page refreshes its snapshot every 60 seconds, but the issuer does not currently provide this calculator with a structured live offer feed. A changed snapshot will appear here after its terms are verified and the site is updated. Before applying, compare the figures with the current prospectus and issuer notices.",
  },
  {
    question: "How does the Dangote IPO support chat use Gemini?",
    answer: "The chat sends your question and up to eight recent conversation messages to Gemini through this site's server. If you have calculated an estimate, the server recalculates your current entries and can include those figures as context. Gemini explains them; it does not set the verified offer terms or perform the calculator's financial arithmetic. Its answer may still be incomplete or wrong, so check amounts against the results and official sources.\n\nMessages are not saved to your account by this calculator. Do not send passwords, bank details, PINs, one-time codes, or other sensitive information. The assistant is educational, not financial advice, and cannot submit an IPO application. If Gemini is unavailable, the calculator still works.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return <article className="faq"><p className="eyebrow">DANGOTE IPO QUESTIONS</p><h2>Answers about this offer and the estimates on this page.</h2><p className="faq-intro">Use these explanations to check what is verified, what you entered, and what the calculator can or cannot estimate.</p>{questions.map(({ question, answer }, index) => {
    const isOpen = openIndex === index;
    const answerId = `faq-answer-${index}`;

    return <section className={`faq-item${isOpen ? " is-open" : ""}`} key={question}>
      <h3><button type="button" aria-expanded={isOpen} aria-controls={answerId} onClick={() => setOpenIndex(isOpen ? null : index)}>{question}<span aria-hidden="true">{isOpen ? "−" : "+"}</span></button></h3>
      <div className="faq-answer" id={answerId} hidden={!isOpen}>{answer.split("\n\n").map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
    </section>;
  })}</article>;
}

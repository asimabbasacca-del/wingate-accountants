import type { Guide } from "./types";

export const GUIDES: Guide[] = [
  {
    slug: "uk-tax-rates-thresholds-allowances-self-employed-2026",
    category: "Self Assessment",
    title: "UK tax rates, thresholds and allowances for the self-employed",
    seoTitle: "Self-employed tax rates and allowances 2026 | Wingate Accountants",
    description: "A practical 2026 guide for sole traders and partners: personal allowance, Income Tax bands, National Insurance, VAT and what to confirm on GOV.UK before you file.",
    excerpt: "If you work for yourself, the rates that matter sit in more than one place. This guide shows how Income Tax, National Insurance and VAT fit together for a 2026 Self Assessment.",
    date: "2026-09-01",
    dateLabel: "1 Sep 2026",
    read: "9 min read",
    featured: true,
    relatedSlugs: ["self-assessment-tax-return-guide", "sole-trader-or-limited-company", "self-assessment-accountant-fees-2026"],
    sections: [
      {
        heading: "Start with the personal allowance, then the bands",
        paragraphs: [
          "Most self-employed people still build their bill from the personal allowance and the Income Tax bands that apply to the tax year. Those figures are frozen for several years at a time, so the number you used last January may still be right — but you should confirm the current bands on GOV.UK before you complete the return.",
          "Your taxable profit is turnover minus allowable expenses, capital allowances and any reliefs that actually apply to you. Trading losses, pension contributions and Gift Aid can all change the picture. Wingate prepares this calculation as part of [Self Assessment](/services/self-assessment), rather than leaving you to stitch figures from a spreadsheet.",
          "Directors who also take a salary and dividends sit in a different mix. The same personal allowance is used once across employment, self-employment and other income. That is why a side trade on top of PAYE often produces a larger bill than people expect.",
        ],
      },
      {
        heading: "National Insurance is a second calculation",
        paragraphs: [
          "Class 4 National Insurance is charged on profits between published lower and upper limits. Class 2 is now usually collected through Self Assessment when profits exceed the small profits threshold. Neither is the same as employee National Insurance deducted through PAYE.",
          "If you also have a job, you may already have paid employee National Insurance. That does not cancel Class 4 on the trade, though high combined earnings can engage the annual maximum rules. We check this when a client has both employment and a freelance trade.",
        ],
        bullets: [
          "Keep a running profit figure, not just a bank balance.",
          "Separate drawings from expenses so the accounts stay clean.",
          "Payments on account for the following year are often the surprise, not the current-year tax.",
        ],
      },
      {
        heading: "VAT sits on turnover, not profit",
        paragraphs: [
          "The VAT registration threshold is a turnover test. You can be loss-making and still need to register if taxable supplies go over the limit. You can also choose [voluntary registration](/blog/voluntary-vat-registration) if reclaiming input VAT is worth the extra filing.",
          "Making Tax Digital for VAT already applies to VAT-registered businesses. Making Tax Digital for Income Tax is a separate programme for qualifying sole traders and landlords. Confirm the latest start dates and turnover tests on GOV.UK — they have moved before.",
        ],
      },
      {
        heading: "What to do before 31 January",
        paragraphs: [
          "Register for Self Assessment if you have not already, gather bank records and invoices, and set aside cash for tax plus payments on account. If you cannot pay in full, HMRC Time to Pay is easier to agree before the deadline than after a penalty has landed.",
          "Rates change. Treat this page as a map, not a substitute for the GOV.UK tables or a personal computation. [Speak to Wingate](/contact) if you want the 2026 return prepared and the January payment planned.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do self-employed people pay Corporation Tax?",
        answer: "No. Sole traders and partners pay Income Tax and National Insurance on profits. Corporation Tax applies to limited companies. If you are unsure which you are, start with our guide to [sole trader versus limited company](/blog/sole-trader-or-limited-company).",
      },
      {
        question: "Where should I check the current rates?",
        answer: "Use the Income Tax rates and allowances pages on GOV.UK for the tax year you are filing. Do not rely on a blog, including this one, as the last word after a Budget.",
      },
      {
        question: "Can Wingate prepare the return from my records?",
        answer: "Yes. Send bank statements, invoices and a note of what you took as drawings. We complete the Self Assessment, explain the bill and file after you approve it.",
      },
    ],
  },
  {
    slug: "contractors-pension-contributions-subcontractors",
    category: "Payroll",
    title: "Do contractors need to make pension contributions for subcontractors?",
    seoTitle: "Contractor pensions for subcontractors | Wingate Accountants",
    description: "When UK contractors must auto-enrol staff, when a genuine subcontractor is outside workplace pensions, and how CIS and employment status sit together.",
    excerpt: "Auto-enrolment follows employment status, not the word contractor. Get the status wrong and you can owe pension contributions, PAYE and penalties.",
    date: "2026-08-28",
    dateLabel: "28 Aug 2026",
    read: "8 min read",
    relatedSlugs: ["monthly-cis-returns", "paye-for-employers", "hire-your-first-employee"],
    sections: [
      {
        heading: "Workplace pensions follow workers, not invoices",
        paragraphs: [
          "UK auto-enrolment applies when you employ staff who meet the age and earnings tests. Labelling someone a subcontractor on an invoice does not take them outside the regime if, in law, they are a worker.",
          "A genuine self-employed subcontractor running their own business, with their own insurance, tools and substitution rights, is usually outside auto-enrolment. That is a facts test. HMRC and The Pensions Regulator look at control, substitution, mutuality of obligation and whether the person is in business on their own account.",
        ],
      },
      {
        heading: "CIS and pensions are different systems",
        paragraphs: [
          "The Construction Industry Scheme is a tax deduction regime for certain construction payments. Being in CIS does not automatically mean the person is self-employed for National Insurance, employment rights or pensions.",
          "Many disputes start because a firm operates CIS on a labour-only individual who only works for them, uses their van and cannot send a substitute. That pattern often looks like employment. If it is employment, PAYE, auto-enrolment and holiday pay can all follow.",
        ],
        bullets: [
          "Write a status assessment before the first payment, not after a letter from a regulator.",
          "Keep contracts, timesheets and substitution evidence with the payroll file.",
          "If status is finely balanced, take advice before you skip pension contributions.",
        ],
      },
      {
        heading: "What employers actually pay",
        paragraphs: [
          "Where auto-enrolment applies, the employer must put eligible jobholders into a qualifying scheme and pay at least the minimum employer contribution unless the worker has opted out correctly. Missing that is a compliance failure, not a bookkeeping preference.",
          "Directors of their own personal service company sit in a different analysis again. IR35 and off-payroll working can recharacterise income for tax without turning every site labourer into an employee. Do not mix those tests.",
        ],
      },
      {
        heading: "How Wingate helps contractors",
        paragraphs: [
          "We review whether people you pay are workers or genuine subcontractors, set up PAYE where it is required, and file [CIS returns](/blog/monthly-cis-returns) on time. If you already have a mixed labour force, [contact us](/contact) before the next payday rather than after a Pensions Regulator notice.",
        ],
      },
    ],
    faqs: [
      {
        question: "If I deduct CIS tax, do I still need a pension scheme?",
        answer: "CIS tax is not a substitute for auto-enrolment. If the person is a worker, you may need both a correct employment tax treatment and a workplace pension.",
      },
      {
        question: "Can a one-person company be a subcontractor?",
        answer: "Yes, if they are genuinely in business. Paying a limited company does not, by itself, prove self-employment of the individual who turns up each day.",
      },
      {
        question: "What if I have treated people as subcontractors for years?",
        answer: "Status can still be challenged. A disclosure and a clean payroll from a set date is usually better than waiting for a review. Wingate can map the risk with you.",
      },
    ],
  },
  {
    slug: "tax-for-actors-and-performers",
    category: "Tax",
    title: "Tax for actors and performers: how UK Self Assessment actually works",
    seoTitle: "Tax for actors and performers UK | Wingate Accountants",
    description: "How UK actors, musicians and performers report mixed PAYE and freelance income, claim allowable costs, and stay on top of Self Assessment deadlines.",
    excerpt: "Theatre, TV, touring and teaching rarely fit a single payslip. The tax return has to show the mix without mixing up employment and trade.",
    date: "2026-08-22",
    dateLabel: "22 Aug 2026",
    read: "8 min read",
    relatedSlugs: ["self-assessment-tax-return-guide", "uk-tax-rates-thresholds-allowances-self-employed-2026", "voluntary-vat-registration"],
    sections: [
      {
        heading: "Employment and freelance work on the same return",
        paragraphs: [
          "Many performers are paid through PAYE for a production and invoice separately for workshops, royalties or commercial voice work. Self Assessment is designed for that mix. P60 and P45 figures go in the employment pages; freelance profit goes in the self-employment pages.",
          "The mistake we see most is putting everything through the trade, or ignoring small PAYE jobs because the tax was already deducted. HMRC already holds the PAYE record. Omitting it can look like a mismatch, not a simplification.",
        ],
      },
      {
        heading: "Allowable costs have to be for the work",
        paragraphs: [
          "Agent commission, professional subscriptions, specialist coaching, travel to a booking that is not ordinary commuting, and a genuine use of home as office can be allowable. Everyday clothes, most gym memberships and the cost of living in London are not.",
          "Keep contracts, call sheets and receipts. If a cost is mixed — a phone used for work and personal use — claim a reasonable business proportion and write down how you got there.",
        ],
        bullets: [
          "Separate agent fees from tax withheld at source.",
          "Royalties and repeat fees often need their own lines, not a lump in ‘other’.",
          "Overseas tours can create dual reporting. Flag them early.",
        ],
      },
      {
        heading: "VAT, limited companies and averaging",
        paragraphs: [
          "High-earning performers sometimes register for VAT or trade through a company. Those are planning decisions, not defaults. Profit averaging for authors, artists and some creative trades still exists in UK law with conditions — it is not automatic and it is not a way to ignore a year of high income.",
          "If income has been missed in earlier years, a [voluntary disclosure](/blog/voluntary-disclosure-to-hmrc) is usually cleaner than hoping a random enquiry never comes. Wingate deals with that work regularly for London professionals.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do I need an accountant if all my work is PAYE?",
        answer: "If you only have employment income and no other reporting, you may not need Self Assessment. Add freelance invoices, property, or significant expenses and you usually do.",
      },
      {
        question: "Can I claim my showreel or website?",
        answer: "Often yes if they are wholly for getting work, with a record of the invoice. Personal branding that is mainly social life will not survive a review.",
      },
      {
        question: "When should I register as self-employed?",
        answer: "Register once you are trading and the Self Assessment rules catch you — typically after you start invoicing in your own name. Do not wait until January of the following year if you can help it.",
      },
    ],
  },
  {
    slug: "selling-on-amazon-uk-tax",
    category: "Tax",
    title: "Selling on Amazon in the UK: tax, VAT and records you actually need",
    seoTitle: "Amazon seller tax UK | VAT, Income Tax and records | Wingate",
    description: "How UK Amazon sellers should treat sales, fees, stock and VAT. What HMRC expects to see, and when a marketplace business must register.",
    excerpt: "Marketplace dashboards are not accounts. HMRC will want sales, fees, stock and VAT treated as a real trade, including storage in fulfilment centres.",
    date: "2026-08-18",
    dateLabel: "18 Aug 2026",
    read: "8 min read",
    relatedSlugs: ["voluntary-vat-registration", "vat-registration-threshold", "sole-trader-or-limited-company"],
    sections: [
      {
        heading: "You are trading, even if Amazon takes the payment",
        paragraphs: [
          "If you sell goods regularly on Amazon in the UK, you are carrying on a trade. Sales are turnover. Amazon referral fees, FBA fees, advertising and storage are usually allowable expenses. Money arriving in your bank after fees is not your profit.",
          "Download settlement reports and keep them with purchase invoices. A year-end screenshot of ‘payments’ is not a complete record. Stock still in a fulfilment centre is stock, not an expense, until it is sold or written off properly.",
        ],
      },
      {
        heading: "VAT is often the first registration you hit",
        paragraphs: [
          "Taxable turnover for VAT includes marketplace sales. Distance selling and goods stored in the UK can create a UK VAT obligation even if you live abroad. UK residents who grow quickly often cross the registration threshold mid-year and then discover they should have registered from an earlier date.",
          "Read our notes on the [VAT threshold](/blog/vat-registration-threshold) and [voluntary registration](/blog/voluntary-vat-registration). Marketplace VAT programmes do not remove your duty to get the registration right.",
        ],
      },
      {
        heading: "Income Tax, companies and imports",
        paragraphs: [
          "Sole traders report profit on Self Assessment. A limited company reports through accounts and Corporation Tax. Import VAT, duty and delayed customs bills need a paper trail that matches the stock movement, not just the Amazon payout.",
          "If you have been selling for years without returns, that is a disclosure issue, not a software issue. [Contact Wingate](/contact) if you need the historic position put in order as well as the live books.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is Amazon sending my figures to HMRC?",
        answer: "Marketplaces share data. You still have to file complete returns. Do not assume HMRC only knows what you declared.",
      },
      {
        question: "Can I ignore FBA stock at the year end?",
        answer: "No. Unsold inventory is an asset. Expensing it all on purchase overstates costs and understates profit.",
      },
      {
        question: "Do I need a limited company to sell on Amazon?",
        answer: "No. Many sellers start as sole traders. A company can make sense later for liability, finance or tax planning — see [sole trader or limited company](/blog/sole-trader-or-limited-company).",
      },
    ],
  },
  {
    slug: "voluntary-vat-registration",
    category: "VAT",
    title: "Should you make a voluntary VAT registration?",
    seoTitle: "Voluntary VAT registration UK | When it is worth it | Wingate",
    description: "When UK businesses should register for VAT before they hit the threshold, when they should wait, and what Making Tax Digital filing then requires.",
    excerpt: "Voluntary VAT can reclaim tax on costs — or it can make you more expensive than competitors. The decision is commercial as well as technical.",
    date: "2026-08-14",
    dateLabel: "14 Aug 2026",
    read: "7 min read",
    relatedSlugs: ["vat-registration-threshold", "selling-on-amazon-uk-tax", "uk-tax-rates-thresholds-allowances-self-employed-2026"],
    sections: [
      {
        heading: "What voluntary registration actually does",
        paragraphs: [
          "If you are in business and making taxable supplies, you can apply to register for VAT before you reach the compulsory threshold. Once registered you charge VAT on taxable sales, reclaim input VAT on qualifying costs, and file VAT returns — under Making Tax Digital rules for VAT.",
          "You cannot register ‘just in case’ if you are not carrying on a business. HMRC can refuse or later cancel a registration that has no taxable activity.",
        ],
      },
      {
        heading: "When it is usually worth it",
        paragraphs: [
          "It tends to help if your customers are VAT-registered businesses that can reclaim the VAT you charge, and you have significant costs with VAT on them — equipment, stock, software, subcontractors. The net cash position can improve even though invoices look higher.",
          "It tends to hurt if you sell mainly to the public, schools, or other customers who cannot recover VAT. Your prices rise by 20 percent or your margin falls if you absorb it. That is why cafes, tradespeople with domestic customers, and many coaches delay registration until they must.",
        ],
        bullets: [
          "Map who your customers are before you apply.",
          "Budget for quarterly VAT payments, not only the reclaim.",
          "Choose a scheme (standard, cash, flat rate) with a computation, not a guess.",
        ],
      },
      {
        heading: "Leaving VAT later is not instant",
        paragraphs: [
          "Deregistration has rules, a possible VAT charge on remaining stock and assets, and a final return. Do not register for a one-off reclaim unless you understand the exit.",
          "Wingate will model compulsory versus voluntary registration against your next twelve months of sales. [Ask for that calculation](/contact) before you submit the VAT1.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I reclaim VAT on costs incurred before registration?",
        answer: "Sometimes, if the goods or services are still on hand or relate to the taxable business and you meet HMRC’s time limits and evidence rules. Pre-registration claims are easy to get wrong.",
      },
      {
        question: "Does voluntary registration trigger Making Tax Digital?",
        answer: "VAT-registered businesses need compatible software and digital records. That is separate from Making Tax Digital for Income Tax.",
      },
      {
        question: "What if I register too late after crossing the threshold?",
        answer: "That is compulsory registration with a backdated date, not a voluntary choice. See [what happens if you exceed the VAT threshold](/blog/vat-registration-threshold).",
      },
    ],
  },
  {
    slug: "tax-for-general-partnerships",
    category: "Tax",
    title: "A practical tax guide for general partnerships",
    seoTitle: "Tax for general partnerships UK | SA800 and partners | Wingate",
    description: "How UK general partnerships are taxed: partnership return, partner Self Assessment, profit shares, VAT and how this differs from an LLP or company.",
    excerpt: "The partnership files a return. Each partner pays tax on their share. Mixing those two steps is how partnership tax goes wrong.",
    date: "2026-08-10",
    dateLabel: "10 Aug 2026",
    read: "8 min read",
    relatedSlugs: ["register-as-partner-in-a-partnership", "llp-versus-limited-company", "self-assessment-tax-return-guide"],
    sections: [
      {
        heading: "The firm is transparent for Income Tax",
        paragraphs: [
          "A traditional general partnership is not a Corporation Tax payer. Profits are calculated for the partnership, allocated according to the agreed profit-sharing ratio, and each partner pays Income Tax and National Insurance on their allocation through Self Assessment.",
          "HMRC still wants a partnership return (SA800) that ties to the accounts. Partners cannot each invent a different profit figure. If the partnership return and the partner returns disagree, expect correspondence.",
        ],
      },
      {
        heading: "Drawings are not salary",
        paragraphs: [
          "Partners taking cash from the bank is drawings, not PAYE, unless someone is genuinely employed by the firm. Mixing a ‘salary’ for one partner into the accounts without a proper allocation clause confuses both the SA800 and the partner pages.",
          "Capital introduced, current accounts and interest on capital should be written down. Verbal ‘we’ll sort it at the year end’ arrangements collapse the first time a partner leaves.",
        ],
        bullets: [
          "Keep a signed profit-sharing agreement.",
          "Register the partnership and each partner as required — see [registering as a partner](/blog/register-as-partner-in-a-partnership).",
          "Put VAT on the partnership registration, not on a random partner’s UTR, if the firm is VAT-registered.",
        ],
      },
      {
        heading: "When an LLP or company is a better wrapper",
        paragraphs: [
          "Limited liability partnerships and limited companies are different legal persons with different tax. Do not assume a general partnership is ‘simpler’ once you have premises, staff or outside investors. Read [LLP versus limited company](/blog/llp-versus-limited-company) before you change structure.",
          "Wingate prepares partnership accounts, the SA800 and the partner returns so the set matches. [Get in touch](/contact) if a partner has joined or left mid-year — that is where allocations go wrong.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does the partnership pay the partners’ tax?",
        answer: "Not automatically. Each partner is responsible for their Self Assessment bill unless you agree privately to reserve cash in the firm for tax.",
      },
      {
        question: "Can a partnership employ people?",
        answer: "Yes. Employees of the partnership go through PAYE. Partners themselves are not employees of the partnership.",
      },
      {
        question: "Is a husband-and-wife firm a partnership?",
        answer: "It can be, if you are carrying on business together with a view to profit. Informal ‘helping out’ without a profit share is a different analysis and can cause NIC and employment issues.",
      },
    ],
  },
  {
    slug: "paye-for-employers",
    category: "Payroll",
    title: "How PAYE works for employers",
    seoTitle: "How PAYE works for UK employers | RTI, NIC and filings | Wingate",
    description: "A plain-English guide to Pay As You Earn: registering as an employer, RTI submissions, National Insurance, student loans and what HMRC expects each payday.",
    excerpt: "PAYE is a payday process, not a year-end cleanup. If the Full Payment Submission is late, the rest of payroll compliance usually follows it downhill.",
    date: "2026-08-06",
    dateLabel: "6 Aug 2026",
    read: "8 min read",
    relatedSlugs: ["hire-your-first-employee", "contractors-pension-contributions-subcontractors", "company-car-tax-electric"],
    sections: [
      {
        heading: "Register before the first paid payday",
        paragraphs: [
          "You need an employer PAYE reference before you pay staff. HMRC expects a Full Payment Submission on or before each payday under Real Time Information. Paying someone in cash and ‘sorting PAYE later’ is how underpayments and penalties start.",
          "Directors are not exempt. A director taking a salary needs a payroll record even if they are the only worker. Dividends are not processed through PAYE.",
        ],
      },
      {
        heading: "What you deduct, and what you pay across",
        paragraphs: [
          "Income Tax, employee National Insurance and other deductions such as student loan or pension contributions (where operated through payroll) come off the payslip. Employer National Insurance and, where due, apprenticeship levy are extra costs for the business.",
          "You pay HMRC on the usual 22nd of the following tax month, or quarterly if you are eligible and registered to do so. The payslip, the FPS and the bank payment should tell the same story.",
        ],
        bullets: [
          "Issue a starter checklist and verify the National Insurance number.",
          "Keep holiday pay, statutory payments and deductions from wages documented.",
          "Year-end forms still matter even with RTI — check GOV.UK for the current P60 and P11D timetable.",
        ],
      },
      {
        heading: "Benefits and termination payments",
        paragraphs: [
          "Company cars, medical insurance and some loans are reported as benefits. Electric cars have their own percentage rules — see [company car tax](/blog/company-car-tax-electric). Leaving payments can be taxable, exempt, or mixed. Do not guess from a forum thread.",
          "Wingate runs payroll for small employers or reviews a file you already operate. [Talk to us](/contact) before the first hire if you have never had a PAYE scheme.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I pay a family member without PAYE?",
        answer: "If they are genuinely employed, PAYE usually applies. If they are a partner, the partnership rules apply instead. Paying ‘cash for help’ with no records is a common enquiry trigger.",
      },
      {
        question: "What is an Employer PAYE reference?",
        answer: "It is the reference HMRC gives your scheme, often shown as an office number and a reference. You need it for payroll software, CIS (in some cases) and many grant or finance forms. It is not your Corporation Tax UTR.",
      },
      {
        question: "Do I still send P60s?",
        answer: "Employees should receive a P60 after the tax year if they were working for you on 5 April. Confirm the current method on GOV.UK — many are issued from payroll software rather than paper HMRC forms.",
      },
    ],
  },
  {
    slug: "accounting-for-gift-cards",
    category: "Companies",
    title: "How to account for gift cards in a UK business",
    seoTitle: "Accounting for gift cards UK | VAT and year-end | Wingate",
    description: "How UK shops and limited companies should treat gift cards and vouchers in the accounts and for VAT, including breakage and year-end deferred income.",
    excerpt: "Cash in for a gift card is not a sale of the underlying goods yet. Treat it as a liability until the card is redeemed or legally written back.",
    date: "2026-08-02",
    dateLabel: "2 Aug 2026",
    read: "7 min read",
    relatedSlugs: ["vat-registration-threshold", "voluntary-vat-registration", "llp-versus-limited-company"],
    sections: [
      {
        heading: "The cash is a liability first",
        paragraphs: [
          "When a customer buys a gift card you have taken money for a future supply. In the accounts that is usually deferred income, not turnover. Turnover is recognised when the card is redeemed against goods or services, or when you are entitled to keep unredeemed balances under the card terms and UK law.",
          "If you recognise all gift-card cash as sales on day one, you overstate income in busy gift seasons and understate it later. That distorts management accounts and can misstate Corporation Tax or Income Tax.",
        ],
      },
      {
        heading: "VAT depends on the type of voucher",
        paragraphs: [
          "UK VAT on vouchers distinguishes single-purpose and multi-purpose vouchers. A voucher that can only be used for one type of supply with VAT known at issue is often taxed up front. A voucher that can be used for mixed supplies is often taxed on redemption. Get the classification wrong and every return can be wrong.",
          "Third-party cards (you sell a supermarket voucher) are usually agency or a separate supply. Do not run them through your own sales codes as if you sold the groceries.",
        ],
        bullets: [
          "Keep a register of cards issued, redeemed and expired.",
          "Reconcile the liability to the payment processor or till report each month.",
          "Write a short policy for breakage so the year-end journals are consistent.",
        ],
      },
      {
        heading: "Year-end and refunds",
        paragraphs: [
          "Auditors and HMRC both look for a gift-card control account. Refunds of unused balances, chargebacks and stolen cards need a trail. If you operate in a limited company, this sits in the year-end pack with accrued income and other deferred items.",
          "Wingate can set the bookkeeping pattern in Xero or in your ledgers and then lock it into the year-end. [Ask us](/contact) if gift cards are material to your December or March year end.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I take unredeemed cards to profit after 12 months?",
        answer: "Only if the card terms and consumer law let you, and the accounts policy is supportable. Many retailers wait longer or keep a provision. Do not write off balances just to hit a profit target.",
      },
      {
        question: "Are staff gift cards a benefit in kind?",
        answer: "They can be. Trivial benefits have tight conditions. A £100 card to an employee is usually taxable. Directors need extra care.",
      },
      {
        question: "Do gift cards count toward the VAT threshold?",
        answer: "It depends on whether VAT is due on issue or on redemption for that voucher type. The turnover test follows the VAT treatment of the supply, not the till drawer.",
      },
    ],
  },
  {
    slug: "self-assessment-accountant-fees-2026",
    category: "Self Assessment",
    title: "How much do accountants charge for Self Assessment in 2026?",
    seoTitle: "Self Assessment accountant fees 2026 UK | Typical prices | Wingate",
    description: "Typical 2026 UK accountant fees for Self Assessment, what drives the price, and what is included when Wingate Accountants prepares your return.",
    excerpt: "A simple PAYE-plus-bank-interest return is not the same job as a sole trader with VAT, CIS and a property. Price the work, not a slogan.",
    date: "2026-07-28",
    dateLabel: "28 Jul 2026",
    read: "7 min read",
    relatedSlugs: ["self-assessment-tax-return-guide", "uk-tax-rates-thresholds-allowances-self-employed-2026", "voluntary-disclosure-to-hmrc"],
    sections: [
      {
        heading: "What the market actually charges",
        paragraphs: [
          "In 2026, a straightforward Self Assessment — employment, a little interest, maybe one property with clean records — often sits in the low hundreds of pounds with a high-street or online firm. A sole trader with a full set of accounts, VAT and a company director’s pages is a different fee, often several hundred pounds more.",
          "National chains advertise a starting price that applies only to the simplest file. Anything missing, late, or historically wrong is extra. That is reasonable: reconstructing two years of Amazon sales is not the same as importing a P60.",
        ],
      },
      {
        heading: "What should be in the fee",
        paragraphs: [
          "A proper fee should cover a review of your records, the tax computation, the online filing, a short explanation of the bill and payments on account, and correspondence on that return. It should not silently exclude ‘questions from HMRC’ if those questions are about the return the firm just filed.",
          "Disclosures, enquiry defence, bookkeeping catch-up and Companies House accounts are separate jobs. Mixing them into a ‘cheap SA’ is how files get filed incomplete.",
        ],
        bullets: [
          "Simple employment or pension return: often a few hundred pounds.",
          "Sole trader with decent records: typically a mid-hundreds fee.",
          "Director plus company plus property: quote the whole set, not one form.",
        ],
      },
      {
        heading: "How Wingate quotes",
        paragraphs: [
          "We quote a fixed fee once we have seen the records, or a short scoping call if the history is messy. Undeclared income is quoted as [disclosure work](/services/tax-disclosure), not as a standard return. [Request a quote](/contact) with a one-page summary of your income sources — that is enough to price fairly.",
          "The cheapest filing is rarely the cheapest outcome if it misses CIS, foreign income or capital gains. Pay for the return that matches your life.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is Self Assessment free if I file it myself?",
        answer: "HMRC does not charge a filing fee for a normal online return. You still pay the tax. Software and accountant fees are optional costs for accuracy and time.",
      },
      {
        question: "Why do some firms charge extra after January?",
        answer: "Late information compresses the work into penalty season. Many firms price that risk. Filing on time with complete records is the way to keep the fee at the quote.",
      },
      {
        question: "Do you charge per client of another firm?",
        answer: "No. Wingate is a practice serving its own clients. We quote the person or company in front of us.",
      },
    ],
  },
  {
    slug: "register-as-partner-in-a-partnership",
    category: "Tax",
    title: "How do I register as a partner in a UK partnership?",
    seoTitle: "Register as a partner in a partnership UK | HMRC steps | Wingate",
    description: "How to register with HMRC as a partner, what the partnership itself must file, and the records to put in place on day one.",
    excerpt: "Joining a partnership is not the same as registering a company. You need a Unique Taxpayer Reference, a profit share, and a partnership that already exists in HMRC’s eyes.",
    date: "2026-07-24",
    dateLabel: "24 Jul 2026",
    read: "6 min read",
    relatedSlugs: ["tax-for-general-partnerships", "llp-versus-limited-company", "self-assessment-tax-return-guide"],
    sections: [
      {
        heading: "Register yourself, then link to the firm",
        paragraphs: [
          "If you are not already in Self Assessment, register as self-employed / a partner so HMRC can issue or match your Unique Taxpayer Reference. If you already file a return, you still need to tell HMRC you have become a partner so the partnership pages appear.",
          "The partnership needs its own UTR and a partnership return. A new firm registers the partnership; an existing firm adds you to the partners list. Do both. One without the other produces mismatched SA800s.",
        ],
      },
      {
        heading: "Agree the commercial terms in writing",
        paragraphs: [
          "HMRC will tax you on your allocated profit, not on what you drew. If the agreement is silent, default partnership law and messy emails take over. Put in writing: profit share, capital introduced, who can bind the firm, and what happens on exit.",
          "National Insurance, VAT and PAYE for any staff sit at firm level. Read [tax for general partnerships](/blog/tax-for-general-partnerships) alongside this page.",
        ],
        bullets: [
          "Keep a copy of the partnership agreement with the first accounts.",
          "Open a partnership bank account — do not run the firm through one partner’s personal account if you can avoid it.",
          "Diary the 31 January Self Assessment deadline for every partner, not just the nominated partner.",
        ],
      },
      {
        heading: "LLPs are a different registration",
        paragraphs: [
          "A limited liability partnership is registered at Companies House as well as with HMRC. Do not use the general partnership process for an LLP. If you are unsure which vehicle you joined, check the written agreement and any Companies House number.",
          "Wingate can complete the HMRC registrations and set the first-year bookkeeping. [Contact us](/contact) before the first profit distribution.",
        ],
      },
    ],
    faqs: [
      {
        question: "How long does a partner UTR take?",
        answer: "HMRC posting times vary. Apply as soon as you join so you are not waiting in January. You can often file once the UTR is on the account.",
      },
      {
        question: "Do I need a new National Insurance number?",
        answer: "No. You use your existing number. Partners pay National Insurance through Self Assessment classes, not through a new card.",
      },
      {
        question: "Can I be a partner and an employee of the same firm?",
        answer: "In a general partnership you are not usually an employee of that partnership. Different group structures exist; they need a specific analysis.",
      },
    ],
  },
  {
    slug: "using-debentures-to-secure-a-company-loan",
    category: "Companies",
    title: "Using debentures to secure a company loan",
    seoTitle: "Company debentures and secured loans UK | Wingate Accountants",
    description: "What a debenture is, how UK companies use them to secure borrowing, the Companies House filing, and what directors should check before signing.",
    excerpt: "A debenture is a security document, not free money. It can unlock a facility — and it can put the lender first if the company later fails.",
    date: "2026-07-20",
    dateLabel: "20 Jul 2026",
    read: "7 min read",
    relatedSlugs: ["llp-versus-limited-company", "sole-trader-or-limited-company", "hire-your-first-employee"],
    sections: [
      {
        heading: "What a debenture actually is",
        paragraphs: [
          "In UK company finance a debenture usually means a written instrument creating security over the company’s assets in favour of a lender. It may be a fixed charge over specific assets, a floating charge over the rest of the business, or both.",
          "Banks, invoice funders and some directors’ loan arrangements use them. The company can keep trading, but the lender’s rights sit on the asset base. That is the point of the document.",
        ],
      },
      {
        heading: "Companies House and priority",
        paragraphs: [
          "Most charges must be registered at Companies House within the statutory period or they risk being void against a liquidator or other creditors. Search the company’s charge history before you sign a second facility — you need to know who is already ahead of you.",
          "A personal guarantee is separate. Lenders often want both a debenture from the company and a guarantee from the directors. Signing one does not cancel the other.",
        ],
        bullets: [
          "Read which assets are fixed-charged; those often cannot be sold without consent.",
          "Check whether the charge is all-monies or limited to a stated facility.",
          "Diary the filing deadline the day the document is dated.",
        ],
      },
      {
        heading: "Accounts and advice",
        paragraphs: [
          "Secured debt still appears on the balance sheet as borrowings, with disclosure of the security. It is not an off-balance-sheet trick. If you are refinancing, model cash interest and covenant tests before you complete.",
          "Wingate is not a law firm. We help directors understand the accounts impact and the tax of any connected interest. Have a solicitor review the charge wording, then [speak to us](/contact) about the bookkeeping and year-end disclosure.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does a debenture mean the bank owns the company?",
        answer: "No. The shareholders still own the company. The lender has security over assets and contractual rights if you default.",
      },
      {
        question: "Can a director take a debenture for their own loan?",
        answer: "Sometimes, and it can be sensitive in insolvency. Priority, filing and whether the loan was genuine all get examined. Take legal advice first.",
      },
      {
        question: "Is this the same as a mortgage on a property?",
        answer: "A legal mortgage over land is a form of security, often alongside a debenture. Property also has Land Registry filings. Do not treat them as interchangeable.",
      },
    ],
  },
  {
    slug: "monthly-cis-returns",
    category: "Payroll",
    title: "What is a monthly CIS return?",
    seoTitle: "Monthly CIS return UK | How contractors file | Wingate Accountants",
    description: "How the Construction Industry Scheme monthly return works, who must file, deduction rates, and what happens if a contractor misses the deadline.",
    excerpt: "If you pay subcontractors in construction, CIS is a monthly filing duty. The return and the tax you withheld have to match.",
    date: "2026-07-16",
    dateLabel: "16 Jul 2026",
    read: "7 min read",
    relatedSlugs: ["contractors-pension-contributions-subcontractors", "paye-for-employers", "self-assessment-tax-return-guide"],
    sections: [
      {
        heading: "Who files, and who does not",
        paragraphs: [
          "Contractors in the Construction Industry Scheme file a monthly return of payments to subcontractors, including the amount withheld. Many small builders are contractors for CIS even if they also do some labour themselves.",
          "A subcontractor who only receives payments does not file this monthly contractor return. They still need the payment and deduction statements to complete Self Assessment or company accounts. Gross payment status changes the deduction rate; it does not remove record-keeping.",
        ],
      },
      {
        heading: "The monthly rhythm",
        paragraphs: [
          "The CIS tax month ends on the 5th. The return is due by the 19th (paper) or 19th/online timetable HMRC publishes — confirm the current date on GOV.UK. Nil returns can still be required if the scheme is open but you paid nobody.",
          "Deduction rates depend on whether the subcontractor is registered and verified. Paying someone you have not verified is how the higher default rate appears. Verification is not the same as ‘they told me their UTR over WhatsApp’.",
        ],
        bullets: [
          "Verify every subcontractor before the first payment.",
          "Give each subcontractor a statement of tax deducted.",
          "Pay the CIS tax to HMRC on the same cycle as the return.",
        ],
      },
      {
        heading: "Status still matters",
        paragraphs: [
          "CIS does not decide employment status. A labour-only worker can be inside CIS on paper and still be an employee for PAYE and pensions. See [contractor pensions and subcontractors](/blog/contractors-pension-contributions-subcontractors).",
          "Wingate files CIS for contractors and ties the deductions into year-end. [Contact us](/contact) if you have missed months — late filing penalties accrue on the scheme, not on good intentions.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I skip a month if I paid nobody?",
        answer: "Often you must still file a nil return while the scheme is active. Check your HMRC account rather than assuming silence is fine.",
      },
      {
        question: "Does CIS replace Self Assessment for the subcontractor?",
        answer: "No. Tax deducted at source is a credit. The subcontractor still reports profit and claims the credit on their return or in the company.",
      },
      {
        question: "How do I get gross payment status?",
        answer: "HMRC has turnover, compliance and business tests. Failed returns and unpaid tax are the usual blockers. We can review whether you are close before you apply.",
      },
    ],
  },
  {
    slug: "vat-registration-threshold",
    category: "VAT",
    title: "What happens if you go over the VAT registration threshold?",
    seoTitle: "VAT registration threshold UK | Late registration risks | Wingate",
    description: "What UK businesses must do after exceeding the VAT threshold, how HMRC looks at historic turnover, and how to register without compounding the error.",
    excerpt: "The VAT threshold is a rolling turnover test. Crossing it is not a year-end decision. Waiting for the next January usually makes the bill worse.",
    date: "2026-07-12",
    dateLabel: "12 Jul 2026",
    read: "7 min read",
    relatedSlugs: ["voluntary-vat-registration", "selling-on-amazon-uk-tax", "accounting-for-gift-cards"],
    sections: [
      {
        heading: "The test is rolling taxable turnover",
        paragraphs: [
          "You must monitor taxable supplies in the last 12 months, not just the tax year. The current threshold is published on GOV.UK and has been £90,000 in recent years — confirm the figure that applies on the day you check, because Budgets change it.",
          "Exempt supplies and some non-business income do not count in the same way. Most trading sales do. If you have already passed the limit, you normally need to register within the statutory deadline from the end of the month you exceeded it.",
        ],
      },
      {
        heading: "Late registration is backdated",
        paragraphs: [
          "HMRC will usually register you from the date you should have been registered. You may owe output VAT on past sales even if you never charged it. You may also reclaim some input VAT, which can offset part of the bill — but only with invoices that meet the rules.",
          "Telling customers months later that you ‘should have added VAT’ is commercially ugly. Some businesses absorb the VAT. That is a cash hit. Do not ignore the registration in the hope the numbers average down.",
        ],
        bullets: [
          "Keep a 12-month turnover tracker, updated monthly.",
          "Apply as soon as the test is met — not at year end.",
          "If you are already late, treat it as a disclosure of the correct date, not a fresh voluntary application.",
        ],
      },
      {
        heading: "After you are registered",
        paragraphs: [
          "You charge VAT, file returns under Making Tax Digital for VAT, and keep digital records. You can still choose [voluntary registration](/blog/voluntary-vat-registration) before you hit the limit if the commercial case is there.",
          "Wingate can calculate the historic VAT, register the business and put compatible software in place. [Call us](/contact) if you think you crossed the line last year and have not told HMRC yet.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does the threshold include VAT?",
        answer: "The test is on taxable turnover according to VAT rules. Do not add VAT on top of VAT-exclusive sales, and do not ignore cash that should have included VAT.",
      },
      {
        question: "Can I deregister if sales fall again?",
        answer: "Yes, if you are below the deregistration threshold and you apply. Output VAT on remaining goods can still arise. Plan the exit.",
      },
      {
        question: "Are worldwide Amazon sales included?",
        answer: "UK VAT on goods and the place-of-supply rules are specific. Many marketplace sellers have a UK registration even when some sales are treated as outside the UK. Get a proper review, not a forum rule of thumb.",
      },
    ],
  },
  {
    slug: "sole-trader-or-limited-company",
    category: "Companies",
    title: "Should I register as a sole trader or a limited company?",
    seoTitle: "Sole trader vs limited company UK | Tax and risk | Wingate",
    description: "How to choose between sole trader and limited company in the UK: tax, National Insurance, limited liability, accounts and when incorporation actually helps.",
    excerpt: "A company is not automatically cheaper. It is a different legal person with extra filings — useful when profit, risk or finance justify it.",
    date: "2026-07-08",
    dateLabel: "8 Jul 2026",
    read: "8 min read",
    relatedSlugs: ["llp-versus-limited-company", "uk-tax-rates-thresholds-allowances-self-employed-2026", "hire-your-first-employee"],
    sections: [
      {
        heading: "Sole trader: simpler, personally on the hook",
        paragraphs: [
          "As a sole trader you are the business. Profits are yours, losses are yours, and creditors can pursue personal assets if things go wrong. Self Assessment and, if needed, VAT are the core filings.",
          "That simplicity is valuable at the start. One UTR, one return, drawings from the same account if you must. It is also why a tradesperson with site risk, or a consultant with a large contract, often outgrows it.",
        ],
      },
      {
        heading: "Limited company: extra law, limited liability",
        paragraphs: [
          "A company is a separate legal person. It owns the contracts, pays Corporation Tax on its profits, and files accounts at Companies House. You take money as salary, dividends or both. Directors’ duties apply even if you own 100 percent.",
          "Limited liability is real but not magic. Banks still ask for personal guarantees. Wrongful trading, unpaid PAYE and some taxes can still reach directors. Incorporation is a governance decision as well as a tax model.",
        ],
        bullets: [
          "Compare take-home after Corporation Tax, PAYE and dividend tax — not turnover.",
          "Budget for accounts, Confirmation Statement and a payroll even for one director.",
          "Do not fold a risky trade into a company and strip it of assets the same week.",
        ],
      },
      {
        heading: "Tax is only one column",
        paragraphs: [
          "At modest profits a sole trader can still take home more after National Insurance than a company once you pay for accounts and payroll. At higher profits, retained cash, research reliefs or bringing in a shareholder can tip the other way. The numbers need a spreadsheet for your case.",
          "IR35 and off-payroll working can also make a company less attractive for some contractors. Wingate will model both structures and the cost of moving from one to the other. [Book a conversation](/contact) before you buy an off-the-shelf company.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I start as a sole trader and incorporate later?",
        answer: "Yes. You can transfer the trade into a company. There are tax and VAT issues on the transfer, including possible capital gains and VAT on assets. Plan the date.",
      },
      {
        question: "Does a company look more professional?",
        answer: "Sometimes. Customers and lenders do notice ‘Ltd’. That is not a reason to ignore the filing burden or a personal guarantee sitting in the pack.",
      },
      {
        question: "Is an LLP the middle option?",
        answer: "It can be for professional firms. See [LLP versus limited company](/blog/llp-versus-limited-company).",
      },
    ],
  },
  {
    slug: "hire-your-first-employee",
    category: "Payroll",
    title: "How to hire your first employee in the UK",
    seoTitle: "Hiring your first employee UK | PAYE, pensions, contracts | Wingate",
    description: "A checklist for UK sole traders and companies hiring their first employee: PAYE, auto-enrolment, employment contract, Right to Work and the first payroll.",
    excerpt: "The first hire is a compliance event, not only a recruitment one. Get PAYE and the contract right before the first payday.",
    date: "2026-07-04",
    dateLabel: "4 Jul 2026",
    read: "7 min read",
    relatedSlugs: ["paye-for-employers", "contractors-pension-contributions-subcontractors", "sole-trader-or-limited-company"],
    sections: [
      {
        heading: "Register as an employer, then run payroll",
        paragraphs: [
          "HMRC requires an employer PAYE scheme before you pay wages. Choose a payday, a payroll software or agent, and file RTI on time. Read [how PAYE works](/blog/paye-for-employers) for the monthly rhythm.",
          "National Minimum Wage / National Living Wage applies even to family members if they are employees. Unpaid ‘trial weeks’ are tightly constrained. Holiday pay accrues from day one.",
        ],
      },
      {
        heading: "Pensions, insurance and Right to Work",
        paragraphs: [
          "Auto-enrolment duties can start from the first eligible jobholder. Employers’ liability insurance is a legal requirement when you employ staff. Right to Work checks need to be done before employment starts, with a record you can show.",
          "A written statement of particulars is required. A proper contract is cheaper than a dispute. Sick pay, family leave and working time rules apply to tiny firms as well as large ones.",
        ],
        bullets: [
          "Right to Work check and copy on file.",
          "PAYE scheme live before payday one.",
          "Pension staging / duties assessed, not postponed indefinitely.",
          "Employers’ liability insurance certificate displayed or available.",
        ],
      },
      {
        heading: "Sole traders can employ people",
        paragraphs: [
          "You do not need a limited company to have staff. The sole trader is the employer. That also means the employment liabilities sit on you personally. Some owners incorporate at the same time as the first hire for that reason — see [sole trader or limited company](/blog/sole-trader-or-limited-company).",
          "Wingate can register the PAYE scheme and run the first six months of payroll while you settle the role. [Get in touch](/contact) a couple of weeks before the start date, not the night before payday.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can my first hire be a contractor instead?",
        answer: "Only if they are genuinely self-employed. Mislabeling an employee as a contractor stores up PAYE, pensions and holiday claims. Status has to match the facts.",
      },
      {
        question: "Do I need a workplace pension for one part-time person?",
        answer: "Possibly, if they meet the age and earnings tests. There is no ‘tiny firm’ exemption from auto-enrolment once you employ eligible jobholders.",
      },
      {
        question: "What is an Employer Reference Number?",
        answer: "People usually mean the PAYE reference. You will also see an Accounts Office reference for paying HMRC. Keep both on the payroll file.",
      },
    ],
  },
  {
    slug: "llp-versus-limited-company",
    category: "Companies",
    title: "What is the difference between an LLP and a limited company?",
    seoTitle: "LLP vs limited company UK | Tax and liability | Wingate Accountants",
    description: "LLP versus limited company in the UK: legal personality, tax, accounts, partners versus shareholders, and which wrapper suits professional firms.",
    excerpt: "Both have limited liability and Companies House filings. The tax engine underneath is not the same, and neither is how you take money out.",
    date: "2026-06-30",
    dateLabel: "30 Jun 2026",
    read: "8 min read",
    relatedSlugs: ["sole-trader-or-limited-company", "tax-for-general-partnerships", "using-debentures-to-secure-a-company-loan"],
    sections: [
      {
        heading: "Same street address, different statute",
        paragraphs: [
          "A private limited company is owned by shareholders and run by directors. Profits belong to the company until distributed. Corporation Tax applies to the company’s profits.",
          "A limited liability partnership has members, not shareholders. For tax it is usually transparent: members are taxed on their profit shares much like partners, while still enjoying limited liability if the LLP is used properly.",
        ],
      },
      {
        heading: "Taking money out",
        paragraphs: [
          "Company owners typically mix salary and dividends, with PAYE on the salary. LLP members usually take drawings against profit allocations. Mixed member rules, salaried member tests and disguised remuneration can all recharacterise an LLP member who is in substance an employee.",
          "Investors and employee share schemes are far easier in a company. An LLP can raise capital, but it is a less familiar wrapper for outside equity.",
        ],
        bullets: [
          "Companies: CT600, accounts, Confirmation Statement, payroll for directors.",
          "LLPs: accounts, Confirmation Statement, SA800-style partnership tax, member Self Assessments.",
          "Both: VAT if registered, PAYE for actual employees.",
        ],
      },
      {
        heading: "Which one should you use?",
        paragraphs: [
          "Professional practices that want partnership economics with limited liability often choose an LLP. Founders who want to retain profits, sell shares or look ‘corporate’ to lenders often choose a company. General partnerships with no limited liability are a third option — see [tax for general partnerships](/blog/tax-for-general-partnerships).",
          "Wingate prepares accounts for both. We will not recommend an LLP solely because a friend used one. [Ask for a structure note](/contact) that covers tax, liability and how you want to pay yourselves.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does an LLP pay Corporation Tax?",
        answer: "Generally no for a trading UK LLP — members pay Income Tax on their shares. There are exceptions and anti-avoidance rules. Do not assume ‘never’ without a review.",
      },
      {
        question: "Is an LLP more private?",
        answer: "LLPs still file accounts at Companies House. Privacy is not the reason to choose one.",
      },
      {
        question: "Can I convert a company to an LLP?",
        answer: "It is a reconstruction, not a form toggle. Tax, stamp and VAT issues arise. Plan it with an accountant and a solicitor.",
      },
    ],
  },
  {
    slug: "voluntary-disclosure-to-hmrc",
    category: "Disclosures",
    title: "Do I need to make a voluntary disclosure to HMRC?",
    seoTitle: "Voluntary disclosure to HMRC | When and how | Wingate Accountants",
    description: "When a UK taxpayer should make a voluntary disclosure to HMRC, how Digital Disclosure Service and COP9 differ, and why waiting usually costs more.",
    excerpt: "If you already know a return was wrong, HMRC’s penalty rules generally treat an unprompted disclosure more kindly than a prompted one.",
    date: "2026-06-26",
    dateLabel: "26 Jun 2026",
    read: "8 min read",
    relatedSlugs: ["self-assessment-tax-return-guide", "selling-on-amazon-uk-tax", "tax-for-actors-and-performers"],
    sections: [
      {
        heading: "Unprompted is a technical word",
        paragraphs: [
          "A disclosure is unprompted when you tell HMRC before they have opened an enquiry or given you reason to believe they are about to. That status can reduce penalties. Once a letter is on the doormat, you are usually in prompted territory.",
          "Common facts: omitted rental income, a side trade, crypto disposals, overseas accounts, or a company director’s loan that was never reported. The feeling of ‘it was only a few years’ does not stop interest running.",
        ],
      },
      {
        heading: "Choose the right channel",
        paragraphs: [
          "Many cases go through HMRC’s Digital Disclosure Service with a later computation and payment. Contractual Disclosure Facility (COP9) is for suspected tax fraud — it is a different, more serious process. Do not send a casual letter if the facts could be read as fraud; get advice first.",
          "Worldwide Disclosure and Let Property Campaign-style pathways still inform how HMRC expect rental and offshore histories to be laid out. Completeness matters more than a neat story.",
        ],
        bullets: [
          "Gather bank statements and property records before you notify.",
          "Do not destroy records. That makes everything worse.",
          "Pay on account if you can once the number is known — interest does not wait for the paperwork.",
        ],
      },
      {
        heading: "What Wingate does",
        paragraphs: [
          "This is a core service of the firm. We scope the years, reconstruct income, prepare the computation, submit the disclosure and handle the officer. See [tax disclosure services](/services/tax-disclosure).",
          "If you are waiting to see whether HMRC already knows, assume marketplace, bank and land registry data are not on your side. [Contact us](/contact) before you phone the helpline and improvise.",
        ],
      },
    ],
    faqs: [
      {
        question: "Will I go to prison if I disclose?",
        answer: "A full unprompted disclosure of careless or even some deliberate errors is usually a civil matter with tax, interest and penalties. Criminal investigation is a different path. Get advice if you are unsure which facts you have.",
      },
      {
        question: "Can I just amend last year’s return?",
        answer: "In-date amendments are fine for recent years. Older years, multiple years, or suspected fraud need a disclosure process, not a quiet tweak.",
      },
      {
        question: "Should I ignore a ‘nudge’ letter?",
        answer: "No. A nudge is often the start of prompted treatment. Reply with advice, not with silence.",
      },
    ],
  },
  {
    slug: "company-car-tax-electric",
    category: "Payroll",
    title: "Company car tax for electric cars",
    seoTitle: "Electric company car tax UK | BiK percentages | Wingate Accountants",
    description: "How UK company car tax works for electric and hybrid vehicles, benefit-in-kind percentages, and what employers must report on P11D or payroll.",
    excerpt: "Electric cars still create a benefit in kind if the company provides a car for private use. The percentage is lower than petrol — it is not zero forever.",
    date: "2026-06-20",
    dateLabel: "20 Jun 2026",
    read: "6 min read",
    relatedSlugs: ["paye-for-employers", "hire-your-first-employee", "uk-tax-rates-thresholds-allowances-self-employed-2026"],
    sections: [
      {
        heading: "The benefit is private use, not the badge on the boot",
        paragraphs: [
          "If a limited company or employer makes a car available for private use, a taxable benefit usually arises. That includes commuting. Pool cars that never go home and are used only for work can fall outside, but the conditions are strict.",
          "The cash equivalent uses the car’s list price (plus certain accessories) multiplied by a percentage. For zero-emission cars that percentage has been far below petrol and diesel. Parliament has already legislated stepped increases in later years — check the GOV.UK table for the tax year you are in.",
        ],
      },
      {
        heading: "Hybrids, vans and charging",
        paragraphs: [
          "Plug-in hybrids use different percentages driven by CO2 and electric range. Vans have a separate van benefit regime. Workplace charging of a company electric car is often not a benefit; charging an employee’s own car can be.",
          "Fuel is another axis. Electricity is not treated like petrol fuel benefit in the old way, but you still need a clean policy so directors do not mix personal supercharger bills into the company without a method.",
        ],
        bullets: [
          "Keep the list price invoice, not just the discounted amount you paid.",
          "Report the benefit through payroll or P11D as required for that year.",
          "Class 1A National Insurance on benefits is an employer cost — budget it.",
        ],
      },
      {
        heading: "Salary sacrifice still needs a genuine change",
        paragraphs: [
          "Swapping salary for a car has to meet the optional remuneration rules. A poorly drafted sacrifice can tax the greater of the salary given up and the car benefit. Have the numbers run before you order a fleet of SUVs.",
          "Wingate calculates benefits for directors and small fleets as part of payroll. [Send us the vehicle list](/contact) if year-end P11Ds have been guessed in previous years.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is a company electric car tax-free?",
        answer: "No. It is usually a low percentage of list price, not a nil benefit, unless a specific exemption applies (for example some pool or emergency vehicles).",
      },
      {
        question: "What if I pay for all private miles?",
        answer: "Paying for fuel does not by itself cancel the car benefit. There are reductions if you reimburse the full benefit, which almost nobody does accurately.",
      },
      {
        question: "Do sole traders have company car tax?",
        answer: "Sole traders do not have a ‘company’ car. They may disallow a private-use slice of motor expenses instead. Directors of their own company are in the benefit-in-kind world.",
      },
    ],
  },
  {
    slug: "self-assessment-tax-return-guide",
    category: "Self Assessment",
    title: "A complete guide to your Self Assessment tax return",
    seoTitle: "Self Assessment tax return UK guide | Deadlines and pages | Wingate",
    description: "What a UK Self Assessment return includes, who must file, the 31 January deadline, payments on account, and how to prepare records for your accountant.",
    excerpt: "Self Assessment is one online return made of several pages. File the pages that match your life, then pay the balancing payment and any payments on account.",
    date: "2026-06-16",
    dateLabel: "16 Jun 2026",
    read: "9 min read",
    relatedSlugs: ["uk-tax-rates-thresholds-allowances-self-employed-2026", "self-assessment-accountant-fees-2026", "voluntary-disclosure-to-hmrc"],
    sections: [
      {
        heading: "Who has to file",
        paragraphs: [
          "You usually need a return if you are self-employed, a partner, a landlord, a company director with untaxed income, or you have foreign or capital gains HMRC cannot collect through PAYE. HMRC also issues notices to file. If you get a notice, you must file even if the tax is nil.",
          "Registering late does not remove the duty. It just compresses the work into penalty season. If you should have been in Self Assessment earlier, that is often a [disclosure](/blog/voluntary-disclosure-to-hmrc) of earlier years as well as this year’s form.",
        ],
      },
      {
        heading: "The pages that actually matter",
        paragraphs: [
          "Employment, self-employment, UK property, capital gains, foreign, and additional information are the common modules. You do not complete every page. You do complete every page that applies. Leaving off a property because ‘the letting agent dealt with it’ is a classic omission.",
          "The tax calculation is only as good as the records. Bank statements, invoices, mileage logs and completion statements beat a reconstructed guess in March.",
        ],
        bullets: [
          "Online deadline: 31 January after the tax year.",
          "Paper deadline is earlier — most people should file online.",
          "Balancing payment is due 31 January; payments on account are 31 January and 31 July.",
        ],
      },
      {
        heading: "Payments on account",
        paragraphs: [
          "If your last bill was over HMRC’s threshold and not all collected through PAYE, you usually pay 50 percent on account toward the following year, twice. That feels like paying twice. It is not — it is a prepayment. Reducing payments on account is possible if you expect profits to fall, but you need a reasonable basis.",
          "Wingate prepares and files the return, explains the three numbers on the statement, and diaries the July payment. Start at [Self Assessment services](/services/self-assessment) or [send your records](/contact).",
        ],
      },
    ],
    faqs: [
      {
        question: "What if I cannot pay on 31 January?",
        answer: "File on time anyway — late filing and late payment are different penalties. Then speak to HMRC about Time to Pay, ideally with a computation in hand.",
      },
      {
        question: "Can I file without a UTR?",
        answer: "You need a Unique Taxpayer Reference to file. Register as soon as you know you need a return. Do not wait for January.",
      },
      {
        question: "Does Making Tax Digital replace Self Assessment?",
        answer: "Making Tax Digital for Income Tax adds digital records and updates for qualifying sole traders and landlords. It does not mean you ignore the annual return. Confirm the latest timetable on GOV.UK.",
      },
    ],
  },
  {
    slug: "capital-gains-on-property-and-shares",
    category: "Property",
    title: "Capital Gains Tax on UK property and shares",
    seoTitle: "Capital Gains Tax UK property and shares | Wingate Accountants",
    description: "How UK Capital Gains Tax works on residential property, shares and crypto, which reliefs may apply, and the reporting deadlines after a sale.",
    excerpt: "CGT is a separate calculation from your wages. The annual exemption is smaller than many people still think, and property sales can have their own reporting clock.",
    date: "2026-06-12",
    dateLabel: "12 Jun 2026",
    read: "8 min read",
    relatedSlugs: ["voluntary-disclosure-to-hmrc", "self-assessment-tax-return-guide", "sole-trader-or-limited-company"],
    sections: [
      {
        heading: "Work out the gain before you spend the proceeds",
        paragraphs: [
          "Capital Gains Tax applies when you dispose of an asset — typically selling, gifting, or receiving insurance proceeds — for more than the allowable cost. Allowable cost is usually what you paid plus certain improvement and selling costs, not a round-number guess.",
          "Residential property that is not fully covered by Private Residence Relief can need a report and payment to HMRC on a short deadline after completion, as well as an entry on Self Assessment. Confirm the current reporting window on GOV.UK; it has changed before.",
        ],
      },
      {
        heading: "Reliefs are specific, not vibes",
        paragraphs: [
          "Private Residence Relief, lettings relief (now limited), spouse transfers, Business Asset Disposal Relief, and Incorporation Relief all have conditions. Using the wrong nickname for a relief is how claims fail. Business Asset Rollover Relief is for replacing qualifying business assets — not for a buy-to-let swap you have already completed.",
          "Shares and crypto follow CGT rules with matching and pooling. ‘I moved it between my own wallets’ is usually not a disposal; ‘I sold it for sterling on an exchange’ usually is.",
        ],
        bullets: [
          "Keep completion statements and broker contract notes.",
          "Record dates — same-day and 30-day share matching can change the gain.",
          "Do not net a property loss against your salary on the employment page.",
        ],
      },
      {
        heading: "If the disposal was years ago",
        paragraphs: [
          "Unreported property or crypto gains are a staple of [voluntary disclosures](/blog/voluntary-disclosure-to-hmrc). Interest will have run. A clean computation is still better than waiting for a nudge letter.",
          "CGT is one of Wingate’s specialist areas. See [Capital Gains Tax services](/services/capital-gains) or [contact the team](/contact) with the completion statement before you file.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do I pay CGT if I sell my home?",
        answer: "Often no, if it has been your only or main residence throughout and the relief conditions are met. Partial letting, a long delay in selling, or more than one home can create a chargeable gain.",
      },
      {
        question: "Is crypto taxed as income or capital?",
        answer: "Frequent trading can be income in rare cases. Most individuals pay CGT on disposals. Airdrops and mining can be income. Keep the exchange CSVs.",
      },
      {
        question: "Can a company pay CGT?",
        answer: "Companies generally pay Corporation Tax on chargeable gains, not the individual CGT rates. Different indexation and relief rules apply.",
      },
    ],
  },
];

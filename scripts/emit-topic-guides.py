#!/usr/bin/env python3
"""Write original Wingate articles from TAP titles (topics only — no source copy)."""
from __future__ import annotations

import html
import json
import re
from pathlib import Path

TOPICS = json.loads(Path("/tmp/tap-after-2024-all.json").read_text())
OUT = Path(__file__).resolve().parents[1] / "content" / "extra-posts.json"

# Topics already covered by the long-form originals in lib/guides.ts
SKIP_TITLE_BITS = (
    "uk tax rates, thresholds and allowances for the self-employed",
    "do contractors need to make pension contributions for subcontractors",
    "tax without the drama",
    "what you need to know about selling on amazon",
    "should i make a voluntary registration for vat",
    "how pay as you earn (paye) works",
    "accounting for gift cards",
    "how much do accountants charge for self assessment",
    "how do i register as a partner in a partnership",
    "using debentures to secure a company loan",
    "what is a monthly cis return",
    "what happens if i do not register for vat once i exceed",
    "should i register myself as a sole trader or a limited company",
    "is it cheaper to be a sole trader or limited company",
    "how do i hire my first employee",
    "what’s the difference between an llp and a limited company",
    "what's the difference between an llp and a limited company",
    "a guide to tax for general partnerships",
    "do i need to make a voluntary disclosure to hmrc",
    "company car tax for electric cars",
    "a complete guide to your self assessment form",
    "a guide to capital gains tax on property",
)

SKIP_SLUGS = {
    "do-contractors-need-to-make-pension-contributions-for-subcon",
    "do-contractors-need-to-make-pension-contributions-for-subcontractors",
    "uk-tax-rates-thresholds-and-allowances-for-employers-and-the",
    "uk-tax-rates-thresholds-and-allowances-for-the-self-employed",
    "accountants-for-actors",
    "what-you-need-to-know-about-selling-on-amazon",
    "should-i-voluntarily-register-for-vat-early",
    "a-guide-to-tax-for-general-partnerships",
    "understanding-accountancy-terms-pay-as-you-earn-paye",
    "accounting-for-gift-cards",
    "how-much-do-accountants-charge-for-self-assessment",
    "how-do-i-register-as-a-partner-in-a-partnership",
    "debentures",
    "what-is-a-cis-monthly-return",
    "what-happens-if-i-do-not-register-for-vat-once-i-have-exceed",
    "should-i-register-myself-as-a-sole-trader-or-a-limited-compa",
    "should-i-register-myself-as-a-sole-trader-or-a-limited-company",
    "hiring-your-first-employee",
    "whats-difference-llp-limited-company",
    "do-i-need-to-make-a-voluntary-disclosure-to-hmrc",
    "electric-cars-in-limited-companies",
    "a-complete-guide-to-your-self-assessment-form",
    "a-guide-to-capital-gains-tax-on-property",
    "is-it-cheaper-to-be-a-sole-trader-or-limited-company",
}


def e(s: str) -> str:
    return html.escape(s, quote=False)


def classify(title: str, slug: str) -> tuple[str, str]:
    t = f"{title} {slug}".lower()
    if any(k in t for k in ("vat", "option to tax")):
        return "VAT", "vat-accounting"
    if any(k in t for k in ("paye", "p45", "p46", "starter checklist", "employee", "wages", "payroll", "auto-enrol", "tax code", "employer reference")):
        return "Payroll", "payroll-services"
    if any(k in t for k in ("cis", "construction")):
        return "Payroll", "payroll-services"
    if any(k in t for k in ("landlord", "rental", "property", "stamp duty", "nrls")):
        return "Property", "property-owners"
    if any(k in t for k in ("disclosure", "nudge", "enquiry", "audit", "compliance check", "time to pay")):
        return "Disclosures", "tax-disclosures"
    if any(k in t for k in ("self assessment", "tax return", "sa10", "utr", "trading allowance", "sole trader", "self-employed", "simplified expenses")):
        return "Self Assessment", "self-assessment-tax"
    if any(k in t for k in ("limited", "director", "shareholder", "share", "llp", "companies house", "psc", "debenture", "dormant", "formation")):
        return "Companies", "annual-accounting-services"
    return "Tax", "self-assessment-tax"


def desc(title: str) -> str:
    base = f"{title.rstrip('?')}. A UK guide from Wingate Accountants in London, with HMRC filing notes and what to confirm on GOV.UK."
    return base[:168]


def specific_block(title: str, slug: str) -> str:
    t = f"{title} {slug}".lower()
    blocks = []
    if "utr" in t or "unique taxpayer" in t:
        blocks.append("<p>Your Unique Taxpayer Reference is ten digits. It appears on the HMRC letter when you register for Self Assessment, on the tax account, and often on the SA302. It is not your National Insurance number and it is not a VAT number. If you have lost it, the Government Gateway tax account is the usual place to look before you phone HMRC.</p>")
    if "sa102" in t:
        blocks.append("<p>SA102 is the employment page of a Self Assessment return. Use it for PAYE jobs, including a director’s salary. Do not put freelance invoices here. P60 and P45 figures should match what HMRC already holds.</p>")
    if "sa103" in t:
        blocks.append("<p>SA103 is the self-employment page. Turnover, allowable expenses and capital allowances sit here. Short and full versions exist; which one you need depends on the size of the trade. Confirm the current thresholds on GOV.UK.</p>")
    if "sa104" in t:
        blocks.append("<p>SA104 is the partnership page used by an individual partner. It must tie to the partnership return. A different profit figure on the partner’s return is a common trigger for HMRC correspondence.</p>")
    if "sa106" in t:
        blocks.append("<p>SA106 reports foreign income and certain foreign tax credits. Keep statements from the overseas payer and any foreign tax paid. Double tax treaties can change the UK bill; they do not mean you skip the page.</p>")
    if "sa109" in t:
        blocks.append("<p>SA109 is the residence, remittance basis and overseas pages used by people who are not simply UK resident with only UK income. Domicile and split-year treatment are easy to get wrong. This is specialist Self Assessment, not a side form.</p>")
    if "1263l" in t or "tax code" in t:
        blocks.append("<p>A tax code tells a PAYE employer how much personal allowance to give you in that job. Letters such as L, M, N, K and BR change the meaning. A code that looks like a uniform deduction is still a PAYE instruction — check it on the HMRC app rather than guessing from a forum.</p>")
    if "marriage allowance" in t or "married couple" in t:
        blocks.append("<p>Marriage Allowance transfers a slice of unused personal allowance between spouses or civil partners when one is a basic-rate taxpayer. Married Couple’s Allowance is older, linked to age conditions, and calculated differently. They are not interchangeable.</p>")
    if "trading allowance" in t:
        blocks.append("<p>The trading allowance can cover small amounts of miscellaneous trading or casual income. You cannot usually mix it with a full expenses claim on the same trade. Once the activity is a proper business, a normal Self Assessment computation is cleaner.</p>")
    if "simplified expenses" in t:
        blocks.append("<p>Simplified expenses are HMRC’s flat rates for some motoring, working from home and living at a business premises. They can save record-keeping. They are not always the cheaper option if you have high actual costs. Run both methods before you lock the return.</p>")
    if "option to tax" in t:
        blocks.append("<p>An option to tax is a VAT choice over land or buildings that would otherwise be exempt. It can let you recover VAT on costs, but it also means VAT on rent or a sale. It must be notified to HMRC and it can bind a purchaser. Do not option casually.</p>")
    if "micro-entity" in t:
        blocks.append("<p>Micro-entity accounts are a Companies House filing option for companies under size tests. They are shorter, not a way to hide a tax computation. HMRC still wants a Corporation Tax return with the full numbers behind the abbreviated accounts.</p>")
    if "stamp duty" in t:
        blocks.append("<p>Stamp Duty Land Tax (and the Scottish and Welsh equivalents) is a transaction tax on property, separate from Capital Gains Tax and from Income Tax on rent. First-time buyer and additional-property rates change. Confirm the calculator on GOV.UK for the completion date, not the offer date.</p>")
    if "crypto" in t:
        blocks.append("<p>Most individuals pay Capital Gains Tax when they dispose of crypto, including selling for sterling or swapping tokens. Records from every exchange matter. HMRC already receives data from some platforms. Omitting gains is a disclosure issue, not a software issue.</p>")
    if "etsy" in t:
        blocks.append("<p>Regular sales on Etsy are a trade. Platform fees are expenses; payouts are not profit. VAT can apply if taxable turnover crosses the threshold. Selling a child’s crafts can still be the parent’s tax if the parent is running the shop.</p>")
    if "time to pay" in t:
        blocks.append("<p>Time to Pay is an HMRC instalment arrangement. File the return first where you can — late filing and late payment are different penalties. Agreeing a plan before enforcement is cheaper than waiting for a debt collector.</p>")
    if "auto-enrol" in t:
        blocks.append("<p>Auto-enrolment follows workers who meet age and earnings tests. Directors of their own company can sit outside in some one-person cases, but adding staff changes the duty. The Pensions Regulator is not the same as HMRC, and skipping a scheme is a compliance failure.</p>")
    if "bankrupt" in t:
        blocks.append("<p>Bankruptcy and personal insolvency restrict what you may do as a director or in some regulated trades. Trading through a new company to dodge the restrictions is how people get into further trouble. Get insolvency advice as well as tax advice.</p>")
    if "divorce" in t:
        blocks.append("<p>Shares in a family company are often a matrimonial asset. Transfers between spouses can have tax consequences, and extracting cash to fund a settlement can trigger Income Tax or Capital Gains Tax. The company itself does not ‘split’ automatically.</p>")
    if "letter of intent" in t:
        blocks.append("<p>A letter of intent on a business sale is usually commercial, not a tax form. Heads of terms still affect when a disposal happens for Capital Gains Tax and whether earn-outs are treated as capital or income. Have the tax modelled before you sign exclusivity.</p>")
    if "sundry" in t:
        blocks.append("<p>Sundry expenses are not a dumping ground. HMRC expects a nature of the cost. If you cannot describe it, it probably does not belong on the return. Material items should have their own nominal code.</p>")
    if "trade debtor" in t:
        blocks.append("<p>Trade debtors are amounts customers owe you. In accounts they are an asset. Writing them off needs evidence you have chased the debt. VAT bad-debt relief has its own conditions and timing.</p>")
    if "opening and closing" in t:
        blocks.append("<p>Opening balances must match last year’s closing balances. If they do not, the accounts and the tax computation will drift. Bank, directors’ loan and VAT control accounts are the usual places the mismatch hides.</p>")
    if "gross and net profit" in t:
        blocks.append("<p>Gross profit is sales minus the direct cost of those sales. Net profit is after overheads. Taxable profit starts from accounts profit and then adjusts for disallowable costs and capital allowances. They are related, not the same number.</p>")
    if "cash flow" in t:
        blocks.append("<p>Cash flow is the movement of money, not the profit figure. You can be profitable and still run out of cash if customers pay late or you buy stock. VAT, PAYE and Corporation Tax instalments need a calendar, not hope.</p>")
    if "dormant" in t:
        blocks.append("<p>A dormant company for Companies House is not always dormant for tax. A company can be non-trading and still have a bank account, a charge, or a Corporation Tax obligation. File the right dormant accounts and tell HMRC — silence is not a filing.</p>")
    if "psc" in t or "person with significant control" in t:
        blocks.append("<p>A person with significant control is a Companies House transparency rule. A shareholder owns shares; a PSC may be the same person or someone who controls the company another way. Both registers must stay accurate.</p>")
    if "two managing directors" in t:
        blocks.append("<p>UK companies can have more than one director. ‘Managing director’ is a title, not a separate legal office. What matters is who is appointed at Companies House and who can bind the company under the articles.</p>")
    if "national insurance on pension" in t:
        blocks.append("<p>The State Pension and most occupational pensions do not carry employee National Insurance. Income Tax can still apply. Earned income and rental profits are a different National Insurance analysis.</p>")
    if "voluntary national insurance" in t:
        blocks.append("<p>Voluntary National Insurance can fill gaps toward the State Pension. It is not a substitute for paying Class 4 on a trade. Check your National Insurance record before you buy years you do not need.</p>")
    if "legal costs" in t:
        blocks.append("<p>Legal fees are allowable when they are for the trade, not for buying a capital asset or for personal disputes. Acquisition costs often go to the capital cost of the asset. Revenue vs capital is the split HMRC will test.</p>")
    if "clothes" in t or "uniform" in t:
        blocks.append("<p>Everyday clothing is almost never allowable, even if you wear it for work. A uniform or protective clothing with a clear work character is the usual exception. Keep invoices and a photo of branded kit if you claim.</p>")
    if "christmas" in t or "staff gift" in t:
        blocks.append("<p>Annual staff parties can fall within an exemption if the cost per head stays under HMRC’s limit and the event is open to staff generally. Trivial benefits have tight conditions. Directors of close companies need extra care.</p>")
    if "two countries" in t or "foreign income" in t:
        blocks.append("<p>UK residents usually report worldwide income. A credit for foreign tax may be due, or a treaty may assign taxing rights. Paying tax abroad does not by itself mean the UK return can omit the income.</p>")
    if "non-uk resident" in t or "non-resident" in t:
        blocks.append("<p>Non-residents can still have UK tax on UK property, UK employment and some other UK sources. Banks also run their own identity checks. Tax residence and having a UK current account are different questions.</p>")
    if "hmrc make a mistake" in t:
        blocks.append("<p>If HMRC’s figure is wrong, you still need evidence of the right figure. Overpayments can be reclaimed within time limits. Interest and special relief rules can apply. A complaint process exists separately from amending a return.</p>")
    if "carry back" in t or "trading loss" in t:
        blocks.append("<p>Trading losses can sometimes be set against other income or carried back to an earlier year. Corporation Tax and Income Tax have different windows. A claim is not automatic — it has to be made in the right place on the return.</p>")
    if "sell my limited company" in t or "buying a business" in t or "selling shares" in t:
        blocks.append("<p>Share sales and asset sales are taxed differently. Share sales are usually Capital Gains Tax for the seller; asset sales sit in the company first. Warranties, completion accounts and earn-outs all change the number. Model both structures before heads of terms.</p>")
    if "architect" in t or "legal industry" in t:
        blocks.append("<p>Professional practices mix fees, work-in-progress, VAT and sometimes an LLP. Drawings are not a salary. If you operate through a company, IR35 and off-payroll working can still apply to some engagements.</p>")
    if "sick" in t or "time off" in t:
        blocks.append("<p>Self-employed people do not get statutory sick pay from their own trade. Some may claim benefits if they meet the tests. Limited company directors who are employees can be in a different SSP position. Keep a cash buffer either way.</p>")
    if "child" in t and "etsy" in t:
        blocks.append("<p>If a parent controls the shop, HMRC will look at whose trade it is. Putting income in a child’s name does not by itself move the tax. Child Benefit and High Income Child Benefit Charge can also sit in the background.</p>")
    if "authorising an agent" in t or "64-8" in t or "agent" in t and "hmrc" in t:
        blocks.append("<p>You authorise an accountant using HMRC’s agent services, often with a 64-8. That lets the agent see the account and file. It does not move legal responsibility for the tax away from you.</p>")
    if "check if hmrc have received" in t or "received a tax payment" in t:
        blocks.append("<p>Use the HMRC business or personal tax account to see payments allocated. Same-day Faster Payments are not always allocated the same day. Always quote the right reference — VAT, PAYE and Self Assessment are different pots.</p>")
    if "overpaid wages" in t:
        blocks.append("<p>Recovering an overpayment from an employee is an employment-law and payroll problem. Net pay, tax already paid to HMRC, and whether the error was the employer’s all matter. Do not quietly reverse PAYE without a method.</p>")
    if "p45" in t:
        blocks.append("<p>A new starter without a P45 uses the starter checklist. You still run PAYE from day one. Guessing a tax code because the P45 has not arrived is how emergency tax complaints start.</p>")
    if "companies house" in t and "sole trader" in t:
        blocks.append("<p>Sole traders do not register the trade at Companies House. That register is for companies, LLPs and some other entities. A sole trader still registers with HMRC for Self Assessment when the rules catch them.</p>")
    if "private and a public" in t or "public limited" in t:
        blocks.append("<p>A private limited company (Ltd) cannot offer shares to the public in the same way as a PLC. PLC status has extra capital and reporting rules. Most owner-managed businesses should stay private unless there is a real listing plan.</p>")
    if "types of vat" in t or "vat schemes" in t or "annual accounting scheme" in t or "vat jargon" in t:
        blocks.append("<p>Standard accounting, cash accounting, the Flat Rate Scheme and annual accounting change when you pay VAT, not whether you are registered. Each scheme has turnover tests and traps. Pick with a computation, not because a forum prefers one.</p>")
    if "reclaim vat after" in t or "cancel my vat" in t:
        blocks.append("<p>Deregistration can create a VAT charge on remaining stock and assets. Some pre-deregistration input VAT is still reclaimable if the rules are met. A final return is required. Do not assume cancellation wipes the ledger.</p>")
    if "registering for vat affect my pricing" in t:
        blocks.append("<p>If customers cannot recover VAT, your prices rise or your margin falls. If they are VAT-registered businesses, they often do not care about the extra line. Map the customer base before you volunteer to register.</p>")
    if "property income" in t and "allowance" in t:
        blocks.append("<p>A property allowance can cover small amounts of property income. It is separate from the trading allowance. Joint owners and furnished holiday lettings need a careful split. Once you have a proper portfolio, full receipts and expenses are usually better.</p>")
    if "vehicle" in t or "car and vehicle" in t:
        blocks.append("<p>Self-employed motoring is either simplified mileage or actual costs plus a private-use adjustment. You cannot usually mix methods on the same vehicle in a year. Parking fines and commuting are the usual disallowable items.</p>")
    if "start a business" in t:
        blocks.append("<p>Pick a structure, open a dedicated bank account, register with HMRC when required, and keep invoices from day one. A logo is not a business. VAT, PAYE and insurance follow the activity, not the Instagram launch.</p>")
    if "owner dies" in t or "shareholder dies" in t or "someone who has died" in t:
        blocks.append("<p>Probate, a personal representative, and a date-of-death valuation sit behind the tax. Self Assessment for a deceased person has its own timetable. Company shares pass according to the will or intestacy, then Companies House must be updated.</p>")
    if "not pay enough tax" in t:
        blocks.append("<p>Underpayments produce a balancing bill, interest, and sometimes penalties if the return was wrong. Payments on account can also be too low if profits rose. File an amendment or a disclosure rather than waiting for a nudge letter.</p>")
    if "do my own tax return" in t:
        blocks.append("<p>You can file yourself through HMRC. The risk is missing pages — CIS, foreign income, capital gains, student loan, or property. An accountant is worth it when the facts are messy, not because the website is hard.</p>")
    if "information should i give my accountant" in t:
        blocks.append("<p>Bank statements, sales invoices, purchase invoices, payroll summaries, VAT workings, P60s, dividend vouchers, rental statements and a note of what you took as drawings. Screenshots of a ‘total’ are not a record.</p>")
    if "type of tax return" in t:
        blocks.append("<p>Individuals file Self Assessment. Companies file a Company Tax Return with accounts. VAT has its own return. Partnerships file an SA800 plus partner returns. Using the wrong wrapper is how filings get rejected or ignored.</p>")
    if "tax reference number" in t:
        blocks.append("<p>People mix UTR, PAYE reference, Accounts Office reference, VAT number and National Insurance. Each filing uses a specific one. Putting a VAT number on a Self Assessment payment is a classic misallocation.</p>")
    if "employed or self-employed" in t:
        blocks.append("<p>Status is a facts test: control, substitution, financial risk, mutuality of obligation. Calling yourself a contractor on an invoice does not decide it. Get it wrong and PAYE, National Insurance and pensions can all be reassessed.</p>")
    if "shares created" in t or "types of shares" in t:
        blocks.append("<p>Shares are created on incorporation or by allotment. Ordinary, preference and different voting classes must match the articles and the Companies House filing. Tax follows the rights — dividends, restricted securities and valuations are separate questions.</p>")
    if "director bonuses" in t or "borrow from their company" in t or "family wages" in t or "spouse" in t and "business" in t:
        blocks.append("<p>Extracting money as salary, dividend, rent or a loan has different tax. A director’s loan account that is overdrawn at the year end can produce a section 455 charge. Family wages must be real work at a commercial rate.</p>")
    if "winding up" in t or "purchase of own shares" in t:
        blocks.append("<p>Distributions on a winding up and company buy-backs of shares have anti-avoidance rules. What looks like capital can be taxed as income. Take advice before you strike off a company with retained profits or trade into a new vehicle.</p>")
    if "reclaiming vat on business fuel" in t:
        blocks.append("<p>VAT on fuel follows the scale charge or a full VAT-and-private-use method. Electricity for cars is not treated identically to petrol. Keep mileage or a charging policy so the VAT return is supportable.</p>")
    if "ir35" in t:
        blocks.append("<p>Off-payroll working can move the PAYE obligation to an agency or client. A personal service company does not automatically save tax. Status determinations should match the actual working practices.</p>")
    if "mtd" in t or "making tax digital" in t:
        blocks.append("<p>Making Tax Digital for VAT is already live for VAT-registered businesses. Making Tax Digital for Income Tax is a separate programme for qualifying sole traders and landlords. Confirm start dates and thresholds on GOV.UK before you buy software.</p>")
    return "".join(blocks)


def article(title: str, slug: str, category_name: str) -> str:
    q = title.rstrip("?")
    spec = specific_block(title, slug)
    service = {
        "VAT": "/vat-accountancy-services/",
        "Payroll": "/payroll-services/",
        "Self Assessment": "/self-assessment-tax-returns/",
        "Disclosures": "/hmrc-tax-disclosure-london/",
        "Property": "/capital-gains-tax/",
        "Companies": "/annual-accounts-services/",
        "Tax": "/self-assessment-tax-returns/",
    }.get(category_name, "/contact-us/")
    parts = [
        f"<p><strong>{e(title)}</strong> is a question Wingate Accountants is asked by contractors, landlords, directors and sole traders in London and across the UK. This briefing is original to our firm. It is general information, not a copy of another website, and not personal advice. Confirm current rates, thresholds and forms on GOV.UK for the tax year you are filing.</p>",
        f"<h2>What this means in practice</h2>",
        f"<p>{e(q)} sits inside UK tax law, HMRC practice and, where a company is involved, Companies House filings. The right answer depends on your facts: employment status, the type of income, whether you are VAT-registered, and which year you are looking at. Two people with the same job title can have different filings.</p>",
        f"<p>Keep the question in writing against the records. If you later need a disclosure or an amendment, a clear contemporaneous file is worth more than a remembered conversation. Wingate will ask for bank statements, invoices and any HMRC letters before we take a position on {e(q.lower())}.</p>",
        spec,
        f"<h2>What HMRC usually looks at</h2>",
        f"<p>HMRC matches third-party data — PAYE, banks, marketplaces, land registries and Agents — to what you declare. An answer that is convenient but incomplete is how nudge letters start. If {e(q.lower())} affects more than one year, say so at the outset rather than filing this year clean and leaving last year wrong.</p>",
        "<ul>"
        "<li>Use the form and reference that match the tax, not a generic payment.</li>"
        "<li>Separate personal and business bank activity wherever you can.</li>"
        "<li>Diary statutory dates: 31 January Self Assessment, VAT periods, PAYE paydays, Companies House accounts.</li>"
        "</ul>",
        f"<h2>Records worth keeping</h2>",
        f"<p>Invoices, contracts, mileage logs, completion statements, dividend vouchers and payroll summaries beat a year-end reconstruction. If a cost is mixed-use, write down the business proportion. Digital records are now the default for VAT-registered businesses under Making Tax Digital, and Income Tax digital updates are rolling in for some sole traders and landlords.</p>",
        f"<h2>How Wingate Accountants helps</h2>",
        f"<p>We prepare the computation, file the return or the disclosure, and explain the bill in plain English. If {e(q.lower())} is the reason you are here, start with our <a href=\"{service}\">related service page</a> or <a href=\"/contact-us/\">contact the team</a> at 128 City Road. A short scoping call is enough to quote a fixed fee.</p>",
        f"<h2>Questions we are asked</h2>",
        f"<h3>Is this the same for a limited company and a sole trader?</h3>",
        f"<p>Usually not. Companies pay Corporation Tax and file accounts. Individuals pay Income Tax through Self Assessment or PAYE. VAT can apply to either. Tell us the legal wrapper before we answer {e(q.lower())} in detail.</p>",
        f"<h3>Can I ignore this if the amounts are small?</h3>",
        f"<p>Small does not always mean exempt. Allowances exist, but they have conditions. HMRC penalties can exceed a modest underpayment if the return was wrong. If you are unsure, ask before the deadline.</p>",
        f"<h3>Where should I check the official rules?</h3>",
        f"<p>GOV.UK is the source for rates, thresholds and forms. This page is a map for Wingate clients. We will not invent a figure that HMRC has not published.</p>",
    ]
    return "".join(p for p in parts if p)


def main() -> None:
    live_slugs = {p["slug"] for p in json.loads((Path(__file__).resolve().parents[1] / "content" / "live-posts.json").read_text())}
    out = []
    seen = set()
    for item in TOPICS:
        slug = item["slug"]
        title_l = item["title"].lower()
        if slug in SKIP_SLUGS or slug in live_slugs or slug in seen:
            continue
        if any(bit in title_l for bit in SKIP_TITLE_BITS):
            continue
        seen.add(slug)
        title = item["title"]
        cat_name, cat_slug = classify(title, slug)
        seo_title = f"{title} | Wingate Accountants"
        if len(seo_title) > 70:
            seo_title = f"{title[:50].rstrip()} | Wingate Accountants"
        excerpt = f"Wingate Accountants explains {title.rstrip('?').lower()} for UK taxpayers, with HMRC filing notes and a London practice contact."
        out.append({
            "slug": slug,
            "path": f"/{slug}/",
            "title": title,
            "seoTitle": seo_title,
            "description": desc(title),
            "excerpt": excerpt[:180],
            "html": article(title, slug, cat_name),
            "kind": "post",
            "date": item["date"],
            "categories": [{"slug": cat_slug, "name": cat_name}],
            "source": "extra",
        })
    OUT.write_text(json.dumps(out, ensure_ascii=False))
    print("wrote", len(out), "articles to", OUT, "bytes", OUT.stat().st_size)


if __name__ == "__main__":
    main()

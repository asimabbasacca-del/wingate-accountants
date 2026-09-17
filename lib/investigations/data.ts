import { SITE } from "@/lib/site";
import type { InvestigationGroup, InvestigationTopic } from "./types";

const CALL =
  `Call ${SITE.phone} or email ${SITE.email} for a free, confidential discussion. We will not contact HMRC in your name until you instruct us to act.`;

export const INVESTIGATION_GROUPS: InvestigationGroup[] = [
  {
    id: "enquiries",
    name: "Enquiries and compliance checks",
    summary: "Everyday HMRC letters, visits and full enquiries into personal, company, VAT and PAYE affairs.",
  },
  {
    id: "serious",
    name: "Serious fraud and avoidance",
    summary: "COP8, COP9, the Fraud Investigation Service and cases that could become criminal.",
  },
  {
    id: "disclosures",
    name: "Voluntary disclosure and offshore",
    summary: "Coming forward before HMRC writes, including offshore accounts, the WDF and residence questions.",
  },
  {
    id: "disputes",
    name: "Disputes, tribunals and other advisers",
    summary: "When talks stall, when a case needs a tribunal, and when another accountant or solicitor wants us on the file.",
  },
];

export const INVESTIGATION_TOPICS: InvestigationTopic[] = [
  {
    slug: "hmrc-enquiry",
    groupId: "enquiries",
    title: "HMRC tax investigations",
    navTitle: "HMRC tax investigation",
    seoTitle: "HMRC Tax Investigation Help | Wingate Accountants",
    description:
      "Wingate Accountants represent individuals and businesses in HMRC enquiries, from a simple letter to a full investigation. Confidential, named-accountant support from London.",
    summary: "What an HMRC enquiry actually is, how it can escalate, and how we keep the case in the civil system wherever we can.",
    intro: [
      "HMRC calls almost every check an “enquiry”. That word covers a polite request for a bank statement and, at the other end, a criminal investigation. The letter you have received is the starting point, not the whole story.",
    "Wingate Accountants Limited acts for people and companies who have been contacted by HMRC, and for those who want their tax affairs straightened before a letter arrives. We are chartered accountants first: we already prepare returns and accounts, so we know how an enquiry looks from both sides of the file.",
    ],
    sections: [
      {
        heading: "Who and what HMRC can look at",
        paragraphs: [
          "An enquiry can sit on an individual, a sole trader, a partnership, a company or a trust. It can cover Income Tax, Capital Gains Tax, Corporation Tax, VAT, Inheritance Tax or the PAYE the business runs as an employer — including directors’ pay and benefits.",
          "Some cases close with a short exchange of letters. Others involve a review of business and personal records, a meeting, or a visit to the premises. Those enquiries take longer and feel more intrusive. That is why you should not send a bundle of papers until someone has checked what HMRC is actually entitled to see.",
        ],
      },
      {
        heading: "Civil settlement or criminal case",
        paragraphs: [
          "Almost all HMRC investigations stay civil. HMRC wants the tax that should have been paid, interest, and often a penalty. Where they suspect marketed avoidance they may open the case under Code of Practice 8. Where they suspect serious fraud they may use Code of Practice 9 — or, in a smaller number of cases, investigate with a view to prosecution.",
          "A case that starts as a letter can be moved up if new information appears, or if the replies are handled badly. Specialist representation from the first response reduces that risk. If more tax is due, we present the facts so the liability and penalty are no higher than they should be, and we can ask HMRC for Time to Pay rather than a single lump sum.",
        ],
      },
    ],
    help: {
      heading: "How Wingate helps",
      paragraphs: [
        "We read the letter, identify who is running the case and what powers they are using, and take over the correspondence. You stay informed; you decide whether any settlement is accepted. As far as we can, you do not deal with the inspector day to day.",
        CALL,
      ],
    },
    faqs: [
      {
        question: "Is an ‘enquiry’ the same as an investigation?",
        answer:
          "Yes in practice. HMRC uses “enquiry” in the law. People say “investigation” for the same process. The seriousness depends on the team, the questions and whether they suspect carelessness, avoidance or fraud.",
      },
      {
        question: "Should I reply to HMRC myself?",
        answer:
          "A short factual reply is better than silence, but a long unexplained pack of bank statements often creates new questions. Let us draft the first response.",
      },
    ],
    related: ["personal", "company", "compliance-check", "cop9"],
  },
  {
    slug: "personal",
    groupId: "enquiries",
    title: "Personal tax investigations",
    navTitle: "Personal tax investigation",
    seoTitle: "Personal Tax Investigation | Wingate Accountants",
    description:
      "HMRC enquiry into a Self Assessment return, interest, dividends, rent or capital gains. Wingate handles aspect and full personal tax investigations.",
    summary: "Most HMRC enquiries sit on individual tax returns — employed people, landlords, investors and the self-employed.",
    intro: [
      "Most tax investigations HMRC opens are into returns filed by individuals. Some start because interest, dividends, rental income or a capital gain looks missing. Many sit on self-employed returns, where HMRC thinks profits are easier to understate — income left out, or expenses claimed that the records do not support.",
      "If HMRC is already looking at a company, they often want to look at the directors’ personal returns as well, especially in a small or family company. A company enquiry does not automatically give them the right to personal bank statements. We keep those requests inside the law.",
    ],
    sections: [
      {
        heading: "Aspect enquiry or full enquiry",
        paragraphs: [
          "People talk about “aspect” and “full” enquiries. The legislation does not split them. In practice an aspect enquiry asks about particular boxes on the return. A full enquiry looks at the whole return and usually the records behind it.",
        ],
      },
      {
        heading: "No business on the return",
        paragraphs: [
          "HMRC can match bank interest and dividends to the return. If the figures differ, they will ask why. Capital Gains Tax arises on disposals; some assets are exempt (a qualifying main home, or small proceeds under the published limits). If they think a gain was missed, they open an enquiry.",
          "These cases are often document-heavy rather than technical — until receipts are missing. A landlord who refurbished a buy-to-let without keeping invoices may find HMRC refusing the cost. We build alternative evidence: completion statements, photos, contractor messages, comparable quotes — so you are not taxed on a gain that never existed in economic terms.",
        ],
      },
      {
        heading: "Where there is a business",
        paragraphs: [
          "On a full enquiry into a trade, HMRC typically ask for the business records and a sample of personal accounts. They will read the accounts your accountant prepared. They often want a meeting to understand how the business actually takes money. Do not attend that meeting alone. Where we can, we handle it so you are not answering unprepared questions in the room.",
          "If they find an error that also applied in earlier years, they can assess those years. In the worst cases the window can run to 20 years. That is why the first reply matters.",
        ],
      },
    ],
    help: {
      heading: "How Wingate helps",
      paragraphs: [
        "We test what HMRC has asked for against their powers, explain genuine differences between the records and the return, and negotiate any addition to profits and the penalty. If the enquiry spilled out of a company check, we keep directors’ private affairs out of scope unless HMRC has a proper basis.",
        CALL,
      ],
    },
    faqs: [
      {
        question: "I am employed. Why would HMRC enquire into me?",
        answer:
          "PAYE does not cover everything. Interest, dividends, property, crypto disposals and freelance side work sit on Self Assessment. HMRC’s data matching is what usually starts these letters.",
      },
      {
        question: "Can they look at my personal bank accounts if they are investigating my company?",
        answer:
          "Not automatically. We challenge fishing requests. If company money has been mixed with personal accounts, the position is different — tell us before we write.",
      },
    ],
    related: ["company", "hmrc-enquiry", "voluntary-disclosure"],
  },
  {
    slug: "company",
    groupId: "enquiries",
    title: "Company tax investigations",
    navTitle: "Company tax investigation",
    seoTitle: "Company Tax Investigation | Corporation Tax Enquiry | Wingate",
    description:
      "HMRC enquiry into a Corporation Tax return. Wingate manages aspect and full company investigations and protects directors’ personal files.",
    summary: "Corporation Tax enquiries, directors’ private records, and the way VAT or PAYE often gets pulled in.",
    intro: [
      "A company enquiry may look at one line on the CT600 or at every figure in the accounts. HMRC will usually ask for the books, the year-end file and the workings behind the return. They examine whether income is complete and whether expenses were allowable.",
      "They often want to meet the directors. We recommend you do not go unrepresented, and that where possible the meeting runs with us in the room so questions stay on the company, not on private spending.",
    ],
    sections: [
      {
        heading: "Directors’ personal tax is a separate file",
        paragraphs: [
          "Inspectors frequently ask for personal bank statements or put personal questions in a company meeting, especially where there are few directors. Sometimes that is justified — for example where company income looks to have been diverted. Often it is simply convenient for HMRC. An enquiry into the company does not, by itself, force a director to hand over a personal file. We tell you what to provide and what to refuse.",
        ],
      },
      {
        heading: "Earlier years and other taxes",
        paragraphs: [
          "If the same error sits in earlier returns, HMRC can go back at least four years and, in some cases, up to 20. Where company money reached directors, they may open a personal enquiry as well.",
          "Corporation Tax is the heading on the letter. VAT and PAYE often follow once they are on the premises. We keep those streams identified so one visit does not become three unmanaged investigations.",
        ],
      },
    ],
    help: {
      heading: "How Wingate helps",
      paragraphs: [
        "We quantify differences between the records and the accounts, agree revised profits where they are due, and push back where they are not. We will not let a company enquiry wander into a director’s private affairs without a proper legal basis.",
        CALL,
      ],
    },
    faqs: [
      {
        question: "Will this affect my personal Self Assessment?",
        answer:
          "Only if company and personal money are mixed, or HMRC opens a separate personal enquiry. We keep the two files distinct unless the facts require otherwise.",
      },
      {
        question: "Do the directors have to attend the HMRC meeting?",
        answer:
          "Not always. We discuss tactics before we accept a meeting. Unrepresented directors answering “helpful” questions is how many cases widen.",
      },
    ],
    related: ["personal", "paye", "vat", "hmrc-enquiry"],
  },
  {
    slug: "partnership",
    groupId: "enquiries",
    title: "Partnership tax investigations",
    navTitle: "Partnership tax investigation",
    seoTitle: "Partnership Tax Investigation | Wingate Accountants",
    description:
      "HMRC enquiry into a partnership return and accounts. Wingate represents the firm and keeps each partner’s Self Assessment aligned.",
    summary: "Aspect and full enquiries into partnership profits — and the knock-on for every partner’s personal return.",
    intro: [
      "HMRC can ask about particular entries on a partnership return, or review the whole of the partnership accounts and records. A full enquiry usually means the books, the accounts file and a meeting with the partners about how the firm takes work and money.",
      "Partners should not sit in that meeting without representation. Adjustments to partnership profit flow through to each partner’s Self Assessment. One enquiry can therefore move several personal bills at once.",
    ],
    sections: [
      {
        heading: "Other taxes on the same visit",
        paragraphs: [
          "The letter may mention partnership Income Tax. Once HMRC is looking at the records they often glance at VAT and PAYE. We keep those questions in their own scope so the partnership profit enquiry does not quietly become a payroll review.",
        ],
      },
    ],
    help: {
      heading: "How Wingate helps",
      paragraphs: [
        "We agree what the partnership records actually show, challenge requests that go beyond HMRC’s powers, and explain the effect of any adjustment on each partner before anything is signed.",
        CALL,
      ],
    },
    faqs: [
      {
        question: "Does every partner need their own adviser?",
        answer:
          "Usually we act for the partnership and then confirm each partner’s personal position. If partners’ interests conflict, we will say so and split the files.",
      },
    ],
    related: ["personal", "company", "compliance-check"],
  },
  {
    slug: "compliance-check",
    groupId: "enquiries",
    title: "HMRC compliance checks",
    navTitle: "HMRC compliance check",
    seoTitle: "HMRC Compliance Check | Wingate Accountants",
    description:
      "HMRC compliance visits and information requests for individuals, companies and partnerships. Wingate attends, limits the papers and stops a check becoming a full investigation.",
    summary: "A compliance check is often the first visit. Handled well, it stays a check. Handled badly, it becomes a full enquiry.",
    intro: [
      "HMRC risk-assesses returns against the data it already holds. Where income looks light or expenses look heavy, they write to say they are carrying out a compliance check and list the records they want — sometimes including the current year as well as years already filed.",
      "Many business checks include a visit. That is usually by appointment. In limited circumstances they can arrive without notice. You are entitled to have your tax adviser present. The same legislation that lets them check also limits what they can demand. A general accountant who hands over “everything” often gives HMRC a second investigation they did not start with.",
    ],
    sections: [
      {
        heading: "When a check becomes an investigation",
        paragraphs: [
          "If they find significant errors they can escalate. Getting us involved early means we can often explain a mismatch — a timing difference, a loan, a personal transfer — before it is written up as omitted income.",
        ],
      },
    ],
    help: {
      heading: "How Wingate helps",
      paragraphs: [
        "We attend the visit, answer the questions that are in scope, and control the papers so HMRC cannot later say you failed to cooperate while you also did not volunteer your entire life. If something is wrong, we agree it cleanly rather than letting the check drift.",
        CALL,
      ],
    },
    faqs: [
      {
        question: "Can I refuse a visit?",
        answer:
          "Unannounced visits are rare. Appointed visits should be diarised so we can attend. Do not turn an officer away in panic and do not start a tour of the office without us.",
      },
    ],
    related: ["hmrc-enquiry", "vat", "paye"],
  },
  {
    slug: "vat",
    groupId: "enquiries",
    title: "VAT investigations",
    navTitle: "VAT investigation",
    seoTitle: "VAT Investigation and VAT Visit | Wingate Accountants",
    description:
      "HMRC VAT compliance visits, record checks and Notice 160 dishonest-conduct cases. Wingate attends, controls the records and negotiates any assessment.",
    summary: "VAT visits, input tax queries and the more serious dishonest-conduct cases under Notice 160.",
    intro: [
      "HMRC checks whether the right amount of VAT has been declared. Almost every VAT investigation includes a visit to look at records and ask questions. They usually say in advance which periods they want. You are entitled to have an adviser there.",
      "A visit can escalate if they find large errors, and it can spread into other taxes. Separately, where they suspect dishonest conduct they may use the procedure in Public Notice 160 — typically larger amounts and an allegation that the business acted fraudulently.",
    ],
    sections: [
      {
        heading: "What we watch for",
        paragraphs: [
          "Making Tax Digital for VAT already applies to VAT-registered businesses. A visit will look at digital records as well as paper. Partial exemption, the capital goods scheme, the flat rate scheme and land/property options to tax are common tripwires. We keep the information flow tight so “cooperation” does not mean an open-ended trawl.",
        ],
      },
    ],
    help: {
      heading: "How Wingate helps",
      paragraphs: [
        "We attend, explain genuine differences between the VAT returns and the books, and argue the assessment and penalty down to what the law actually supports. We also work to keep the business off any naming list that would follow a badly handled case.",
        CALL,
      ],
    },
    faqs: [
      {
        question: "Is a VAT visit the same as a tax investigation?",
        answer:
          "It starts as a compliance check. If they find significant errors or suspect dishonesty it becomes a fuller investigation, sometimes under Notice 160.",
      },
    ],
    related: ["compliance-check", "paye", "tax-fraud"],
  },
  {
    slug: "paye",
    groupId: "enquiries",
    title: "PAYE investigations",
    navTitle: "PAYE investigation",
    seoTitle: "PAYE Investigation | Employer HMRC Check | Wingate",
    description:
      "HMRC PAYE employer visits covering wages, benefits, status, CIS and RTI. Wingate answers the technical questions and contains any arrears.",
    summary: "Employer record visits: pay, benefits, status, CIS and the way a payroll check can open VAT or director enquiries.",
    intro: [
      "A PAYE investigation asks whether the business has operated PAYE correctly. It is almost always a visit, usually with two officers. They will want to speak to the people who actually run payroll, not only the director.",
      "They look at wages, expenses and benefits, whether people treated as self-employed should have been on PAYE (status), redundancy payments, CIS if you are in construction, and short-term workers coming from or going abroad. Real Time Information has applied since 2013; they will test whether submissions match what was actually paid.",
    ],
    sections: [
      {
        heading: "How a payroll visit spreads",
        paragraphs: [
          "Officers take useful fragments back to VAT and Corporation Tax colleagues. Director benefits and the proprietor’s own tax are of particular interest. It is common for a PAYE visit to lead to a VAT check or a personal or company enquiry. Software does the arithmetic; a junior member of staff coding a payment can still create years of arrears.",
        ],
      },
    ],
    help: {
      heading: "How Wingate helps",
      paragraphs: [
        "PAYE is technical. If they find errors they will want tax and NIC for several years, plus interest and sometimes penalties. We answer how the system was run, contain the years and people in scope, and negotiate the figures. We already run payroll for clients, so we can show them a working file rather than a theory.",
        CALL,
      ],
    },
    faqs: [
      {
        question: "We use a payroll bureau. Are we still responsible?",
        answer:
          "Yes. HMRC looks at the employer. A bureau mistake is still your arrears unless the contract and facts say otherwise. We still represent you.",
      },
    ],
    related: ["employment-status", "ir35", "company"],
  },
  {
    slug: "employment-status",
    groupId: "enquiries",
    title: "Employment status enquiries",
    navTitle: "Employment status",
    seoTitle: "Employment Status Enquiry | Self-Employed vs Employee | Wingate",
    description:
      "HMRC status reviews of people paid as self-employed. Wingate tests the facts, not the labels, and negotiates any PAYE and NIC.",
    summary: "When HMRC says a “contractor” should have been an employee — construction, IT and everywhere else labels are used.",
    intro: [
      "Paying someone as self-employed is cheaper for a business: no employer National Insurance, no holiday or sick pay, no work when there is no work. The worker may charge more, pay tax later, and claim expenses. Construction and IT have used this model for years. None of that decides status.",
      "Status follows the facts, not what both sides wrote on a contract. HMRC will ignore a “consultancy agreement” if day-to-day control, substitution and mutuality look like employment. There is no single court test that every case matches. When they enquire into a business they often check who is off-payroll. Status inspectors argue this for a living.",
    ],
    sections: [
      {
        heading: "What a wrong call costs",
        paragraphs: [
          "If people should have been employees, the engager can owe PAYE and NIC, sometimes for several years, with interest and penalties. Several workers over several years becomes a large bill. We review the engagements, put counter-arguments where the facts support self-employment, and negotiate where they do not — including a voluntary disclosure if you want to correct the past before they write.",
        ],
      },
    ],
    help: {
      heading: "How Wingate helps",
      paragraphs: [
        "We gather contracts, diaries, substitution evidence and how work is actually done. Then we either defend the status or quantify a settlement. Do not let a status inspector interview staff without us.",
        CALL,
      ],
    },
    faqs: [
      {
        question: "If both of us signed a self-employed contract, is that enough?",
        answer:
          "No. HMRC look at what happens in practice. A contract helps, but it is not the decision.",
      },
    ],
    related: ["paye", "ir35", "company"],
  },
  {
    slug: "ir35",
    groupId: "enquiries",
    title: "IR35, personal service companies and managed service companies",
    navTitle: "IR35 and PSCs",
    seoTitle: "IR35 and PSC Enquiry | Off-Payroll Working | Wingate Accountants",
    description:
      "HMRC enquiries into IR35, personal service companies and managed service companies. Wingate defends off-payroll status and deemed-pay calculations.",
    summary: "Intermediaries legislation: PSCs, MSCs, umbrella companies and who now has to decide IR35.",
    intro: [
      "Many specialists work through a personal service company — a limited company they own, with themselves as the main or only employee — rather than as a sole trader or an employee of the client. Since April 2000, if they would have been an employee of the client without that company, IR35 can treat a slice of the company income as a deemed salary with PAYE and NIC.",
      "HMRC cannot say a company is an “employee”. They can say the person would have been one. A wrong IR35 decision is corrected going forward and HMRC will try to collect earlier years with interest and penalties.",
    ],
    sections: [
      {
        heading: "Managed service companies",
        paragraphs: [
          "From April 2007, separate rules catch managed service companies and many umbrella arrangements: an intermediary the worker does not control, even if they hold a small share, in the UK or overseas. Payments to the worker can be deemed subject to PAYE whatever form they took. MSC rules are looked at before IR35.",
        ],
      },
      {
        heading: "Who decides IR35 now",
        paragraphs: [
          "Public sector clients, and medium and large private-sector clients, generally decide status and operate PAYE where the rules apply. Small private-sector clients can still leave the decision with the worker’s company. Size tests follow the Companies Act thresholds published on GOV.UK — confirm the current figures before you rely on the small-client exemption. The worker can dispute a client’s status determination.",
          "HMRC treat aggressive PSC and MSC structures as something to discourage. An enquiry can sit on the person, the company, or both.",
        ],
      },
    ],
    help: {
      heading: "How Wingate helps",
      paragraphs: [
        "We already look after contractor companies. For an enquiry we reconstruct the working practices, test the determination, and negotiate deemed-pay figures if IR35 or the MSC rules do apply.",
        CALL,
      ],
    },
    faqs: [
      {
        question: "Does a CEST result protect me?",
        answer:
          "A genuine CEST outcome that matches the facts helps. A CEST built on optimistic answers does not. We check the inputs before anyone waves the printout at an inspector.",
      },
    ],
    related: ["employment-status", "paye", "company"],
  },
  {
    slug: "tax-fraud",
    groupId: "serious",
    title: "Tax fraud and tax evasion",
    navTitle: "Tax fraud and evasion",
    seoTitle: "Tax Fraud and Tax Evasion Enquiry | Wingate Accountants",
    description:
      "HMRC investigations into suspected tax fraud or evasion. Wingate takes over contact, manages disclosure and works for a civil settlement where that is still open.",
    summary: "The most serious civil cases — and the line between a financial settlement and a prosecution file.",
    intro: [
      "A letter that alleges fraud or evasion is not a normal enquiry. The consequences can include large penalties, publication and, in some cases, a criminal investigation. Most high-street firms have little day-to-day experience of this. The first meetings and the first written account of what happened set the path.",
      "If HMRC has already written, we take the file over so you are not speaking to an inspector without a strategy. If they have not written, and you know there is a problem, a managed voluntary disclosure is often the way to keep the case civil.",
    ],
    sections: [
      {
        heading: "What we do first",
        paragraphs: [
          "We meet you, hear the facts without dressing them, and agree what can be said to HMRC. After an initial meeting you should not need to deal with the inspector yourself. Full, accurate disclosure is what keeps a civil case civil. Incomplete accounts are how files move to the criminal team.",
        ],
      },
    ],
    help: {
      heading: "How Wingate helps",
      paragraphs: [
        "We handle the investigation or the disclosure, keep the scope honest, and negotiate tax, interest and penalty. This is confidential. Family members and staff should not be briefed until we have agreed a line.",
        CALL,
      ],
    },
    faqs: [
      {
        question: "Is a mistake fraud?",
        answer:
          "HMRC’s own definition requires knowing involvement in fraudulent evasion. You cannot commit tax fraud by accident. Carelessness and fraud are different — and the penalty ranges are different. Do not use either word in a letter home-made to HMRC.",
      },
    ],
    related: ["cop9", "fraud-investigation-service", "voluntary-disclosure", "criminal"],
  },
  {
    slug: "fraud-investigation-service",
    groupId: "serious",
    title: "HMRC Fraud Investigation Service",
    navTitle: "Fraud Investigation Service",
    seoTitle: "HMRC Fraud Investigation Service (FIS) | Wingate Accountants",
    description:
      "Representation in HMRC Fraud Investigation Service cases, including COP8, COP9 and complex offshore files.",
    summary: "FIS teams handle the highest-value civil fraud and avoidance cases — sometimes while another HMRC office appears to be writing the letters.",
    intro: [
      "The Fraud Investigation Service brings together HMRC’s senior investigators for serious or high-value work. They run Code of Practice 8 (suspected avoidance) and Code of Practice 9 (suspected serious fraud), and many complex offshore cases. They also sit with the criminal team when a case might be prosecuted.",
      "Sometimes the letterhead looks like a local office while FIS is already directing the work, gathering evidence before a COP9 invitation is issued. A FIS letter is a reason to instruct someone who has handled this level of case, not to hope it will blow over.",
    ],
    sections: [
      {
        heading: "What representation changes",
        paragraphs: [
          "These investigators are used to unrepresented taxpayers over-explaining. We keep the file to the issues they are entitled to pursue, negotiate tax and penalties, and try to stop a civil FIS case being passed across for prosecution.",
        ],
      },
    ],
    help: {
      heading: "How Wingate helps",
      paragraphs: [
        "We take the correspondence, attend the meetings and quantify any settlement. You should not have a “quick call” with FIS to clear the air.",
        CALL,
      ],
    },
    faqs: [
      {
        question: "Does a local tax office letter mean it is not FIS?",
        answer:
          "Not necessarily. FIS sometimes works behind another office until they are ready to open COP8 or COP9. Send us the letter and the envelope.",
      },
    ],
    related: ["cop8", "cop9", "criminal", "offshore"],
  },
  {
    slug: "cop9",
    groupId: "serious",
    title: "Code of Practice 9 and the Contractual Disclosure Facility",
    navTitle: "COP9 and CDF",
    seoTitle: "COP9 Tax Investigation and CDF | Wingate Accountants",
    description:
      "HMRC Code of Practice 9 and the Contractual Disclosure Facility. Wingate prepares outline disclosures, reports and civil settlements.",
    summary: "Serious suspected fraud: admit and disclose under CDF, or deny — with a 60-day outline disclosure if you accept the CDF.",
    intro: [
      "If HMRC suspects a serious loss of tax from fraud or evasion, they usually open the investigation under Code of Practice 9, unless they have already decided to prosecute. COP9 is run by the Fraud Investigation Service. You are offered two paths: admit the fraud and use the Contractual Disclosure Facility, or deny it.",
      "Under the CDF you make a complete disclosure of the frauds, in return for immunity from prosecution on what you have disclosed. You have 60 days from the offer to give an outline disclosure of every area involved. Immunity only covers what is in that outline. A material omission lets HMRC prosecute. HMRC’s wording is that a person commits an offence if they are knowingly concerned in the fraudulent evasion of tax — you cannot commit tax fraud accidentally.",
    ],
    sections: [
      {
        heading: "How a COP9 case is worked",
        paragraphs: [
          "There is often a formal meeting about the outline disclosure and your affairs. You will generally need to attend. Your adviser then prepares a detailed report of the tax unpaid, with as much evidence as exists. Where records are thin, estimates have to be made; HMRC will test every assumption before they settle.",
          "A full CDF disclosure is what reduces the penalty in the final negotiation. An inadequate report is how a civil COP9 becomes a criminal file. COP9 itself tells you to take independent advice, and notes that many people appoint a specialist even if they already have an accountant.",
        ],
      },
    ],
    help: {
      heading: "How Wingate helps",
      paragraphs: [
        "We attend the opening meeting, agree the scope of the report and write it. The 60-day clock is short. If a COP9 letter has arrived, contact us the same day — do not use the period to “gather thoughts” without a plan.",
        CALL,
      ],
    },
    faqs: [
      {
        question: "Should I deny the allegation?",
        answer:
          "Only after advice. A denial that later collapses is worse than a complete CDF. We will not tell you to admit something that is not true, and we will not let you send a partial outline.",
      },
      {
        question: "Does COP9 always mean I am going to prison?",
        answer:
          "No. COP9 is the civil route for suspected serious fraud. The CDF is designed to reach a financial settlement. Prosecution is the other fork — which is why the outline has to be complete.",
      },
    ],
    related: ["tax-fraud", "fraud-investigation-service", "criminal", "voluntary-disclosure"],
  },
  {
    slug: "cop8",
    groupId: "serious",
    title: "Code of Practice 8 — tax avoidance investigations",
    navTitle: "COP8",
    seoTitle: "COP8 Tax Avoidance Investigation | Wingate Accountants",
    description:
      "HMRC Code of Practice 8 investigations into tax planning and avoidance schemes. Wingate gives an independent view and defends or settles on the facts.",
    summary: "Serious suspected loss of tax without an allegation of fraud — usually a planning structure or marketed scheme.",
    intro: [
      "Where HMRC suspects a serious tax loss but does not allege fraud, they may open the case under Code of Practice 8. Most COP8 files concern a tax planning structure or a marketed avoidance scheme. Fraud Investigation Service teams run them.",
      "If a scheme was sold to many people, HMRC often investigates a sample in detail and then applies the result to everyone who used it.",
    ],
    sections: [
      {
        heading: "How HMRC attacks a scheme",
        paragraphs: [
          "They may disagree with the reading of the legislation the scheme depends on — a technical argument that can end at the Tax Tribunal if neither side yields. They may also say the steps were not implemented as drafted. Many schemes fail because one meeting, one loan or one board minute did not happen as the counsel’s opinion assumed. In most COP8 cases they run both attacks at once.",
          "The adviser who sold the scheme is rarely the right person to defend it. They are not independent. We will tell you, plainly, whether we think the planning works. If it does, we defend it. If it does not, we stop pouring fees into a lost technical argument and settle what can be settled.",
        ],
      },
    ],
    help: {
      heading: "How Wingate helps",
      paragraphs: [
        "We read the opinions, the implementation pack and HMRC’s information notices, then put a written position that a tribunal could live with. Scheme users should not rely on the promoter’s circulars as a reply to FIS.",
        CALL,
      ],
    },
    faqs: [
      {
        question: "The promoter says the scheme still works. Should I stay with them?",
        answer:
          "Get an independent view. Promoters are defending their product. Your interest is the tax, the penalty and whether this stays civil.",
      },
    ],
    related: ["tax-tribunal", "fraud-investigation-service", "litigation"],
  },
  {
    slug: "criminal",
    groupId: "serious",
    title: "Criminal tax investigations",
    navTitle: "Criminal tax investigation",
    seoTitle: "Criminal Tax Investigation | HMRC Prosecution | Wingate",
    description:
      "HMRC criminal tax investigations under PACE. Wingate works with your criminal solicitor and argues for the case to stay civil where that is still possible.",
    summary: "Rare, severe cases: cautioned interviews, searches, and a prison sentence rather than a tax penalty.",
    intro: [
      "HMRC keeps criminal investigations for cases they want as a deterrent, or where they say the conduct is too serious for a civil penalty. A specialist criminal team inside the Fraud Investigation Service runs them. They still want the tax and interest. Instead of a financial penalty they seek a conviction.",
      "Falsified documents, false statements, conspiracy, organised crime, organised tax-credit fraud and missing-trader VAT (including carousel fraud) are typical. People in a position of trust — accountants, solicitors, doctors — are more likely to be selected for prosecution for the same underlying facts. These cases follow PACE: cautioned recorded interviews, and often searches of business and home.",
    ],
    sections: [
      {
        heading: "FIS civil team",
        paragraphs: [
          "FIS also has a civil team, used where a prosecution is not taken forward but they still want a financial settlement. A letter from FIS, civil or criminal, needs specialist advice the same week. We have moved cases out of the criminal frame where the facts did not match the original allegation. If charges remain, we work with a criminal solicitor who knows this work. We do not pretend to be your defence advocate in the Crown Court.",
        ],
      },
    ],
    help: {
      heading: "How Wingate helps",
      paragraphs: [
        "We put the tax analysis, argue for a civil outcome where it is still open, and sit with your lawyer on the numbers. Do not attend a PACE interview without both.",
        CALL,
      ],
    },
    faqs: [
      {
        question: "Should I answer questions under caution to “clear it up”?",
        answer:
          "Not without a criminal solicitor and us having agreed the ground. A helpful interview is often the prosecution’s best evidence.",
      },
    ],
    related: ["tax-fraud", "cop9", "fraud-investigation-service"],
  },
  {
    slug: "voluntary-disclosure",
    groupId: "disclosures",
    title: "HMRC voluntary tax disclosure",
    navTitle: "Voluntary tax disclosure",
    seoTitle: "HMRC Voluntary Tax Disclosure | Wingate Accountants",
    description:
      "Unprompted disclosure of unpaid tax to HMRC. Wingate reviews the years, prepares the report and seeks lower penalties than a prompted investigation.",
    summary: "Telling HMRC before they tell you. Unprompted disclosure is how penalties fall and how criminal risk is reduced.",
    intro: [
      "It is almost always better to go to HMRC than to wait for an enquiry. In serious cases an unprompted disclosure can be the difference between a financial penalty and an investigation aimed at prosecution. Penalties are lower when the disclosure is unprompted. HMRC also tends to accept explanations where third-party evidence is thin, and in some cases they charge no penalty at all.",
      "Once a full disclosure is in, the fear of the envelope on the doormat should end for those years. That is the point. A partial disclosure that leaves a second problem sitting in the same accounts is how a “voluntary” letter becomes an investigation.",
    ],
    sections: [
      {
        heading: "How we present it",
        paragraphs: [
          "We review the years, the taxes and the records, then write the disclosure so it is complete and readable. We already prepare Self Assessment and company returns, so the numbers sit in the same practice as your ongoing compliance. For a dedicated London disclosure page with campaign detail (including the Let Property Campaign), see our tax disclosure service.",
        ],
      },
    ],
    help: {
      heading: "How Wingate helps",
      paragraphs: [
        "We decide the right route (ordinary disclosure, a published facility such as the WDF, or COP9 CDF if the facts are that serious), submit it and stay on the file until it is closed.",
        CALL,
      ],
    },
    faqs: [
      {
        question: "Will HMRC still investigate me if I disclose?",
        answer:
          "They will check the figures. A complete, well-evidenced disclosure is usually settled. A thin letter invites questions. That is why we write it.",
      },
    ],
    related: ["worldwide-disclosure-facility", "offshore", "cop9", "personal"],
  },
  {
    slug: "offshore",
    groupId: "disclosures",
    title: "Offshore tax investigations",
    navTitle: "Offshore tax investigation",
    seoTitle: "Offshore Tax Investigation | Foreign Accounts | Wingate",
    description:
      "HMRC enquiries into offshore accounts, companies and property. Wingate tests residence, what HMRC can demand, and disclosure of undeclared foreign income.",
    summary: "CRS data, information notices and purchased leaks: HMRC already knows more about foreign accounts than most people assume.",
    intro: [
      "Holding money abroad does not hide it from UK tax if you are UK resident. Through the Common Reporting Standard, banks and investment firms in more than a hundred countries send account data to HMRC. HMRC also issues information notices to UK-connected banks, and has bought leaked data. Penalties on offshore evasion can run to 100–200% of the tax, plus in some cases an asset-based penalty of 10% of connected assets.",
    ],
    sections: [
      {
        heading: "What they ask about an offshore account",
        paragraphs: [
          "Where did the money come from, and was it taxed in the UK? Has UK-taxable income or gains arisen on the account (interest, dividends, disposals)? If they think the answer is fraud, they may go criminal or open COP9. If they think it is avoidance, COP8. If the data is incomplete they may open an ordinary enquiry first.",
          "Accounts in the name of an offshore company are in scope where the beneficial owner is UK resident. We first establish residence and domicile (and, for current years, the residence-based rules for foreign income and gains). Then we test whether HMRC is entitled to the documents they have demanded. Extra cooperation can be given voluntarily — but HMRC should be told that it is voluntary.",
        ],
      },
    ],
    help: {
      heading: "How Wingate helps",
      paragraphs: [
        "If the account was used to keep untaxed UK income or gains, we manage the enquiry or a voluntary disclosure, including the Worldwide Disclosure Facility where that is the right door.",
        CALL,
      ],
    },
    faqs: [
      {
        question: "The account is in a company in another country. Does that protect me?",
        answer:
          "Not if you are the beneficial owner and UK resident. HMRC now receives that data as a matter of course.",
      },
    ],
    related: ["worldwide-disclosure-facility", "residence-domicile", "cop9", "voluntary-disclosure"],
  },
  {
    slug: "worldwide-disclosure-facility",
    groupId: "disclosures",
    title: "Worldwide Disclosure Facility",
    navTitle: "Worldwide Disclosure Facility",
    seoTitle: "Worldwide Disclosure Facility (WDF) | Wingate Accountants",
    description:
      "Using HMRC’s Worldwide Disclosure Facility for offshore interests. Wingate reviews whether the WDF is the right route and prepares the disclosure.",
    summary: "A structured way to tell HMRC about offshore interests — it does not buy immunity from a criminal investigation.",
    intro: [
      "The Worldwide Disclosure Facility is HMRC’s route for a voluntary disclosure that involves offshore interests. It exists because the UK wants the offshore part of the tax gap closed, and because automatic exchange of information now makes “HMRC will never see this account” a bad bet.",
      "Individuals, companies, partnerships and trustees can use it. It is not always the right door: in some cases an ordinary disclosure or COP9 is safer. Entering the WDF does not stop HMRC opening a criminal investigation if the facts are that serious. We review before anyone presses submit.",
    ],
    sections: [
      {
        heading: "Why people review now",
        paragraphs: [
          "Offshore legislation has moved quickly, including anti-avoidance aimed at structures you may not have built yourself. The Common Reporting Standard shares financial data between tax authorities. HMRC’s Connect system reads billions of data points. Offshore penalties can be very high, and naming powers exist. A review is cheaper than an enquiry that starts from a CRS match.",
        ],
      },
    ],
    help: {
      heading: "How Wingate helps",
      paragraphs: [
        "We map the offshore interests, choose the facility or the COP9 path, and write the disclosure. Related reading: our voluntary disclosure page and the existing tax disclosure service.",
        CALL,
      ],
    },
    faqs: [
      {
        question: "Is the Let Property Campaign the same as the WDF?",
        answer:
          "No. The Let Property Campaign is aimed at landlords’ rental income. The WDF is aimed at offshore interests. Some people need both. We sort that before filing.",
      },
    ],
    related: ["offshore", "voluntary-disclosure", "residence-domicile"],
  },
  {
    slug: "residence-domicile",
    groupId: "disclosures",
    title: "Residence and domicile enquiries",
    navTitle: "Residence and domicile",
    seoTitle: "UK Tax Residence and Domicile Enquiry | Wingate Accountants",
    description:
      "HMRC challenges to UK tax residence and historic domicile. Wingate applies the statutory residence test and the current foreign-income rules.",
    summary: "Whether you are UK tax resident, and how historic domicile claims still matter for earlier years.",
    intro: [
      "Residence and domicile are different. Residence for Income Tax is decided for each tax year, mainly by the statutory residence test: days in the UK, ties, and the automatic tests. “Ordinary residence” has largely gone, but it can still matter for older years HMRC is looking at.",
      "Domicile is a general-law concept, usually taken from your father at birth and hard to change without a clear decision. People can live in the UK for decades without becoming UK domiciled — and can be domiciled in a country they have never visited. From 6 April 2025 the UK moved away from domicile as the main test for taxing foreign income and gains, towards residence-based rules. HMRC still investigates older years on the old law, and they still challenge people who claimed to be non-resident or non-domiciled to keep foreign income out of UK tax.",
    ],
    sections: [
      {
        heading: "When it surfaces in an investigation",
        paragraphs: [
          "Foreign assets only create a UK bill if the person was in the UK tax net for that year. Proving non-residence, or a historic non-domicile claim, can remove or cut a proposed assessment. HMRC also opens dedicated enquiries into people they think claimed non-residence while still living a UK life.",
          "Companies do not have domicile. They do have residence, which can follow incorporation or central management and control. We review both the person and, where relevant, the company.",
        ],
      },
    ],
    help: {
      heading: "How Wingate helps",
      paragraphs: [
        "We build a year-by-year residence analysis (travel, home, family, work) and, for earlier years, a domicile analysis. Then we either disclose on the correct basis or defend the claim HMRC is attacking.",
        CALL,
      ],
    },
    faqs: [
      {
        question: "I spend fewer than 90 days in the UK. Am I non-resident?",
        answer:
          "Not automatically. The statutory residence test has several automatic and sufficient-ties tests. Day-count alone is not the whole answer. We run the statutory tests, not a rule of thumb.",
      },
    ],
    related: ["offshore", "worldwide-disclosure-facility", "personal"],
  },
  {
    slug: "tax-tribunal",
    groupId: "disputes",
    title: "Tax Tribunal",
    navTitle: "Tax Tribunal",
    seoTitle: "Tax Tribunal Representation | Wingate Accountants",
    description:
      "When an HMRC enquiry cannot be settled, Wingate reviews tribunal prospects, reopens negotiation and prepares First-tier Tax Tribunal cases.",
    summary: "Most enquiries settle. When they do not, the First-tier Tribunal is the independent arbiter — after an HMRC review if you want one.",
    intro: [
      "If you cannot agree with the officer, you can ask for a review by a different HMRC officer. That review rarely reverses the whole case, but it sometimes does. After that, the Tax Tribunal — part of the court system — decides.",
      "Most appeals start in the First-tier Tribunal. Appeals from there are usually on law, not facts, to the Upper Tribunal, and in some cases onwards to the Court of Appeal or the Supreme Court.",
    ],
    sections: [
      {
        heading: "What a First-tier hearing is like",
        paragraphs: [
          "It is the least formal of the tax courts, and still formal enough to unsettle most people. A judge, sometimes with a colleague, hears both sides. Witnesses can be called and questioned. The decision may be given on the day or later in writing. A short reasoned decision can be followed by a longer one if requested.",
          "The whole case has to be put first time. New arguments are hard to introduce later. Legislation and earlier cases that help you should be in the bundle; so should the ones HMRC will use, with your answer already written.",
        ],
      },
    ],
    help: {
      heading: "How Wingate helps",
      paragraphs: [
        "We give you a frank view of prospects. Often a fresh adviser can unblock a stuck negotiation, which is cheaper than a hearing. If we go to the tribunal we prepare the evidence and present it. Most of our investigation files still finish by agreement.",
        CALL,
      ],
    },
    faqs: [
      {
        question: "Is a tribunal cheaper than settling?",
        answer:
          "Rarely, once you count preparation and the risk of a worse result plus costs in some cases. We only recommend a hearing where the issue is worth it.",
      },
    ],
    related: ["litigation", "cop8", "hmrc-enquiry"],
  },
  {
    slug: "litigation",
    groupId: "disputes",
    title: "Tax litigation advice",
    navTitle: "Tax litigation",
    seoTitle: "Tax Litigation Advice | Wingate Accountants",
    description:
      "Independent tax view on civil disputes that turn on tax, including support to solicitors and expert evidence.",
    summary: "When two parties are already in a legal dispute and tax sits in the middle — and your usual adviser cannot be independent.",
    intro: [
      "Civil disputes sometimes turn on tax: a share sale, a completed enquiry, an indemnity, an employee/contractor argument. The accountant who gave the original advice is often a witness, not an independent voice. You then need a second view of the merits and of the tax that follows each possible outcome.",
    ],
    sections: [
      {
        heading: "Working with your solicitor",
        paragraphs: [
          "We can review the file, advise on prospects, help the lawyers present the tax, and give expert evidence if the court needs it. We can also speak to HMRC if the dispute creates a live compliance issue.",
        ],
      },
    ],
    help: {
      heading: "How Wingate helps",
      paragraphs: [
        "Instruct us early enough that the pleadings match the tax analysis. If someone has already issued against you, send the claim form and the tax correspondence together.",
        CALL,
      ],
    },
    faqs: [
      {
        question: "Is this the same as a Tax Tribunal appeal?",
        answer:
          "Not always. A tribunal appeal is against HMRC. Litigation advice here also covers disputes between private parties that happen to be about tax.",
      },
    ],
    related: ["tax-tribunal", "professional-intermediaries"],
  },
  {
    slug: "professional-intermediaries",
    groupId: "disputes",
    title: "Working with accountants, solicitors and other advisers",
    navTitle: "For other advisers",
    seoTitle: "Investigation Support for Accountants and Solicitors | Wingate",
    description:
      "Wingate works with other accountants and solicitors on HMRC investigations, either on the record or by drafting in the background.",
    summary: "Your client’s enquiry does not have to leave your practice. We can sit behind you, or take the investigation while you keep the accounts.",
    intro: [
      "Most accountancy firms are built for returns and accounts, not for HMRC investigations. A well-meant dump of records often creates new questions. Before anything is sent, someone who does this work should say what HMRC is entitled to and how to present it so the enquiry narrows, not widens.",
      "Serious fraud and evasion files are also time-hungry. Taking one on without capacity hurts the rest of the client list. Unlike a firm that only does investigations, we still prepare accounts and tax returns. We have no wish to lift a compliant client from another practice. We will take the investigation, or a defined piece of it, and leave the ongoing compliance where it sits.",
    ],
    sections: [
      {
        heading: "How much of the file we take",
        paragraphs: [
          "Solicitors instruct us when the client arrived via a legal problem, or when the usual accountant is out of their depth. The client and the agent decide the level: a second opinion on one information notice, through to running the whole enquiry. We can be named to HMRC, or we can draft letters on your letterhead if that is what the client wants.",
        ],
      },
    ],
    help: {
      heading: "How Wingate helps",
      paragraphs: [
        "Professional intermediaries can call us for a confidential, no-obligation discussion about a client file. We are used to working under someone else’s engagement letter.",
        CALL,
      ],
    },
    faqs: [
      {
        question: "Will you take our client?",
        answer:
          "Not as a condition of helping with an enquiry. If the client later asks us to take the compliance work as well, we will speak to you first.",
      },
    ],
    related: ["hmrc-enquiry", "cop9", "tax-tribunal"],
  },
];

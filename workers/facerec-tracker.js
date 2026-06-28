// FaceHeatMap v13 - Bottom Sheet Fixes, dvh frame, Font Ligature Fix, E2E Error Reporting
const VENDOR_INFO = {
  "Clearview AI": { desc: "Scraped 30B+ faces without consent. Used by ICE ($9.2M contract 2025), 600+ agencies, banned in IL, TX, WA, CA for commercial use.", danger: "EXTREME", wiki: "https://en.wikipedia.org/wiki/Clearview_AI", founded: "2017", hq: "New York, NY" },
  "Idemia": { desc: "Major global biometrics contractor. Supplies driver license facial recognition to 20+ US states. French-owned. AAMVA partner.", danger: "HIGH", wiki: "https://en.wikipedia.org/wiki/IDEMIA", founded: "2017", hq: "Courbevoie, France" },
  "NEC": { desc: "Japanese tech giant. FRT used in FL, GA, TX state programs. Ranked #1 by NIST accuracy benchmarks. Defense contractor.", danger: "HIGH", wiki: "https://en.wikipedia.org/wiki/NEC_Corporation", founded: "1899", hq: "Tokyo, Japan" },
  "FBI FACE Services": { desc: "Federal program that queries state DMV photo databases without warrants. 21+ states participate. No judicial oversight required. 641M+ photos in database.", danger: "HIGH", wiki: "https://www.gao.gov/products/gao-16-267", founded: "2011", hq: "Clarksburg, WV" },
  "LACRIS": { desc: "LA County Regional Identification System. 50+ LA-area police departments have access. Operated by LA Sheriff. No public audit.", danger: "HIGH", wiki: "https://www.muckrock.com/foi/los-angeles-county-358/lacris-member-list-2024-164197/", founded: "2014", hq: "Los Angeles, CA" },
  "Veritone": { desc: "AI media company. FRT formally approved for Anaheim PD in 2020 after 2018 pilot. Publicly traded (VERI). Cloud-based platform.", danger: "MEDIUM", wiki: "https://www.veritone.com", founded: "2014", hq: "Costa Mesa, CA" },
  "DataWorks Plus": { desc: "Detroit PD system — directly linked to wrongful arrests of Robert Williams (2020) and Michael Oliver. ACLU filed suit. Misidentification rate 96%.", danger: "EXTREME", wiki: "https://www.aclu.org/press-releases/detroit-police-department-wrongfully-arrested-robert-williams", founded: "2000", hq: "Greenville, SC" },
  "Vigilant Solutions": { desc: "Motorola subsidiary. ALPR + facial recognition combo product. Used in CA, TX, FL. Shares data with federal fusion centers.", danger: "HIGH", wiki: "https://www.motorolasolutions.com", founded: "2009", hq: "Livermore, CA" },
  "Palantir": { desc: "CIA-backed data analytics. Gotham platform used by NYPD, ICE, CBP. Integrates FRT with predictive policing scores.", danger: "EXTREME", wiki: "https://en.wikipedia.org/wiki/Palantir_Technologies", founded: "2003", hq: "Denver, CO" },
  "BANNED": { desc: "This city/jurisdiction has passed an ordinance banning or heavily restricting government use of facial recognition technology.", danger: "NONE", wiki: "https://www.banfacialrecognition.com/map/", founded: "N/A", hq: "N/A" }
};

const STATE_LAWS = {
  "IL": { title: "Illinois BIPA (2008)", summary: "Strictest biometric privacy law in the US. Private right of action. $1,000-$5,000 per violation. Clearview banned.", status: "STRONG", type: "STATUTE", link: "https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=3004" },
  "TX": { title: "Texas CUBI Act (2009)", summary: "Biometric data rules with AG enforcement. Clearview AI paid $6.75M settlement. No private right of action.", status: "MODERATE", type: "STATUTE", link: "https://statutes.capitol.texas.gov/Docs/BC/htm/BC.503.htm" },
  "WA": { title: "Washington HB 1493 (2023)", summary: "Law enforcement must get warrant for FRT except exigent circumstances. Audits required annually.", status: "STRONG", type: "STATUTE", link: "https://app.leg.wa.gov/billsummary?BillNumber=1493&Year=2023" },
  "CA": { title: "California AB 1215 + Local Bans", summary: "3-yr police body cam moratorium (expired 2023). SF, Oakland, Berkeley, Santa Cruz, Davis locally banned FRT.", status: "MODERATE", type: "MIXED", link: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=201920200AB1215" },
  "OR": { title: "Oregon HB 3202 (2021)", summary: "State agencies and law enforcement banned from using FRT except for human trafficking investigations.", status: "STRONG", type: "STATUTE", link: "https://olis.oregonlegislature.gov/liz/2021R1/Measures/Overview/HB3202" },
  "VA": { title: "Virginia HB 2031 (2021)", summary: "Law enforcement must get warrant for FRT except for violent felonies, missing persons. Annual audits.", status: "MODERATE", type: "STATUTE", link: "https://lis.virginia.gov/cgi-bin/legp604.exe?211+sum+HB2031" },
  "MA": { title: "Local Bans (Boston, Cambridge, Somerville)", summary: "Boston banned FRT for city use (2020). Cambridge (2020), Somerville (2019) also banned. State moratorium bill pending.", status: "PARTIAL", type: "LOCAL_BAN", link: "https://www.boston.gov/news/boston-enacts-ordinance-banning-city-government-use-facial-recognition" },
  "NY": { title: "NY Bills Pending", summary: "NYC introduced moratorium bills. State-level bill A6569 pending. No current state law. Local advocacy active.", status: "PENDING", type: "PROPOSED", link: "https://nyassembly.gov/leg/?default_fld=&leg_video=&bn=A06569&term=2021&Summary=Y&Actions=Y" },
  "CO": { title: "Colorado SB 169 (2024)", summary: "Biometric data consent requirements. Facial recognition included. AG enforcement. Right to delete.", status: "MODERATE", type: "STATUTE", link: "https://leg.colorado.gov/bills/sb24-169" },
  "MN": { title: "Minnesota MCDPA (2023)", summary: "Consumer Data Privacy Act includes biometric identifiers. Controller obligations. Effective 2025.", status: "MODERATE", type: "STATUTE", link: "https://www.revisor.mn.gov/bills/bill.php?f=HF4&b=house&y=2023&ssn=0" },
  "MD": { title: "Maryland CDPA (2024)", summary: "Biometrics included. Opt-in consent for processing. Effective 2025. AG enforcement.", status: "MODERATE", type: "STATUTE", link: "https://mgaleg.maryland.gov/mgawebsite/Legislation/Details/hb0567?ys=2024RS" },
  "ME": { title: "Maine Act (2021)", summary: "State and local government use of FRT banned entirely. One of the strictest state-level bans.", status: "STRONG", type: "STATUTE", link: "https://legislature.maine.gov/legis/bills/display_ps.asp?ld=1948&PID=1456&snum=130" }
};


function buildPrivacyPage() {
  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>Privacy Policy — FaceHeatMap</title>\n<meta name="robots" content="noindex, follow">\n<link rel="canonical" href="https://faceheatmap.app/privacy">\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">\n<style>\n:root{--bg:#060a14;--panel:#0d1526;--border:#1e293b;--text:#e2e8f0;--text2:#94a3b8;--accent:#60a5fa;--red:#ef4444}\n*{box-sizing:border-box;margin:0;padding:0}\nbody{font-family:\'Inter\',system-ui,sans-serif;background:var(--bg);color:var(--text);padding:0;line-height:1.6}\n.legal-wrap{max-width:800px;margin:0 auto;padding:40px 24px}\n.legal-nav{background:var(--panel);border-bottom:1px solid var(--border);padding:16px 24px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:10}\n.legal-nav a{color:var(--accent);text-decoration:none;font-size:14px}\n.legal-logo{font-weight:900;font-size:16px;color:var(--text)}\n.legal-logo span{color:var(--red)}\nh1{font-size:28px;font-weight:900;margin-bottom:8px;line-height:1.2}\nh2{font-size:16px;font-weight:700;color:var(--accent);margin:28px 0 10px;padding-top:8px;border-top:1px solid var(--border)}\nh3{font-size:14px;font-weight:600;color:var(--text);margin:16px 0 6px}\np{font-size:13px;color:var(--text2);margin-bottom:12px;line-height:1.7}\nul,ol{font-size:13px;color:var(--text2);padding-left:20px;margin-bottom:12px}\nli{margin-bottom:6px;line-height:1.6}\n.warning{background:#1a0a0a;border:1px solid var(--red)40;border-radius:8px;padding:14px;margin:16px 0}\n.warning p{color:#fca5a5;margin:0}\n.updated{font-size:12px;color:#475569;margin-bottom:32px}\na{color:var(--accent)}\n.contact-box{background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:20px;margin-top:24px}\n.contact-form input,.contact-form textarea,.contact-form select{width:100%;background:#0f172a;border:1px solid var(--border);border-radius:6px;padding:10px 12px;color:var(--text);font-size:13px;font-family:inherit;margin-bottom:10px}\n.contact-form textarea{height:100px;resize:vertical}\n.contact-form button{background:var(--red);color:#fff;border:none;border-radius:6px;padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;width:100%}\n</style>\n</head>\n<body>\n<nav class="legal-nav">\n  <a href="/" style="display:flex;align-items:center;gap:8px">\n    <span class="legal-logo"><span>Face</span>HeatMap</span>\n  </a>\n  <span style="color:#334155;margin:0 4px">|</span>\n  <a href="/privacy">Privacy Policy</a>\n  <span style="color:#334155;margin:0 4px">·</span>\n  <a href="/terms">Terms of Service</a>\n  <span style="color:#334155;margin:0 4px">·</span>\n  <a href="/">← Back to Map</a>\n</nav>\n<div class="legal-wrap">\n\n<h1>Privacy Policy</h1>\n<p class="updated">Last Updated: May 1, 2026 · Effective: May 1, 2026</p>\n\n<div class="warning">\n  <p><strong>Summary:</strong> FaceHeatMap does not sell your data. We collect minimal technical data needed to operate the service. We do not require account registration. You have full rights to access, correct, or delete any data we hold about you.</p>\n</div>\n\n<h2>1. Who We Are</h2>\n<p>FaceHeatMap ("we," "us," "our") is operated by VPDLNY (Vulnerable Persons Defense League of New York), a collective of technologists and artists dedicated to transparency and civil liberties. Our primary contact for privacy matters is: <a href="mailto:contact@faceheatmap.app">contact@faceheatmap.app</a></p>\n\n<h2>2. Information We Collect</h2>\n<h3>2.1 Automatically Collected Technical Data</h3>\n<p>When you visit FaceHeatMap, our web server (Cloudflare Workers) automatically logs:</p>\n<ul>\n  <li>Your IP address (processed by Cloudflare — see Cloudflare\'s privacy policy)</li>\n  <li>Browser type and version (User-Agent string)</li>\n  <li>Pages requested and timestamps</li>\n  <li>Referring URL (if you clicked a link to reach us)</li>\n  <li>Country-level geolocation (derived from IP, not stored)</li>\n</ul>\n<p>This data is processed by Cloudflare under their standard infrastructure logging. We do not have persistent access to this data beyond error reports.</p>\n\n<h3>2.2 Consent Records</h3>\n<p>When you agree to our Terms of Service, we store a consent record in your browser\'s localStorage. This record contains: timestamp of consent, and a truncated User-Agent string. This data stays on your device and is not transmitted to our servers.</p>\n\n<h3>2.3 JavaScript Error Reports</h3>\n<p>If a JavaScript error occurs in your browser while using the app, an automated error report may be sent to our /api/error endpoint. This report contains: the error message, the URL where it occurred, and a truncated User-Agent string. No personally identifiable information is included.</p>\n\n<h3>2.4 Contact Form Submissions</h3>\n<p>If you voluntarily submit our contact form, we collect: your name, email address, subject, and message. This data is stored in our secure database and used only to respond to your inquiry. We do not use contact form data for marketing.</p>\n\n<h3>2.5 Data We Do NOT Collect</h3>\n<ul>\n  <li>We do not require or create user accounts</li>\n  <li>We do not use advertising tracking pixels or cookies</li>\n  <li>We do not use Google Analytics or third-party analytics</li>\n  <li>We do not collect biometric data from users</li>\n  <li>We do not sell, rent, or trade any user data</li>\n  <li>We do not use cross-site tracking technologies</li>\n</ul>\n\n<h2>3. How We Use Your Information</h2>\n<p>Technical log data is used solely for: debugging errors, preventing abuse and DDoS attacks, and understanding aggregate usage patterns. Contact form data is used solely to respond to your message.</p>\n\n<h2>4. Data Sharing and Third Parties</h2>\n<h3>4.1 Cloudflare</h3>\n<p>Our site is hosted on Cloudflare Workers and Cloudflare D1. Cloudflare processes request metadata as part of infrastructure operations. Cloudflare\'s privacy policy governs their data handling: <a href="https://www.cloudflare.com/privacypolicy/" target="_blank">cloudflare.com/privacypolicy</a></p>\n<h3>4.2 External Data Sources</h3>\n<p>The surveillance data displayed on FaceHeatMap comes from public sources (EFF, USASpending.gov, MuckRock, ACLU, NewsAPI). We link to these sources but do not control their privacy practices.</p>\n<h3>4.3 No Advertising Partners</h3>\n<p>We have no advertising partners and do not share data with ad networks, data brokers, or marketing platforms.</p>\n<h3>4.4 Legal Requirements</h3>\n<p>We may disclose information if required by valid legal process (court order, subpoena) after consultation with legal counsel. We will notify affected users when legally permitted to do so.</p>\n\n<h2>5. Your Rights</h2>\n<p>Depending on your jurisdiction, you may have the following rights:</p>\n<ul>\n  <li><strong>Right to Access:</strong> Request a copy of data we hold about you</li>\n  <li><strong>Right to Correction:</strong> Request correction of inaccurate data</li>\n  <li><strong>Right to Deletion:</strong> Request deletion of your data (contact form submissions)</li>\n  <li><strong>Right to Portability:</strong> Receive your data in a machine-readable format</li>\n  <li><strong>Right to Object:</strong> Object to certain processing activities</li>\n  <li><strong>CCPA Rights (California):</strong> Right to know, delete, opt-out of sale (we do not sell data)</li>\n  <li><strong>GDPR Rights (EU/UK):</strong> All rights under GDPR Article 15-22</li>\n</ul>\n<p>To exercise any right, contact us at <a href="mailto:contact@faceheatmap.app">contact@faceheatmap.app</a>. We will respond within 30 days (or 45 days where permitted by law).</p>\n\n<h2>6. Data Security</h2>\n<p>We implement reasonable technical security measures including: HTTPS/TLS encryption for all data in transit, Cloudflare DDoS protection and WAF, no storage of sensitive personal data, regular security reviews. However, no internet transmission is 100% secure. We cannot guarantee absolute security.</p>\n\n<h2>7. Data Retention</h2>\n<ul>\n  <li>Contact form submissions: retained for 2 years, then deleted</li>\n  <li>Error reports: retained for 30 days in logs</li>\n  <li>Cloudflare infrastructure logs: subject to Cloudflare\'s retention policies (typically 72 hours)</li>\n  <li>Consent records: stored locally in your browser, deleted when you clear browser data</li>\n</ul>\n\n<h2>8. Children\'s Privacy</h2>\n<p>FaceHeatMap is not directed at children under 18 years of age. We do not knowingly collect personal information from minors. If you believe we have inadvertently collected data from a minor, contact us immediately at <a href="mailto:contact@faceheatmap.app">contact@faceheatmap.app</a>.</p>\n\n<h2>9. International Users</h2>\n<p>FaceHeatMap is operated in the United States. If you access our service from outside the US, your data may be processed in the US. By using our service, you consent to this transfer. We process data in accordance with applicable law.</p>\n\n<h2>10. Changes to This Policy</h2>\n<p>We may update this Privacy Policy. Material changes will be indicated by updating the "Last Updated" date at the top of this page. Continued use of FaceHeatMap after changes constitutes acceptance of the updated policy.</p>\n\n<h2>11. Contact Us</h2>\n<div class="contact-box">\n  <p style="margin-bottom:12px">For privacy-related requests, data deletion, or questions about this policy:</p>\n  <p><strong>Email:</strong> <a href="mailto:contact@faceheatmap.app">contact@faceheatmap.app</a></p>\n  <p><strong>Subject line:</strong> "Privacy Request" or "Data Deletion Request"</p>\n  <p style="margin-top:8px;font-size:12px;color:#475569">Response time: 30 days or less. For urgent matters, include "URGENT" in your subject line.</p>\n</div>\n\n</div>\n</body>\n</html>';
}

function buildTermsPage() {
  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>Terms of Service — FaceHeatMap</title>\n<meta name="robots" content="noindex, follow">\n<link rel="canonical" href="https://faceheatmap.app/terms">\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">\n<style>\n:root{--bg:#060a14;--panel:#0d1526;--border:#1e293b;--text:#e2e8f0;--text2:#94a3b8;--accent:#60a5fa;--red:#ef4444}\n*{box-sizing:border-box;margin:0;padding:0}\nbody{font-family:\'Inter\',system-ui,sans-serif;background:var(--bg);color:var(--text);padding:0;line-height:1.6}\n.legal-wrap{max-width:800px;margin:0 auto;padding:40px 24px}\n.legal-nav{background:var(--panel);border-bottom:1px solid var(--border);padding:16px 24px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:10}\n.legal-nav a{color:var(--accent);text-decoration:none;font-size:14px}\n.legal-logo{font-weight:900;font-size:16px;color:var(--text)}\n.legal-logo span{color:var(--red)}\nh1{font-size:28px;font-weight:900;margin-bottom:8px;line-height:1.2}\nh2{font-size:16px;font-weight:700;color:var(--accent);margin:28px 0 10px;padding-top:8px;border-top:1px solid var(--border)}\nh3{font-size:14px;font-weight:600;color:var(--text);margin:16px 0 6px}\np{font-size:13px;color:var(--text2);margin-bottom:12px;line-height:1.7}\nul,ol{font-size:13px;color:var(--text2);padding-left:20px;margin-bottom:12px}\nli{margin-bottom:6px;line-height:1.6}\n.warning{background:#1a0a0a;border:1px solid var(--red)40;border-radius:8px;padding:14px;margin:16px 0}\n.warning p{color:#fca5a5;margin:0}\n.updated{font-size:12px;color:#475569;margin-bottom:32px}\na{color:var(--accent)}\n.contact-box{background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:20px;margin-top:24px}\n.contact-form input,.contact-form textarea,.contact-form select{width:100%;background:#0f172a;border:1px solid var(--border);border-radius:6px;padding:10px 12px;color:var(--text);font-size:13px;font-family:inherit;margin-bottom:10px}\n.contact-form textarea{height:100px;resize:vertical}\n.contact-form button{background:var(--red);color:#fff;border:none;border-radius:6px;padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;width:100%}\n</style>\n</head>\n<body>\n<nav class="legal-nav">\n  <a href="/" style="display:flex;align-items:center;gap:8px">\n    <span class="legal-logo"><span>Face</span>HeatMap</span>\n  </a>\n  <span style="color:#334155;margin:0 4px">|</span>\n  <a href="/privacy">Privacy Policy</a>\n  <span style="color:#334155;margin:0 4px">·</span>\n  <a href="/terms">Terms of Service</a>\n  <span style="color:#334155;margin:0 4px">·</span>\n  <a href="/">← Back to Map</a>\n</nav>\n<div class="legal-wrap">\n\n<h1>Terms of Service</h1>\n<p class="updated">Last Updated: May 1, 2026 · Effective: May 1, 2026</p>\n\n<div class="warning">\n  <p><strong>Important:</strong> FaceHeatMap provides publicly sourced OSINT data for educational and research purposes only. By using this service, you agree to these terms. You must be 18+ to use this service.</p>\n</div>\n\n<h2>1. Acceptance of Terms</h2>\n<p>By accessing or using FaceHeatMap at faceheatmap.app ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all Terms, do not use the Service. These Terms apply to all users including visitors, researchers, journalists, and any other party who accesses the Service.</p>\n\n<h2>2. About the Service</h2>\n<p>FaceHeatMap is a free, public-interest OSINT (Open Source Intelligence) research tool operated by VPDLNY (Vulnerable Persons Defense League of New York). The Service aggregates and displays publicly available information about government use of facial recognition technology in the United States for educational, journalistic, and research purposes. This tool is protected by the First Amendment of the United States Constitution as lawful newsgathering and public interest research.</p>\n\n<h2>3. Permitted Uses</h2>\n<p>You may use FaceHeatMap for:</p>\n<ul>\n  <li>Academic research and scholarship</li>\n  <li>Journalism and investigative reporting</li>\n  <li>Civil rights advocacy and public policy analysis</li>\n  <li>Personal education and awareness</li>\n  <li>Legal research by attorneys, paralegals, or law students</li>\n  <li>Non-commercial public interest work</li>\n  <li>Government accountability reporting</li>\n</ul>\n\n<h2>4. Prohibited Uses</h2>\n<p>You expressly agree NOT to use FaceHeatMap to:</p>\n<ul>\n  <li>Harass, stalk, surveil, or harm any individual person or group</li>\n  <li>Facilitate illegal discrimination based on race, religion, national origin, gender, sexual orientation, or any other protected class</li>\n  <li>Conduct commercial surveillance or build competing commercial products using our data without written permission</li>\n  <li>Attempt to circumvent technical security measures or access restricted areas of the Service</li>\n  <li>Scrape or systematically harvest our database for bulk data export without written permission</li>\n  <li>Use the Service in connection with any unlawful activity</li>\n  <li>Impersonate VPDLNY, FaceHeatMap, or our representatives</li>\n  <li>Submit false, misleading, or defamatory contact form submissions</li>\n</ul>\n<p>Violation of prohibited use restrictions may result in termination of access and potential legal action.</p>\n\n<h2>5. Nature of the Data — Critical Disclaimers</h2>\n<div class="warning">\n  <p><strong>DATA ACCURACY DISCLAIMER:</strong> FaceHeatMap data is compiled from public sources and may be incomplete, outdated, or contain errors. We do not represent or warrant that any information on this site is current, accurate, or complete.</p>\n</div>\n<h3>5.1 Public Records Basis</h3>\n<p>All information on FaceHeatMap is derived from: government databases (USASpending.gov, GAO reports), FOIA-disclosed records via MuckRock, EFF Atlas of Surveillance, court documents and litigation records, published journalism from credible news organizations, and academic research.</p>\n<h3>5.2 No Defamatory Intent</h3>\n<p>Information about agencies and vendors displayed on this site is factual, sourced, and presented in the public interest. We maintain source citations for all entries. This Service does not present information as established fact where not established, and does not intend to defame any person, agency, or organization.</p>\n<h3>5.3 Not Legal Advice</h3>\n<p>Nothing on FaceHeatMap constitutes legal advice. Information about laws, rights, and regulations is provided for educational purposes only. Consult a qualified attorney for legal guidance specific to your situation.</p>\n<h3>5.4 Temporal Limitations</h3>\n<p>Government surveillance programs change frequently. Contracts expire, agencies change vendors, and laws are enacted or repealed. Data displayed may not reflect current conditions.</p>\n\n<h2>6. Intellectual Property</h2>\n<h3>6.1 Our Content</h3>\n<p>The FaceHeatMap interface, design, curation, analysis, and original editorial content are protected by copyright and owned by VPDLNY. You may not reproduce, distribute, or create derivative works without written permission.</p>\n<h3>6.2 Underlying Data</h3>\n<p>Underlying data from public sources (government databases, FOIA records) is in the public domain or licensed under open government data licenses. We claim no copyright over raw government data.</p>\n<h3>6.3 Citation and Attribution</h3>\n<p>If you use FaceHeatMap data in published work, academic papers, or journalism, please cite: "FaceHeatMap USA (faceheatmap.app), VPDLNY, [date accessed]."</p>\n\n<h2>7. Disclaimer of Warranties</h2>\n<p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, NON-INFRINGEMENT, OR UNINTERRUPTED AVAILABILITY. VPDLNY AND FACEHEATMAP MAKE NO REPRESENTATIONS ABOUT THE ACCURACY, COMPLETENESS, TIMELINESS, OR RELIABILITY OF ANY INFORMATION ON THE SERVICE.</p>\n\n<h2>8. Limitation of Liability</h2>\n<p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, VPDLNY, FACEHEATMAP, AND THEIR OPERATORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES ARISING FROM YOUR USE OF THE SERVICE OR RELIANCE ON ITS CONTENT, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, DATA, OR OTHER INTANGIBLE LOSSES, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>\n<p>IN JURISDICTIONS THAT DO NOT ALLOW LIMITATION OF LIABILITY, OUR LIABILITY IS LIMITED TO THE GREATEST EXTENT PERMITTED BY LAW.</p>\n\n<h2>9. Indemnification</h2>\n<p>You agree to indemnify, defend, and hold harmless VPDLNY, FaceHeatMap, and their officers, agents, and representatives from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys\' fees, arising out of or in any way connected with your access to or use of the Service in violation of these Terms.</p>\n\n<h2>10. Third-Party Links and Sources</h2>\n<p>FaceHeatMap links to third-party sources including EFF, ACLU, MuckRock, USASpending.gov, and news organizations. We are not responsible for the content, accuracy, or privacy practices of third-party sites. Links do not constitute endorsement.</p>\n\n<h2>11. Age Requirement</h2>\n<p>You must be at least 18 years of age to use FaceHeatMap. By using this Service, you represent and warrant that you are 18 or older. If you are under 18, do not use this Service.</p>\n\n<h2>12. Governing Law and Jurisdiction</h2>\n<p>These Terms are governed by the laws of the State of New York, United States, without regard to conflict of law provisions. Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the state and federal courts located in New York County, New York.</p>\n\n<h2>13. Modifications to Terms</h2>\n<p>We reserve the right to modify these Terms at any time. Changes take effect upon posting to this page. Your continued use of the Service following any modification constitutes acceptance of the updated Terms. We encourage you to review these Terms periodically.</p>\n\n<h2>14. Termination</h2>\n<p>We reserve the right to terminate or suspend access to the Service, with or without notice, for violation of these Terms or for any other reason at our sole discretion. Sections 7, 8, 9, and 12 survive termination.</p>\n\n<h2>15. Contact and Notices</h2>\n<div class="contact-box">\n  <p style="margin-bottom:12px">For legal inquiries, DMCA notices, or Terms-related questions:</p>\n  <p><strong>Email:</strong> <a href="mailto:contact@faceheatmap.app">contact@faceheatmap.app</a></p>\n  <p><strong>Operated by:</strong> VPDLNY — Vulnerable Persons Defense League of New York</p>\n  <p style="margin-top:8px;font-size:12px;color:#475569">Legal notices must be sent in writing to our contact email. DMCA notices must comply with 17 U.S.C. § 512(c)(3).</p>\n\n  <div id="contact-section" style="margin-top:20px;border-top:1px solid #1e293b;padding-top:16px">\n    <h3 style="margin-bottom:12px;font-size:14px">Send Us a Message</h3>\n    <form class="contact-form" onsubmit="submitContact(event)">\n      <input type="text" id="cf-name" placeholder="Your name" required>\n      <input type="email" id="cf-email" placeholder="Your email address" required>\n      <select id="cf-subject">\n        <option value="General">General Inquiry</option>\n        <option value="Data Correction">Data Correction Request</option>\n        <option value="DMCA">DMCA / Legal Notice</option>\n        <option value="Privacy">Privacy / Data Request</option>\n        <option value="Partnership">Partnership / Media</option>\n        <option value="Bug Report">Bug Report</option>\n      </select>\n      <textarea id="cf-message" placeholder="Your message..." required></textarea>\n      <button type="submit" id="cf-submit">Send Message</button>\n      <div id="cf-status" style="margin-top:8px;font-size:12px;text-align:center"></div>\n    </form>\n  </div>\n</div>\n\n<script>\nasync function submitContact(e) {\n  e.preventDefault();\n  var btn = document.getElementById(\'cf-submit\');\n  var status = document.getElementById(\'cf-status\');\n  btn.disabled = true; btn.textContent = \'Sending...\';\n  try {\n    var r = await fetch(\'/api/contact\', {\n      method: \'POST\',\n      headers: {\'Content-Type\':\'application/json\'},\n      body: JSON.stringify({\n        name: document.getElementById(\'cf-name\').value,\n        email: document.getElementById(\'cf-email\').value,\n        subject: document.getElementById(\'cf-subject\').value,\n        message: document.getElementById(\'cf-message\').value\n      })\n    });\n    if (r.ok) {\n      status.style.color = \'#00c853\'; status.textContent = \'✓ Message sent. We will respond within 30 days.\';\n      btn.textContent = \'✓ Sent\';\n    } else { throw new Error(\'Server error\'); }\n  } catch(err) {\n    status.style.color = \'#ef4444\'; status.textContent = \'Error sending. Please email contact@faceheatmap.app directly.\';\n    btn.disabled = false; btn.textContent = \'Send Message\';\n  }\n}\n</script>\n\n</div>\n</body>\n</html>';
}

function buildCSS() {
  return `
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#060a14;--panel:#0b1120;--panel2:#0f1729;--panel3:#131f35;
  --border:#192138;--border2:#1e2a45;--text:#dde4f0;--text2:#8fa3c8;--muted:#4a5a7a;
  --accent:#3b82f6;--accent2:#6366f1;--red:#ff2d2d;--orange:#ff8c00;
  --yellow:#ffd700;--green:#00c853;--cyan:#06b6d4;--card:#0d1628;
  --glow-red:rgba(255,45,45,0.15);--glow-blue:rgba(59,130,246,0.15);
}
html{height:100%;height:100dvh}body{height:100%;height:100dvh;overflow:hidden;max-height:100dvh}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;display:flex;flex-direction:column;font-variant-ligatures:none;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}

/* ===== HEADER ===== */
header{
  background:linear-gradient(135deg,#06091a 0%,#0b1120 100%);
  border-bottom:1px solid var(--border2);
  padding:0 20px;height:56px;display:flex;align-items:center;gap:16px;
  flex-shrink:0;z-index:500;position:fixed;top:0;left:0;right:0;width:100%;
  padding-top:env(safe-area-inset-top,0px);height:calc(56px + env(safe-area-inset-top,0px));
}
header::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,var(--accent),var(--red),transparent)}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none}
.logo-icon{width:34px;height:34px;border-radius:8px;
  background:linear-gradient(135deg,var(--red),#cc0000);
  display:flex;align-items:center;justify-content:center;font-size:18px;
  box-shadow:0 0 12px rgba(255,45,45,0.4);flex-shrink:0}
.logo-text{font-size:20px;font-weight:900;letter-spacing:-0.5px;
  background:linear-gradient(135deg,#fff 0%,var(--text2) 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent}
.logo-text span{background:linear-gradient(135deg,var(--red),#ff6b6b);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent}
.header-tagline{font-size:10px;color:var(--muted);letter-spacing:0.5px;text-transform:uppercase;
  border-left:1px solid var(--border2);padding-left:14px;display:none}
.live-badge{display:flex;align-items:center;gap:5px;background:rgba(255,45,45,0.08);
  border:1px solid rgba(255,45,45,0.2);border-radius:20px;padding:3px 9px;font-size:10px;
  font-weight:700;color:var(--red);letter-spacing:0.5px}
.live-dot{width:6px;height:6px;border-radius:50%;background:var(--red);
  animation:pulse-dot 1.4s ease-in-out infinite}
@keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.7)}}
.stats-bar{display:flex;gap:4px;margin-left:auto;align-items:center}
.stat-chip{display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:6px;
  background:var(--card);border:1px solid var(--border);font-size:11px}
.stat-chip .dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.stat-chip .n{font-weight:800;font-size:13px;font-variant-numeric:tabular-nums}
.stat-chip .lbl{color:var(--muted);font-size:10px}
.stat-chip.red .n{color:var(--red)}.stat-chip.orange .n{color:var(--orange)}
.stat-chip.green .n{color:var(--green)}.stat-chip.total .n{color:#60a5fa}
.dot.red{background:var(--red)}.dot.orange{background:var(--orange)}
.dot.green{background:var(--green)}
.header-menu-btn{display:none;background:none;border:none;color:var(--text);
  cursor:pointer;padding:8px;font-size:20px}

/* ===== NAV TABS ===== */
.nav-tabs-wrap{position:relative}
.nav-tabs-wrap::after{content:'';position:absolute;right:0;top:0;bottom:0;width:24px;background:linear-gradient(to right,transparent,var(--bg));pointer-events:none;z-index:1}
.nav-tabs{
  background:var(--panel);border-bottom:1px solid var(--border);
  display:flex;gap:0;padding:0 12px;flex-shrink:0;overflow-x:auto;
  scrollbar-width:none;-webkit-overflow-scrolling:touch;
  position:fixed;top:calc(56px + env(safe-area-inset-top,0px));left:0;right:0;width:100%;z-index:499;
}
.nav-tabs::-webkit-scrollbar{display:none}
.tab{padding:10px 14px;font-size:12px;font-weight:600;color:var(--muted);
  cursor:pointer;border-bottom:2px solid transparent;transition:all 0.2s;
  white-space:nowrap;user-select:none;display:flex;align-items:center;gap:5px}
.tab:hover{color:var(--text2)}
.tab.active{color:var(--text);border-bottom-color:var(--red);background:rgba(255,45,45,0.05)}
.tab:active{transform:scale(0.95)}
.tab-icon{font-size:13px;opacity:0.8}

/* ===== MAIN LAYOUT ===== */
.main{display:flex;flex:1;overflow:hidden;position:relative;padding-top:calc(96px + env(safe-area-inset-top,0px))}

/* ===== MAP PAGE ===== */
#map-page{display:flex;flex:1;overflow:hidden}
#map{flex:1;position:relative;z-index:1;min-height:400px}
.map-marker{border-radius:50%;cursor:pointer;position:relative}
.map-marker.pulse-red{animation:ripple-red 2s ease-out infinite}
.map-marker.pulse-orange{animation:ripple-orange 2s ease-out infinite}
@keyframes ripple-red{0%{box-shadow:0 0 0 2px rgba(0,0,0,0.4),0 0 8px #ff2d2d60,0 0 0 4px #ff2d2d40}100%{box-shadow:0 0 0 2px rgba(0,0,0,0.4),0 0 8px #ff2d2d60,0 0 0 18px #ff2d2d00}}
@keyframes ripple-orange{0%{box-shadow:0 0 0 2px rgba(0,0,0,0.4),0 0 6px #ff8c0060,0 0 0 4px #ff8c0030}100%{box-shadow:0 0 0 2px rgba(0,0,0,0.4),0 0 6px #ff8c0060,0 0 0 16px #ff8c0000}}
.page{flex:1;overflow-y:auto;display:none;flex-direction:column;padding:20px;gap:20px}
.page.active{display:flex}

/* ===== SIDEBAR ===== */
.sidebar{
  width:360px;background:var(--panel);border-left:1px solid var(--border);
  display:flex;flex-direction:column;overflow:hidden;flex-shrink:0;
}
.sidebar-hdr{padding:12px 14px;border-bottom:1px solid var(--border);flex-shrink:0}
.sidebar-hdr h2{font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px}
.sidebar-hdr p{font-size:11px;color:var(--muted);margin-top:3px}
.search-wrap{padding:8px 12px;border-bottom:1px solid var(--border);flex-shrink:0;position:relative}
.search-wrap input{
  width:100%;background:var(--card);border:1px solid var(--border2);
  border-radius:8px;padding:8px 12px 8px 32px;color:var(--text);
  font-size:12px;outline:none;transition:border-color 0.2s
}
.search-wrap input:focus{border-color:var(--accent)}
.search-icon{position:absolute;left:20px;top:50%;transform:translateY(-50%);
  color:var(--muted);font-size:13px;pointer-events:none}
.filter-wrap{padding:7px 12px;border-bottom:1px solid var(--border);
  display:flex;gap:5px;flex-wrap:wrap;flex-shrink:0}
.fb{font-size:10px;font-weight:700;padding:3px 9px;border-radius:4px;
  border:1px solid var(--border);background:transparent;color:var(--muted);
  cursor:pointer;transition:all 0.15s;text-transform:uppercase;letter-spacing:0.3px}
.fb:hover{color:var(--text)}
.fb.active-f{color:var(--text);border-color:var(--accent);background:rgba(59,130,246,0.08)}
.fb.red-f.active-f{border-color:var(--red);background:var(--glow-red);color:var(--red)}
.fb.orange-f.active-f{border-color:var(--orange);background:rgba(255,140,0,0.08);color:var(--orange)}
.fb.green-f.active-f{border-color:var(--green);background:rgba(0,200,83,0.08);color:var(--green)}
.sidebar-list{flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:8px}
.sidebar-list::-webkit-scrollbar{width:4px}
.sidebar-list::-webkit-scrollbar-track{background:transparent}
.sidebar-list::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}
.count-bar{padding:6px 14px;font-size:11px;color:var(--muted);border-bottom:1px solid var(--border);flex-shrink:0}
.count-bar span{color:var(--text);font-weight:600}

/* ===== ENTRY CARDS ===== */
.ecard.RED{border-left:3px solid #ff2d2d;background:rgba(255,45,45,0.03)}
.ecard.RED:hover{background:rgba(255,45,45,0.06) !important}
.ecard.ORANGE{border-left:2px solid #ff8c00}
.ecard{
  background:var(--card);border:1px solid var(--border);border-radius:10px;
  padding:11px;cursor:pointer;transition:all 0.15s;position:relative;overflow:hidden
}
.ecard::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:10px 0 0 10px}
.ecard.RED::before{background:var(--red)}
.ecard.ORANGE::before{background:var(--orange)}
.ecard.YELLOW::before{background:var(--yellow)}
.ecard.GREEN::before{background:var(--green)}
.ecard.NONE::before{background:var(--accent)}
.ecard:hover{border-color:var(--border2);background:#101c30;transform:translateX(1px)}
.ecard.selected{border-color:var(--accent);background:rgba(59,130,246,0.05)}
.ec-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:4px}
.ec-city{font-size:14px;font-weight:700;line-height:1.2}
.ec-state{font-size:10px;color:var(--muted);font-weight:600;letter-spacing:0.5px;text-transform:uppercase}
.ec-badge{font-size:9px;font-weight:800;padding:2px 6px;border-radius:3px;
  text-transform:uppercase;letter-spacing:0.4px;white-space:nowrap;flex-shrink:0}
.ec-badge.RED{background:rgba(255,45,45,0.12);color:var(--red);border:1px solid rgba(255,45,45,0.25)}
.ec-badge.ORANGE{background:rgba(255,140,0,0.12);color:var(--orange);border:1px solid rgba(255,140,0,0.25)}
.ec-badge.YELLOW{background:rgba(255,215,0,0.12);color:var(--yellow);border:1px solid rgba(255,215,0,0.3)}
.ec-badge.GREEN{background:rgba(0,200,83,0.12);color:var(--green);border:1px solid rgba(0,200,83,0.25)}
.ec-badge.NONE{background:rgba(59,130,246,0.12);color:#60a5fa;border:1px solid rgba(59,130,246,0.25)}
.ec-agency{font-size:11px;color:var(--text2);margin-bottom:6px;line-height:1.3}
.ec-vendor{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;
  color:#60a5fa;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2);
  border-radius:4px;padding:2px 7px;margin-bottom:5px}
.ec-meta{display:flex;align-items:center;gap:8px;font-size:10px;color:var(--muted)}
.ec-source{background:rgba(255,255,255,0.04);border-radius:3px;padding:1px 5px}
.ec-amount{color:#fbbf24;font-weight:600}
.ec-expand{margin-top:8px;border-top:1px solid var(--border);padding-top:8px;display:none}
.ec-expand.open{display:block}
.ec-desc{font-size:11px;color:var(--text2);line-height:1.5;margin-bottom:8px}
.ec-actions{display:flex;gap:8px;flex-wrap:wrap}
.ec-btn{font-size:10px;font-weight:600;padding:4px 9px;border-radius:5px;
  border:1px solid var(--border2);background:transparent;color:var(--text2);
  cursor:pointer;transition:all 0.15s;text-decoration:none;display:inline-flex;align-items:center;gap:4px}
.ec-btn:hover{border-color:var(--accent);color:var(--accent)}

/* ===== RISK LEGEND ===== */
.map-legend{
  position:absolute;bottom:28px;left:10px;z-index:1000;
  background:rgba(6,10,20,0.92);border:1px solid var(--border2);
  border-radius:10px;padding:10px 13px;font-size:11px;backdrop-filter:blur(8px);
  min-width:160px
}
.legend-title{font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;
  letter-spacing:0.5px;margin-bottom:7px}
.legend-item{display:flex;align-items:center;gap:7px;margin-bottom:5px;font-size:11px}
.legend-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.map-controls{
  position:absolute;top:10px;right:10px;z-index:1000;display:flex;flex-direction:column;gap:6px
}
.map-ctrl-btn{
  background:rgba(6,10,20,0.92);border:1px solid var(--border2);border-radius:8px;
  padding:7px 10px;font-size:11px;font-weight:600;color:var(--text2);cursor:pointer;
  transition:all 0.15s;backdrop-filter:blur(8px);white-space:nowrap
}
.map-ctrl-btn:hover{border-color:var(--accent);color:var(--accent)}
.map-ctrl-btn.active{border-color:var(--accent);color:var(--accent);background:rgba(59,130,246,0.1)}

/* ===== PAGE SECTIONS ===== */
.page-hdr{font-size:22px;font-weight:800;margin-bottom:4px}
.page-sub{font-size:13px;color:var(--text2)}
.section{background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:20px}
.section-title{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;
  color:var(--text2);margin-bottom:14px;display:flex;align-items:center;gap:7px}
.section-title span{width:3px;height:14px;background:var(--accent);border-radius:2px;display:inline-block}

/* ===== VENDOR GRID ===== */
.vendor-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
.vcard{background:var(--card);border:1px solid var(--border);border-radius:12px;
  padding:16px;cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden}
.vcard-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.vcard:hover{border-color:var(--border2);transform:translateY(-1px);box-shadow:0 4px 20px rgba(0,0,0,0.3)}
.vcard-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px}
.vcard-name{font-size:15px;font-weight:800;line-height:1.2}
.vcard-danger{font-size:9px;font-weight:800;padding:3px 7px;border-radius:4px;
  text-transform:uppercase;letter-spacing:0.4px;flex-shrink:0}
.vcard-danger.EXTREME{background:rgba(255,45,45,0.12);color:var(--red);border:1px solid rgba(255,45,45,0.3)}
.vcard-danger.HIGH{background:rgba(255,140,0,0.12);color:var(--orange);border:1px solid rgba(255,140,0,0.3)}
.vcard-danger.MEDIUM{background:rgba(255,215,0,0.12);color:var(--yellow);border:1px solid rgba(255,215,0,0.3)}
.vcard-danger.NONE{background:rgba(0,200,83,0.12);color:var(--green);border:1px solid rgba(0,200,83,0.3)}
.vcard-stats{display:flex;gap:14px;margin-bottom:10px}
.vcard-stat{font-size:11px;color:var(--muted)}
.vcard-stat strong{color:var(--text);font-size:16px;font-weight:800;display:block;line-height:1}
.vcard-desc{font-size:11px;color:var(--text2);line-height:1.5;margin-bottom:10px}
.vcard-hq{font-size:10px;color:var(--muted);margin-bottom:8px}
.vcard-link{font-size:11px;color:var(--accent);text-decoration:none}
.vcard-link:hover{text-decoration:underline}
.vcard-bar{height:3px;border-radius:2px;margin-top:10px;overflow:hidden;background:var(--border)}
.vcard-bar-fill{height:100%;border-radius:2px;transition:width 0.8s ease}

/* ===== CONTRACTS TABLE ===== */
.contracts-table{width:100%;border-collapse:collapse;font-size:12px}
.contracts-table th{
  text-align:left;padding:9px 12px;font-size:10px;font-weight:700;
  text-transform:uppercase;letter-spacing:0.4px;color:var(--muted);
  border-bottom:1px solid var(--border);cursor:pointer;user-select:none;
  white-space:nowrap
}
.contracts-table th:hover{color:var(--text)}
.contracts-table th.sorted{color:var(--accent)}
.contracts-table td{padding:10px 12px;border-bottom:1px solid rgba(25,33,56,0.5);vertical-align:top}
.contracts-table tr:hover td{background:rgba(255,255,255,0.02)}
.ct-vendor{font-weight:700;font-size:13px;margin-bottom:2px}
.ct-agency{font-size:11px;color:var(--text2)}
.ct-amount{font-size:14px;font-weight:800;color:#fbbf24}
.ct-loc{font-size:11px;color:var(--muted)}
.ct-date{font-size:11px;color:var(--muted)}
.ct-badge{display:inline-block;font-size:9px;padding:2px 6px;border-radius:3px;font-weight:700}

/* ===== TIMELINE ===== */
.timeline{display:flex;flex-direction:column;gap:0}
.tl-item{display:flex;gap:14px;padding:12px 0;border-bottom:1px solid var(--border);position:relative}
.tl-dot-col{display:flex;flex-direction:column;align-items:center;gap:0;flex-shrink:0;width:16px}
.tl-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0;margin-top:3px}
.tl-line{flex:1;width:1px;background:var(--border);margin-top:2px}
.tl-content{flex:1}
.tl-date{font-size:10px;color:var(--muted);margin-bottom:3px;font-weight:600;text-transform:uppercase;letter-spacing:0.3px}
.tl-title{font-size:13px;font-weight:700;margin-bottom:2px}
.tl-agency{font-size:11px;color:var(--text2);margin-bottom:4px}
.tl-tags{display:flex;gap:5px;flex-wrap:wrap}
.tl-tag{font-size:10px;padding:1px 6px;border-radius:3px;border:1px solid var(--border);color:var(--muted)}

/* ===== STATE LAWS ===== */
.laws-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
.law-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;transition:all 0.2s}
.law-card:hover{border-color:var(--border2);transform:translateY(-1px)}
.law-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:6px;gap:8px}
.law-state{font-size:28px;font-weight:900;color:var(--text2);line-height:1}
.law-status{font-size:9px;font-weight:800;padding:3px 7px;border-radius:4px;
  text-transform:uppercase;letter-spacing:0.4px;flex-shrink:0;margin-top:4px}
.law-status.STRONG{background:rgba(0,200,83,0.12);color:var(--green);border:1px solid rgba(0,200,83,0.3)}
.law-status.MODERATE{background:rgba(255,215,0,0.12);color:var(--yellow);border:1px solid rgba(255,215,0,0.3)}
.law-status.PARTIAL{background:rgba(255,140,0,0.12);color:var(--orange);border:1px solid rgba(255,140,0,0.3)}
.law-status.PENDING{background:rgba(59,130,246,0.12);color:#60a5fa;border:1px solid rgba(59,130,246,0.3)}
.law-status.NONE{background:rgba(255,45,45,0.12);color:var(--red);border:1px solid rgba(255,45,45,0.3)}
.law-title{font-size:13px;font-weight:700;margin-bottom:5px}
.law-summary{font-size:11px;color:var(--text2);line-height:1.5;margin-bottom:8px}
.law-type{font-size:10px;color:var(--muted);background:rgba(255,255,255,0.04);
  border-radius:3px;padding:2px 6px;display:inline-block;margin-bottom:8px}
.law-link{font-size:11px;color:var(--accent);text-decoration:none}
.law-link:hover{text-decoration:underline}

/* ===== INTEL FEED ===== */
.intel-grid{display:flex;flex-direction:column;gap:8px}
.intel-card{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:14px;transition:all 0.2s}
.intel-card:hover{border-color:var(--border2)}
.intel-hl{font-size:14px;font-weight:600;line-height:1.4;margin-bottom:6px}
.intel-hl a{color:var(--text);text-decoration:none}
.intel-hl a:hover{color:var(--accent)}
.intel-meta{display:flex;align-items:center;gap:10px;font-size:11px;color:var(--muted)}
.intel-source{color:var(--accent);font-weight:600}
.intel-tags{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}
.intel-tag{font-size:10px;padding:2px 7px;border-radius:4px;font-weight:600;
  background:rgba(99,102,241,0.1);color:#818cf8;border:1px solid rgba(99,102,241,0.2)}

/* ===== ABOUT PAGE ===== */
.about-hero{background:linear-gradient(135deg,var(--panel3),var(--panel));
  border:1px solid var(--border);border-radius:14px;padding:28px;margin-bottom:16px;
  position:relative;overflow:hidden}
.about-hero::before{content:'';position:absolute;top:-40px;right:-40px;width:200px;height:200px;
  background:radial-gradient(circle,rgba(255,45,45,0.08),transparent 70%);pointer-events:none}
.about-hero h1{font-size:28px;font-weight:900;margin-bottom:6px}
.about-hero h1 span{color:var(--red)}
.about-hero p{font-size:14px;color:var(--text2);line-height:1.6;max-width:600px}
.about-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
.about-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px}
.about-card h3{font-size:13px;font-weight:700;margin-bottom:8px;color:var(--accent)}
.about-card p,about-card li{font-size:12px;color:var(--text2);line-height:1.6}
.about-card ul{padding-left:14px;margin-top:4px}
.about-card li{margin-bottom:3px}
.vpdlny-badge{display:inline-flex;align-items:center;gap:7px;background:rgba(59,130,246,0.08);
  border:1px solid rgba(59,130,246,0.2);border-radius:8px;padding:8px 14px;margin-top:14px}
.vpdlny-badge strong{font-size:13px;color:var(--accent)}
.vpdlny-badge span{font-size:11px;color:var(--text2)}
.risk-table{width:100%;border-collapse:collapse;font-size:12px;margin-top:10px}
.risk-table td{padding:7px 10px;border-bottom:1px solid var(--border)}
.risk-table tr:last-child td{border-bottom:none}

/* ===== DETAIL MODAL ===== */
.modal-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:2000;
  display:none;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)
}
.modal-overlay.open{display:flex;animation:overlayFadeIn 0.18s ease-out}
@keyframes overlayFadeIn{from{opacity:0}to{opacity:1}}
.modal{animation:modalSlideUp 0.25s cubic-bezier(0.32,0.72,0,1)}
@keyframes modalSlideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}
.modal{
  background:var(--panel);border:1px solid var(--border2);border-radius:16px;
  max-width:560px;width:100%;max-height:85vh;overflow-y:auto;padding:24px;
  position:relative
}
.modal::-webkit-scrollbar{width:4px}
.modal::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}
.modal-close{position:absolute;top:14px;right:14px;background:var(--card);
  border:1px solid var(--border);border-radius:6px;width:28px;height:28px;
  display:flex;align-items:center;justify-content:center;cursor:pointer;
  color:var(--muted);font-size:14px;transition:all 0.15s}
.modal-close:hover{color:var(--text);border-color:var(--text)}
.modal-risk-bar{height:4px;border-radius:2px;margin-bottom:16px}
.modal-city{font-size:26px;font-weight:900;margin-bottom:2px}
.modal-agency{font-size:14px;color:var(--text2);margin-bottom:12px}
.modal-section{margin-bottom:14px}
.modal-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;
  color:var(--muted);margin-bottom:4px}
.modal-value{font-size:13px;color:var(--text);line-height:1.5}
.modal-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.modal-link{color:var(--accent);text-decoration:none;font-size:12px}
.modal-link:hover{text-decoration:underline}
.modal-actions{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}
.modal-btn{flex:1;min-width:120px;padding:9px 14px;border-radius:8px;font-size:12px;
  font-weight:700;cursor:pointer;transition:all 0.2s;text-align:center;
  border:1px solid var(--border2);background:transparent;color:var(--text2);text-decoration:none;
  display:inline-flex;align-items:center;justify-content:center;gap:5px}
.modal-btn:hover{border-color:var(--accent);color:var(--accent)}
.modal-btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}
.modal-btn.primary:hover{background:#2563eb}

/* ===== TOAST ===== */
.toast{
  position:fixed;bottom:20px;left:50%;transform:translateX(-50%) translateY(60px);
  background:var(--panel3);border:1px solid var(--border2);border-radius:8px;
  padding:9px 16px;font-size:12px;font-weight:600;z-index:3000;
  transition:transform 0.3s ease;white-space:nowrap
}
.toast.show{transform:translateX(-50%) translateY(0)}

/* ===== SCROLLBAR GLOBAL ===== */
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px}

/* ===== PULSING MAP MARKERS ===== */
.pulse-marker{
  width:18px;height:18px;border-radius:50%;position:relative;cursor:pointer
}
.pulse-marker::after{
  content:'';position:absolute;inset:-4px;border-radius:50%;
  animation:marker-pulse 2s ease-out infinite;opacity:0
}
.pulse-red::after{border:2px solid var(--red);animation-name:marker-pulse-red}
.pulse-orange::after{border:2px solid var(--orange);animation-name:marker-pulse-orange}
@keyframes marker-pulse-red{
  0%{inset:-4px;opacity:0.8}100%{inset:-14px;opacity:0}
}
@keyframes marker-pulse-orange{
  0%{inset:-4px;opacity:0.6}100%{inset:-12px;opacity:0}
}

/* ===== EMPTY STATE ===== */
.empty-state{text-align:center;padding:40px;color:var(--muted)}
.empty-state .icon{font-size:40px;margin-bottom:10px;opacity:0.5}
.empty-state p{font-size:13px}

/* ===== RESPONSIVE ===== */
@media(min-width:768px){
  .header-tagline{display:block}
  .stat-chip .lbl{display:inline}
}
/* === MOBILE PORTRAIT: BOTTOM SHEET v2 === */
@media(max-width:767px) and (orientation:portrait){
  header{padding:env(safe-area-inset-top,0px) 12px 0;height:calc(50px + env(safe-area-inset-top,0px))}
  .logo-text{font-size:15px}
  .stats-bar{gap:2px;flex-wrap:nowrap}
  .stat-chip{padding:2px 5px;font-size:10px}
  .stat-chip .n{font-size:11px}
  .stat-chip .lbl{font-size:9px}
  .header-tagline,.live-badge{display:none !important}

  /* App container uses dynamic viewport height (no browser chrome overflow) */
  body{height:100dvh;max-height:100dvh;overflow:hidden}

  /* Map fills entire screen behind the sheet */
  #map-page{
    display:block !important;position:relative;
    width:100%;height:100%;overflow:hidden
  }
  #map{
    position:absolute !important;
    top:0 !important;left:0 !important;right:0 !important;bottom:0 !important;
    width:100% !important;height:100% !important;
    min-height:unset !important;z-index:1
  }

  /* ── Bottom Sheet ── */
  .sidebar{
    position:fixed !important;
    bottom:0 !important;left:0;right:0;width:100% !important;
    border-left:none;border-top:none;
    border-radius:20px 20px 0 0;
    background:linear-gradient(180deg,#0d1628 0%,#090f1e 100%);
    box-shadow:0 -8px 40px rgba(0,0,0,0.8),0 -1px 0 rgba(59,130,246,0.12);
    z-index:400 !important;
    display:flex !important;flex-direction:column;overflow:hidden;
    /* Initial position: half open (JS will override via inline transform) */
    transform:translateY(42%);
    /* No CSS transition here — JS handles all animation */
    will-change:transform;
    height:92dvh;
    max-height:92dvh;
    padding-bottom:env(safe-area-inset-bottom,12px);
    /* Touch action: allow horizontal scrolling inside, capture vertical for drag */
    touch-action:pan-x;
  }

  /* ── Drag Handle ── */
  .sheet-handle-bar{
    display:flex !important;flex-direction:column;align-items:center;
    padding:12px 0 8px;cursor:grab;flex-shrink:0;
    user-select:none;-webkit-user-select:none;
    /* Explicit touch target */
    min-height:44px;justify-content:center;
    -webkit-tap-highlight-color:transparent
  }
  .sheet-handle-bar:active{cursor:grabbing}
  .handle-pill{
    width:44px;height:5px;
    background:rgba(148,163,184,0.4);
    border-radius:3px;
    transition:background 0.2s,width 0.2s
  }
  .sidebar[data-state="full"] .handle-pill,
  .sidebar[data-state="half"] .handle-pill{
    background:rgba(148,163,184,0.6);
    width:36px
  }
  .sheet-state-hint{
    font-size:10px;color:rgba(148,163,184,0.6);
    margin-top:5px;letter-spacing:0.5px;
    transition:opacity 0.2s
  }
  .sidebar[data-state="half"] .sheet-state-hint,
  .sidebar[data-state="full"] .sheet-state-hint{
    opacity:0;pointer-events:none
  }

  /* ── Content area ── */
  .sidebar-list{
    overflow-y:auto !important;
    -webkit-overflow-scrolling:touch;
    flex:1;
    overscroll-behavior:contain
  }
  .sidebar-hdr,.search-wrap,.filter-wrap,.count-bar{flex-shrink:0}

  /* ── Map overlays: push above sheet peek ── */
  .map-legend{bottom:96px !important;top:auto !important;right:8px !important}
  .btc-fab{bottom:88px !important;right:8px !important}

  .nav-tabs{top:calc(50px + env(safe-area-inset-top,0px)) !important}

  /* ── Other pages ── */
  .page{padding:12px}
  .section{padding:14px}
  .vendor-grid{grid-template-columns:1fr}
  .laws-grid{grid-template-columns:1fr}
  .about-grid{grid-template-columns:1fr}

  /* Full-width content pages on mobile — no map alongside */
  .main{flex-direction:column}
  .page.active{
    position:fixed !important;
    top:0;left:0;right:0;bottom:0;
    width:100% !important;
    height:100% !important;
    max-height:100dvh !important;
    padding-top:calc(50px + env(safe-area-inset-top,0px) + 44px + 8px) !important;
    padding-bottom:env(safe-area-inset-bottom,12px) !important;
    overflow-y:auto !important;
    -webkit-overflow-scrolling:touch;
    z-index:200 !important;
    background:var(--bg) !important;
    display:flex;flex-direction:column
  }
}

/* === MOBILE: BASE (non-portrait or fallback) === */
@media(max-width:767px){
  header{padding:env(safe-area-inset-top,0px) 12px 0;height:calc(50px + env(safe-area-inset-top,0px))}
  .logo-text{font-size:15px}
  .stats-bar{gap:2px;flex-wrap:nowrap}
  .stat-chip{padding:2px 5px;font-size:10px}
  .stat-chip .n{font-size:11px}
  .stat-chip .lbl{font-size:9px}
  .header-tagline,.live-badge{display:none !important}
  .page{padding:12px}
  .section{padding:14px}
  .vendor-grid{grid-template-columns:1fr}
  .laws-grid{grid-template-columns:1fr}
  .about-grid{grid-template-columns:1fr}
}

/* === MOBILE LANDSCAPE: RESTORE SIDE-BY-SIDE === */
@media(max-width:900px) and (orientation:landscape){
  #map-page{display:flex;flex-direction:row;flex:1;overflow:hidden}
  .sidebar{
    width:280px;position:relative;transform:none !important;
    border-left:1px solid var(--border);border-top:none;border-radius:0;
    box-shadow:none;max-height:100%;overflow:hidden;
    display:flex;flex-direction:column
  }
  .sidebar-list{overflow-y:auto;-webkit-overflow-scrolling:touch;flex:1}
  .sheet-handle-bar{display:none}
  #map{flex:1;height:100%;min-height:unset}
  header{height:44px}
  .nav-tabs .tab{padding:7px 10px;font-size:11px}
  .btc-fab{bottom:12px !important;right:12px}
}
  
/* ===== SUPPORT / BITCOIN ===== */
#page-support{padding:24px 28px;max-width:960px;margin:0 auto}
.support-header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-bottom:16px;border-bottom:1px solid var(--border);margin-bottom:24px;flex-wrap:wrap}
.support-header-left h2{font-size:18px;font-weight:800;color:var(--text);margin:0 0 4px}
.support-header-left p{font-size:12px;color:var(--muted);margin:0;line-height:1.5;max-width:480px}
.support-header-right{display:flex;align-items:center;gap:8px;flex-shrink:0}
.support-grid{display:grid;grid-template-columns:240px 1fr;gap:20px;align-items:start;margin-bottom:24px}
@media(max-width:680px){.support-grid{grid-template-columns:1fr}}
.btc-qr-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px;display:flex;flex-direction:column;align-items:center;gap:12px}
.btc-qr-card:hover{border-color:rgba(247,147,26,0.25)}
.qr-wrapper{width:160px;height:160px;background:#fff;border-radius:10px;display:flex;align-items:center;justify-content:center;padding:8px;box-shadow:0 2px 12px rgba(0,0,0,0.3)}
.qr-wrapper canvas{display:block;width:144px!important;height:144px!important}
.btc-label{font-size:10px;font-weight:700;color:rgba(247,147,26,0.7);letter-spacing:0.8px;text-transform:uppercase;display:flex;align-items:center;gap:5px}
.btc-addr-wrap{background:var(--panel2);border:1px solid var(--border);border-radius:8px;padding:8px 12px;width:100%;display:flex;align-items:center;gap:8px}
.btc-addr{font-family:'Courier New',monospace;font-size:9px;color:var(--text2);word-break:break-all;flex:1;line-height:1.6}
.copy-btn{background:transparent;border:1px solid rgba(247,147,26,0.25);color:rgba(247,147,26,0.7);border-radius:5px;padding:5px 10px;cursor:pointer;font-size:10px;font-weight:700;white-space:nowrap;transition:all 0.2s;flex-shrink:0}
.copy-btn:hover{background:rgba(247,147,26,0.1);border-color:rgba(247,147,26,0.5);color:#f7931a}
.copy-btn.copied{background:rgba(0,200,83,0.1);border-color:rgba(0,200,83,0.3);color:var(--green)}
.mempool-link{display:inline-flex;align-items:center;gap:5px;color:rgba(247,147,26,0.5);text-decoration:none;font-size:10px;font-weight:600;transition:color 0.2s;width:100%;justify-content:center;padding:4px 0}
.mempool-link:hover{color:#f7931a}
.support-right{display:flex;flex-direction:column;gap:14px}
.why-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px}
.why-title{font-size:13px;font-weight:700;color:var(--text);margin-bottom:12px}
.why-items{display:grid;grid-template-columns:1fr 1fr;gap:8px}
@media(max-width:500px){.why-items{grid-template-columns:1fr}}
.why-item{display:flex;align-items:flex-start;gap:10px;padding:10px;background:var(--panel2);border:1px solid var(--border);border-radius:8px}
.why-icon{font-size:16px;flex-shrink:0;width:24px;text-align:center;line-height:1.4}
.why-text h4{font-size:11px;font-weight:700;color:var(--text);margin-bottom:2px}
.why-text p{font-size:11px;color:var(--text2);line-height:1.45;margin:0}
.btc-stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px}
.btc-stat{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center}
.btc-stat-val{font-size:16px;font-weight:800;color:rgba(247,147,26,0.85);font-variant-numeric:tabular-nums}
.btc-stat-lbl{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-top:2px}
.btc-stat-lbl.loading{animation:blink 1.4s ease-in-out infinite}
@keyframes blink{0%,100%{opacity:0.4}50%{opacity:1}}
.recent-txns{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px}
.txns-title{font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;display:flex;align-items:center;gap:8px}
.txn-list{display:flex;flex-direction:column;gap:4px}
.txn-item{background:var(--panel2);border:1px solid var(--border);border-radius:6px;padding:8px 12px;display:flex;align-items:center;gap:12px;font-size:11px}
.txn-hash{font-family:'Courier New',monospace;font-size:10px;color:var(--muted);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-decoration:none}
.txn-hash:hover{color:var(--accent)}
.txn-amount{font-weight:700;color:rgba(247,147,26,0.85);font-variant-numeric:tabular-nums;white-space:nowrap}
.txn-confs{font-size:10px;padding:2px 6px;border-radius:4px;white-space:nowrap}
.txn-confs.confirmed{background:rgba(0,200,83,0.1);color:var(--green)}
.txn-confs.pending{background:rgba(255,215,0,0.1);color:var(--yellow)}
.txns-empty{font-size:11px;color:var(--muted);text-align:center;padding:16px}
.strip-addr{font-family:'Courier New',monospace;font-size:10px;color:var(--text2);background:var(--panel2);border:1px solid var(--border);border-radius:6px;padding:6px 10px;cursor:pointer;transition:border-color 0.2s}
.strip-addr:hover{border-color:#f7931a;color:#f7931a}
.strip-btn{background:rgba(247,147,26,0.12);border:1px solid rgba(247,147,26,0.3);color:#f7931a;border-radius:8px;padding:8px 16px;cursor:pointer;font-size:12px;font-weight:700;transition:all 0.2s;white-space:nowrap;text-decoration:none;display:inline-flex;align-items:center;gap:6px}
.strip-btn:hover{background:rgba(247,147,26,0.2);border-color:#f7931a}
.btc-fab{position:fixed;bottom:20px;right:20px;z-index:9000;height:32px;border-radius:16px;cursor:pointer;background:rgba(10,15,28,0.85);border:1px solid rgba(247,147,26,0.25);color:#f7931a;font-size:11px;font-weight:700;letter-spacing:0.2px;display:flex;align-items:center;gap:6px;padding:0 14px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:0 2px 12px rgba(0,0,0,0.4);transition:all 0.25s;letter-spacing:0.3px}
.btc-fab:hover{background:rgba(247,147,26,0.1);border-color:rgba(247,147,26,0.5);color:#f7931a;box-shadow:0 4px 16px rgba(247,147,26,0.12)}
.btc-fab .fab-tooltip{display:none}
@keyframes fab-ring{0%,100%{opacity:1}}
.toast.btc-toast{border-color:rgba(247,147,26,0.4);color:#f7931a}
@media(max-width:768px){.btc-fab{bottom:12px;right:12px;height:28px;font-size:10px;padding:0 10px}#page-support{padding:12px 14px}.support-header{flex-direction:column;align-items:flex-start}.support-header-right .btc-stats-row{grid-template-columns:repeat(3,1fr)}.btc-stats-row{gap:6px}.btc-stat-val{font-size:14px}}

/* ===== BTC MODAL ===== */
.btc-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.78);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);z-index:99000;display:none;align-items:center;justify-content:center;padding:16px}
.btc-modal-overlay.open{display:flex}
.btc-modal{background:#0c1422;border:1px solid rgba(247,147,26,0.22);border-radius:16px;padding:22px;width:100%;max-width:380px;box-shadow:0 24px 80px rgba(0,0,0,0.75);position:relative}
.btc-modal-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.btc-modal-title{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:800;color:#fff}
.btc-modal-close{background:transparent;border:none;color:rgba(255,255,255,0.35);font-size:18px;cursor:pointer;padding:2px 6px;line-height:1;border-radius:4px;transition:color 0.2s}
.btc-modal-close:hover{color:#fff}
.btc-modal-sub{font-size:11px;color:rgba(255,255,255,0.4);margin:0 0 14px;line-height:1.5}
.btc-modal-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:16px}
.btc-mstat{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:9px;text-align:center}
.btc-mstat-val{font-size:13px;font-weight:800;color:rgba(247,147,26,0.9);font-variant-numeric:tabular-nums}
.btc-mstat-lbl{font-size:9px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.5px;margin-top:2px}
.btc-modal-qr-wrap{display:flex;justify-content:center;margin-bottom:14px}
.btc-modal-qr-bg{width:164px;height:164px;background:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;padding:8px;box-shadow:0 4px 24px rgba(0,0,0,0.5)}
.btc-modal-qr-bg canvas{display:block;width:148px!important;height:148px!important}
.btc-modal-addr-row{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:8px 10px;display:flex;align-items:center;gap:8px;margin-bottom:8px}
.btc-modal-addr{font-family:'Courier New',monospace;font-size:9px;color:rgba(255,255,255,0.5);word-break:break-all;flex:1;line-height:1.6}
.btc-modal-copy{background:transparent;border:1px solid rgba(247,147,26,0.3);color:rgba(247,147,26,0.7);border-radius:5px;padding:5px 10px;cursor:pointer;font-size:10px;font-weight:700;white-space:nowrap;transition:all 0.2s;flex-shrink:0}
.btc-modal-copy:hover{background:rgba(247,147,26,0.12);border-color:#f7931a;color:#f7931a}
.btc-modal-copy.copied{background:rgba(0,200,83,0.1);border-color:rgba(0,200,83,0.3);color:#00c853}
.btc-modal-mempool{display:flex;align-items:center;justify-content:center;gap:5px;color:rgba(247,147,26,0.35);text-decoration:none;font-size:10px;font-weight:600;transition:color 0.2s;padding:4px 0;margin-bottom:12px}
.btc-modal-mempool:hover{color:#f7931a}
.btc-modal-recent{border-top:1px solid rgba(255,255,255,0.06);padding-top:10px}
.btc-modal-recent-title{font-size:10px;font-weight:700;color:rgba(255,255,255,0.28);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px}
#modal-txn-list{display:flex;flex-direction:column;gap:4px;max-height:110px;overflow-y:auto}
/* ===== ECARD FIX ===== */
.ec-top>div:first-child{min-width:0;flex:1;overflow:hidden}
.ec-city{font-size:12px!important;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* ===== FAB ===== */
.btc-fab{position:fixed;bottom:20px;right:20px;z-index:9000;height:30px;border-radius:15px;cursor:pointer;background:rgba(8,12,24,0.9);border:1px solid rgba(247,147,26,0.3);color:rgba(247,147,26,0.8);font-size:10px;font-weight:700;display:flex;align-items:center;gap:5px;padding:0 12px;backdrop-filter:blur(10px);box-shadow:0 2px 16px rgba(0,0,0,0.5);transition:all 0.2s;letter-spacing:0.3px;font-family:inherit}
.btc-fab:hover{background:rgba(247,147,26,0.1);border-color:rgba(247,147,26,0.6);color:#f7931a}
@media(max-width:768px){.btc-fab{bottom:12px;right:12px;height:26px;font-size:9px;padding:0 10px}.btc-modal{padding:16px}.btc-modal-stats{gap:5px}}
`;
}

const _APP_JS = "var verifiedOnly = false;\n\n\n\nfunction toggleVerifiedOnly() {\n  verifiedOnly = !verifiedOnly;\n  var btn = document.getElementById('btn-verified');\n  if (btn) btn.classList.toggle('active-f', verifiedOnly);\n  renderAll();\n}// ===== GLOBAL STATE =====\nvar allEntries = [];\nvar filteredEntries = [];\nvar contractsData = [];\nvar newsData = [];\nvar leafletMap = null;\nvar markerLayer = null;\nvar markers = {};\nvar currentTab = 'map';\nvar currentFilter = 'ALL';\nvar currentSearch = '';\nvar selectedId = null;\nvar contractSortCol = 'amount';\nvar contractSortDir = 'desc';\nvar currentSort = 'date_desc';\nvar clusterMode = false;\nvar clusterGroup = null;\n\n// ===== ERROR REPORTING =====\nvar _fhmLogs = [];\nvar _fhmErrors = [];\n\nfunction fhmLog(msg) {\n  var ts = new Date().toISOString().slice(11,23);\n  _fhmLogs.push('[' + ts + '] ' + msg);\n  console.log('[FHM]', msg);\n}\nfunction fhmError(msg, type, extra) {\n  type = type || 'ERROR';\n  var ts = new Date().toISOString();\n  console.error('[FHM ' + type + ' ' + ts + ']', msg, extra || '');\n  try {\n    var payload = {\n      type: type,\n      msg: String(msg).slice(0, 600),\n      url: window.location.href,\n      ua: navigator.userAgent.slice(0, 120),\n      ts: ts,\n      extra: extra || null,\n      viewport: window.innerWidth + 'x' + window.innerHeight,\n      bsState: window.fhmBottomSheet ? window.fhmBottomSheet.getState() : 'unknown'\n    };\n    fetch('/api/error', {\n      method: 'POST',\n      headers: {'Content-Type': 'application/json'},\n      body: JSON.stringify(payload)\n    }).catch(function(e){ console.warn('[FHM ERR-REPORT FAIL]', e); });\n  } catch(e) { console.warn('[FHM ERR-SEND FAIL]', e); }\n}\n\n// Global uncaught error handler\nwindow.onerror = function(msg, src, line, col, err) {\n  fhmError((err && err.stack ? err.stack : msg) + ' @' + src + ':' + line + ':' + col, 'UNCAUGHT', {src: src, line: line, col: col});\n  return false;\n};\n\n// Unhandled promise rejections\nwindow.addEventListener('unhandledrejection', function(e) {\n  var reason = e.reason;\n  var msg = reason instanceof Error ? reason.stack || reason.message : String(reason);\n  fhmError(msg, 'UNHANDLED_PROMISE');\n});\n\n// Network error monitor\nvar _origFetch = window.fetch;\nwindow.fetch = function(url, opts) {\n  var start = Date.now();\n  return _origFetch.apply(this, arguments).then(function(resp) {\n    if (!resp.ok && resp.status >= 500) {\n      fhmError('Fetch ' + resp.status + ' ' + (typeof url === 'string' ? url : url.url || '?'), 'FETCH_ERROR', {status: resp.status, ms: Date.now()-start});\n    }\n    return resp;\n  }).catch(function(err) {\n    fhmError('Fetch network error: ' + err.message + ' url=' + (typeof url === 'string' ? url : '?'), 'FETCH_NETWORK', {ms: Date.now()-start});\n    throw err;\n  });\n};\n\nwindow.addEventListener('unhandledrejection', function(e) {\n  fhmError((e.reason ? (e.reason.message || String(e.reason)) : 'Unhandled rejection'), 'PROMISE');\n});\n\n// ===== MAP =====\nfunction initMap() {\n  leafletMap = L.map('map', { center: [39.5, -98.35], zoom: 4, zoomControl: true, attributionControl: false });\n  var tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' });\n  tileLayer.addTo(leafletMap);\n  markerLayer = L.layerGroup().addTo(leafletMap);\n  setTimeout(function() { if (leafletMap) leafletMap.invalidateSize(true); }, 200);\n}\n\nfunction createPulseIcon(riskLevel, size, confidenceTier) {\n  size = size || 14;\n  var RISK_COLORS = {RED:'#ff2d2d', ORANGE:'#ff8c00', YELLOW:'#ffd700', GREEN:'#00c853', BLUE:'#3b82f6', GRAY:'#888888'};\n  var color = RISK_COLORS[riskLevel] || '#888888';\n  var pulseClass = (riskLevel === 'RED') ? ' pulse-red' : (riskLevel === 'ORANGE') ? ' pulse-orange' : '';\n  var bStyle = 'background:' + color;\n  // Opacity based on confidence tier\n  var opacity = 1.0;\n  if (confidenceTier === 'PROBABLE') opacity = 0.8;\n  else if (confidenceTier === 'REPORTED') opacity = 0.6;\n  else if (confidenceTier === 'UNCONFIRMED') opacity = 0.4;\n  var iconHtml = '<div class=\"map-marker' + pulseClass + '\" style=\"width:' + size + 'px;height:' + size + 'px;' + bStyle + ';box-shadow:0 0 0 2px rgba(0,0,0,0.4),0 0 8px ' + color + '60;border-radius:50%;opacity:' + opacity + ';\">' + '</div>';\n  return L.divIcon({\n    html: iconHtml,\n    className: '',\n    iconSize: [size, size],\n    iconAnchor: [size/2, size/2]\n  });\n}\n\nfunction renderMap(entries) {\n  if (!markerLayer) return;\n  markerLayer.clearLayers();\n  markers = {};\n  entries.forEach(function(e) {\n    if (!e.lat || !e.lng) return;\n    var icon = createPulseIcon(e.risk_level, 14, e.confidence_tier);\n    var m = L.marker([e.lat, e.lng], { icon: icon });\n    m.on('click', function() { selectEntry(e); openEntryModal(e); });\n    m.bindTooltip('<b>' + (e.city||'') + ', ' + (e.state||'') + '</b><br>' + (e.agency||'') + '<br><span style=\"color:' + getRiskColor(e.risk_level) + '\">' + e.risk_level + '</span>',\n      { className: 'leaflet-tooltip-dark', offset: [8, 0] });\n    markerLayer.addLayer(m);\n    markers[e.id] = m;\n  });\n}\n\nfunction getRiskColor(r) {\n  return {RED:'#ff2d2d',ORANGE:'#ff8c00',YELLOW:'#ffd700',GREEN:'#00c853',GRAY:'#888',NONE:'#3b82f6'}[r] || '#888';\n}\n\n// ===== DATA LOAD =====\nasync function loadData() {\n  try {\n    var results = await Promise.all([\n      fetch('/api/entries').then(function(r){return r.json();}),\n      fetch('/api/contracts').then(function(r){return r.json();}),\n      fetch('/api/news').then(function(r){return r.json();})\n    ]);\n    allEntries = results[0].entries || [];\n    contractsData = results[1].contracts || [];\n    newsData = results[2].news || [];\n    fhmLog('Loaded: ' + allEntries.length + ' entries, ' + contractsData.length + ' contracts, ' + newsData.length + ' news');\n  } catch(e) {\n    fhmError('loadData failed: ' + e.message, 'LOAD');\n  }\n}\n\n// ===== RENDER ALL =====\nfunction renderAll() {\n  applyFilters();\n  renderMap(filteredEntries);\n  renderSidebar(filteredEntries);\n  updateStats();\n  if (currentTab === 'vendors') renderVendors();\n  if (currentTab === 'contracts') renderContracts();\n  if (currentTab === 'timeline') renderTimeline();\n  if (currentTab === 'laws') renderLaws();\n  if (currentTab === 'intel') renderIntel();\n  if (currentTab === 'about') renderAbout();\n}\n\nfunction applyFilters() {\n  filteredEntries = allEntries.filter(function(e) {\n    var matchFilter = currentFilter === 'ALL' || e.risk_level === currentFilter;\n    var q = currentSearch.toLowerCase();\n    var matchSearch = !q ||\n      (e.city||'').toLowerCase().includes(q) ||\n      (e.state||'').toLowerCase().includes(q) ||\n      (e.agency||'').toLowerCase().includes(q) ||\n      (e.vendor||'').toLowerCase().includes(q);\n    return matchFilter && matchSearch;\n  });\n}\n\n// ===== SIDEBAR =====\nfunction renderSidebar(entries) {\n  var list = document.getElementById('sidebar-list');\n  var countEl = document.getElementById('entry-count');\n  if (countEl) countEl.innerHTML = 'Showing <span>' + entries.length + '</span> of ' + allEntries.length + ' entries';\n  if (!list) return;\n  if (entries.length === 0) {\n    list.innerHTML = '<div class=\"empty-state\"><div class=\"icon\">\\uD83D\\uDD0D</div><p>No entries match your filter.</p></div>';\n    return;\n  }\n  list.innerHTML = entries.map(function(e) {\n    return '<div class=\"ecard ' + e.risk_level + '\" data-id=\"' + e.id + '\" onclick=\"openEntryById(\\'' + e.id + '\\')\">' +\n      '<div class=\"ec-top\"><div><div class=\"ec-city\">' + (e.city||'Unknown') + '</div><div class=\"ec-state\">' + (e.state||'') + '</div></div>' +\n      '<div class=\"ec-badge ' + e.risk_level + '\">' + e.risk_level + '</div></div>' +\n      '<div class=\"ec-agency\">' + ((e.agency||'').substring(0,60)) + ((e.agency||'').length>60?'...':'') + '</div>' +\n      '<div class=\"ec-vendor\">\\uD83C\\uDFE2 ' + (e.vendor||'Unknown Vendor') + '</div>' +\n      '<div class=\"ec-meta\">' +\n        (e.contract_value > 0 ? '<span class=\"ec-amount\">$' + Number(e.contract_value).toLocaleString() + '</span>' : '') +\n        (e.source ? '<span class=\"ec-source\">' + e.source + '</span>' : '') +\n      '</div></div>';\n  }).join('');\n}\n\nfunction openEntryById(id) {\n  var e = allEntries.find(function(x) { return String(x.id) === String(id); });\n  if (!e) return;\n  selectEntry(e);\n  panToEntry(id);\n  openEntryModal(e);\n}\n\nfunction selectEntry(e) {\n  selectedId = e.id;\n  document.querySelectorAll('.ecard').forEach(function(c) { c.classList.remove('selected'); });\n  var card = document.querySelector('.ecard[data-id=\"' + e.id + '\"]');\n  if (card) { card.classList.add('selected'); card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }\n}\n\nfunction panToEntry(id) {\n  var e = allEntries.find(function(x) { return x.id == id; });\n  if (e && e.lat && e.lng && leafletMap) leafletMap.flyTo([e.lat, e.lng], 9, { duration: 0.8 });\n}\n\n// ===== ENTRY DETAIL MODAL =====\nfunction openEntryModal(e) {\n  var v = window.VENDOR_INFO[e.vendor] || {};\n  var color = getRiskColor(e.risk_level);\n  // Find related contracts\n  var relContracts = contractsData.filter(function(c) {\n    return (c.vendor||'').toLowerCase().includes((e.vendor||'').toLowerCase().split(' ')[0].toLowerCase()) ||\n           (c.agency||'').toLowerCase().includes((e.agency||'').toLowerCase().split(' ')[0].toLowerCase());\n  }).slice(0,3);\n  // Find related news\n  var relNews = newsData.filter(function(n) {\n    return (n.headline||'').toLowerCase().includes((e.city||'').toLowerCase()) ||\n           (n.headline||'').toLowerCase().includes((e.vendor||'').toLowerCase().split(' ')[0].toLowerCase());\n  }).slice(0,3);\n\n  var html = '<button class=\"modal-close\" onclick=\"closeModal()\">\\u2715</button>' +\n    '<div class=\"modal-risk-bar\" style=\"background:' + color + '\"></div>' +\n    '<div class=\"modal-city\">' + (e.city||'Unknown City') + '</div>' +\n    '<div class=\"modal-agency\">' + (e.agency||'Unknown Agency') + ' \\u00b7 ' + (e.state||'') + '</div>' +\n    '<div class=\"modal-tags\">' +\n      '<div class=\"ec-badge ' + e.risk_level + '\" style=\"font-size:11px;padding:3px 9px\">' + e.risk_level + ' RISK</div>' +\n      (e.vendor ? '<div class=\"ec-vendor\" style=\"font-size:11px\">' + e.vendor + '</div>' : '') +\n      (e.technology ? '<div style=\"font-size:10px;background:#1e293b;padding:2px 8px;border-radius:10px;color:#94a3b8\">' + e.technology + '</div>' : '') +\n    '</div>' +\n    // CONFIDENCE BAR\n    (function() {\n      var sc = e.confidence_score||0;\n      var ct = e.confidence_tier||'UNCONFIRMED';\n      var fc = {VERIFIED:'#22c55e',PROBABLE:'#60a5fa',REPORTED:'#f59e0b',UNCONFIRMED:'#ef4444'}[ct]||'#64748b';\n      var smap = {FEDERAL_CONTRACT:'Federal Contract',GAO_REPORT:'GAO Audit',FOIA:'FOIA Doc',ORDINANCE:'City Ordinance',EFF:'EFF Atlas',MUCKROCK:'MuckRock',NEWS_INVESTIGATIVE:'News Report',STATE_CONTRACT:'State Contract',INFERRED:'Inferred',UNKNOWN:'Unknown'};\n      var sl = smap[e.source_type]||(e.source_type||'Unknown');\n      var lnk = e.source_url ? ' <a href=' + '\"' + '+e.source_url+' + '\"' + ' target=' + '\"_blank\"' + ' style=' + '\"color:#60a5fa\"' + '>View</a>' : '';\n      return '<div class=' + '\"conf-bar-wrap\"' + '>'\n        +'<div class=' + '\"conf-header\"' + '><span class=' + '\"conf-label\"' + '>Data Confidence</span>'\n        +'<span style=' + '\"display:flex;align-items:center;gap:6px\"' + '><span class=' + '\"conf-score\"' + ' style=' + '\"color:'+fc+'\"' + '>'+sc+'/100</span>'\n        +'<span class=' + '\"conf-tier ' + ''+ct+'' + '\"' + '>'+ct+'</span></span></div>'\n        +'<div class=' + '\"conf-track\"' + '><div class=' + '\"conf-fill\"' + ' style=' + '\"width:'+sc+'%;background:'+fc+'\"' + '></div></div>'\n        +'<div class=' + '\"conf-src-type\"' + '>Source: '+sl+lnk+'</div>'\n        +'</div>';\n    })() +\n    // Stats row\n    '<div style=\"display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:14px 0\">' +\n      '<div style=\"background:#0f172a;border-radius:8px;padding:10px;text-align:center\">' +\n        '<div style=\"font-size:18px;font-weight:800;color:' + color + '\">' + (e.contract_value > 0 ? '$' + Number(e.contract_value).toLocaleString() : 'N/A') + '</div>' +\n        '<div style=\"font-size:10px;color:#64748b;margin-top:2px\">CONTRACT VALUE</div>' +\n      '</div>' +\n      '<div style=\"background:#0f172a;border-radius:8px;padding:10px;text-align:center\">' +\n        '<div style=\"font-size:18px;font-weight:800;color:#e2e8f0\">' + (e.contract_start || e.last_updated || 'N/A') + '</div>' +\n        '<div style=\"font-size:10px;color:#64748b;margin-top:2px\">ACTIVE SINCE</div>' +\n      '</div>' +\n      '<div style=\"background:#0f172a;border-radius:8px;padding:10px;text-align:center\">' +\n        '<div style=\"font-size:18px;font-weight:800;color:#e2e8f0\">' + (e.source||'\u2014').split(' ')[0] + '</div>' +\n        '<div style=\"font-size:10px;color:#64748b;margin-top:2px\">DATA SOURCE</div>' +\n      '</div>' +\n    '</div>';\n\n  if (e.notes) html += '<div class=\"modal-section\"><div class=\"modal-label\">Description</div><div class=\"modal-value\" style=\"font-size:12px;color:var(--text2)\">' + e.notes \n        + (e.confidence_tier ? '<span class=\"ec-conf ' + e.confidence_tier + '\">' + (e.confidence_score||0) + '</span>' : '')\n      + '</div></div>';\n  if (v.desc) html += '<div class=\"modal-section\"><div class=\"modal-label\">About ' + e.vendor + '</div><div class=\"modal-value\" style=\"font-size:12px;color:var(--text2)\">' + v.desc + '<br><span style=\"color:#ef4444;font-weight:600\">Danger Level: ' + (v.danger||'?') + '</span></div></div>';\n  if (v.founded) html += '<div class=\"modal-section\"><div style=\"display:flex;gap:16px\"><div><div class=\"modal-label\">Founded</div><div class=\"modal-value\">' + v.founded + '</div></div><div><div class=\"modal-label\">HQ</div><div class=\"modal-value\">' + (v.hq||'?') + '</div></div></div></div>';\n  \n  if (relContracts.length > 0) {\n    html += '<div class=\"modal-section\"><div class=\"modal-label\">\\uD83D\\uDCC4 Related Federal Contracts</div>';\n    relContracts.forEach(function(c) {\n      html += '<div style=\"background:#0f172a;border-radius:6px;padding:8px;margin-top:6px;font-size:11px\">' +\n        '<div style=\"color:#fbbf24;font-weight:700\">$' + Number(c.amount||0).toLocaleString() + '</div>' +\n        '<div style=\"color:#94a3b8\">' + (c.agency||'') + ' \\u00b7 ' + (c.start_date||'') + '</div>' +\n        '<div style=\"color:#e2e8f0\">' + (c.description||'').substring(0,80) + '</div>' +\n        '</div>';\n    });\n    html += '</div>';\n  }\n\n  if (relNews.length > 0) {\n    html += '<div class=\"modal-section\"><div class=\"modal-label\">\\uD83D\\uDCF0 Related News</div>';\n    relNews.forEach(function(n) {\n      html += '<div style=\"margin-top:6px\"><a href=\"' + (n.url||'#') + '\" target=\"_blank\" style=\"color:#60a5fa;font-size:11px;text-decoration:none\">' + (n.headline||'').substring(0,100) + ' \\u2197</a>' +\n        '<div style=\"font-size:10px;color:#64748b\">' + (n.source_name||'') + ' \\u00b7 ' + formatDate(n.published_at) + '</div></div>';\n    });\n    html += '</div>';\n  }\n\n  html += '<div class=\"modal-actions\">' +\n    (e.source_url ? '<a class=\"modal-btn primary\" href=\"' + e.source_url + '\" target=\"_blank\" rel=\"noopener\">\\uD83D\\uDCC4 View Source</a>' : '') +\n    (v.wiki ? '<a class=\"modal-btn\" href=\"' + v.wiki + '\" target=\"_blank\" rel=\"noopener\">\\uD83D\\uDCD6 Vendor Wiki</a>' : '') +\n    '<button class=\"modal-btn\" onclick=\"copyEntryLink(\\'' + e.id + '\\')\">\\uD83D\\uDD17 Copy Link</button>' +\n    '</div>';\n\n  var modal = document.getElementById('modal');\n  var overlay = document.getElementById('modal-overlay');\n  if (modal && overlay) {\n    modal.innerHTML = html;\n    overlay.classList.add('open');\n    var url = new URL(window.location.href);\n    url.searchParams.set('id', e.id);\n    history.replaceState(null, '', url.toString());\n  }\n}\n\nfunction closeModal() {\n  var overlay = document.getElementById('modal-overlay');\n  if (overlay) overlay.classList.remove('open');\n  var url = new URL(window.location.href);\n  url.searchParams.delete('id');\n  history.replaceState(null, '', url.toString());\n}\n\nfunction copyEntryLink(id) {\n  var url = new URL(window.location.href);\n  url.searchParams.set('id', id);\n  url.searchParams.set('tab', 'map');\n  navigator.clipboard.writeText(url.toString()).then(function() { showToast('Link copied!'); });\n}\n\n// ===== TABS =====\n// HTML structure: each tab has a .page div (display:none by default)\n// map-page is separate. Pages: page-vendors, page-contracts, page-timeline, page-laws, page-intel, page-about\nfunction switchTab(tab) {\n  fhmLog('switchTab: ' + tab);\n  currentTab = tab;\n  // Update tab nav highlights\n  document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });\n  var tabEl = document.querySelector('.tab[data-tab=\"' + tab + '\"]');\n  if (tabEl) tabEl.classList.add('active');\n  // Show/hide pages via .active class\n  var mapPage = document.getElementById('map-page');\n  if (tab === 'map') {\n    if (mapPage) mapPage.style.display = '';\n    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });\n    setTimeout(function() { if (leafletMap) leafletMap.invalidateSize(true); }, 50);\n  } else {\n    if (mapPage) mapPage.style.display = 'none';\n    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });\n    var activePage = document.getElementById('page-' + tab);\n    if (activePage) activePage.classList.add('active');\n    if (tab === 'vendors') renderVendors();\n    else if (tab === 'contracts') renderContracts();\n    else if (tab === 'timeline') renderTimeline();\n    else if (tab === 'laws') renderLaws();\n    else if (tab === 'intel') renderIntel();\n    else if (tab === 'about') renderAbout();\n  }\n  var url = new URL(window.location.href);\n  url.searchParams.set('tab', tab);\n  history.replaceState(null, '', url.toString());\n}\n\nfunction checkUrlParams() {\n  var params = new URLSearchParams(window.location.search);\n  var tab = params.get('tab');\n  var id = params.get('id');\n  if (tab && tab !== 'support') switchTab(tab);\n  if (id) {\n    var entry = allEntries.find(function(e) { return String(e.id) === String(id); });\n    if (entry) {\n      if (currentTab !== 'map') switchTab('map');\n      setTimeout(function() { openEntryModal(entry); }, 400);\n    }\n  }\n}\n\n// ===== FILTERS =====\nfunction setFilter(level) {\n  currentFilter = level;\n  document.querySelectorAll('.fb').forEach(function(b) { b.classList.remove('active-f'); });\n  var btn = document.querySelector('.fb[data-filter=\"' + level + '\"]');\n  if (btn) btn.classList.add('active-f');\n  applyFilters();\n  renderMap(filteredEntries);\n  renderSidebar(filteredEntries);\n}\n\nfunction setSearch(q) {\n  currentSearch = q;\n  applyFilters();\n  renderMap(filteredEntries);\n  renderSidebar(filteredEntries);\n}\n\nfunction updateStats() {\n  var red = allEntries.filter(function(e) { return e.risk_level === 'RED'; }).length;\n  var orange = allEntries.filter(function(e) { return e.risk_level === 'ORANGE'; }).length;\n  var safe = allEntries.filter(function(e) { return e.risk_level === 'GREEN'; }).length;\n  setCount('stat-red', red);\n  setCount('stat-orange', orange);\n  setCount('stat-safe', safe);\n  setCount('stat-total', allEntries.length);\n}\n\nfunction setCount(id, val) {\n  var el = document.getElementById(id);\n  if (el) el.textContent = val;\n}\n\nfunction animateCounters() {\n  document.querySelectorAll('[data-count]').forEach(function(el) {\n    var target = parseInt(el.getAttribute('data-count'));\n    var cur = 0;\n    var step = Math.ceil(target / 30);\n    var iv = setInterval(function() {\n      cur = Math.min(cur + step, target);\n      el.textContent = cur;\n      if (cur >= target) clearInterval(iv);\n    }, 30);\n  });\n}\n\nfunction toggleCluster() {\n  clusterMode = !clusterMode;\n  var btn = document.getElementById('cluster-btn');\n  if (btn) btn.classList.toggle('active', clusterMode);\n  renderAll();\n}\n\n// ===== VENDORS TAB =====\nfunction renderVendors() {\n  var cp = document.getElementById('vendors-grid');\n  if (!cp) return;\n  var vendors = {};\n  allEntries.forEach(function(e) {\n    if (!vendors[e.vendor]) vendors[e.vendor] = { count: 0, totalValue: 0, states: new Set(), entries: [], riskCounts: {RED:0,ORANGE:0,YELLOW:0,GREEN:0} };\n    vendors[e.vendor].count++;\n    vendors[e.vendor].totalValue += (e.contract_value || 0);\n    vendors[e.vendor].states.add(e.state);\n    vendors[e.vendor].entries.push(e);\n    if (e.risk_level) vendors[e.vendor].riskCounts[e.risk_level] = (vendors[e.vendor].riskCounts[e.risk_level]||0) + 1;\n  });\n\n  var sorted = Object.keys(vendors).sort(function(a,b) { return vendors[b].count - vendors[a].count; });\n\n  var html = '<div style=\"padding:24px\"><h2 style=\"margin:0 0 4px;font-size:22px\">Surveillance Vendors</h2>' +\n    '<p style=\"color:var(--text2);margin:0 0 20px\">Companies supplying facial recognition to US law enforcement</p>' +\n    '<div style=\"display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px\">';\n\n  sorted.forEach(function(vendorName) {\n    var v = vendors[vendorName];\n    var info = window.VENDOR_INFO[vendorName] || {};\n    var dangerColor = {EXTREME:'#ff2d2d',HIGH:'#ff8c00',MEDIUM:'#ffd700',NONE:'#00c853'}[info.danger] || '#64748b';\n    var riskBar = '';\n    ['RED','ORANGE','GREEN'].forEach(function(r) {\n      if (v.riskCounts[r]) {\n        var pct = Math.round(v.riskCounts[r]/v.count*100);\n        riskBar += '<div style=\"flex:' + pct + ';background:' + getRiskColor(r) + ';height:4px;min-width:4px\" title=\"' + r + ': ' + v.riskCounts[r] + '\"></div>';\n      }\n    });\n\n    html += '<div class=\"vendor-card\" onclick=\"openVendorModal(\\'' + encodeURIComponent(vendorName) + '\\')\" style=\"cursor:pointer\">' +\n      '<div style=\"display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px\">' +\n        '<div style=\"font-size:15px;font-weight:700;color:#e2e8f0;flex:1\">' + vendorName + '</div>' +\n        (info.danger ? '<div style=\"font-size:10px;font-weight:700;color:' + dangerColor + ';border:1px solid ' + dangerColor + '40;padding:2px 6px;border-radius:4px;flex-shrink:0\">' + info.danger + '</div>' : '') +\n      '</div>' +\n      '<div style=\"font-size:12px;color:#94a3b8;margin-bottom:10px;line-height:1.5\">' + (info.desc||'Government surveillance vendor').substring(0,120) + (info.desc&&info.desc.length>120?'...':'') + '</div>' +\n      '<div style=\"display:flex;height:4px;border-radius:2px;overflow:hidden;margin-bottom:10px;background:#1e293b\">' + riskBar + '</div>' +\n      '<div style=\"display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;font-size:11px\">' +\n        '<div style=\"text-align:center\"><div style=\"font-size:18px;font-weight:800;color:#60a5fa\">' + v.count + '</div><div style=\"color:#64748b\">AGENCIES</div></div>' +\n        '<div style=\"text-align:center\"><div style=\"font-size:18px;font-weight:800;color:#fbbf24\">' + v.states.size + '</div><div style=\"color:#64748b\">STATES</div></div>' +\n        '<div style=\"text-align:center\"><div style=\"font-size:' + (v.totalValue>0?'14':'18') + 'px;font-weight:800;color:#34d399\">' + (v.totalValue>0?'$'+formatNum(v.totalValue):'N/A') + '</div><div style=\"color:#64748b\">VALUE</div></div>' +\n      '</div>' +\n      '<div style=\"margin-top:10px;font-size:10px;color:#475569\">Click to drill down \\u2192</div>' +\n      '</div>';\n  });\n  html += '</div></div>';\n  cp.innerHTML = html;\n}\n\nfunction openVendorModal(encodedName) {\n  var vendorName = decodeURIComponent(encodedName);\n  var info = window.VENDOR_INFO[vendorName] || {};\n  var entries = allEntries.filter(function(e) { return e.vendor === vendorName; });\n  var totalValue = entries.reduce(function(s,e) { return s + (e.contract_value||0); }, 0);\n  var states = [...new Set(entries.map(function(e){return e.state;}))].sort();\n  var dangerColor = {EXTREME:'#ff2d2d',HIGH:'#ff8c00',MEDIUM:'#ffd700',NONE:'#00c853'}[info.danger] || '#64748b';\n\n  // Related federal contracts\n  var fedContracts = contractsData.filter(function(c) {\n    return (c.vendor||'').toLowerCase().includes(vendorName.toLowerCase().split(' ')[0]);\n  });\n\n  var html = '<button class=\"modal-close\" onclick=\"closeModal()\">\\u2715</button>' +\n    '<div class=\"modal-risk-bar\" style=\"background:' + dangerColor + '\"></div>' +\n    '<div class=\"modal-city\">' + vendorName + '</div>' +\n    '<div class=\"modal-agency\" style=\"color:#94a3b8\">' + (info.hq||'') + (info.founded?' \\u00b7 Founded '+info.founded:'') + '</div>' +\n    (info.danger ? '<div style=\"display:inline-block;font-size:11px;font-weight:700;color:' + dangerColor + ';border:1px solid ' + dangerColor + '40;padding:3px 10px;border-radius:6px;margin:8px 0\">DANGER: ' + info.danger + '</div>' : '') +\n    // Stats\n    '<div style=\"display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:14px 0\">' +\n      '<div style=\"background:#0f172a;border-radius:8px;padding:10px;text-align:center\"><div style=\"font-size:22px;font-weight:800;color:#60a5fa\">' + entries.length + '</div><div style=\"font-size:10px;color:#64748b\">AGENCIES</div></div>' +\n      '<div style=\"background:#0f172a;border-radius:8px;padding:10px;text-align:center\"><div style=\"font-size:22px;font-weight:800;color:#fbbf24\">' + states.length + '</div><div style=\"font-size:10px;color:#64748b\">STATES</div></div>' +\n      '<div style=\"background:#0f172a;border-radius:8px;padding:10px;text-align:center\"><div style=\"font-size:' + (totalValue>0?'16':'22') + 'px;font-weight:800;color:#34d399\">' + (totalValue>0?'$'+formatNum(totalValue):'See Fed') + '</div><div style=\"font-size:10px;color:#64748b\">KNOWN VALUE</div></div>' +\n    '</div>' +\n    '<div class=\"modal-section\"><div class=\"modal-label\">About</div><div class=\"modal-value\" style=\"font-size:12px;color:#94a3b8\">' + (info.desc||'Government surveillance technology vendor.') + '</div></div>' +\n    '<div class=\"modal-section\"><div class=\"modal-label\">Deployed States</div><div style=\"display:flex;flex-wrap:wrap;gap:4px;margin-top:6px\">' +\n      states.map(function(s){return '<span style=\"background:#1e293b;color:#94a3b8;padding:2px 8px;border-radius:4px;font-size:11px\">'+s+'</span>';}).join('') +\n    '</div></div>';\n\n  // Agency list\n  html += '<div class=\"modal-section\"><div class=\"modal-label\">Known Deployments (' + entries.length + ')</div>';\n  entries.slice(0,8).forEach(function(e) {\n    html += '<div style=\"display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #1e293b;font-size:12px\">' +\n      '<div><span style=\"color:#e2e8f0\">' + (e.agency||'') + '</span> <span style=\"color:#64748b\">' + e.city + ', ' + e.state + '</span></div>' +\n      '<div style=\"display:flex;gap:6px;align-items:center\">' +\n        (e.contract_value>0?'<span style=\"color:#fbbf24\">$'+Number(e.contract_value).toLocaleString()+'</span>':'') +\n        '<span class=\"ec-badge ' + e.risk_level + '\" style=\"font-size:9px;padding:1px 5px\">' + e.risk_level + '</span>' +\n      '</div></div>';\n  });\n  if (entries.length > 8) html += '<div style=\"font-size:11px;color:#64748b;margin-top:4px\">+ ' + (entries.length-8) + ' more deployments</div>';\n  html += '</div>';\n\n  if (fedContracts.length > 0) {\n    html += '<div class=\"modal-section\"><div class=\"modal-label\">Federal Contracts (' + fedContracts.length + ')</div>';\n    fedContracts.forEach(function(c) {\n      html += '<div style=\"background:#0f172a;border-radius:6px;padding:8px;margin-top:6px;font-size:11px\">' +\n        '<div style=\"display:flex;justify-content:space-between\"><span style=\"color:#fbbf24;font-weight:700\">$' + Number(c.amount||0).toLocaleString() + '</span><span style=\"color:#64748b\">' + (c.start_date||'') + '</span></div>' +\n        '<div style=\"color:#94a3b8\">' + (c.agency||'') + '</div>' +\n        '<div style=\"color:#e2e8f0;margin-top:2px\">' + (c.description||'').substring(0,100) + '</div>' +\n        '</div>';\n    });\n    html += '</div>';\n  }\n\n  html += '<div class=\"modal-actions\">' +\n    (info.wiki ? '<a class=\"modal-btn primary\" href=\"' + info.wiki + '\" target=\"_blank\">\\uD83D\\uDCD6 Learn More</a>' : '') +\n    '<button class=\"modal-btn\" onclick=\"filterByVendor(\\'' + encodeURIComponent(vendorName) + '\\')\">\u00f0\u009f\u0097\u00ba Show on Map</button>' +\n    '</div>';\n\n  var modal = document.getElementById('modal');\n  var overlay = document.getElementById('modal-overlay');\n  if (modal && overlay) { modal.innerHTML = html; overlay.classList.add('open'); }\n}\n\nfunction filterByVendor(encodedName) {\n  closeModal();\n  var vendorName = decodeURIComponent(encodedName);\n  currentSearch = vendorName.split(' ')[0];\n  var si = document.getElementById('search-input');\n  if (si) si.value = currentSearch;\n  switchTab('map');\n  setTimeout(function() { applyFilters(); renderMap(filteredEntries); renderSidebar(filteredEntries); }, 100);\n}\n\n// ===== CONTRACTS TAB =====\nfunction renderContracts() {\n  var tbody = document.getElementById('contracts-tbody');\n  var totalEl = document.getElementById('contracts-total');\n  if (!tbody) return;\n  if (!contractsData || contractsData.length === 0) {\n    tbody.innerHTML = '<tr><td colspan=\"4\" style=\"text-align:center;color:#64748b;padding:30px\">No contract data loaded.</td></tr>';\n    return;\n  }\n  var sorted = contractsData.slice().sort(function(a,b) {\n    var va = a[contractSortCol] || 0, vb = b[contractSortCol] || 0;\n    return contractSortDir === 'desc' ? (vb > va ? 1 : -1) : (va > vb ? 1 : -1);\n  });\n  var totalValue = contractsData.reduce(function(s,c) { return s + (c.amount||0); }, 0);\n  if (totalEl) totalEl.innerHTML = contractsData.length + ' contracts \\u00b7 Total: <span style=\"color:#fbbf24;font-weight:700\">$' + formatNum(totalValue) + '</span>';\n  var rows = sorted.map(function(c, i) {\n    var rowBg = i % 2 === 0 ? 'transparent' : '#0a0f1a';\n    var encoded = encodeURIComponent(JSON.stringify(c));\n    return '<tr style=\"background:' + rowBg + ';cursor:pointer\" ' +\n      'onmouseover=\"this.style.background=\\'#1e293b\\'\" ' +\n      'onmouseout=\"this.style.background=\\'' + rowBg + '\\'\" ' +\n      'onclick=\"openContractModal(\\'' + encoded + '\\')\">' +\n      '<td style=\"padding:10px 12px\">' +\n        '<div style=\"font-weight:600;color:#e2e8f0\">' + (c.vendor||'\u2014').substring(0,28) + '</div>' +\n        '<div style=\"font-size:11px;color:#64748b\">' + (c.agency||'\u2014').replace('Department of ', 'Dept. ').substring(0,30) + '</div>' +\n      '</td>' +\n      '<td style=\"padding:10px 12px;text-align:right;font-weight:700;color:#fbbf24\">$' + Number(c.amount||0).toLocaleString() + '</td>' +\n      '<td style=\"padding:10px 12px;color:#64748b\">' + ([c.location_city,c.location_state].filter(Boolean).join(', ')||'\u2014') + '</td>' +\n      '<td style=\"padding:10px 12px;color:#94a3b8;text-align:center\">' + (c.start_date||'\u2014') + '</td>' +\n      '</tr>';\n  });\n  tbody.innerHTML = rows.join('');\n}\n\nfunction sortArrow(col) {\n  if (contractSortCol !== col) return '<span style=\"opacity:0.3\">\\u2195</span>';\n  return contractSortDir === 'desc' ? '\\u2193' : '\\u2191';\n}\n\nfunction sortContracts(col) {\n  if (contractSortCol === col) contractSortDir = contractSortDir === 'desc' ? 'asc' : 'desc';\n  else { contractSortCol = col; contractSortDir = 'desc'; }\n  renderContracts();\n}\n\nfunction openContractModal(encoded) {\n  var c;\n  try { c = JSON.parse(decodeURIComponent(encoded)); } catch(e) { return; }\n  var relEntries = allEntries.filter(function(e) {\n    return (e.vendor||'').toLowerCase().includes((c.vendor||'').toLowerCase().split(' ')[0].toLowerCase());\n  }).slice(0,5);\n\n  var duration = '';\n  if (c.start_date && c.end_date) {\n    var ms = new Date(c.end_date) - new Date(c.start_date);\n    var months = Math.round(ms / (1000*60*60*24*30));\n    duration = months + ' months';\n  }\n\n  var html = '<button class=\"modal-close\" onclick=\"closeModal()\">\\u2715</button>' +\n    '<div class=\"modal-risk-bar\" style=\"background:#fbbf24\"></div>' +\n    '<div class=\"modal-city\" style=\"font-size:16px\">' + (c.vendor||'Unknown Vendor') + '</div>' +\n    '<div class=\"modal-agency\" style=\"color:#94a3b8\">' + (c.agency||'') + '</div>' +\n    '<div style=\"display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:14px 0\">' +\n      '<div style=\"background:#0f172a;border-radius:8px;padding:10px;text-align:center\"><div style=\"font-size:20px;font-weight:800;color:#fbbf24\">$' + formatNum(c.amount||0) + '</div><div style=\"font-size:10px;color:#64748b\">AWARD AMOUNT</div></div>' +\n      '<div style=\"background:#0f172a;border-radius:8px;padding:10px;text-align:center\"><div style=\"font-size:14px;font-weight:800;color:#e2e8f0\">' + (c.start_date||'N/A') + '</div><div style=\"font-size:10px;color:#64748b\">START DATE</div></div>' +\n      '<div style=\"background:#0f172a;border-radius:8px;padding:10px;text-align:center\"><div style=\"font-size:14px;font-weight:800;color:#94a3b8\">' + (duration||c.end_date||'N/A') + '</div><div style=\"font-size:10px;color:#64748b\">DURATION</div></div>' +\n    '</div>' +\n    '<div class=\"modal-section\"><div class=\"modal-label\">Contract Description</div><div class=\"modal-value\" style=\"font-size:13px;color:#e2e8f0\">' + (c.description||'No description available') + '</div></div>' +\n    '<div class=\"modal-section\"><div style=\"display:grid;grid-template-columns:1fr 1fr;gap:12px\">' +\n      '<div><div class=\"modal-label\">Agency</div><div class=\"modal-value\">' + (c.agency||'\u2014') + '</div></div>' +\n      '<div><div class=\"modal-label\">Location</div><div class=\"modal-value\">' + ([c.location_city,c.location_state].filter(Boolean).join(', ')||'\u2014') + '</div></div>' +\n      '<div><div class=\"modal-label\">Award ID</div><div class=\"modal-value\" style=\"font-size:10px;color:#64748b\">' + (c.award_id||'\u2014') + '</div></div>' +\n      '<div><div class=\"modal-label\">End Date</div><div class=\"modal-value\">' + (c.end_date||'\u2014') + '</div></div>' +\n    '</div></div>';\n\n  if (relEntries.length > 0) {\n    html += '<div class=\"modal-section\"><div class=\"modal-label\">Known Deployments of this Vendor</div>';\n    relEntries.forEach(function(e) {\n      html += '<div style=\"display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #1e293b;font-size:12px\">' +\n        '<span style=\"color:#e2e8f0\">' + e.agency + ' \u2014 ' + e.city + ', ' + e.state + '</span>' +\n        '<span class=\"ec-badge ' + e.risk_level + '\" style=\"font-size:9px;padding:1px 5px\">' + e.risk_level + '</span>' +\n        '</div>';\n    });\n    html += '</div>';\n  }\n\n  html += '<div class=\"modal-actions\"><a class=\"modal-btn primary\" href=\"https://www.usaspending.gov/award/' + (c.award_id||'') + '\" target=\"_blank\">\\uD83D\\uDCC4 USASpending.gov</a></div>';\n\n  var modal = document.getElementById('modal');\n  var overlay = document.getElementById('modal-overlay');\n  if (modal && overlay) { modal.innerHTML = html; overlay.classList.add('open'); }\n}\n\n// ===== TIMELINE TAB =====\nfunction renderTimeline() {\n  var cp = document.getElementById('timeline-container');\n  if (!cp) return;\n\n  // Sort options\n  var sortedEntries = allEntries.slice();\n  if (currentSort === 'date_desc') {\n    sortedEntries.sort(function(a,b) { return (b.contract_start||b.last_updated||'') > (a.contract_start||a.last_updated||'') ? 1 : -1; });\n  } else if (currentSort === 'date_asc') {\n    sortedEntries.sort(function(a,b) { return (a.contract_start||a.last_updated||'') > (b.contract_start||b.last_updated||'') ? 1 : -1; });\n  } else if (currentSort === 'value_desc') {\n    sortedEntries.sort(function(a,b) { return (b.contract_value||0) - (a.contract_value||0); });\n  } else if (currentSort === 'risk') {\n    var riskOrder = {RED:0,ORANGE:1,YELLOW:2,GREEN:3};\n    sortedEntries.sort(function(a,b) { return (riskOrder[a.risk_level]||9) - (riskOrder[b.risk_level]||9); });\n  }\n\n  var html = '<div style=\"padding:24px\">' +\n    '<div style=\"display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;flex-wrap:wrap;gap:12px\">' +\n      '<div><h2 style=\"margin:0 0 4px;font-size:22px\">Deployment Timeline</h2><p style=\"color:var(--text2);margin:0\">Surveillance deployments \u2014 click any entry to drill down</p></div>' +\n      '<div style=\"display:flex;gap:8px;align-items:center\">' +\n        '<select onchange=\"currentSort=this.value;renderTimeline()\" style=\"background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:6px;padding:6px 12px;font-size:12px\">' +\n          '<option value=\"date_desc\"' + (currentSort==='date_desc'?' selected':'') + '>Most Recent</option>' +\n          '<option value=\"date_asc\"' + (currentSort==='date_asc'?' selected':'') + '>Oldest First</option>' +\n          '<option value=\"value_desc\"' + (currentSort==='value_desc'?' selected':'') + '>Highest Value</option>' +\n          '<option value=\"risk\"' + (currentSort==='risk'?' selected':'') + '>Risk Level</option>' +\n        '</select>' +\n      '</div>' +\n    '</div>' +\n    '<div style=\"position:relative;padding-left:28px\">' +\n    '<div style=\"position:absolute;left:10px;top:0;bottom:0;width:2px;background:linear-gradient(to bottom,#ef4444,#f97316,#1e293b)\"></div>';\n\n  sortedEntries.forEach(function(e) {\n    var color = getRiskColor(e.risk_level);\n    // Use best available date \u2014 contract_start is most accurate, fallback to source year, then last_updated\n    var displayDate = e.contract_start || extractYearFromSource(e.source) || e.last_updated || 'Unknown';\n    var dateLabel = formatDate(displayDate);\n    var hasValue = e.contract_value > 0;\n\n    html += '<div style=\"position:relative;margin-bottom:0;cursor:pointer\" onclick=\"openTimelineEntry(\\'' + e.id + '\\')\">' +\n      '<div style=\"position:absolute;left:-22px;top:18px;width:12px;height:12px;border-radius:50%;background:' + color + ';box-shadow:0 0 8px ' + color + '80;border:2px solid #0f172a\"></div>' +\n      '<div style=\"background:#0d1526;border:1px solid #1e293b;border-left:3px solid ' + color + ';border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:2px;transition:background 0.15s\" ' +\n        'onmouseover=\"this.style.background=\\'#1e293b\\'\" onmouseout=\"this.style.background=\\'#0d1526\\'\">' +\n        '<div style=\"display:flex;justify-content:space-between;align-items:flex-start\">' +\n          '<div style=\"flex:1\">' +\n            '<div style=\"font-size:11px;color:#64748b;margin-bottom:2px\">' + dateLabel + ' \\u00b7 ' + (e.source||'') + '</div>' +\n            '<div style=\"font-size:15px;font-weight:700;color:#e2e8f0\">' + (e.city||'') + ', ' + (e.state||'') + '</div>' +\n            '<div style=\"font-size:12px;color:#60a5fa;margin-top:1px\">' + (e.agency||'') + '</div>' +\n            '<div style=\"display:flex;gap:6px;align-items:center;margin-top:6px;flex-wrap:wrap\">' +\n              '<span class=\"ec-badge ' + e.risk_level + '\" style=\"font-size:10px;padding:2px 7px\">' + e.risk_level + '</span>' +\n              '<span style=\"font-size:11px;background:#1e293b;padding:2px 8px;border-radius:8px;color:#94a3b8\">' + (e.vendor||'') + '</span>' +\n              (hasValue ? '<span style=\"font-size:11px;color:#fbbf24;font-weight:600\">$' + Number(e.contract_value).toLocaleString() + '</span>' : '') +\n            '</div>' +\n          '</div>' +\n          '<div style=\"font-size:10px;color:#475569;margin-left:12px;white-space:nowrap\">drill down \\u2192</div>' +\n        '</div>' +\n      '</div>' +\n    '</div>';\n  });\n\n  html += '</div></div>';\n  cp.innerHTML = html;\n}\n\nfunction openTimelineEntry(id) {\n  var e = allEntries.find(function(x) { return String(x.id) === String(id); });\n  if (!e) return;\n  openEntryModal(e);\n}\n\nfunction extractYearFromSource(source) {\n  if (!source) return null;\n  var match = source.match(/\\b(20\\d{2})\\b/);\n  return match ? match[1] : null;\n}\n\n// ===== LAWS TAB =====\nfunction renderLaws() {\n  var cp = document.getElementById('laws-container');\n  if (!cp) return;\n  var laws = window.STATE_LAWS || {};\n  var statusOrder = {STRONG:0,MODERATE:1,PARTIAL:2,PENDING:3};\n  var statusColor = {STRONG:'#00c853',MODERATE:'#ffd700',PARTIAL:'#ff8c00',PENDING:'#94a3b8'};\n  var sortedStates = Object.keys(laws).sort(function(a,b) { return (statusOrder[laws[a].status]||9) - (statusOrder[laws[b].status]||9); });\n\n  // Summary stats\n  var counts = {STRONG:0,MODERATE:0,PARTIAL:0,PENDING:0};\n  sortedStates.forEach(function(s) { counts[laws[s].status] = (counts[laws[s].status]||0) + 1; });\n\n  var html = '<div style=\"padding:24px\">' +\n    '<h2 style=\"margin:0 0 4px;font-size:22px\">State Laws & Protections</h2>' +\n    '<p style=\"color:var(--text2);margin:0 0 16px\">Facial recognition legislation across the US \u2014 click a state for details</p>' +\n    // Summary row\n    '<div style=\"display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap\">' +\n    Object.keys(counts).map(function(s) {\n      return '<div style=\"background:#0d1526;border:1px solid ' + (statusColor[s]||'#1e293b') + '40;border-radius:8px;padding:8px 16px;text-align:center\">' +\n        '<div style=\"font-size:20px;font-weight:800;color:' + (statusColor[s]||'#94a3b8') + '\">' + counts[s] + '</div>' +\n        '<div style=\"font-size:10px;color:#64748b\">' + s + '</div></div>';\n    }).join('') +\n    '<div style=\"background:#0d1526;border:1px solid #3b82f640;border-radius:8px;padding:8px 16px;text-align:center\">' +\n      '<div style=\"font-size:20px;font-weight:800;color:#3b82f6\">' + sortedStates.length + '</div><div style=\"font-size:10px;color:#64748b\">TOTAL STATES</div></div>' +\n    '</div>' +\n    '<div style=\"display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px\">';\n\n  sortedStates.forEach(function(state) {\n    var law = laws[state];\n    var color = statusColor[law.status] || '#94a3b8';\n    html += '<div style=\"background:#0d1526;border:1px solid ' + color + '30;border-radius:12px;padding:16px;cursor:pointer;transition:border-color 0.2s,transform 0.15s\" ' +\n      'onclick=\"openLawModal(\\'' + state + '\\')\" onmouseover=\"this.style.borderColor=\\'' + color + '\\';this.style.transform=\\'translateY(-2px)\\'\" onmouseout=\"this.style.borderColor=\\'' + color + '30\\';this.style.transform=\\'\\'\">' +\n      '<div style=\"display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px\">' +\n        '<div style=\"font-size:28px;font-weight:900;color:#e2e8f0\">' + state + '</div>' +\n        '<div style=\"font-size:10px;font-weight:700;color:' + color + ';background:' + color + '20;padding:3px 8px;border-radius:4px\">' + law.status + '</div>' +\n      '</div>' +\n      '<div style=\"font-size:12px;font-weight:600;color:#cbd5e1;margin-bottom:4px\">' + (law.title||'') + '</div>' +\n      '<div style=\"font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px\">' + (law.type||'') + '</div>' +\n      '<div style=\"font-size:11px;color:#94a3b8;line-height:1.5\">' + (law.summary||'').substring(0,90) + '...</div>' +\n      '<div style=\"margin-top:10px;font-size:10px;color:#475569\">Click for full details \\u2192</div>' +\n      '</div>';\n  });\n  html += '</div></div>';\n  cp.innerHTML = html;\n}\n\nfunction openLawModal(state) {\n  var law = (window.STATE_LAWS||{})[state];\n  if (!law) return;\n  var statusColor = {STRONG:'#00c853',MODERATE:'#ffd700',PARTIAL:'#ff8c00',PENDING:'#94a3b8'};\n  var color = statusColor[law.status] || '#94a3b8';\n  // Find affected entries in this state\n  var stateEntries = allEntries.filter(function(e) { return e.state === state; });\n  var redCount = stateEntries.filter(function(e){return e.risk_level==='RED';}).length;\n  var greenCount = stateEntries.filter(function(e){return e.risk_level==='GREEN';}).length;\n  var vendors = [...new Set(stateEntries.map(function(e){return e.vendor;}))];\n\n  var html = '<button class=\"modal-close\" onclick=\"closeModal()\">\\u2715</button>' +\n    '<div class=\"modal-risk-bar\" style=\"background:' + color + '\"></div>' +\n    '<div style=\"display:flex;align-items:center;gap:12px;margin-bottom:4px\">' +\n      '<div style=\"font-size:40px;font-weight:900;color:#e2e8f0\">' + state + '</div>' +\n      '<div><div style=\"font-size:16px;font-weight:700;color:#e2e8f0\">' + (law.title||'') + '</div>' +\n      '<div style=\"font-size:10px;font-weight:700;color:' + color + ';background:' + color + '20;display:inline-block;padding:2px 8px;border-radius:4px;margin-top:4px\">' + law.status + ' PROTECTION</div></div>' +\n    '</div>' +\n    '<div style=\"font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px\">' + (law.type||'') + '</div>' +\n    // Stats\n    '<div style=\"display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:14px 0\">' +\n      '<div style=\"background:#0f172a;border-radius:8px;padding:10px;text-align:center\"><div style=\"font-size:22px;font-weight:800;color:#ff2d2d\">' + redCount + '</div><div style=\"font-size:10px;color:#64748b\">ACTIVE DEPLOYMENTS</div></div>' +\n      '<div style=\"background:#0f172a;border-radius:8px;padding:10px;text-align:center\"><div style=\"font-size:22px;font-weight:800;color:#00c853\">' + greenCount + '</div><div style=\"font-size:10px;color:#64748b\">BANNED USES</div></div>' +\n      '<div style=\"background:#0f172a;border-radius:8px;padding:10px;text-align:center\"><div style=\"font-size:22px;font-weight:800;color:#60a5fa\">' + vendors.length + '</div><div style=\"font-size:10px;color:#64748b\">VENDORS TRACKED</div></div>' +\n    '</div>' +\n    '<div class=\"modal-section\"><div class=\"modal-label\">Law Summary</div><div class=\"modal-value\" style=\"font-size:13px;color:#94a3b8;line-height:1.6\">' + (law.summary||'') + '</div></div>';\n\n  if (stateEntries.length > 0) {\n    html += '<div class=\"modal-section\"><div class=\"modal-label\">Known ' + state + ' Deployments</div>';\n    stateEntries.slice(0,6).forEach(function(e) {\n      html += '<div style=\"display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #1e293b;font-size:12px\">' +\n        '<div><span style=\"color:#e2e8f0\">' + (e.agency||'') + '</span> <span style=\"color:#64748b\">\u2014 ' + e.city + '</span></div>' +\n        '<div style=\"display:flex;gap:6px;align-items:center\">' +\n          '<span style=\"font-size:10px;color:#94a3b8\">' + (e.vendor||'') + '</span>' +\n          '<span class=\"ec-badge ' + e.risk_level + '\" style=\"font-size:9px;padding:1px 5px\">' + e.risk_level + '</span>' +\n        '</div></div>';\n    });\n    if (stateEntries.length > 6) html += '<div style=\"font-size:11px;color:#64748b;margin-top:4px\">+ ' + (stateEntries.length-6) + ' more</div>';\n    html += '</div>';\n  }\n\n  html += '<div class=\"modal-actions\"><a class=\"modal-btn primary\" href=\"' + (law.link||'#') + '\" target=\"_blank\">\\uD83D\\uDCDC View Legislation</a>' +\n    '<button class=\"modal-btn\" onclick=\"closeModal();currentSearch=\\'' + state + '\\';var si=document.getElementById(\\'search-input\\');if(si)si.value=\\'' + state + '\\';switchTab(\\'map\\');setTimeout(function(){applyFilters();renderMap(filteredEntries);renderSidebar(filteredEntries);},100)\">\u00f0\u009f\u0097\u00ba Show State on Map</button>' +\n    '</div>';\n\n  var modal = document.getElementById('modal');\n  var overlay = document.getElementById('modal-overlay');\n  if (modal && overlay) { modal.innerHTML = html; overlay.classList.add('open'); }\n}\n\n// ===== INTEL TAB =====\nfunction renderIntel() {\n  var cp = document.getElementById('intel-container');\n  if (!cp) return;\n  // Deduplicate by headline\n  var seen = {};\n  var unique = newsData.filter(function(n) {\n    var key = (n.headline||'').toLowerCase().trim().substring(0,60);\n    if (seen[key]) return false;\n    seen[key] = true;\n    return true;\n  });\n\n  var html = '<div style=\"padding:24px\">' +\n    '<h2 style=\"margin:0 0 4px;font-size:22px\">Intel Feed</h2>' +\n    '<p style=\"color:var(--text2);margin:0 0 20px\">Latest surveillance news \u2014 ' + unique.length + ' articles \\u00b7 Click to expand</p>' +\n    '<div style=\"display:flex;flex-direction:column;gap:8px\">';\n\n  unique.forEach(function(n, i) {\n    var dateStr = formatDate(n.published_at);\n    var tags = extractTags(n.headline);\n    html += '<div style=\"background:#0d1526;border:1px solid #1e293b;border-radius:10px;padding:14px 18px;cursor:pointer;transition:background 0.15s,border-color 0.15s\" ' +\n      'onclick=\"openIntelModal(' + i + ')\" onmouseover=\"this.style.background=\\'#0f172a\\';this.style.borderColor=\\'#3b82f6\\'\" onmouseout=\"this.style.background=\\'#0d1526\\';this.style.borderColor=\\'#1e293b\\'\">' +\n      '<div style=\"display:flex;justify-content:space-between;align-items:flex-start;gap:12px\">' +\n        '<div style=\"flex:1\">' +\n          '<div style=\"font-size:14px;font-weight:600;color:#e2e8f0;line-height:1.4;margin-bottom:6px\">' + (n.headline||'') + '</div>' +\n          '<div style=\"display:flex;gap:10px;align-items:center;flex-wrap:wrap\">' +\n            '<span style=\"font-size:11px;color:#60a5fa;font-weight:600\">' + (n.source_name||'Unknown') + '</span>' +\n            '<span style=\"font-size:11px;color:#64748b\">' + dateStr + '</span>' +\n            tags.map(function(t){return '<span style=\"font-size:10px;background:#1e3a5f;color:#93c5fd;padding:2px 7px;border-radius:8px\">'+t+'</span>';}).join('') +\n          '</div>' +\n        '</div>' +\n        '<div style=\"font-size:10px;color:#475569;flex-shrink:0\">expand \\u2192</div>' +\n      '</div>' +\n    '</div>';\n  });\n\n  // Store for modal access\n  window._intelData = unique;\n  html += '</div></div>';\n  cp.innerHTML = html;\n}\n\nfunction openIntelModal(idx) {\n  var n = (window._intelData||[])[idx];\n  if (!n) return;\n  var tags = extractTags(n.headline);\n  // Find related entries\n  var relEntries = allEntries.filter(function(e) {\n    return (n.headline||'').toLowerCase().includes((e.city||'').toLowerCase()) ||\n           (n.city && n.city !== 'NATIONAL' && e.city === n.city);\n  }).slice(0,4);\n  var relNews = (window._intelData||[]).filter(function(m, i) {\n    if (i === idx) return false;\n    return tags.some(function(t) { return (m.headline||'').toLowerCase().includes(t.toLowerCase()); });\n  }).slice(0,3);\n\n  var html = '<button class=\"modal-close\" onclick=\"closeModal()\">\\u2715</button>' +\n    '<div class=\"modal-risk-bar\" style=\"background:#3b82f6\"></div>' +\n    '<div class=\"modal-city\" style=\"font-size:15px;line-height:1.4\">' + (n.headline||'') + '</div>' +\n    '<div style=\"display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:8px 0 16px\">' +\n      '<span style=\"font-size:12px;color:#60a5fa;font-weight:600\">' + (n.source_name||'') + '</span>' +\n      '<span style=\"font-size:12px;color:#64748b\">' + formatDate(n.published_at) + '</span>' +\n      (n.fetched_at ? '<span style=\"font-size:10px;color:#475569\">Indexed: ' + n.fetched_at + '</span>' : '') +\n      tags.map(function(t){return '<span style=\"font-size:10px;background:#1e3a5f;color:#93c5fd;padding:2px 7px;border-radius:8px\">'+t+'</span>';}).join('') +\n    '</div>';\n\n  if (n.city && n.city !== 'NATIONAL') {\n    html += '<div class=\"modal-section\"><div class=\"modal-label\">Location</div><div class=\"modal-value\">' + n.city + (n.state?', '+n.state:'') + '</div></div>';\n  }\n\n  if (relEntries.length > 0) {\n    html += '<div class=\"modal-section\"><div class=\"modal-label\">Related Surveillance Entries</div>';\n    relEntries.forEach(function(e) {\n      html += '<div style=\"display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #1e293b;font-size:12px\">' +\n        '<span style=\"color:#e2e8f0\">' + (e.agency||'') + ' \u2014 ' + e.city + ', ' + e.state + '</span>' +\n        '<span class=\"ec-badge ' + e.risk_level + '\" style=\"font-size:9px;padding:1px 5px\">' + e.risk_level + '</span></div>';\n    });\n    html += '</div>';\n  }\n\n  if (relNews.length > 0) {\n    html += '<div class=\"modal-section\"><div class=\"modal-label\">Related Articles</div>';\n    relNews.forEach(function(m) {\n      html += '<div style=\"margin-top:8px\"><a href=\"' + (m.url||'#') + '\" target=\"_blank\" style=\"color:#60a5fa;font-size:12px;text-decoration:none\">' + (m.headline||'').substring(0,100) + ' \\u2197</a>' +\n        '<div style=\"font-size:10px;color:#64748b\">' + (m.source_name||'') + ' \\u00b7 ' + formatDate(m.published_at) + '</div></div>';\n    });\n    html += '</div>';\n  }\n\n  html += '<div class=\"modal-actions\"><a class=\"modal-btn primary\" href=\"' + (n.url||'#') + '\" target=\"_blank\" rel=\"noopener\">\\uD83D\\uDCF0 Read Full Article</a></div>';\n\n  var modal = document.getElementById('modal');\n  var overlay = document.getElementById('modal-overlay');\n  if (modal && overlay) { modal.innerHTML = html; overlay.classList.add('open'); }\n}\n\nfunction extractTags(headline) {\n  var tags = [];\n  var keywords = ['facial recognition','surveillance','clearview','palantir','ice','fbi','nypd','police','privacy','ban','foia','contract','biometric'];\n  var h = (headline||'').toLowerCase();\n  keywords.forEach(function(k) { if (h.includes(k)) tags.push(k.replace(/\\b./g,function(c){return c.toUpperCase();})); });\n  return tags.slice(0,3);\n}\n\n// ===== ABOUT TAB =====\nfunction renderAbout() {\n  // About page is static HTML \u2014 inject live stats\n  if(!window._aboutBtcInited){window._aboutBtcInited=true;setTimeout(initAboutBtcCard,400);}\n  var statsEl = document.getElementById('about-live-stats');\n  if (!statsEl) return; // static content already rendered\n  var red = allEntries.filter(function(e){return e.risk_level==='RED';}).length;\n  var orange = allEntries.filter(function(e){return e.risk_level==='ORANGE';}).length;\n  var green = allEntries.filter(function(e){return e.risk_level==='GREEN';}).length;\n  var totalValue = allEntries.reduce(function(s,e){return s+(e.contract_value||0);},0);\n  var vendors = new Set(allEntries.map(function(e){return e.vendor;})).size;\n  var states = new Set(allEntries.map(function(e){return e.state;})).size;\n  var fedTotal = contractsData.reduce(function(s,c){return s+(c.amount||0);},0);\n\n  var html = '<div style=\"padding:24px\">' +\n    // Hero\n    '<div style=\"background:linear-gradient(135deg,#0f172a,#1e0a0a);border:1px solid #ef444430;border-radius:16px;padding:28px;margin-bottom:24px\">' +\n      '<div style=\"font-size:32px;font-weight:900;margin-bottom:8px\"><span style=\"color:#ef4444\">Face</span><span style=\"color:#e2e8f0\">HeatMap</span> <span style=\"color:#e2e8f0\">USA</span></div>' +\n      '<p style=\"color:#94a3b8;max-width:600px;line-height:1.6;margin:0 0 16px\">A free, open intelligence tool tracking government use of facial recognition technology across the United States. Built to defend civil liberties through transparency.</p>' +\n      '<div style=\"background:#0f172a;display:inline-block;padding:6px 14px;border-radius:20px;font-size:12px;color:#94a3b8\">VPDLNY \\u2014 info & knowledge as the weapon</div>' +\n    '</div>' +\n    // Live stats\n    '<div style=\"display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-bottom:24px\">' +\n      statCard(allEntries.length, 'AGENCIES TRACKED', '#60a5fa') +\n      statCard(red, 'ACTIVE DEPLOYMENTS', '#ff2d2d') +\n      statCard(orange, 'CONFIRMED USE', '#ff8c00') +\n      statCard(green, 'BANNED JURISDICTIONS', '#00c853') +\n      statCard(states, 'STATES COVERED', '#a78bfa') +\n      statCard(vendors, 'VENDORS TRACKED', '#f59e0b') +\n      statCard(contractsData.length, 'FEDERAL CONTRACTS', '#34d399') +\n      statCard('$'+formatNum(fedTotal), 'FED CONTRACT VALUE', '#fbbf24') +\n    '</div>' +\n    // Cards grid\n    '<div style=\"display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px\">' +\n    aboutCard('\\uD83C\\uDFAF Mission',\n      'Facial recognition technology is being deployed against American communities with little oversight, no warrant requirements, and a documented record of wrongful arrests \u2014 especially against Black Americans.<br><br>FaceHeatMap exists to make this visible. Information is power.',\n      '#ef4444') +\n    aboutCard('\\uD83D\\uDCCA Data Sources',\n      '<ul style=\"margin:0;padding-left:18px;line-height:2\">' +\n        '<li>EFF Atlas of Surveillance</li>' +\n        '<li>USASpending.gov federal contracts</li>' +\n        '<li>MuckRock FOIA database</li>' +\n        '<li>ACLU litigation records</li>' +\n        '<li>GAO investigative reports</li>' +\n        '<li>Local news & academic research</li>' +\n        '<li>NewsAPI surveillance coverage</li>' +\n      '</ul>', '#60a5fa') +\n    aboutCard('\\u2139\\uFE0F Risk Levels',\n      '<div style=\"display:grid;gap:8px\">' +\n        riskRow('RED','#ff2d2d','Active deployment, known contract, confirmed use') +\n        riskRow('ORANGE','#ff8c00','Confirmed use, no current contract on file') +\n        riskRow('YELLOW','#ffd700','Reported, unconfirmed, or historical use') +\n        riskRow('GREEN','#00c853','Local ban or strong legal restriction passed') +\n      '</div>', '#fbbf24') +\n    aboutCard('\\u26A0\\uFE0F Wrongful Arrests',\n      '<p style=\"color:#64748b;font-size:12px;margin:0 0 10px\">Documented FRT misidentification cases:</p>' +\n        wrongfulCase('Robert Williams','Detroit, MI','2020','DataWorks Plus \u2014 Wrongful arrest, charges dropped') +\n        wrongfulCase('Michael Oliver','Detroit, MI','2019','DataWorks Plus \u2014 Wrongful arrest') +\n        wrongfulCase('Nijeer Parks','NJ','2019','Facial recognition error, 10 days jailed') +\n        wrongfulCase('Randal Reid','GA','2022','Wrongful arrest, wrong state, no prior record') +\n        wrongfulCase('Porcha Woodruff','Detroit, MI','2023','Arrested while 8 months pregnant'),\n      '#ef4444') +\n    aboutCard('\\uD83D\\uDEE1\\uFE0F Know Your Rights',\n      '<ul style=\"margin:0;padding-left:18px;line-height:2;color:#94a3b8\">' +\n        '<li>You have <strong style=\"color:#e2e8f0\">no legal obligation</strong> to submit to FRT</li>' +\n        '<li>Demand your attorney before answering questions</li>' +\n        '<li>Document badge numbers and officer names</li>' +\n        '<li>File FOIA requests for local surveillance contracts</li>' +\n        '<li>Contact ACLU or EFF for legal support</li>' +\n      '</ul>', '#a78bfa') +\n    aboutCard('\\uD83D\\uDD17 Resources',\n      '<div style=\"display:flex;flex-direction:column;gap:8px\">' +\n        resLink('EFF Atlas of Surveillance','https://atlasofsurveillance.org') +\n        resLink('ACLU Face Surveillance','https://www.aclu.org/issues/privacy-technology/surveillance-technologies/face-recognition-technology') +\n        resLink('Ban Facial Recognition','https://www.banfacialrecognition.com') +\n        resLink('MuckRock FOIA','https://www.muckrock.com') +\n        resLink('USASpending.gov','https://www.usaspending.gov') +\n        resLink('Electronic Frontier Foundation','https://www.eff.org') +\n      '</div>', '#34d399') +\n    '</div></div>';\n\n  cp.innerHTML = html;\n}\n\nfunction statCard(val, label, color) {\n  return '<div style=\"background:#0d1526;border:1px solid ' + color + '30;border-radius:10px;padding:14px;text-align:center\">' +\n    '<div style=\"font-size:22px;font-weight:900;color:' + color + '\">' + val + '</div>' +\n    '<div style=\"font-size:9px;color:#64748b;margin-top:3px;letter-spacing:0.5px\">' + label + '</div>' +\n  '</div>';\n}\n\nfunction aboutCard(title, body, color) {\n  return '<div style=\"background:#0d1526;border:1px solid ' + color + '20;border-radius:12px;padding:20px\">' +\n    '<div style=\"font-size:14px;font-weight:700;color:#e2e8f0;margin-bottom:12px;border-bottom:1px solid ' + color + '30;padding-bottom:8px\">' + title + '</div>' +\n    '<div style=\"font-size:12px;color:#94a3b8;line-height:1.6\">' + body + '</div>' +\n  '</div>';\n}\n\nfunction riskRow(level, color, desc) {\n  return '<div style=\"display:flex;align-items:center;gap:8px\">' +\n    '<span style=\"background:' + color + '20;color:' + color + ';font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;min-width:52px;text-align:center\">' + level + '</span>' +\n    '<span style=\"font-size:11px;color:#94a3b8\">' + desc + '</span>' +\n  '</div>';\n}\n\nfunction wrongfulCase(name, location, year, detail) {\n  return '<div style=\"border-left:2px solid #ef4444;padding:4px 0 4px 10px;margin-bottom:6px\">' +\n    '<div style=\"font-size:12px;font-weight:600;color:#e2e8f0\">' + name + ' \\u2014 ' + location + '</div>' +\n    '<div style=\"font-size:11px;color:#64748b\">' + year + ' \\u00b7 ' + detail + '</div>' +\n  '</div>';\n}\n\nfunction resLink(label, url) {\n  return '<a href=\"' + url + '\" target=\"_blank\" rel=\"noopener\" style=\"color:#60a5fa;font-size:12px;text-decoration:none;display:flex;align-items:center;gap:6px\">' +\n    '\\u2192 ' + label + '</a>';\n}\n\n// ===== UTILITIES =====\nfunction formatDate(dateStr) {\n  if (!dateStr) return 'Unknown';\n  try {\n    var d = new Date(dateStr);\n    if (isNaN(d.getTime())) return dateStr;\n    return d.toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });\n  } catch(e) { return dateStr; }\n}\n\nfunction formatNum(n) {\n  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';\n  if (n >= 1000) return (n/1000).toFixed(0) + 'K';\n  return Number(n).toLocaleString();\n}\n\nfunction showToast(msg) {\n  var t = document.getElementById('toast');\n  if (!t) return;\n  t.textContent = msg;\n  t.classList.add('show');\n  setTimeout(function() { t.classList.remove('show'); }, 2500);\n}\n\n// ===== BTC MODAL =====\nvar modalQrRendered = false;\nvar modalDataLoaded = false;\n\nfunction openBtcModal() {\n  var m = document.getElementById('btc-modal-overlay');\n  if (m) { m.style.display = 'flex'; if (!modalDataLoaded) { loadModalMempoolData(); renderModalQR(); modalDataLoaded = true; } }\n}\nfunction closeBtcModal() {\n  var m = document.getElementById('btc-modal-overlay');\n  if (m) m.style.display = 'none';\n}\nfunction renderModalQR() {\n  if (modalQrRendered) return;\n  // Try canvas first (direct), then wrapper div fallback\n  var canvas = document.getElementById('modal-qr-canvas');\n  var wrapper = document.getElementById('modal-qr-wrapper');\n  var el = wrapper || canvas;\n  if (!el) { setTimeout(renderModalQR, 300); return; }\n  // Make sure QRCode lib is loaded\n  if (typeof QRCode === 'undefined') { setTimeout(renderModalQR, 400); return; }\n  try {\n    // Clear any existing content first\n    el.innerHTML = '';\n    var qrOpts = {\n      text: BTC_ADDRESS,\n      width: 148,\n      height: 148,\n      colorDark: '#000000',\n      colorLight: '#ffffff'\n    };\n    // Only add correctLevel if the library exposes it (qrcodejs vs qrcode differ)\n    if (typeof QRCode.CorrectLevel !== 'undefined') {\n      qrOpts.correctLevel = QRCode.CorrectLevel.H;\n    }\n    new QRCode(el, qrOpts);\n    modalQrRendered = true;\n  } catch(e) {\n    console.error('QR error:', e);\n    setTimeout(renderModalQR, 500);\n  }\n}\nasync function loadModalMempoolData() {\n  function satsToBtc(s) { return (s / 100000000).toFixed(6); }\n  try {\n    var r = await fetch('https://mempool.space/api/address/' + BTC_ADDRESS);\n    if (!r.ok) throw new Error('Mempool HTTP ' + r.status);\n    var data = await r.json();\n    var recv  = (data.chain_stats.funded_txo_sum  || 0) + (data.mempool_stats.funded_txo_sum  || 0);\n    var spent = (data.chain_stats.spent_txo_sum   || 0) + (data.mempool_stats.spent_txo_sum   || 0);\n    var txCount = (data.chain_stats.tx_count      || 0) + (data.mempool_stats.tx_count        || 0);\n\n    // Update individual stat elements (matching HTML IDs)\n    var recvEl  = document.getElementById('m-btc-recv');\n    var balEl   = document.getElementById('m-btc-bal');\n    var txnsEl  = document.getElementById('m-btc-txns');\n    if (recvEl)  recvEl.textContent  = satsToBtc(recv) + ' BTC';\n    if (balEl)   balEl.textContent   = satsToBtc(recv - spent) + ' BTC';\n    if (txnsEl)  txnsEl.textContent  = txCount;\n\n    // Recent transactions \u2014 HTML uses id=\"modal-txn-list\"\n    var txEl = document.getElementById('modal-txn-list');\n    if (txEl) {\n      if (txCount > 0) {\n        txEl.innerHTML = '<div style=\"font-size:11px;color:#64748b;text-align:center;padding:4px 0\">Fetching transactions...</div>';\n        try {\n          var txs = await (await fetch('https://mempool.space/api/address/' + BTC_ADDRESS + '/txs')).json();\n          if (txs.length === 0) {\n            txEl.innerHTML = '<p style=\"color:#64748b;font-size:11px;text-align:center\">No transactions yet.</p>';\n          } else {\n            txEl.innerHTML = txs.slice(0, 5).map(function(tx) {\n              // Find output to our address\n              var ourOut = tx.vout.find(function(o) { return o.scriptpubkey_address === BTC_ADDRESS; });\n              var val = ourOut ? ourOut.value : tx.vout.reduce(function(s,o){return s+o.value;},0);\n              var conf = tx.status && tx.status.confirmed;\n              var date = conf && tx.status.block_time ? new Date(tx.status.block_time*1000).toLocaleDateString() : 'Unconfirmed';\n              return '<div style=\"display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.06)\">' +\n                '<div>' +\n                  '<div style=\"font-family:monospace;font-size:9px;color:#64748b\">' + tx.txid.substring(0,14) + '...</div>' +\n                  '<div style=\"font-size:9px;color:' + (conf ? '#4ade80' : '#fbbf24') + '\">' + date + '</div>' +\n                '</div>' +\n                '<div style=\"font-size:11px;font-weight:700;color:#f7931a\">' + satsToBtc(val) + ' BTC</div>' +\n              '</div>';\n            }).join('');\n          }\n        } catch(txErr) {\n          txEl.innerHTML = '<p style=\"color:#64748b;font-size:11px;text-align:center\">Could not load transactions.</p>';\n        }\n      } else {\n        txEl.innerHTML = '<p style=\"color:#64748b;font-size:11px;text-align:center;padding:8px 0\">No transactions yet \u2014 be the first! :)</p>';\n      }\n    }\n  } catch(e) {\n    console.error('Mempool error:', e);\n    var txEl = document.getElementById('modal-txn-list');\n    if (txEl) txEl.innerHTML = '<p style=\"color:#ef4444;font-size:11px;text-align:center\">Could not reach mempool.space</p>';\n  }\n}\nfunction copyModalAddr() {\n  navigator.clipboard.writeText(BTC_ADDRESS).then(function() {\n    var btn = document.getElementById('modal-copy-btn');\n    if (btn) { var orig = btn.textContent; btn.textContent = 'Copied!'; btn.classList.add('copied'); setTimeout(function(){ btn.textContent = orig; btn.classList.remove('copied'); }, 2000); }\n  }).catch(function() {\n    var el = document.getElementById('modal-addr-display');\n    if (el) { var r = document.createRange(); r.selectNode(el); window.getSelection().removeAllRanges(); window.getSelection().addRange(r); }\n  });\n}\nfunction copyAddrFromAbout() {\n  navigator.clipboard.writeText(BTC_ADDRESS).catch(function(){});\n  showToast('\\u20bf Bitcoin address copied!');\n}\n\ndocument.addEventListener('keydown', function(e) { if (e.key === 'Escape') { closeModal(); closeBtcModal(); } });\ndocument.addEventListener('click', function(e) { if (e.target.id === 'modal-overlay') closeModal(); });\n\n// ===== BOOTSTRAP =====\nasync function initApp() {\n  fhmLog('FaceHeatMap v13.fix4 booting...');\n  try { initMap(); } catch(e) { fhmError('initMap: ' + e.message, 'INIT'); }\n  try { await loadData(); } catch(e) { fhmError('loadData: ' + e.message, 'INIT'); }\n  try { renderAll(); animateCounters(); checkUrlParams(); fhmLog('Boot complete \u2014 ' + allEntries.length + ' entries'); } catch(e) { fhmError('renderAll: ' + e.message, 'INIT'); }\n}\n\n\n// ===== // ===== BOTTOM SHEET CONTROLLER v2 =====\n(function(){\nvar sheet=null,startY=0,curT=0,dragging=false,state='half';\n// States: 'peek' | 'half' | 'full'\nvar PEEK_PX=80,HALF_FRAC=0.42,VEL_THRESH=40;\n\nfunction fhmLog(msg){\n  var ts=new Date().toISOString().slice(11,23);\n  console.log('[BSC '+ts+'] '+msg);\n}\nfunction fhmBsError(msg){\n  console.error('[BSC-ERR] '+msg);\n  try{fetch('/api/error',{method:'POST',headers:{'Content-Type':'application/json'},\n    body:JSON.stringify({type:'BottomSheetError',msg:msg,url:window.location.href,ua:navigator.userAgent.slice(0,80)})\n  }).catch(function(){});}catch(e){}\n}\n\nfunction isMobPort(){\n  var w=window.innerWidth,h=window.innerHeight;\n  return w<=767&&h>w;\n}\n\nfunction snapTo(newState,animate){\n  if(!sheet){fhmBsError('snapTo: no sheet el');return;}\n  var h=window.innerHeight;\n  var target;\n  if(newState==='full') target=0;\n  else if(newState==='half') target=h-(h*HALF_FRAC);\n  else target=h-PEEK_PX;\n  state=newState;\n  if(animate){\n    sheet.style.transition='transform 0.32s cubic-bezier(0.32,0.72,0,1)';\n  } else {\n    sheet.style.transition='none';\n  }\n  sheet.style.transform='translateY('+target+'px)';\n  sheet.dataset.state=newState;\n  fhmLog('snap→'+newState+' transform=translateY('+Math.round(target)+'px)');\n  setTimeout(function(){\n    sheet.style.transition='';\n    if(window.leafletMap){\n      window.leafletMap.invalidateSize(true);\n      fhmLog('map resized after snap');\n    }\n  },360);\n}\n\nfunction onTouchStart(e){\n  if(!isMobPort())return;\n  var h=window.innerHeight;\n  startY=e.touches[0].clientY;\n  dragging=true;\n  if(state==='full') curT=0;\n  else if(state==='half') curT=h-(h*HALF_FRAC);\n  else curT=h-PEEK_PX;\n  sheet.style.transition='none';\n  fhmLog('touchstart y='+startY+' curT='+Math.round(curT)+' state='+state);\n}\n\nfunction onTouchMove(e){\n  if(!dragging)return;\n  e.preventDefault();\n  var delta=e.touches[0].clientY-startY;\n  var newT=Math.min(Math.max(0,curT+delta),window.innerHeight-PEEK_PX);\n  sheet.style.transform='translateY('+newT+'px)';\n}\n\nfunction onTouchEnd(e){\n  if(!dragging)return;\n  dragging=false;\n  var endY=e.changedTouches[0].clientY;\n  var vel=endY-startY; // positive = dragged down\n  fhmLog('touchend vel='+Math.round(vel)+' state='+state);\n  \n  if(vel<-VEL_THRESH){\n    // dragged UP\n    if(state==='peek')snapTo('half',true);\n    else if(state==='half')snapTo('full',true);\n    else snapTo('full',true);\n  } else if(vel>VEL_THRESH){\n    // dragged DOWN\n    if(state==='full')snapTo('half',true);\n    else if(state==='half')snapTo('peek',true);\n    else snapTo('peek',true);\n  } else {\n    // small movement: snap back to current\n    snapTo(state,true);\n  }\n}\n\nfunction initSheet(){\n  fhmLog('initSheet called, isMobPort='+isMobPort());\n  sheet=document.getElementById('bottom-sheet');\n  var handle=document.getElementById('sheet-handle');\n  if(!sheet){fhmBsError('bottom-sheet el not found');return;}\n  if(!handle){fhmBsError('sheet-handle el not found');return;}\n  \n  if(!isMobPort()){\n    fhmLog('not mobile portrait, sheet stays desktop');\n    sheet.style.transform='';\n    sheet.style.transition='';\n    sheet.dataset.state='desktop';\n    return;\n  }\n\n  fhmLog('attaching touch listeners');\n  \n  // Attach to handle\n  handle.addEventListener('touchstart',onTouchStart,{passive:false});\n  handle.addEventListener('touchmove',onTouchMove,{passive:false});\n  handle.addEventListener('touchend',onTouchEnd,{passive:false});\n  \n  // Attach to sheet header area (not scrollable list)\n  var hdr=sheet.querySelector('.sidebar-hdr');\n  var searchWrap=sheet.querySelector('.search-wrap');\n  var filterWrap=sheet.querySelector('.filter-wrap');\n  [hdr,searchWrap,filterWrap].forEach(function(el){\n    if(!el)return;\n    el.addEventListener('touchstart',onTouchStart,{passive:false});\n    el.addEventListener('touchmove',onTouchMove,{passive:false});\n    el.addEventListener('touchend',onTouchEnd,{passive:false});\n  });\n\n  // Double-tap handle to cycle\n  var lastTap=0;\n  handle.addEventListener('touchend',function(e){\n    var n=Date.now();\n    if(n-lastTap<280){\n      e.preventDefault();\n      if(state==='full')snapTo('peek',true);\n      else if(state==='half')snapTo('full',true);\n      else snapTo('half',true);\n    }\n    lastTap=n;\n  });\n\n  // START at half state (show bottom 42% of screen)\n  fhmLog('mounting at half state');\n  snapTo('half',false);\n  \n  // After a short delay, animate to half for the polish effect\n  setTimeout(function(){snapTo('half',true);},80);\n}\n\nwindow.addEventListener('orientationchange',function(){\n  setTimeout(function(){\n    fhmLog('orientationchange fired isMobPort='+isMobPort());\n    if(!sheet)return;\n    if(!isMobPort()){\n      sheet.style.transform='';\n      sheet.style.transition='';\n      sheet.dataset.state='desktop';\n      if(window.leafletMap)window.leafletMap.invalidateSize(true);\n    } else {\n      state='half';\n      snapTo('half',true);\n    }\n  },400);\n});\n\nwindow.addEventListener('resize',function(){\n  if(!sheet||!isMobPort())return;\n  // Recalculate position on resize (keyboard open/close etc)\n  snapTo(state,false);\n});\n\nif(document.readyState==='loading'){\n  document.addEventListener('DOMContentLoaded',initSheet);\n} else {\n  initSheet();\n}\n\n// Expose for external use\nwindow.fhmBottomSheet={snapTo:snapTo,getState:function(){return state;}};\nfhmLog('bottom sheet controller registered');\n})();\n// ===== END BOTTOM SHEET CONTROLLER v2 =====c\n// ===== PERFORMANCE + RESOURCE ERROR LOGGING =====\n(function(){\n  if(window.PerformanceObserver){\n    try{\n      var po=new PerformanceObserver(function(list){\n        list.getEntries().forEach(function(entry){\n          if(entry.duration>3000){\n            fhmError('Slow resource: '+entry.name+' '+Math.round(entry.duration)+'ms','PERF_SLOW');\n          }\n        });\n      });\n      po.observe({entryTypes:['resource']});\n    }catch(e){}\n  }\n  window.addEventListener('error',function(e){\n    if(e.target&&(e.target.tagName==='IMG'||e.target.tagName==='SCRIPT'||e.target.tagName==='LINK')){\n      fhmError('Resource load failed: '+(e.target.src||e.target.href||'unknown'),'RESOURCE_ERROR');\n    }\n  },true);\n  document.addEventListener('DOMContentLoaded',function(){\n    setTimeout(function(){\n      if(window.leafletMap){\n        window.leafletMap.on('error',function(e){\n          fhmError('Leaflet error: '+JSON.stringify(e),'MAP_ERROR');\n        });\n      }\n    },2000);\n  });\n  console.log('[FHM] E2E error reporting active');\n})();\n// ===== END PERFORMANCE LOGGING =====\ndocument.addEventListener('DOMContentLoaded', function() { initApp(); });\n";

function buildJS() {
  return _APP_JS;
}

async function buildFullHTML(entries, federalContracts, recentNews, stats) {
  const { totalEntries, redCount, orangeCount, greenCount, yellowCount } = stats;
  
  const vendorInfoJSON = JSON.stringify(VENDOR_INFO);
  const stateLawsJSON = JSON.stringify(STATE_LAWS);

  const cssStr = buildCSS();
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">

<!-- ===== PRIMARY SEO ===== -->
<title>Facial Recognition Surveillance Tracker USA — FaceHeatMap</title>
<meta name="description" content="FaceHeatMap tracks government facial recognition deployments across the US. ${totalEntries} agencies mapped with vendor data, federal contracts, wrongful arrest records, and state law analysis. Free, open OSINT tool.">
<meta name="keywords" content="facial recognition surveillance, government face recognition tracker, US law enforcement biometrics, Clearview AI map, facial recognition database USA, surveillance state map, OSINT facial recognition, biometric surveillance tracker, police face recognition database, civil liberties surveillance tool, who uses facial recognition, facial recognition by state, federal facial recognition contracts, EFF surveillance atlas alternative, facial recognition wrongful arrests">
<meta name="language" content="en-US">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta name="author" content="VPDLNY — Vulnerable Persons Defense League of New York">

<!-- ===== AI CRAWLER ACCESS (2026 AEO) ===== -->
<meta name="GPTBot" content="index, follow">
<meta name="Claude-Web" content="index, follow">
<meta name="perplexity-bot" content="index, follow">
<meta name="CCBot" content="index, follow">
<meta name="Google-Extended" content="index, follow">
<meta name="Amazonbot" content="index, follow">

<!-- ===== CANONICAL + HREFLANG ===== -->
<link rel="canonical" href="https://faceheatmap.app/">
<link rel="alternate" hreflang="en" href="https://faceheatmap.app/">
<link rel="alternate" hreflang="x-default" href="https://faceheatmap.app/">

<!-- ===== OPEN GRAPH ===== -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://faceheatmap.app/">
<meta property="og:site_name" content="FaceHeatMap USA">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="Facial Recognition Surveillance Tracker USA — FaceHeatMap">
<meta property="og:description" content="FaceHeatMap maps ${totalEntries} US government facial recognition deployments. Vendors, contracts, wrongful arrests, state laws — free open OSINT tool by VPDLNY.">
<meta property="og:image" content="https://faceheatmap.app/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="FaceHeatMap USA — US government facial recognition surveillance heatmap showing ${totalEntries} active deployments across all 50 states">
<meta property="og:image:type" content="image/png">
<meta property="article:published_time" content="2026-04-30T00:00:00Z">
<meta property="article:modified_time" content="2026-05-01T00:00:00Z">
<meta property="article:section" content="Civil Liberties">
<meta property="article:tag" content="facial recognition">
<meta property="article:tag" content="surveillance">
<meta property="article:tag" content="OSINT">
<meta property="article:tag" content="civil rights">

<!-- ===== TWITTER/X CARD ===== -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@indicaindependent">
<meta name="twitter:creator" content="@indicaindependent">
<meta name="twitter:title" content="FaceHeatMap — US Facial Recognition Surveillance Tracker">
<meta name="twitter:description" content="${totalEntries} US agencies using facial recognition — mapped, sourced, and searchable. Free OSINT tool tracking government biometric surveillance.">
<meta name="twitter:image" content="https://faceheatmap.app/og.png">
<meta name="twitter:image:alt" content="FaceHeatMap USA surveillance heatmap">
<meta name="twitter:label1" content="Agencies Tracked">
<meta name="twitter:data1" content="${totalEntries} and growing">
<meta name="twitter:label2" content="Data Updated">
<meta name="twitter:data2" content="Weekly">

<!-- ===== PWA ===== -->
<meta name="theme-color" content="#060a14">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="FaceHeatMap">
<meta name="application-name" content="FaceHeatMap">

<!-- ===== PERFORMANCE: PRECONNECT ===== -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://unpkg.com">
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="preconnect" href="https://mempool.space">
<link rel="dns-prefetch" href="https://a.basemaps.cartocdn.com">
<link rel="dns-prefetch" href="https://www.googletagmanager.com">

<!-- ===== FONTS ===== -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">

<!-- ===== STRUCTURED DATA: JSON-LD ===== -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://faceheatmap.app/#website",
      "name": "FaceHeatMap USA",
      "alternateName": ["FaceHeatMap", "Face Heat Map USA", "US Facial Recognition Tracker"],
      "url": "https://faceheatmap.app/",
      "description": "Free open-source intelligence (OSINT) tool tracking government use of facial recognition technology across all 50 US states. Includes agency data, vendor profiles, federal contracts, wrongful arrest records, and state law analysis.",
      "inLanguage": "en-US",
      "datePublished": "2026-04-01",
      "dateModified": "2026-05-01",
      "keywords": "facial recognition, surveillance, OSINT, civil liberties, biometrics, law enforcement technology, Clearview AI, government surveillance",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://faceheatmap.app/?tab=map&q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://faceheatmap.app/#organization",
      "name": "VPDLNY — Vulnerable Persons Defense League of New York",
      "url": "https://faceheatmap.app/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://faceheatmap.app/og.png",
        "width": 1200,
        "height": 630
      },
      "description": "VPDLNY is a collective of technologists and artists who use information and knowledge to defend vulnerable and marginalized people. FaceHeatMap is our flagship civil liberties transparency tool.",
      "foundingDate": "2026",
      "knowsAbout": [
        "Facial Recognition Technology",
        "Government Surveillance",
        "Civil Liberties",
        "OSINT",
        "Biometric Data",
        "Law Enforcement Technology",
        "Privacy Rights",
        "First Amendment",
        "FOIA Research"
      ],
      "sameAs": [
        "https://bsky.app/profile/indicaindependent.bsky.social"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "contact@faceheatmap.app",
        "contactType": "General Inquiry"
      }
    },
    {
      "@type": "Dataset",
      "@id": "https://faceheatmap.app/#dataset",
      "name": "US Government Facial Recognition Deployments Database",
      "description": "Comprehensive database of ${totalEntries} US government and law enforcement agencies using facial recognition technology. Includes agency names, vendors, contract values, geographic coordinates, risk classifications, and source citations.",
      "url": "https://faceheatmap.app/",
      "creator": { "@id": "https://faceheatmap.app/#organization" },
      "dateModified": "2026-05-01",
      "license": "https://creativecommons.org/licenses/by-nc/4.0/",
      "keywords": ["facial recognition", "surveillance", "law enforcement", "biometrics", "OSINT"],
      "spatialCoverage": {
        "@type": "Place",
        "name": "United States of America"
      },
      "variableMeasured": [
        "Agency Count", "Contract Values", "Vendor Distribution", "Geographic Coverage", "Risk Level Classification"
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://faceheatmap.app/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is FaceHeatMap?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "FaceHeatMap is a free, open-source intelligence (OSINT) tool that tracks government use of facial recognition technology across the United States. It maps ${totalEntries} law enforcement agencies and government bodies using FRT, along with vendor data, federal contracts, wrongful arrest records, and state privacy laws. It was built by VPDLNY (Vulnerable Persons Defense League of New York) to promote transparency and civil liberties."
          }
        },
        {
          "@type": "Question",
          "name": "Which agencies use facial recognition technology in the US?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "FaceHeatMap tracks ${totalEntries} US agencies using facial recognition, including federal agencies (FBI FACE Services, ICE, CBP), state police departments across all 50 states, and hundreds of local police departments. Major vendors include Clearview AI (17 tracked agencies), Idemia (13 agencies), NEC, Veritone, DataWorks Plus, LACRIS, and Palantir. Some jurisdictions like Illinois, Oregon, Maine, and Washington have strong legal restrictions."
          }
        },
        {
          "@type": "Question",
          "name": "Has facial recognition caused wrongful arrests in the US?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. FaceHeatMap documents five confirmed wrongful arrest cases caused by facial recognition errors: Robert Williams (Detroit, 2020, DataWorks Plus), Michael Oliver (Detroit, 2019), Nijeer Parks (New Jersey, 2019), Randal Reid (Georgia, 2022), and Porcha Woodruff (Detroit, 2023, arrested while 8 months pregnant). These cases disproportionately affected Black Americans and led to ACLU litigation."
          }
        },
        {
          "@type": "Question",
          "name": "Which states have banned facial recognition?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Several US states have strong facial recognition restrictions. Illinois (BIPA, 2008) has the strictest law with a private right of action. Oregon (HB 3202, 2021) bans state agencies from using FRT. Maine (Maine Act, 2021) bans all government use. Washington (HB 1493, 2023) requires warrants for law enforcement use. Cities including Boston, Cambridge, San Francisco, Oakland, and Seattle have local bans."
          }
        },
        {
          "@type": "Question",
          "name": "How does Clearview AI work and why is it controversial?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Clearview AI scraped over 30 billion faces from the public internet without consent and sells access to law enforcement. It is used by ICE (with a known $9.2M contract in 2025), and over 600 US law enforcement agencies. It has been banned for commercial use in Illinois, Texas, Washington, and California. It paid a $6.75M settlement in Texas. FaceHeatMap tracks 17 confirmed Clearview AI deployments."
          }
        },
        {
          "@type": "Question",
          "name": "Where does FaceHeatMap get its data?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "FaceHeatMap sources data from the EFF Atlas of Surveillance, USASpending.gov federal contracts, MuckRock FOIA database, ACLU litigation records, GAO investigative reports, local news investigations, and academic research. All entries include source citations. The database is updated regularly through an automated intelligence pipeline."
          }
        },
        {
          "@type": "Question",
          "name": "Is FaceHeatMap data free to use?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "FaceHeatMap is completely free to use. The tool is open-source and built for public interest journalism, civil rights advocacy, academic research, and public awareness. The data is compiled from public records, government databases, and FOIA disclosures. We ask that users cite FaceHeatMap when using data in published work."
          }
        },
        {
          "@type": "Question",
          "name": "Do I have to submit to facial recognition if police ask?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You have no legal obligation to submit to facial recognition technology. You have the right to demand your attorney before answering questions, document badge numbers and officer names, file FOIA requests for local surveillance contracts, and contact the ACLU or EFF for legal support. Laws vary by state — Illinois, Oregon, and Maine have the strongest protections."
          }
        }
      ]
    }
  ]
}
</script>

<!-- ===== LEAFLET + DEPENDENCIES ===== -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
<script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
<style>
` + cssStr + `
.leaflet-tooltip-dark{background:rgba(6,10,20,0.95);border:1px solid #1e2a45;color:#dde4f0;font-size:12px;padding:7px 10px;border-radius:7px;box-shadow:0 4px 12px rgba(0,0,0,0.4);font-family:'Inter',sans-serif}
.leaflet-tooltip-dark::before{display:none}
/* ===== ABOUT DONATION CARD ===== */
.btc-donate-card{
  margin:24px 0 8px;
  background:linear-gradient(135deg,rgba(247,147,26,0.06) 0%,rgba(12,20,34,0.95) 60%);
  border:1px solid rgba(247,147,26,0.25);
  border-radius:16px;padding:24px;
  box-shadow:0 4px 24px rgba(247,147,26,0.08)
}
.btc-donate-inner{display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap}
.btc-donate-title{font-size:16px;font-weight:800;color:#fff;margin:0 0 8px;letter-spacing:-0.2px}
.btc-donate-why{font-size:12px;color:rgba(255,255,255,0.55);line-height:1.6;margin:0 0 14px}
.btc-donate-right{display:flex;flex-direction:column;align-items:center;gap:10px}
.btc-qr-frame{
  width:152px;height:152px;
  background:#fff;border-radius:10px;
  padding:8px;display:flex;align-items:center;justify-content:center;
  flex-shrink:0;overflow:hidden;
  box-shadow:0 0 0 1px rgba(247,147,26,0.15),0 4px 16px rgba(0,0,0,0.4)
}
#about-qr-img{display:block;border-radius:4px}
.btc-addr-row{
  display:flex;align-items:center;gap:6px;
  background:rgba(255,255,255,0.04);
  border:1px solid rgba(255,255,255,0.08);
  border-radius:8px;padding:6px 10px;max-width:200px
}
.btc-addr-text{
  font-family:monospace;font-size:9px;
  color:rgba(255,255,255,0.7);
  word-break:break-all;flex:1;line-height:1.4
}
.btc-addr-copy{
  background:none;border:none;color:rgba(247,147,26,0.7);
  cursor:pointer;padding:2px;flex-shrink:0;
  transition:color 0.2s
}
.btc-addr-copy:hover{color:#f7931a}
.btc-copy-confirm{
  font-size:10px;color:#4ade80;font-weight:700;
  height:14px;opacity:0;transition:opacity 0.3s
}
.btc-copy-confirm.show{opacity:1}
@media(max-width:600px){
  .btc-donate-inner{flex-direction:column;align-items:center}
  .btc-donate-right{width:100%;align-items:center}
  .btc-addr-row{max-width:240px}
  .btc-qr-frame canvas{width:120px !important;height:120px !important}
}

</style>
</head>
<body>

<!-- ===== CONSENT MODAL (shown to new users / new month sessions) ===== -->
<div id="consent-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(4px)">
  <div style="background:#0d1526;border:1px solid #ef444440;border-radius:16px;max-width:620px;width:100%;max-height:90vh;overflow-y:auto;padding:32px;position:relative">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
      <div style="width:48px;height:48px;background:#ef444420;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0">⚖️</div>
      <div>
        <div style="font-size:20px;font-weight:800;color:#e2e8f0">Before You Continue</div>
        <div style="font-size:12px;color:#64748b">FaceHeatMap requires your agreement to these terms</div>
      </div>
    </div>

    <div style="background:#0f172a;border-radius:10px;padding:16px;margin-bottom:20px;font-size:12px;color:#94a3b8;line-height:1.7;max-height:220px;overflow-y:auto;border:1px solid #1e293b">
      <div style="font-weight:700;color:#e2e8f0;margin-bottom:8px">What is FaceHeatMap?</div>
      FaceHeatMap is a free, open-source intelligence (OSINT) research tool that aggregates <strong style="color:#e2e8f0">publicly available information</strong> about government use of facial recognition technology in the United States. All data is sourced from public records, government databases, FOIA disclosures, court documents, and published journalism.
      <br><br>
      <div style="font-weight:700;color:#e2e8f0;margin-bottom:8px">Important Limitations</div>
      Data may be incomplete, outdated, or contain errors. This tool is for <strong style="color:#fbbf24">educational and public interest research only</strong>. We make no warranties about accuracy or completeness.
    </div>

    <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:24px">
      <label style="display:flex;gap:12px;align-items:flex-start;cursor:pointer;padding:12px;background:#0f172a;border-radius:8px;border:1px solid #1e293b" id="cb1-label">
        <input type="checkbox" id="consent-tos" onchange="checkConsent()" style="width:18px;height:18px;margin-top:1px;accent-color:#ef4444;flex-shrink:0">
        <span style="font-size:12px;color:#cbd5e1;line-height:1.6">I have read and agree to the <a href="/terms" target="_blank" style="color:#60a5fa">Terms of Service</a>. I understand this tool provides <strong>publicly sourced OSINT data for educational and research purposes only</strong>.</span>
      </label>

      <label style="display:flex;gap:12px;align-items:flex-start;cursor:pointer;padding:12px;background:#0f172a;border-radius:8px;border:1px solid #1e293b" id="cb2-label">
        <input type="checkbox" id="consent-privacy" onchange="checkConsent()" style="width:18px;height:18px;margin-top:1px;accent-color:#ef4444;flex-shrink:0">
        <span style="font-size:12px;color:#cbd5e1;line-height:1.6">I have read and agree to the <a href="/privacy" target="_blank" style="color:#60a5fa">Privacy Policy</a>. I understand how my data is handled and my rights under applicable privacy laws.</span>
      </label>

      <label style="display:flex;gap:12px;align-items:flex-start;cursor:pointer;padding:12px;background:#0f172a;border-radius:8px;border:1px solid #1e293b" id="cb3-label">
        <input type="checkbox" id="consent-age" onchange="checkConsent()" style="width:18px;height:18px;margin-top:1px;accent-color:#ef4444;flex-shrink:0">
        <span style="font-size:12px;color:#cbd5e1;line-height:1.6">I confirm I am at least <strong>18 years of age</strong> and am accessing this tool for <strong>lawful educational, journalistic, or research purposes</strong>. I will not use this information to harass, stalk, or harm any individual.</span>
      </label>

      <label style="display:flex;gap:12px;align-items:flex-start;cursor:pointer;padding:12px;background:#0f172a;border-radius:8px;border:1px solid #1e293b" id="cb4-label">
        <input type="checkbox" id="consent-disclaimer" onchange="checkConsent()" style="width:18px;height:18px;margin-top:1px;accent-color:#ef4444;flex-shrink:0">
        <span style="font-size:12px;color:#cbd5e1;line-height:1.6">I understand that <strong>FaceHeatMap is not a law firm</strong> and nothing on this site constitutes legal advice. I will seek qualified legal counsel for any legal matters.</span>
      </label>
    </div>

    <button id="consent-btn" onclick="acceptConsent()" disabled
      style="width:100%;padding:14px;background:#1e293b;color:#64748b;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:not-allowed;transition:all 0.2s">
      Please check all boxes above to continue
    </button>

    <div style="text-align:center;margin-top:12px;font-size:11px;color:#475569">
      By continuing you agree to our <a href="/terms" target="_blank" style="color:#64748b">Terms</a> &amp; <a href="/privacy" target="_blank" style="color:#64748b">Privacy Policy</a>. 
      This modal appears once per month. Contact: <a href="mailto:contact@faceheatmap.app" style="color:#64748b">contact@faceheatmap.app</a>
    </div>
  </div>
</div>

<script>
// ===== CONSENT SYSTEM =====
function getConsentKey() {
  var d = new Date();
  return 'fhm_consent_' + d.getFullYear() + '_' + (d.getMonth()+1);
}
function checkConsentNeeded() {
  try {
    if (!localStorage.getItem(getConsentKey())) {
      document.getElementById('consent-overlay').style.display = 'flex';
    }
  } catch(e) {}
}
function checkConsent() {
  var all = ['consent-tos','consent-privacy','consent-age','consent-disclaimer'].every(function(id) {
    return document.getElementById(id).checked;
  });
  var btn = document.getElementById('consent-btn');
  if (btn) {
    btn.disabled = !all;
    btn.style.background = all ? '#ef4444' : '#1e293b';
    btn.style.color = all ? '#ffffff' : '#64748b';
    btn.style.cursor = all ? 'pointer' : 'not-allowed';
    btn.textContent = all ? '✓ I Agree — Enter FaceHeatMap' : 'Please check all boxes above to continue';
  }
}
function acceptConsent() {
  try {
    localStorage.setItem(getConsentKey(), JSON.stringify({ ts: new Date().toISOString(), ua: navigator.userAgent.slice(0,100) }));
    document.getElementById('consent-overlay').style.display = 'none';
  } catch(e) {
    document.getElementById('consent-overlay').style.display = 'none';
  }
}
// Run on load
(function() { 
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkConsentNeeded);
  } else {
    checkConsentNeeded();
  }
})();
</script>


<header>
  <a class="logo" href="/" aria-label="FaceHeatMap Home">
    <div class="logo-icon">👁</div>
    <div>
      <div class="logo-text"><span>Face</span>HeatMap</div>
    </div>
  </a>
  <div class="header-tagline">Tracking US government facial recognition</div>
  <div class="live-badge"><div class="live-dot"></div>LIVE</div>
  <div class="stats-bar">
    <div class="stat-chip red"><div class="dot red"></div><div><span id="count-red" class="n" data-count="${redCount}">${redCount}</span><div class="lbl">RED</div></div></div>
    <div class="stat-chip orange"><div class="dot orange"></div><div><span id="count-orange" class="n" data-count="${orangeCount}">${orangeCount}</span><div class="lbl">ORANGE</div></div></div>
    <div class="stat-chip green"><div class="dot green"></div><div><span id="count-green" class="n" data-count="${greenCount}">${greenCount}</span><div class="lbl">SAFE</div></div></div>
    <div class="stat-chip total"><div><span id="count-total" class="n" data-count="${totalEntries}">${totalEntries}</span><div class="lbl">TOTAL</div></div></div>
  </div>
</header>

<div class="nav-tabs">
  <div class="tab active" data-tab="map" onclick="switchTab('map')"><span class="tab-icon">🗺</span>Heatmap</div>
  <div class="tab" data-tab="vendors" onclick="switchTab('vendors')"><span class="tab-icon">🏢</span>Vendors</div>
  <div class="tab" data-tab="contracts" onclick="switchTab('contracts')"><span class="tab-icon">📋</span>Contracts</div>
  <div class="tab" data-tab="timeline" onclick="switchTab('timeline')"><span class="tab-icon">📅</span>Timeline</div>
  <div class="tab" data-tab="laws" onclick="switchTab('laws')"><span class="tab-icon">⚖️</span>Laws</div>
  <div class="tab" data-tab="intel" onclick="switchTab('intel')"><span class="tab-icon">📡</span>Intel</div>
  <div class="tab" data-tab="about" onclick="switchTab('about')"><span class="tab-icon">ℹ</span>About</div>
</div>

<div class="main">

  <!-- MAP PAGE -->
  <div id="map-page">
    <div id="map">
      <div class="map-legend">
        <div class="legend-title">Risk Level</div>
        <div class="legend-item"><div class="legend-dot" style="background:#ff2d2d;box-shadow:0 0 6px #ff2d2d60"></div>RED — Active / Deployed</div>
        <div class="legend-item"><div class="legend-dot" style="background:#ff8c00"></div>ORANGE — Confirmed Use</div>
        <div class="legend-item"><div class="legend-dot" style="background:#ffd700"></div>YELLOW — Reported</div>
        <div class="legend-item"><div class="legend-dot" style="background:#00c853"></div>GREEN — Banned</div>
        <div class="legend-item"><div class="legend-dot" style="background:#3b82f6"></div>BLUE — Federal</div>
      </div>
      <div class="map-controls">
        <button class="map-ctrl-btn" onclick="leafletMap.setView([39.5,-98.35],4)">⊙ Reset View</button>
        <button class="map-ctrl-btn" id="cluster-btn" onclick="toggleCluster()">⊞ Cluster</button>
      </div>
    </div>
    <div class="sidebar" id="bottom-sheet">
      <div class="sheet-handle-bar" id="sheet-handle">
        <div class="handle-pill"></div>
        <span class="sheet-state-hint">▲ drag up for entries</span>
      </div>
      <div class="sidebar-hdr">
        <h2>📍 Surveillance Entries</h2>
        <p>Click an entry to view details & source</p>
      </div>
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input type="text" id="search-input" placeholder="Search city, agency, vendor..." oninput="setSearch(this.value)">
      </div>
      <div class="filter-wrap">
        <button class="fb active-f" data-filter="ALL" onclick="setFilter('ALL')">ALL</button>
        <button class="fb red-f" data-filter="RED" onclick="setFilter('RED')">🔴 RED</button>
        <button class="fb orange-f" data-filter="ORANGE" onclick="setFilter('ORANGE')">🟠 ORANGE</button>
        <button class="fb green-f" data-filter="GREEN" onclick="setFilter('GREEN')">🟢 BANNED</button>
      </div>
      <div class="count-bar" id="entry-count">Loading...</div>
      <div class="sidebar-list" id="sidebar-list">
        <div class="empty-state"><div class="icon">⏳</div><p>Loading entries...</p></div>
      </div>
    </div>
  </div>

  <!-- VENDORS PAGE -->
  <div id="page-vendors" class="page">
    <div>
      <div class="page-hdr">Surveillance Vendors</div>
      <div class="page-sub">Companies supplying facial recognition to US law enforcement</div>
    </div>
    <div class="vendor-grid" id="vendors-grid">
      <div class="empty-state"><p>Loading vendor data...</p></div>
    </div>
  </div>

  <!-- CONTRACTS PAGE -->
  <div id="page-contracts" class="page">
    <div>
      <div class="page-hdr">Federal Contracts</div>
      <div class="page-sub" id="contracts-total">Loading contracts...</div>
    </div>
    <div class="section">
      <table class="contracts-table">
        <thead>
          <tr>
            <th data-sort="vendor" onclick="sortContracts('vendor')">Vendor / Agency ↕</th>
            <th data-sort="amount" class="sorted" onclick="sortContracts('amount')">Amount ↕</th>
            <th>Location</th>
            <th data-sort="start_date" onclick="sortContracts('start_date')">Date ↕</th>
          </tr>
        </thead>
        <tbody id="contracts-tbody">
          <tr><td colspan="4" style="text-align:center;color:var(--muted);padding:30px">Loading...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- TIMELINE PAGE -->
  <div id="page-timeline" class="page">
    <div>
      <div class="page-hdr">Deployment Timeline</div>
      <div class="page-sub">Surveillance entries ordered by most recent</div>
    </div>
    <div class="section">
      <div class="timeline" id="timeline-container">
        <div class="empty-state"><p>Loading timeline...</p></div>
      </div>
    </div>
  </div>

  <!-- LAWS PAGE -->
  <div id="page-laws" class="page">
    <div>
      <div class="page-hdr">State Laws & Protections</div>
      <div class="page-sub">Facial recognition legislation across the US — sorted by protection strength</div>
    </div>
    <div class="laws-grid" id="laws-container">
      <div class="empty-state"><p>Loading...</p></div>
    </div>
  </div>

  <!-- INTEL FEED PAGE -->
  <div id="page-intel" class="page">
    <div>
      <div class="page-hdr">Intel Feed</div>
      <div class="page-sub">Latest surveillance news — updated weekly by automated pipeline</div>
    </div>
    <div class="intel-grid" id="intel-container">
      <div class="empty-state"><div class="icon">📡</div><p>Loading intel...</p></div>
    </div>
  </div>

  
  <!-- SUPPORT / BTC PAGE -->

<!-- ABOUT PAGE -->
  <div id="page-about" class="page">
    <div class="about-hero">
      <h1><span>Face</span>HeatMap USA</h1>
      <p>A free, open intelligence tool tracking government use of facial recognition technology across the United States. Built to defend civil liberties through transparency.</p>
      <div class="vpdlny-badge">
        <strong>VPDLNY</strong>
        <span>VPDLNY — info & knowledge as the weapon</span>
      </div>
    </div>
    <div class="about-grid">
      <div class="about-card">
        <h3>🎯 Mission</h3>
        <p>Facial recognition technology is being deployed against American communities with little oversight, no warrant requirements, and a documented record of wrongful arrests — especially against Black Americans.</p>
        <p style="margin-top:8px">FaceHeatMap exists to make this visible. Information is power.</p>
      </div>
      <div class="about-card">
        <h3>📊 Data Sources</h3>
        <ul>
          <li>EFF Atlas of Surveillance</li>
          <li>USASpending.gov federal contracts</li>
          <li>MuckRock FOIA database</li>
          <li>ACLU litigation records</li>
          <li>GAO investigative reports</li>
          <li>Local news & academic research</li>
          <li>NewsAPI surveillance coverage</li>
        </ul>
      </div>
      <div class="about-card">
        <h3>🚦 Risk Levels</h3>
        <table class="risk-table">
          <tr><td style="color:var(--red);font-weight:700">RED</td><td>Active deployment, known contract, confirmed use</td></tr>
          <tr><td style="color:var(--orange);font-weight:700">ORANGE</td><td>Confirmed use, no current contract on file</td></tr>
          <tr><td style="color:var(--yellow);font-weight:700">YELLOW</td><td>Reported, unconfirmed, or historical use</td></tr>
          <tr><td style="color:var(--green);font-weight:700">GREEN</td><td>Local ban or strong legal restriction passed</td></tr>
        </table>
      </div>
      <div class="about-card">
        <h3>⚠️ Wrongful Arrests</h3>
        <p>Documented FRT misidentification cases:</p>
        <ul style="margin-top:6px">
          <li><b>Robert Williams</b> — Detroit, 2020 (DataWorks Plus)</li>
          <li><b>Michael Oliver</b> — Detroit, 2019</li>
          <li><b>Nijeer Parks</b> — NJ, 2019</li>
          <li><b>Randal Reid</b> — GA, 2022</li>
          <li><b>Porcha Woodruff</b> — Detroit, 2023</li>
        </ul>
      </div>
      <div class="about-card">
        <h3>🛡️ Know Your Rights</h3>
        <ul>
          <li>You have no legal obligation to submit to FRT</li>
          <li>Demand your attorney before answering questions</li>
          <li>Document badge numbers and officer names</li>
          <li>File FOIA requests for local surveillance contracts</li>
          <li>Contact ACLU or EFF for legal support</li>
        </ul>
      </div>
      <div class="about-card">
        <h3>🔗 Resources</h3>
        <ul>
          <li><a href="https://atlasofsurveillance.org" target="_blank" style="color:var(--accent)">EFF Atlas of Surveillance</a></li>
          <li><a href="https://www.aclu.org/face-surveillance" target="_blank" style="color:var(--accent)">ACLU Face Surveillance</a></li>
          <li><a href="https://www.banfacialrecognition.com" target="_blank" style="color:var(--accent)">Ban Facial Recognition</a></li>
          <li><a href="https://www.muckrock.com" target="_blank" style="color:var(--accent)">MuckRock FOIA</a></li>
          <li><a href="https://usaspending.gov" target="_blank" style="color:var(--accent)">USASpending.gov</a></li>
        </ul>
      </div>
    </div>

    <!-- ── BTC DONATION CARD ── -->
    <div class="btc-donate-card">
      <div class="btc-donate-inner">
        <div class="btc-donate-text">
            <h3 class="btc-donate-title">Support FaceHeatMap</h3>
            <p class="btc-donate-why">This tool is free, ad-free, and VC-free. Hosting, data, and dev time cost real money. We only accept Bitcoin — no banks, no payment processors, no surveillance capitalism. Your sats keep this map running.</p>

          </div>
        
        <div class="btc-donate-right">
          <div class="btc-qr-frame">
            <img id="about-qr-img" src="/api/qr?size=272" width="136" height="136" alt="Bitcoin QR code" style="display:block;width:136px;height:136px;max-width:136px;max-height:136px;border-radius:4px;flex-shrink:0" />
          </div>
          <div class="btc-addr-row">
            <span class="btc-addr-text" id="about-addr-text">tips@skygive.app</span>
            <button class="btc-addr-copy" onclick="copyAboutAddr()" title="Copy address" aria-label="Copy Bitcoin address">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
            </button>
          </div>
          <div class="btc-copy-confirm" id="about-copy-confirm">✓ Copied!</div>
        </div>
      </div>
    </div>

  </div>




</div><!-- /main -->

<!-- MODAL -->
<div id="modal-overlay" class="modal-overlay">
  <div id="modal" class="modal"></div>
</div>

<!-- TOAST -->
<div id="toast" class="toast"></div>

<script>
window.VENDOR_INFO = ${vendorInfoJSON};
window.STATE_LAWS = ${stateLawsJSON};

const BTC_ADDRESS = 'tips@skygive.app';
</script>

<script src="/app.js?v=15">
function initAboutBtcCard(){
  // QR served as plain img from /api/qr — no JS needed, browser handles it
  var qrImg=document.getElementById('about-qr-img');
  if(qrImg){
    qrImg.onerror=function(){
      var addr='tips@skygive.app';
      qrImg.src='https://quickchart.io/qr?text='+encodeURIComponent('lightning:'+addr)+'&size=272&margin=2';
    };
  }
}
function copyAboutAddr(){
  const addr= + BTC_ADDR + ;
  navigator.clipboard.writeText(addr).then(()=>{
    const el=document.getElementById('about-copy-confirm');
    if(el){el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2000);}
  }).catch(()=>{
    const ta=document.createElement('textarea');
    ta.value=addr;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);
    const el=document.getElementById('about-copy-confirm');
    if(el){el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2000);}
  });
}
</script>
<!-- FLOATING BTC FAB -->
<!-- BTC MODAL TRIGGER -->
<!-- btc-fab removed: donate card on About page -->

<!-- BTC DONATION MODAL -->
<div id="btc-modal-overlay" class="btc-modal-overlay" onclick="if(event.target===this)closeBtcModal()">
  <div class="btc-modal">
    <div class="btc-modal-hdr">
      <div class="btc-modal-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#f7931a"><path d="M17.06 11.57c.59-.69.94-1.58.94-2.57 0-2.21-1.79-4-4-4H8V2H6v3H4V2H2v3H0v2h2v10H0v2h2v3h2v-3h2v3h2v-3h5c2.21 0 4-1.79 4-4 0-1.22-.55-2.3-1.44-3.01-.03-.14.03-.28-.5-.42zm-9.06-4.57h6c1.1 0 2 .9 2 2s-.9 2-2 2H8V7zm7 12H8v-4h7c1.1 0 2 .9 2 2s-.9 2-2 2z"/></svg>
        Support FaceHeatMap
      </div>
      <button class="btc-modal-close" onclick="closeBtcModal()">&#x2715;</button>
    </div>
    <p class="btc-modal-sub">Free &amp; independent OSINT. No ads, no VC. Your sats keep it alive.</p>
    <div class="btc-modal-stats">
      <div class="btc-mstat"><div class="btc-mstat-val" id="m-btc-recv">&#x2014;</div><div class="btc-mstat-lbl">Total received</div></div>
      <div class="btc-mstat"><div class="btc-mstat-val" id="m-btc-bal">&#x2014;</div><div class="btc-mstat-lbl">Balance</div></div>
      <div class="btc-mstat"><div class="btc-mstat-val" id="m-btc-txns">&#x2014;</div><div class="btc-mstat-lbl">Transactions</div></div>
    </div>
    <div class="btc-modal-qr-wrap">
      <div class="btc-modal-qr-bg" id="modal-qr-wrapper">
        <canvas id="modal-qr-canvas"></canvas>
      </div>
    </div>
    <div class="btc-modal-addr-row">
      <div class="btc-modal-addr" id="modal-addr-display">tips@skygive.app</div>
      <button class="btc-modal-copy" id="modal-copy-btn" onclick="copyModalAddr()">Copy</button>
    </div>
    <a class="btc-modal-mempool" href="https://tips.osintnet.uk" target="_blank" rel="noopener">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      Verify on mempool.space
    </a>
    <div class="btc-modal-recent">
      <div class="btc-modal-recent-title">Recent transactions</div>
      <div id="modal-txn-list"><div class="txns-empty">Loading...</div></div>
    </div>
  </div>
</div>

</body>
</html>`;
}

async function getEntriesFromDB(db) {
  try {
    const result = await db.prepare(`
      SELECT id, city, state, agency, vendor, risk_level, lat, lng, 
             contract_value, contract_start, source, source_url, notes, last_updated,
             technology, county, is_banned, confidence_score, confidence_tier, source_type
      FROM surveillance_entries
      ORDER BY
        CASE risk_level WHEN 'RED' THEN 1 WHEN 'ORANGE' THEN 2 WHEN 'YELLOW' THEN 3 WHEN 'GREEN' THEN 4 ELSE 5 END,
        city ASC
    `).all();
    return result.results || [];
  } catch(e) {
    console.error('getEntries error:', e);
    return [];
  }
}

async function getContractsFromDB(db) {
  try {
    const result = await db.prepare(`
      SELECT * FROM federal_contracts 
      ORDER BY amount DESC LIMIT 100
    `).all();
    return result.results || [];
  } catch(e) { return []; }
}

async function getNewsFromDB(db) {
  try {
    const result = await db.prepare(`
      SELECT * FROM news_cache 
      ORDER BY published_at DESC LIMIT 50
    `).all();
    return result.results || [];
  } catch(e) { return []; }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const db = env.FACEMAP_DB;

    // Handle www redirect
    if (url.hostname === 'www.faceheatmap.app') {
      return Response.redirect('https://faceheatmap.app' + url.pathname + url.search, 301);
    }


    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-worker-secret',
        }
      });
    }


    
    // Debug / health check (Pete-only)
    if (url.pathname === '/debug') {
      const auth = url.searchParams.get('secret') || request.headers.get('x-worker-secret');
      if (auth !== env.WORKER_SECRET) return new Response('Forbidden', { status: 403 });
      let dbInfo = {};
      try {
        const entCount = await db.prepare('SELECT COUNT(*) as n FROM surveillance_entries').first();
        const errCount = await db.prepare('SELECT COUNT(*) as n FROM fhm_errors').first().catch(()=>({n:'table missing'}));
        dbInfo = { entries: entCount?.n, errors: errCount?.n };
      } catch(e) { dbInfo = { error: e.message }; }
      return Response.json({
        worker: 'facerec-tracker',
        version: 'v13',
        ts: new Date().toISOString(),
        db: dbInfo,
        headers: Object.fromEntries(request.headers),
        cf: request.cf || {}
      }, { headers: { 'Cache-Control': 'no-store' } });
    }

// E2E Error reporting endpoint
    if (url.pathname === '/api/btcstats') {
      const addr = url.searchParams.get('addr') || 'tips@skygive.app';
      try {
        const resp = await fetch('https://mempool.space/api/address/' + addr);
        const data = await resp.json();
        return new Response(JSON.stringify(data), { headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
          'Access-Control-Allow-Origin': '*'
        }});
      } catch(e) {
        return new Response(JSON.stringify({chain_stats:{funded_txo_sum:0,tx_count:0},mempool_stats:{funded_txo_sum:0,tx_count:0}}), {
          headers: {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}
        });
      }
    }

    if (url.pathname === '/api/qr') {
      const qrAddr = url.searchParams.get('addr') || 'tips@skygive.app';
      const qrText = encodeURIComponent('lightning:' + qrAddr);
      const qrUrl = 'https://quickchart.io/qr?text=' + qrText + '&size=400&margin=2&dark=000000&light=ffffff';
      try {
        const qrResp = await fetch(qrUrl);
        const qrBody = await qrResp.arrayBuffer();
        return new Response(qrBody, { headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*'
        }});
      } catch(e) {
        return new Response('QR error: ' + e.message, { status: 500 });
      }
    }

    if (url.pathname === '/api/error' && request.method === 'POST') {
      try {
        const body = await request.json();
        const ts = new Date().toISOString();
        console.error('[FHM-CLIENT]', ts, JSON.stringify(body));
        // Store in D1 if table exists (best-effort)
        try {
          await db.prepare(
            'CREATE TABLE IF NOT EXISTS fhm_errors (id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT, type TEXT, msg TEXT, url TEXT, ua TEXT, extra TEXT)'
          ).run();
          await db.prepare(
            'INSERT INTO fhm_errors (ts, type, msg, url, ua, extra) VALUES (?, ?, ?, ?, ?, ?)'
          ).bind(ts, body.type || 'ERROR', (body.msg || '').slice(0, 500), (body.url || '').slice(0, 200), (body.ua || '').slice(0, 150), JSON.stringify(body.extra || null)).run();
        } catch(dbErr) { console.error('[FHM-DB-ERR]', dbErr.message); }
      } catch(e) { /* ignore malformed */ }
      return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // API: stats
    
    // Timeline API — returns entries sorted by contract_start/last_updated
    if (url.pathname === '/api/timeline') {
      try {
        const rows = await db.prepare(
          'SELECT id, agency, city, state, risk_level, confidence_tier, source_type, source_url, notes, contract_value, contract_start, last_updated, vendor FROM surveillance_entries ORDER BY COALESCE(contract_start, last_updated) DESC LIMIT 200'
        ).all();
        const entries = (rows.results || []).map(function(e) {
          return {
            id: e.id,
            agency: e.agency,
            city: e.city,
            state: e.state,
            risk_level: e.risk_level,
            confidence_tier: e.confidence_tier,
            source_type: e.source_type,
            source_url: e.source_url,
            notes: e.notes,
            contract_value: e.contract_value,
            contract_start: e.contract_start,
            last_updated: e.last_updated,
            vendor: e.vendor
          };
        });
        return Response.json({ entries }, {
          headers: { 'Cache-Control': 'public, max-age=120', 'Access-Control-Allow-Origin': '*' }
        });
      } catch(e) {
        return Response.json({ error: e.message, entries: [] }, { status: 500 });
      }
    }


    // API: entries — main data
    if (url.pathname === '/api/entries') {
      const entries = await getEntriesFromDB(db);
      return Response.json({ entries }, {
        headers: { 'Cache-Control': 'public, max-age=60', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // API: contracts
    if (url.pathname === '/api/contracts') {
      const contracts = await getContractsFromDB(db);
      return Response.json({ contracts }, {
        headers: { 'Cache-Control': 'public, max-age=120', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // API: news
    if (url.pathname === '/api/news') {
      const news = await getNewsFromDB(db);
      return Response.json({ news }, {
        headers: { 'Cache-Control': 'public, max-age=120', 'Access-Control-Allow-Origin': '*' }
      });
    }

if (url.pathname === '/api/stats') {
      const entries = await getEntriesFromDB(db);
      const counts = { RED:0, ORANGE:0, YELLOW:0, GREEN:0, GRAY:0 };
      entries.forEach(e => { if (counts[e.risk_level] !== undefined) counts[e.risk_level]++; });
      return Response.json({ total: entries.length, ...counts });
    }


    // robots.txt — allow all AI crawlers
    if (url.pathname === '/robots.txt') {
      const robots = `User-agent: *
Allow: /
Allow: /api/entries
Allow: /api/news
Allow: /api/stats
Disallow: /api/error

# AI Crawlers — explicitly allowed (AEO 2026)
User-agent: GPTBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: CCBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Amazonbot
Allow: /

Sitemap: https://faceheatmap.app/sitemap.xml
Host: faceheatmap.app`;
      return new Response(robots, { headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=86400' } });
    }

    // sitemap.xml
    if (url.pathname === '/sitemap.xml') {
      const now = new Date().toISOString().split('T')[0];
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://faceheatmap.app/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://faceheatmap.app/"/>
  </url>
  <url>
    <loc>https://faceheatmap.app/?tab=vendors</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://faceheatmap.app/?tab=contracts</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://faceheatmap.app/?tab=timeline</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://faceheatmap.app/?tab=laws</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://faceheatmap.app/?tab=intel</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://faceheatmap.app/?tab=about</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://faceheatmap.app/privacy</loc>
    <lastmod>${now}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://faceheatmap.app/terms</loc>
    <lastmod>${now}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`;
      return new Response(sitemap, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=86400' } });
    }

    // Contact form submission
    if (url.pathname === '/api/contact' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { name, email, message, subject } = body;
        if (!name || !email || !message) return Response.json({ error: 'Missing fields' }, { status: 400 });
        // Store in D1
        await db.prepare(`INSERT INTO contact_messages (id, name, email, subject, message, submitted_at, ip) VALUES (?,?,?,?,?,?,?)`)
          .bind(crypto.randomUUID(), name, email, subject||'General', message, new Date().toISOString(), request.headers.get('CF-Connecting-IP')||'')
          .run();
        // Telegram notification to Pete
        const tgMsg = encodeURIComponent(`📬 FaceHeatMap Contact\n\nFrom: ${name} <${email}>\nSubject: ${subject||'General'}\n\n${message.slice(0,400)}`);
        await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=REDACTED3091981&text=${tgMsg}`).catch(()=>{});
        return Response.json({ success: true });
      } catch(e) {
        return Response.json({ error: e.message }, { status: 500 });
      }
    }

    // Privacy Policy page
    if (url.pathname === '/privacy') {
      return new Response(buildPrivacyPage(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=86400' }
      });
    }

    // Terms of Service page
    if (url.pathname === '/terms') {
      return new Response(buildTermsPage(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=86400' }
      });
    }

        // Serve JS bundle
    if (url.pathname === '/app.js') {
      return new Response(buildJS(), {
        headers: {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }

    // Main app — get stats for SSR header
    const entries = await getEntriesFromDB(db);
    const contracts = await getContractsFromDB(db);
    const news = await getNewsFromDB(db);

    const stats = { RED:0, ORANGE:0, YELLOW:0, GREEN:0 };
    entries.forEach(e => { if (stats[e.risk_level] !== undefined) stats[e.risk_level]++; });

    try {
      const html = await buildFullHTML(entries, contracts, news, {
        totalEntries: entries.length,
        redCount: stats.RED,
        orangeCount: stats.ORANGE,
        greenCount: stats.GREEN,
        yellowCount: stats.YELLOW
      });
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=120',
          'X-Frame-Options': 'SAMEORIGIN',
          'X-Content-Type-Options': 'nosniff',
        }
      });
    } catch(err) {
      return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
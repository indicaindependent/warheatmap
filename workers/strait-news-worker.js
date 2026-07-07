export default {
  async fetch(req, env) {
    const url  = new URL(req.url);
    const path = url.pathname;
    const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Access-Control-Allow-Headers': '*' };

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Headers': 'Authorization,Content-Type' }});
    }

    // ── SMOKE TEST ──
    if (path === '/smoke-test' && req.method === 'POST') {
      const _auth = req.headers.get('Authorization') || '';
      if (_auth !== (env.SMOKE_TEST_TOKEN ? 'Bearer ' + env.SMOKE_TEST_TOKEN : 'Bearer __disabled__')) return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
      return Response.json({ ok: true, worker: 'strait-news-worker', version: '3.2', updated: new Date().toISOString() });
    }

    // ── PUBLIC ENDPOINTS ──
    if (path === '/intel' || path === '/news/latest' || path === '/news') return handleGetIntel(env, CORS, path);
    if (path === '/status')      return handleGetStatus(env, CORS);
    if (path === '/oil-live')    return handleGetOilLive(env, CORS);
    if (path === '/ais')         return handleGetAIS(env, CORS);
    if (path === '/vessels')     return handleGetVessels(env, CORS);
    if (path === '/ticker')      return handleGetTicker(env, CORS);
    if (path === '/health')      return Response.json({ ok: true, version: '3.2', ts: new Date().toISOString() }, { headers: CORS });

    // ── ADMIN ENDPOINTS ──
    const auth = req.headers.get('Authorization') || '';
    const WORKER_SECRET = env.WORKER_SECRET || "__REDACTED_APPPW__";
    if (auth !== `Bearer ${WORKER_SECRET}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS });
    }
    if (path === '/admin/refresh' && req.method === 'POST') return handleAdminRefresh(env, CORS);
    if (path === '/admin/status'  && req.method === 'GET')  return handleAdminStatus(env, CORS);

    return Response.json({ ok: true, version: '3.2', endpoints: ['/intel', '/news/latest', '/status', '/oil-live', '/ais', '/vessels', '/ticker', '/health'] }, { headers: CORS });
  },

  // ── CRON: every 30 minutes ──
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runFullCycle(env));
  },
};

// ─── MISSING CONSTANTS — RESTORED 2026-05-20 by Bumboclaat ───────────────────
// Bug: BACKSTOP_EVENTS / STATIC_VESSELS / STATIC_NAVAL_ASSETS / WAR_START were
// referenced throughout but never defined, causing ReferenceError → CF 1101 / 500.
// All event data below is cross-sourced (≥2 wire services) or marked REPORTED:

const WAR_START = new Date('2026-02-28T00:00:00Z').getTime();


// ─── PINNED_EVENTS — verified manual intel that MUST survive cron re-synthesis ───
// Added by Bumboclaat 2026-06-05. Merged on top of synthesis/backstop, deduped by id.
// To retire an event, remove it here. Newest first.
const PINNED_EVENTS = [
  { id:'us_strikes_0609', date:'June 9, 2026', tag:'BREAKING', tag_color:'red', icon:'🟥',
    title:'US STRIKES ~20 IRANIAN AIR-DEFENSE & RADAR SITES NEAR HORMUZ',
    body:'Late Jun 9, US/CENTCOM fighter aircraft struck roughly 20 Iranian air-defense, radar, ground-control and surveillance sites near the Strait of Hormuz — what Washington called a "proportional response" to the Jun 8 Apache downing. Iranian state media reported explosions in Hormozgan Province: Sirik, Bandar Abbas, Minab and Qeshm Island. US officials framed it as a limited warning, NOT the opening of a broader campaign; they said it should not derail talks.',
    source:'CENTCOM / RFE/RL / NYT / WSJ — June 9, 2026', severity:'critical' },
  { id:'iran_retaliation_0610', date:'June 10, 2026', tag:'ESCALATION', tag_color:'red', icon:'💥',
    title:'IRAN HITS US AL-AZRAQ BASE (JORDAN) + KUWAIT & BAHRAIN TARGETS',
    body:"Jun 10: Iran's IRGC said it launched missiles and drones at the US Al-Azraq base in Jordan plus American-linked targets in Kuwait and Bahrain, in retaliation for the Jun 9 US strikes. Jordan's military said it intercepted and destroyed five missiles bound for Al-Azraq; Bahrain and Kuwait reported engaging incoming threats. A US official said “just about all” projectiles were intercepted, with NO confirmed US casualties or facility damage (assessment ongoing). Iran's claimed damage is unverified.",
    source:'IRGC / RFE/RL / Reuters — June 10, 2026', severity:'critical' },
  { id:'trump_paytheprice_0610', date:'June 10, 2026', tag:'DIPLOMACY', tag_color:'orange', icon:'⚠️',
    title:'TRUMP: IRAN "WILL PAY THE PRICE"; TALKS NOW "UNDER REVIEW"',
    body:'Jun 10: Trump (Truth Social) called Iran "completely defeated" and warned it would "pay the price" for stalling a deal; on Fox News he said he was close to authorizing strikes on Iranian power plants and bridges if Tehran refuses to sign — while still insisting a deal is "close." Qatari mediators traveled to Tehran. Iran FM spokesman Baghaei said the future of US talks is "under review" after the overnight exchange. The April ceasefire is at its most strained since signing.',
    source:'RFE/RL / Fox News / Reuters — June 10, 2026', severity:'critical' },
  { id:'apache0608', date:'June 8, 2026', tag:'BREAKING', tag_color:'red', icon:'🟥',
    title:'US APACHE DOWN OFF OMAN — CREW SAVED BY NAVY DRONE, CAUSE UNCONFIRMED',
    body:'A US Army AH-64 Apache went down near Hormuz off Oman late Jun 8 — the first Apache lost this war. Both crew were rescued alive (~2hrs) by a US Navy surface DRONE, a first-of-its-kind save. Cause is officially UNCONFIRMED (Iranian fire vs mechanical) and Iran has claimed NOTHING — "shoot-down" framing is unverified on both sides.',
    source:'CENTCOM (Capt. Hawkins) / AP / Axios / NYT — June 8-9, 2026', severity:'critical' },
  { id:'iliexchange0607', date:'June 8, 2026', tag:'ESCALATION', tag_color:'red', icon:'💥',
    title:'FIRST ISRAEL-IRAN DIRECT EXCHANGE SINCE APRIL CEASEFIRE',
    body:'Jun 7: Iran fired ~30 ballistic missiles at 3 Israeli air bases (over Israeli strikes on Beirut). Jun 8: Israel hit Iranian air defenses + the Mahshahr petrochemical complex; blasts in Tehran, Isfahan, Tabriz. Both PAUSED after. Netanyahu: "the fire has ceased." Iran warns it resumes if Israel keeps striking S. Lebanon.',
    source:'IRGC / IDF / Iranian state media via AP — June 7-8, 2026', severity:'critical' },
  { id:'mou60unsigned0609', date:'June 9, 2026', tag:'DIPLOMACY', tag_color:'orange', icon:'📜',
    title:'60-DAY HORMUZ MOU NEGOTIATED BUT UNSIGNED — BOTH SIDES CONTRADICT TERMS',
    body:'A tentative US-Iran 60-day ceasefire / Hormuz-reopening MOU has been negotiated but remains UNSIGNED, with both sides openly contradicting each other on its terms. Trump claims a deal is "2-3 days" away — a timeline he has repeated for roughly two months.',
    source:'Live research synthesis / AP / CNN tally — June 9, 2026', severity:'high' },
  { id:'aircraftlosses0609', date:'June 9, 2026', tag:'MILITARY', tag_color:'yellow', icon:'✈️',
    title:'US AIRCRAFT LOSSES MOUNT: 5+ JETS, 7 KC-135s, SAR HELI, 2+ DOZEN DRONES, 1 APACHE',
    body:'Since the war began in late February, the US military has lost at least five fighter jets, seven KC-135 Stratotanker refuelers, a search-and-rescue helicopter, more than two dozen drones, and now an Apache — a steep attrition toll for enforcing the crude blockade and contesting Hormuz.',
    source:'Congressional Research Service (May 2026) / NYT — June 2026', severity:'high' },
  { id:'omanterminal05', date:'June 5, 2026', tag:'BREAKING', tag_color:'red', icon:'🟥',
    title:'OMAN MINA AL FAHAL TERMINAL STRUCK — HALTED, THEN RESUMED',
    body:'Explosion near the SBM mooring berths at Oman\'s ~1M bpd Mina al Fahal crude export hub halted loading early June 5 (03:41 BST). Operations RESUMED hours later (07:17 BST); Oman insists ops "proceeding normally." First reported hit on open-water export infrastructure BEYOND the Strait — the conflict\'s geography is widening past the chokepoint.',
    source:'Middle East Eye / Reuters / Arab News — June 5, 2026', severity:'critical' },
  { id:'hormuzmanage05', date:'June 5, 2026', tag:'HORMUZ', tag_color:'orange', icon:'⚓',
    title:'IRAN: HORMUZ "MANAGED JOINTLY WITH OMAN" + SERVICE FEES, NOT TOLLS',
    body:'Tehran reframes its chokepoint play: the Strait will be "managed jointly with Oman under international law," and Iran will seek "service fees, not tolls" for safe passage. A control-and-monetize posture, not a clean closure.',
    source:'Anadolu / Egypt Independent — June 5, 2026', severity:'high' },
  { id:'irantalks01', date:'June 1, 2026', tag:'DIPLOMACY', tag_color:'red', icon:'🚫',
    title:'IRAN WALKS FROM US TALKS — VOWS TO CLAMP HORMUZ',
    body:'Iran halted "dialogue and exchange of texts through mediation," citing Israeli strikes on Lebanon, and vowed to tighten its grip on Hormuz. The May-27 MOU framework is frozen — the "ceasefire" is a business-first construct now visibly collapsing.',
    source:'CNBC / Tasnim / ABC News — June 1, 2026', severity:'critical' },
  { id:'kuwait03', date:'June 3, 2026', tag:'NAVAL-INCIDENT', tag_color:'red', icon:'💥',
    title:'IRAN STRIKES KUWAIT AIRPORT — 1 KILLED, TEHRAN NOW DENIES',
    body:'Iranian missile + drone attack hit Kuwait\'s international airport June 3, killing one and damaging a terminal. US (Rubio) and Kuwait blame Iran; CENTCOM reports defeating multiple Iranian missiles/drones and striking Qeshm. Iran now DENIES the strike, blaming a "Patriot malfunction."',
    source:'Reuters / CBS / Al-Monitor / CENTCOM — June 3, 2026', severity:'critical' },
  { id:'sariska02', date:'June 2, 2026', tag:'VESSEL', tag_color:'yellow', icon:'🚢',
    title:'MSC SARISKA V STRUCK BY PROJECTILES OFF UMM QASR, IRAQ',
    body:'MSC confirms its vessel Sariska V (IMO 8715857, Panama flag) was hit by two projectiles ~40nm from Iraq\'s Umm Qasr; crew safe. A STRIKE, not a seizure — near the Umm Qasr corridor Iran uses to route crude around the US blockade.',
    source:'Reuters / Al-Monitor / Seatrade Maritime — June 2, 2026', severity:'high' },
  { id:'oilfloor05', date:'June 5, 2026', tag:'OIL-IMPACT', tag_color:'orange', icon:'🛢️',
    title:'ANALYSTS: $200/BBL POSSIBLE WITHOUT A HORMUZ DEAL',
    body:'With Hormuz traffic restricted, cumulative Gulf supply losses exceed 1 billion barrels, 14+ mb/d effectively shut in. Analysts warn of a $200/bbl scenario absent a deal. UN/WFP flags a multi-country food-price crisis — macro spillover turning humanitarian.',
    source:'Juan Cole / Al Jazeera (UN-WFP) — June 5, 2026', severity:'high' },
];

// Merge pinned events on top of a base list, deduped by id (pinned win).
function mergePinned(baseEvents) {
  const base = Array.isArray(baseEvents) ? baseEvents : [];
  const pinnedIds = new Set(PINNED_EVENTS.map(e => e.id));
  return [...PINNED_EVENTS, ...base.filter(e => !pinnedIds.has(e.id))];
}

const BACKSTOP_EVENTS = [
  {
    id: 'omanterminal05',
    date: 'June 5, 2026',
    tag: 'BREAKING',
    tag_color: 'red',
    icon: '🟥',
    title: 'OMAN MINA AL FAHAL TERMINAL STRUCK — LOADING HALTED, THEN RESUMED',
    body: 'Explosion near the SBM mooring berths at Oman\'s ~1M bpd Mina al Fahal crude export hub halted loading early June 5 (03:41 BST). Operations RESUMED hours later (07:17 BST); Oman insists ops "proceeding normally." Significance: first reported hit on open-water export infrastructure BEYOND the Strait itself — the conflict\'s relevant geography is widening past the chokepoint.',
    source: 'Middle East Eye / Reuters / Arab News — June 5, 2026',
    severity: 'critical'
  },
  {
    id: 'hormuzmanage05',
    date: 'June 5, 2026',
    tag: 'HORMUZ',
    tag_color: 'orange',
    icon: '⚓',
    title: 'IRAN: HORMUZ "MANAGED JOINTLY WITH OMAN" + SERVICE FEES, NOT TOLLS',
    body: 'Tehran reframes its chokepoint play: FM says the Strait will be "managed jointly with Oman under international law," and Iran will seek "service fees, not tolls" for safe passage. This is a control-and-monetize posture — not a clean closure. Read: Iran wants to convert leverage into a permanent revenue + sovereignty claim over the waterway.',
    source: 'Anadolu / Egypt Independent — June 5, 2026',
    severity: 'high'
  },
  {
    id: 'irantalks01',
    date: 'June 1, 2026',
    tag: 'DIPLOMACY',
    tag_color: 'red',
    icon: '🚫',
    title: 'IRAN WALKS FROM US TALKS — VOWS TO CLAMP HORMUZ',
    body: 'Iran halted "dialogue and exchange of texts through mediation," citing Israeli strikes on Lebanon, and vowed to tighten its grip on Hormuz. Gulf crude exports unlikely to rise near-term. The May-27 MOU framework is effectively frozen — the "ceasefire" is a business-first construct now visibly collapsing.',
    source: 'CNBC / Tasnim / ABC News — June 1, 2026',
    severity: 'critical'
  },
  {
    id: 'kuwait03',
    date: 'June 3, 2026',
    tag: 'NAVAL-INCIDENT',
    tag_color: 'red',
    icon: '💥',
    title: 'IRAN STRIKES KUWAIT AIRPORT — 1 KILLED, IRAN NOW DENIES',
    body: 'Iranian missile + drone attack hit Kuwait\'s international airport June 3, killing one and damaging a terminal. US (Rubio) and Kuwait blame Iran; CENTCOM reports defeating multiple Iranian ballistic missiles/drones and conducting self-defense strikes on Qeshm. Iran now DENIES the airport strike, blaming a "Patriot malfunction" — a denial that itself signals escalation management.',
    source: 'Reuters / CBS / Al-Monitor / CENTCOM — June 3, 2026',
    severity: 'critical'
  },
  {
    id: 'sariska02',
    date: 'June 2, 2026',
    tag: 'VESSEL',
    tag_color: 'yellow',
    icon: '🚢',
    title: 'MSC SARISKA V STRUCK BY PROJECTILES OFF UMM QASR, IRAQ',
    body: 'MSC (world\'s largest shipping group) confirms its vessel Sariska V (IMO 8715857, Panama flag, ~74,500 DWT) was hit by two projectiles ~40nm from Iraq\'s Umm Qasr port; crew safe. Notable: this is a STRIKE, not a seizure, and it lands near the Umm Qasr corridor Iran is using to route crude around the US blockade.',
    source: 'Reuters / Al-Monitor / Seatrade Maritime — June 2, 2026',
    severity: 'high'
  },
  {
    id: 'oilfloor05',
    date: 'June 5, 2026',
    tag: 'OIL-IMPACT',
    tag_color: 'orange',
    icon: '🛢️',
    title: 'ANALYSTS: $200/BBL POSSIBLE WITHOUT A HORMUZ DEAL',
    body: 'With Hormuz tanker traffic restricted, Gulf supply losses now exceed 1 billion barrels cumulative, with 14+ mb/d of oil effectively shut in. Analysts warn of a $200/bbl scenario absent a deal. The UN/WFP flags the war is driving a food-price crisis across multiple countries — the macro spillover is now humanitarian, not just energy.',
    source: 'Juan Cole / Al Jazeera (UN-WFP) — June 5, 2026',
    severity: 'high'
  },
  {
    id: 'mou27',
    date: 'May 27, 2026 (updated Jun 5)',
    tag: 'COLLAPSING',
    tag_color: 'red',
    icon: '🟥',
    title: 'PHONY CEASEFIRE NOW COLLAPSING — MOU FROZEN AS IRAN WALKS',
    body: 'CONTEXT (now superseded): the May-27 MOU framework — limited reopen, ~$24B Iranian asset release, partial sanctions relief — was always a business-first construct, not a peace. As of June 1-5 it is frozen: Iran walked from talks, struck Kuwait, and reframed Hormuz as a fee-charging condominium with Oman. The "ceasefire" is collapsing in real time.',
    source: 'Reuters / Al Jazeera / Tasnim — May 27, 2026',
    severity: 'critical'
  },
  {
    id: 'fire27',
    date: 'May 27, 2026',
    tag: 'NAVAL-INCIDENT',
    tag_color: 'red',
    icon: '🔫',
    title: 'US-IRAN DESTROYERS EXCHANGE FIRE',
    body: 'Brief firefight between US Navy destroyer and IRGC fast-attack craft in Strait of Hormuz. Trump confirms ceasefire still "in place" but BBC reports incident raised escalation risk. No casualties reported. Most serious naval contact in years.',
    source: 'BBC / US 5th Fleet — May 27, 2026',
    severity: 'critical'
  },
  {
    id: 'irgc26',
    date: 'May 26, 2026',
    tag: 'MARITIME',
    tag_color: 'yellow',
    icon: '🚢',
    title: 'IRGC CLAIMS 25 VESSELS PASSED HORMUZ TUESDAY',
    body: 'Islamic Revolutionary Guard Corps Navy claims 25 vessels including oil tankers transited Strait of Hormuz Tuesday. Iran asserting "regulator" status as MOU talks progress. Far below pre-war 100+/day baseline but signals quiet reopen pre-deal.',
    source: 'CNN / IRNA / IRGC press — May 26, 2026',
    severity: 'high'
  },
  {
    id: 'china24',
    date: 'May 24, 2026',
    tag: 'OIL-FLOW',
    tag_color: 'blue',
    icon: '🛢',
    title: 'CHINA + INDIA RESUMING QUIET CRUDE PULLS',
    body: 'CNOOC + Sinopec quietly resumed Iranian crude liftings in past 72 hours per Kpler flow data. Indian IOC + HPCL doing the same, betting on deal closure. Both exploiting de facto US enforcement gray zone. 800+ ships still backed up.',
    source: 'Kpler / S&P Global Commodity Insights — May 23-27, 2026',
    severity: 'high'
  },
  {
    id: 'sm20',
    date: 'May 20, 2026',
    tag: 'TANKER-MOVE',
    tag_color: 'green',
    icon: '🛢',
    title: 'CHINA TAKES 4M BARRELS — TWO TANKERS EXIT HORMUZ',
    body: 'Two Chinese supertankers depart Strait of Hormuz carrying ~4 million barrels combined — largest blockade-easing signal since war began. Asian oil flow tentatively resuming. Vance + Trump talking up Iran deal prospects same day.',
    source: 'Reuters / Gulf News — May 20, 2026',
    severity: 'high'
  },
  {
    id: 'in20',
    date: 'May 20, 2026',
    tag: 'SUPPLY',
    tag_color: 'blue',
    icon: '🇮🇳',
    title: 'INDIA SENDS TANKERS — NEW CRUDE SUPPLY CORRIDOR',
    body: 'New Delhi announces dispatch of oil tankers through Strait of Hormuz to secure crude supply amid Iran-conflict disruptions. India is third-largest Iranian oil customer historically.',
    source: 'Times of India — May 20, 2026',
    severity: 'medium'
  },
  {
    id: 'tw20',
    date: 'May 20, 2026',
    tag: 'DIPLOMATIC',
    tag_color: 'purple',
    icon: '⚠️',
    title: 'IRAN: WAR "BEYOND THE REGION" IF US ATTACKS',
    body: 'Tehran warns escalation will go global if US restarts strikes. Trump claims he came within one hour of relaunching the war. Vance pushes deal framing publicly.',
    source: 'Reuters — May 20, 2026',
    severity: 'high'
  },
  {
    id: 'us19',
    date: 'May 19, 2026',
    tag: 'SEIZURE',
    tag_color: 'red',
    icon: '🟥',
    title: 'US SEIZES IRAN-LINKED TANKER IN INDIAN OCEAN',
    body: 'WSJ exclusive: US Navy intercepts and seizes Iranian-affiliated oil tanker in Indian Ocean. Treasury economic-pressure track running parallel to Trump deal rhetoric. Sanctions enforcement continues despite summit talk.',
    source: 'WSJ exclusive — May 19, 2026',
    severity: 'critical'
  },
  {
    id: 'mk19',
    date: 'May 19, 2026',
    tag: 'NAVAL',
    tag_color: 'blue',
    icon: '⚓',
    title: 'USS MAKIN ISLAND PREPS FOR GULF DEPLOYMENT',
    body: 'Wasp-class amphibious assault ship USS Makin Island (LHD-8) being prepared for possible Persian Gulf deployment. Adds amphibious capability to existing 20-warship presence.',
    source: 'National Interest / USNI News — May 19, 2026',
    severity: 'medium'
  },
  {
    id: 'fl18',
    date: 'May 18, 2026',
    tag: 'NAVAL',
    tag_color: 'blue',
    icon: '🚢',
    title: 'USNI FLEET TRACKER — 20 US WARSHIPS IN THEATER',
    body: 'USNI News Fleet & Marine Tracker confirms 20 US Navy warships enforcing Iran blockade. USS Nimitz on circumnavigation home via Rio. USS Eisenhower remains at Norfolk after April fire — not deployable.',
    source: 'USNI News — May 18, 2026',
    severity: 'medium'
  },
  {
    id: 'tx15',
    date: 'May 15, 2026',
    tag: 'SUMMIT',
    tag_color: 'purple',
    icon: '🤝',
    title: 'TRUMP-XI SUMMIT — NO HORMUZ BREAKTHROUGH',
    body: 'Beijing summit ends with stability rhetoric but no concrete Iran breakthrough. Trump claims Xi agreed Iran "should open Hormuz." Al Jazeera analysis: Xi did not budge on backing Iran economically. China publicly called the Iran war "unjust."',
    source: 'NY Times / Al Jazeera / Euronews — May 14-15, 2026',
    severity: 'critical'
  },
  {
    id: 'tt14',
    date: 'May 14, 2026',
    tag: 'ECONOMIC',
    tag_color: 'yellow',
    icon: '💸',
    title: 'IRAN MOVES TO CHARGE HORMUZ TRANSIT FEES',
    body: 'Iran pushes scheme to charge merchant shippers for passage under threat of violence — declares itself strait "regulator." Experts warn the model could spread to Bab el-Mandeb and Malacca.',
    source: 'USNI News — May 14, 2026',
    severity: 'high'
  },
  {
    id: 'ct11',
    date: 'May 11, 2026',
    tag: 'NAVAL',
    tag_color: 'blue',
    icon: '🛡',
    title: '20 US WARSHIPS — IRAN BLOCKADE ENFORCED',
    body: '20 surface combatants including 2 carriers enforce US blockade. USS Nimitz service extended to 2027 per Navy announcement. Eisenhower out of service indefinitely after Norfolk shipyard fire.',
    source: 'TWZ / Middle East Monitor — May 11, 2026',
    severity: 'high'
  },
  {
    id: 'mn13',
    date: 'May 13, 2026',
    tag: 'INTEL',
    tag_color: 'orange',
    icon: '⚓',
    title: 'NAVY LOOKOUT: NO CONFIRMED MINES IN HORMUZ',
    body: 'Despite repeated reports, no conclusive evidence Iran has laid sea mines in the strait. Risk persists but actual mining unconfirmed as of May 13.',
    source: 'Navy Lookout — May 13, 2026',
    severity: 'medium'
  },
  {
    id: 'ir22',
    date: 'April 22, 2026',
    tag: 'SEIZURE',
    tag_color: 'red',
    icon: '🟥',
    title: 'IRGCN SEIZES 2 CARGO SHIPS — FIRES ON 3RD',
    body: 'MSC Francesca and Epaminondas seized by IRGC Navy in coordinated Hormuz operation. MV Euphoria fired on (~03:00 UTC) but not damaged. UKMTO confirms. Iran calls action retaliation for US capture of M/V Touska.',
    source: 'Reuters / WSJ / UKMTO — April 22, 2026',
    severity: 'critical'
  },
  {
    id: 'tk19',
    date: 'April 19-20, 2026',
    tag: 'SEIZURE',
    tag_color: 'red',
    icon: '🚁',
    title: 'M/V TOUSKA — US MARINES BOARD IRANIAN TANKER',
    body: 'USS Spruance (DDG-111) fires on engine room after 6-hour standoff in Gulf of Oman. US Marines rappel from USS Tripoli (LHA-7). Khatam al-Anbiya vows retaliation — IRGC moves of April 22 appear direct response.',
    source: 'Reuters / WSJ — April 19-20, 2026',
    severity: 'critical'
  },
];

const STATIC_VESSELS = [
  // Same shape as ASSETS in frontend — kept minimal for backstop
  { type: 'tanker', label: 'Chinese VLCC #1', status: 'TRANSITED MAY 20', flag: 'CN', detail: '2M barrels exit Hormuz — Reuters May 20' },
  { type: 'tanker', label: 'Chinese VLCC #2', status: 'TRANSITED MAY 20', flag: 'CN', detail: '2M barrels exit Hormuz — Reuters May 20' },
  { type: 'tanker', label: 'India-bound', status: 'INBOUND', flag: 'IN', detail: 'New Delhi dispatches per Times of India May 20' },
  { type: 'interdicted', label: 'MSC Francesca', status: 'SEIZED APR 22', flag: '--', detail: 'IRGCN — Reuters' },
  { type: 'interdicted', label: 'Epaminondas', status: 'SEIZED APR 22', flag: '--', detail: 'IRGCN — Reuters' },
  { type: 'interdicted', label: 'MV Euphoria', status: 'FIRED-ON APR 22', flag: '--', detail: 'IRGCN — UKMTO' },
  { type: 'interdicted', label: 'M/V Touska', status: 'SEIZED APR 19', flag: 'IR', detail: 'USS Spruance — Reuters' },
  { type: 'interdicted', label: 'Iran-linked tanker', status: 'SEIZED MAY 19', flag: '--', detail: 'WSJ exclusive Indian Ocean' },
];

const STATIC_NAVAL_ASSETS = [
  { class: 'CVN', name: 'USS Nimitz (CVN-68)', status: 'TRANSIT-HOME (Rio)', src: 'USNI May 18' },
  { class: 'CVN', name: 'USS Dwight D. Eisenhower (CVN-69)', status: 'NORFOLK — FIRE DAMAGE', src: '19FortyFive April 2026' },
  { class: 'CVN', name: 'USS Gerald R. Ford (CVN-78)', status: 'IN-THEATER (assumed)', src: 'USNI fleet tracker' },
  { class: 'LHA', name: 'USS Tripoli (LHA-7)', status: 'ACTIVE — recent Touska op', src: 'Reuters Apr 19' },
  { class: 'LHD', name: 'USS Makin Island (LHD-8)', status: 'PREP-FOR-DEPLOY', src: 'National Interest May 19' },
  { class: 'DDG', name: 'USS Spruance (DDG-111)', status: 'ACTIVE — Touska shooter', src: 'Reuters Apr 19' },
];




// ─── UNIFIED INTEL HANDLER ────────────────────────────────────────────────────
async function handleGetIntel(env, CORS, path) {
  try {
    const cached = await env.STRAIT_NEWS_KV.get('hormuz_intel_v3', 'json');
    if (cached) {
      // backward compat: /news/latest returns items-only format
      if (path === '/news/latest' || path === '/news') {
        return new Response(JSON.stringify({
          items: (cached.events || []).slice(0, 8),
          status: cached.status,
          updated: cached.updated,
          oil: cached.oil,
          ticker: cached.ticker,
        }), { headers: CORS });
      }
      return new Response(JSON.stringify(cached), { headers: CORS });
    }
    // No data yet — return static backstop
    const warDay = Math.floor((Date.now() - WAR_START) / 86400000);
    return new Response(JSON.stringify(buildBackstopPayload(warDay)), { headers: CORS });
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message, events: BACKSTOP_EVENTS, vessels: STATIC_VESSELS }), { status: 500, headers: CORS });
  }
}

async function handleGetStatus(env, CORS) {
  const cached = await env.STRAIT_NEWS_KV.get('hormuz_intel_v3', 'json').catch(() => null);
  return new Response(JSON.stringify(cached?.status || {}), { headers: CORS });
}

async function handleGetOilLive(env, CORS) {
  const cached = await env.STRAIT_NEWS_KV.get('oil_cache', 'json').catch(() => null);
  return new Response(JSON.stringify(cached || { brent: null, wti: null, note: 'cache empty' }), { headers: CORS });
}

async function handleGetAIS(env, CORS) {
  const cached = await env.STRAIT_NEWS_KV.get('hormuz_ais', 'json').catch(() => null);
  return new Response(JSON.stringify(cached || { vessels: [], count: 0 }), { headers: CORS });
}

async function handleGetVessels(env, CORS) {
  const cached = await env.STRAIT_NEWS_KV.get('hormuz_intel_v3', 'json').catch(() => null);
  return new Response(JSON.stringify(cached?.vessels || STATIC_VESSELS), { headers: CORS });
}

async function handleGetTicker(env, CORS) {
  const cached = await env.STRAIT_NEWS_KV.get('hormuz_intel_v3', 'json').catch(() => null);
  return new Response(JSON.stringify(cached?.ticker || []), { headers: CORS });
}

async function handleAdminRefresh(env, CORS) {
  try {
    const result = await runFullCycle(env);
    return Response.json({ ok: true, result }, { headers: CORS });
  } catch(e) {
    return Response.json({ ok: false, error: e.message }, { status: 500, headers: CORS });
  }
}

async function handleAdminStatus(env, CORS) {
  const intel  = await env.STRAIT_NEWS_KV.get('hormuz_intel_v3', 'json').catch(() => null);
  const oil    = await env.STRAIT_NEWS_KV.get('oil_cache', 'json').catch(() => null);
  const hash   = await env.STRAIT_NEWS_KV.get('article_hash').catch(() => null);
  return Response.json({
    intel_updated: intel?.updated || null,
    intel_events: intel?.events?.length || 0,
    oil_brent: oil?.brent || null,
    article_hash: hash,
    worker_version: '3.2',
  }, { headers: CORS });
}

// ─── FULL CYCLE ───────────────────────────────────────────────────────────────
async function runFullCycle(env) {
  const now = new Date();
  console.log(`[runFullCycle] Starting at ${now.toISOString()}`);

  // Article hash dedup — skip Claude if news hasn't changed
  const [articles, oil, aisData] = await Promise.allSettled([
    fetchNewsArticles(env),
    fetchOilPrices(env),
    fetchAISData(env),
  ]);

  const safeArticles = articles.status === 'fulfilled' ? articles.value : [];
  const safeOil      = oil.status      === 'fulfilled' ? oil.value      : { brent: null, wti: null };
  const safeAIS      = aisData.status  === 'fulfilled' ? aisData.value  : { vessels: [], count: 0 };

  console.log(`[runFullCycle] Articles: ${safeArticles.length}, Oil: Brent=$${safeOil.brent}, AIS: ${safeAIS.count} vessels`);

  // Hash dedup — only re-synthesize if articles changed
  const newHash = simpleHash(safeArticles.map(a => a.title).join('|'));
  const prevHash = await env.STRAIT_NEWS_KV.get('article_hash').catch(() => null);
  const prevCached = await env.STRAIT_NEWS_KV.get('hormuz_intel_v3', 'json').catch(() => null);
  const cacheAge = prevCached ? (Date.now() - new Date(prevCached.updated).getTime()) : Infinity;

  let intel;
  if (newHash === prevHash && cacheAge < 3600000 && prevCached) {
    // Articles unchanged and cache < 1h old — just update oil + timestamp
    console.log(`[runFullCycle] Articles unchanged (hash=${newHash}), skipping synthesis. Cache age: ${Math.round(cacheAge/60000)}m`);
    intel = { ...prevCached, oil: safeOil };
    // Backfill any newly-added default stat/status keys onto cached payloads (post-deploy safety)
    intel.stats  = { ...buildDefaultStats(safeOil), ...(prevCached.stats  || {}) };
    intel.status = { ...buildDefaultStatus(Math.floor((Date.now()-WAR_START)/86400000)), ...(prevCached.status || {}) };
    // Heal stale placeholder values left in old caches
    var _df = buildDefaultStats(safeOil);
    if (!intel.stats.ships_fired_on || /SYNCING/i.test(intel.stats.ships_fired_on)) intel.stats.ships_fired_on = _df.ships_fired_on;
    if (!intel.stats.tankers_crossed || /SYNCING/i.test(intel.stats.tankers_crossed)) intel.stats.tankers_crossed = _df.tankers_crossed;
  } else {
    // Synthesize fresh intel
    intel = await synthesizeIntel(env, safeArticles, safeOil, safeAIS, now);
    await env.STRAIT_NEWS_KV.put('article_hash', newHash);
    console.log(`[runFullCycle] Synthesis complete. Events: ${intel.events?.length}, Threat: ${intel.status?.threat_level}`);
  }

  // Always update oil cache
  if (safeOil.brent) {
    await env.STRAIT_NEWS_KV.put('oil_cache', JSON.stringify({ ...safeOil, ts: now.toISOString() }), { expirationTtl: 21600 }).catch(() => {});
  }

  // Build full v3 payload
  const warDay = Math.floor((now - WAR_START) / 86400000);
  const payload = {
    version: 3,
    updated: now.toISOString(),
    war_day: warDay,
    operation: intel.operation || buildOpFreedomStatus(intel),
    status: { ...buildDefaultStatus(warDay), ...(intel.status || {}) },
    stats: { ...buildDefaultStats(safeOil), ...(intel.stats || {}) },
    events: mergePinned((intel.events && intel.events.length > 0) ? intel.events : BACKSTOP_EVENTS),
    ticker: intel.ticker || buildDefaultTicker(),
    vessels: intel.vessels || STATIC_VESSELS,
    naval_assets: STATIC_NAVAL_ASSETS,
    oil: safeOil,
    ais: { count: safeAIS.count, updated: now.toISOString() },
  };

  await env.STRAIT_NEWS_KV.put('hormuz_intel_v3', JSON.stringify(payload), { expirationTtl: 86400 * 2 });

  // Threat escalation alert
  const prevThreat = await env.STRAIT_NEWS_KV.get('prev_threat_level').catch(() => null);
  const newThreat  = payload.status?.threat_level || '';
  if (prevThreat && prevThreat !== newThreat && (newThreat === 'CRITICAL' || newThreat === 'WAR')) {
    await sendTelegramAlert(env, `<b>⚠️ HORMUZ THREAT ESCALATION</b>\n${prevThreat} → <b>${newThreat}</b>\n${payload.status?.summary_one_line || ''}`);
  }
  await env.STRAIT_NEWS_KV.put('prev_threat_level', newThreat).catch(() => {});

  return { events: payload.events.length, updated: now.toISOString(), oil: safeOil, ais_vessels: safeAIS.count, hash: newHash };
}

// ─── NEWS FETCH ───────────────────────────────────────────────────────────────
async function fetchNewsArticles(env) {
  const articles = [];
  const seen = new Set();
  const queries = [
    'Strait of Hormuz May 2026',
    'Operation Project Freedom Iran US Navy',
    'Iran US ceasefire Hormuz ship attack May 2026',
    'IRGC tanker seized Gulf Oman 2026',
    'Iran nuclear deal Hormuz Rubio negotiations',
    'US Iran strikes Hormuz tanker May 2026',
    'Iran Hormuz transit rules shipping blockade',
  ];

  for (const q of queries) {
    try {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&sortBy=publishedAt&pageSize=8&language=en&apiKey=${env.NEWSAPI_KEY}`;
      const resp = await fetch(url, { headers: { 'User-Agent': 'StraitTracker/3.0' } });
      if (!resp.ok) { console.warn(`[fetchNewsArticles] Query "${q}" returned ${resp.status}`); continue; }
      const data = await resp.json();
      for (const a of (data.articles || [])) {
        if (!a.title || seen.has(a.title)) continue;
        if (a.title === '[Removed]') continue;
        seen.add(a.title);
        articles.push({
          title: a.title,
          description: a.description || '',
          source: a.source?.name || 'Unknown',
          published: a.publishedAt || '',
          url: a.url || '',
        });
      }
    } catch(e) { console.warn(`[fetchNewsArticles] Error on "${q}":`, e.message); }
  }

  // Sort by date, return top 40
  articles.sort((a, b) => new Date(b.published) - new Date(a.published));
  console.log(`[fetchNewsArticles] Total unique articles: ${articles.length}`);
  return articles.slice(0, 40);
}

// ─── OIL PRICES ──────────────────────────────────────────────────────────────
async function fetchOilPrices(env) {
  const AV_KEY = (env && env.ALPHA_VANTAGE_KEY) || '';
  const FH_KEY = (env && env.FINNHUB_API_KEY) || '';
  const oil = { brent: null, wti: null, brent_prev: null, wti_prev: null, brent_change: null, wti_change: null };

  // Strategy 1: Alpha Vantage BRENT
  try {
    if (AV_KEY) {
      const r = await fetch(`https://www.alphavantage.co/query?function=BRENT&interval=daily&apikey=${AV_KEY}`, { headers: { 'User-Agent': 'StraitTracker/3.0' } });
      if (r.ok) {
        const d = await r.json();
        const data = d['data'] || [];
        if (data.length >= 2) {
          oil.brent = parseFloat(data[0]?.value);
          oil.brent_prev = parseFloat(data[1]?.value);
          const pct = ((oil.brent - oil.brent_prev) / oil.brent_prev * 100).toFixed(2);
          oil.brent_change = (pct > 0 ? '+' : '') + pct + '%';
        }
      }
    }
  } catch(e) { console.warn('[fetchOilPrices] AV Brent error:', e.message); }

  // Strategy 2: Alpha Vantage WTI
  try {
    if (AV_KEY) {
      const r = await fetch(`https://www.alphavantage.co/query?function=WTI&interval=daily&apikey=${AV_KEY}`, { headers: { 'User-Agent': 'StraitTracker/3.0' } });
      if (r.ok) {
        const d = await r.json();
        const data = d['data'] || [];
        if (data.length >= 2) {
          oil.wti = parseFloat(data[0]?.value);
          oil.wti_prev = parseFloat(data[1]?.value);
          const pct = ((oil.wti - oil.wti_prev) / oil.wti_prev * 100).toFixed(2);
          oil.wti_change = (pct > 0 ? '+' : '') + pct + '%';
        }
      }
    }
  } catch(e) { console.warn('[fetchOilPrices] AV WTI error:', e.message); }

  // Strategy 3: yfin self-hosted worker (REAL Brent BZ=F + WTI CL=F) — replaces broken BNO*3.1 proxy.
  // Oil quotes fetched from a private quote proxy (endpoint via env.QUOTE_PROXY_URL).
  if ((!oil.brent || !oil.wti) && env.YFIN_API_KEY) {
    try {
      const r = await fetch(`${env.QUOTE_PROXY_URL}/q?symbols=BZ%3DF,CL%3DF`, { headers: { 'X-API-Key': env.YFIN_API_KEY } });
      if (r.ok) {
        const d = await r.json();
        const bz = d?.quotes?.['BZ=F'];
        const cl = d?.quotes?.['CL=F'];
        if (!oil.brent && bz?.price) { oil.brent = parseFloat(bz.price.toFixed(2)); if (bz.changePercent != null) oil.brent_change = (bz.changePercent > 0 ? '+' : '') + bz.changePercent.toFixed(2) + '%'; }
        if (!oil.wti && cl?.price) { oil.wti = parseFloat(cl.price.toFixed(2)); if (cl.changePercent != null) oil.wti_change = (cl.changePercent > 0 ? '+' : '') + cl.changePercent.toFixed(2) + '%'; }
        console.log('[fetchOilPrices] Used yfin worker (BZ=F/CL=F):', oil.brent, oil.wti);
      }
    } catch(e) { console.warn('[fetchOilPrices] yfin error:', e.message); }
  }

  // Strategy 4: Yahoo Finance proxy for CL=F (WTI futures)
  if (!oil.wti) {
    try {
      const r = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/CL%3DF?interval=1d&range=2d', {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
      });
      if (r.ok) {
        const d = await r.json();
        const price = d?.chart?.result?.[0]?.meta?.regularMarketPrice;
        if (price) { oil.wti = parseFloat(price.toFixed(2)); console.log('[fetchOilPrices] Yahoo WTI:', oil.wti); }
      }
    } catch(e) { console.warn('[fetchOilPrices] Yahoo WTI error:', e.message); }
  }

  // Strategy 5: Last known cache fallback
  if (!oil.brent || !oil.wti) {
    try {
      const cached = await env.STRAIT_NEWS_KV.get('oil_cache', 'json');
      if (cached) {
        if (!oil.brent && cached.brent) { oil.brent = cached.brent; oil.brent_change = cached.brent_change; }
        if (!oil.wti && cached.wti) { oil.wti = cached.wti; oil.wti_change = cached.wti_change; }
        console.log('[fetchOilPrices] Used KV cache fallback');
      }
    } catch(e) {}
  }

  // Sanity clamp (Bumboclaat 2026-06-09): reject impossible prints, keep last-good from KV instead of showing garbage.
  const CLAMP_LO = 30, CLAMP_HI = 130;
  for (const k of ['brent','wti']) {
    if (oil[k] != null && (oil[k] < CLAMP_LO || oil[k] > CLAMP_HI)) {
      console.warn(`[fetchOilPrices] CLAMP: ${k}=$${oil[k]} out of [${CLAMP_LO},${CLAMP_HI}] — discarding`);
      oil[k] = null; oil[k+'_change'] = null;
    }
  }
  if (!oil.brent || !oil.wti) {
    try {
      const c = await env.STRAIT_NEWS_KV.get('oil_cache', 'json');
      if (c) { if (!oil.brent && c.brent) { oil.brent = c.brent; oil.brent_change = c.brent_change; } if (!oil.wti && c.wti) { oil.wti = c.wti; oil.wti_change = c.wti_change; } }
    } catch(e) {}
  }
  console.log(`[fetchOilPrices] Final: Brent=$${oil.brent} (${oil.brent_change}), WTI=$${oil.wti} (${oil.wti_change})`);
  return oil;
}

// ─── AIS DATA ─────────────────────────────────────────────────────────────────
async function fetchAISData(env) {
  // AISstream requires WebSocket — use HTTP snapshot/bounding-box if available
  // For now use cached data + count from KV
  try {
    const cached = await env.STRAIT_NEWS_KV.get('hormuz_ais', 'json');
    if (cached && (Date.now() - new Date(cached.updated || 0).getTime()) < 3600000) {
      return cached;
    }
  } catch(e) {}
  return { vessels: [], count: 0, tanker_count: 0, military_count: 0, updated: new Date().toISOString() };
}

// ─── CLAUDE SYNTHESIS ─────────────────────────────────────────────────────────
async function synthesizeIntel(env, articles, oil, aisData, now) {
  const warDay = Math.floor((now - WAR_START) / 86400000);
  const oilCtx = `Brent: $${oil.brent || 'N/A'} (${oil.brent_change || '—'}). WTI: $${oil.wti || 'N/A'} (${oil.wti_change || '—'}).`;
  const aisCtx = aisData.count > 0
    ? `AIS LIVE: ${aisData.count} vessels in Hormuz region. Tankers: ${aisData.tanker_count}. Military: ${aisData.military_count}.`
    : 'AIS: No live vessel data this cycle.';

  const articleText = articles.slice(0, 30).map((a, i) =>
    `[${i+1}] ${a.published?.slice(0,16)} | ${a.source} | ${a.title} | ${a.description?.slice(0,200) || ''}`
  ).join('\n');

  const prompt = `CURRENT DATE/TIME: ${now.toUTCString()} | WAR DAY: ${warDay}
OIL PRICES: ${oilCtx}
${aisCtx}

GROUND TRUTH BASELINE — AS OF JUNE 10, 2026 (use ONLY if newer articles below are absent; ALWAYS prefer fresher dated articles over this baseline):
- Iran-US-Israel war began ~Feb 27, 2026. WAR DAY ${warDay}. Strait of Hormuz effectively CLOSED ~${warDay} consecutive days.
- Jun 8 (late Mon): US Army AH-64 Apache went down off Oman near Hormuz — FIRST Apache lost this war. Both crew RESCUED ALIVE (~2hrs) by a US Navy SURFACE DRONE (first-ever drone rescue). CAUSE UNCONFIRMED (Iranian fire vs mechanical). Iran has claimed NOTHING. (CENTCOM/AP/Axios/NYT)
- Jun 7: Iran fired ~30 ballistic missiles at 3 Israeli air bases (retaliation for Israeli strikes on Beirut's southern suburbs). (IRGC/IDF via AP)
- Jun 8: Israel struck Iranian air defenses + Mahshahr petrochemical complex; blasts in Tehran/Isfahan/Tabriz. Both sides PAUSED after. Netanyahu: "the fire has ceased." Iran warns it resumes if Israel hits S. Lebanon. First direct Israel-Iran exchange since the Apr 8 ceasefire.
- US aircraft losses since late Feb: >=5 fighter jets, 7 KC-135 tankers, 1 SAR helicopter, 2+ dozen drones, now 1 Apache. (CRS May 2026)
- Oil: Brent retreated to ~$92-93/bbl Tue Jun 9 (after a >$97 intraday spike Mon). WTI upper-$80s/low-$90s. (Do NOT report >$130 — that is a data error.)
- A tentative US-Iran 60-day ceasefire / Hormuz-reopening MOU is NEGOTIATED but UNSIGNED; both sides contradict its terms. Trump claims a deal is "2-3 days" away (repeated for ~2 months).
- Jun 9 (late): US/CENTCOM struck ~20 Iranian air-defense/radar/surveillance sites near Hormuz (Sirik, Bandar Abbas, Minab, Qeshm) — "proportional response" to the Jun 8 Apache downing; US framed it as a limited warning.
- Jun 10: Iran's IRGC retaliated with missiles/drones on the US Al-Azraq base in Jordan + targets in Kuwait & Bahrain; Jordan intercepted 5, US says "just about all" intercepted, no confirmed US casualties (Iran's claimed damage unverified).
- Jun 10: Trump says Iran "completely defeated," will "pay the price," hints at strikes on Iranian power plants/bridges while still calling a deal "close"; Qatar mediating in Tehran; Iran says talks "under review."
- Threat: CRITICAL. The April ceasefire is at its most strained since signing — near collapse but not formally ended.

RECENT NEWS ARTICLES:
${articleText || 'No new articles available this cycle — use ground truth context above.'}

You are a naval OSINT intelligence analyst producing structured JSON for a live crisis tracker.
Respond ONLY with valid JSON — no markdown, no explanation, just the JSON object.

{
  "operation": {
    "name": "Operation Project Freedom",
    "status": "one of: ACTIVE | PAUSED | SUSPENDED | THREATENED | ENDED",
    "detail": "1-2 sentence current status of the operation",
    "color": "one of: red | orange | yellow | green"
  },
  "status": {
    "ceasefire": "string max 50 chars — e.g. FRAGILE — ACTIVE STRIKES",
    "hormuz": "string max 50 chars — e.g. CONTESTED — IRAN IMPOSING RULES",
    "blockade": "string max 50 chars — e.g. PARTIAL — US/IRAN BOTH ENFORCING",
    "talks": "string max 60 chars — e.g. AWAITING IRAN RESPONSE (Oman)",
    "threat_level": "CRITICAL | HIGH | ELEVATED | MODERATE | LOW",
    "war_day": ${warDay},
    "summary_one_line": "string max 120 chars — current situation summary"
  },
  "stats": {
    "vessels_trapped": "string e.g. 200+ VESSELS",
    "seafarers_trapped": "20,000+",
    "oil_brent": ${oil.brent || 'null'},
    "oil_wti": ${oil.wti || 'null'},
    "ships_escort_convoy": "number or string",
    "ships_fired_on": "string — today's count/status of ships fired upon, e.g. '2 (JUN 10)' or 'NONE REPORTED (24H)'",
    "tankers_crossed": "string — Iranian/foreign tankers crossing Hormuz in last 24-48h, e.g. '25+ (IRGC CLAIM)' or 'MINIMAL — LANE CONTESTED'",
    "ships_seized": "string — vessels seized/detained in last 24-48h, e.g. '1 (JUN 10)' or 'NONE REPORTED (24H)'",
    "us_forces_theater": "90,000+",
    "insurance_premium_multiplier": "20x"
  },
  "events": [
    {
      "id": "unique 4-char string",
      "date": "May 9, 2026",
      "tag": "FLASH | BREAKING | UPDATE | CEASEFIRE | SUPPLY | NAVAL | DIPLOMATIC | INTEL | ECONOMIC",
      "tag_color": "red | orange | blue | green | purple | yellow",
      "icon": "single emoji",
      "title": "ALL CAPS TITLE MAX 65 CHARS",
      "body": "2-3 sentences. Military intelligence style. Specific facts only.",
      "source": "Source Name — Date",
      "severity": "critical | high | medium | low"
    }
  ],
  "ticker": [
    "Short breaking-news string max 90 chars — present tense, factual"
  ],
  "vessels": null
}

Produce 8-12 events covering the most important developments from May 14-20, 2026 — PRIORITIZE the very latest news from today (May 20) and the Trump-Xi Beijing summit (May 14-15). DO NOT lean on training data; use ONLY the articles provided above.
Prioritize CRITICAL severity events first. Include exactly 6-8 ticker items.
Events must be factual and sourced — do not invent events not in the articles or context above.`;

  try {
    // Workers AI llama — replaces Anthropic Haiku (May 11 2026)
    let raw = '';
    try {
      const aiRes = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3000,
        temperature: 0.4
      });
      raw = (aiRes && aiRes.response || '').trim();
    } catch (e) {
      throw new Error('Llama error: ' + e.message);
    }
    if (!raw) throw new Error('Llama returned empty');
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Claude response');

    const parsed = JSON.parse(jsonMatch[0]);
    sanitizeEmojis(parsed);
    console.log(`[synthesizeIntel] Llama success. Events: ${parsed.events?.length}, Threat: ${parsed.status?.threat_level}`);

    // Merge vessels: always use static (Llama doesn't produce them)
    parsed.vessels = STATIC_VESSELS;
    return parsed;

  } catch(e) {
    console.error('[synthesizeIntel] Llama failed:', e.message);
    // Gemini fallback
    return await synthesizeWithGemini(env, articles, oil, warDay, prompt, e.message);
  }
}

// ─── GEMINI FALLBACK ──────────────────────────────────────────────────────────
async function synthesizeWithGemini(env, articles, oil, warDay, prompt, claudeError) {
  console.log('[synthesizeWithGemini] Attempting Gemini fallback. Claude error:', claudeError);
  try {
    const GEMINI_KEY = env.GEMINI_API_KEY || '';
    if (!GEMINI_KEY) throw new Error('No GEMINI_API_KEY');

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 3000, temperature: 0.3 },
      }),
    });

    if (!r.ok) throw new Error(`Gemini ${r.status}`);
    const d = await r.json();
    const raw = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in Gemini response');

    const parsed = JSON.parse(jsonMatch[0]);
    sanitizeEmojis(parsed);
    parsed.vessels = STATIC_VESSELS;
    parsed._synthesizer = 'gemini-fallback';
    console.log('[synthesizeWithGemini] Gemini success. Events:', parsed.events?.length);
    return parsed;

  } catch(e) {
    console.error('[synthesizeWithGemini] Gemini also failed:', e.message);
    // Ultimate fallback: return backstop payload
    return buildBackstopPayload(warDay);
  }
}


// ─── EMOJI LAW ENFORCER ───────────────────────────────────────────────────────
// 🚨 IS BANNED FOREVER — replace with 🟥 everywhere in synthesized output.
function sanitizeEmojis(obj) {
  const swap = (s) => typeof s === 'string' ? s.replace(/🚨/g, '🟥') : s;
  if (!obj || typeof obj !== 'object') return;
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (typeof v === 'string') obj[k] = swap(v);
    else if (Array.isArray(v)) {
      for (let i = 0; i < v.length; i++) {
        if (typeof v[i] === 'string') v[i] = swap(v[i]);
        else if (typeof v[i] === 'object') sanitizeEmojis(v[i]);
      }
    } else if (typeof v === 'object' && v !== null) sanitizeEmojis(v);
  }
}

// ─── TELEGRAM ALERT (stub — non-blocking) ─────────────────────────────────────
async function sendTelegramAlert(env, html) {
  try {
    if (!env.TELEGRAM_BOT_TOKEN) return;
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ \1"__REDACTED_CHATID__", text: html, parse_mode: 'HTML' }),
    });
  } catch(e) { console.warn('[sendTelegramAlert]', e.message); }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

function buildBackstopPayload(warDay) {
  return {
    version: 3,
    updated: new Date().toISOString(),
    war_day: warDay,
    _source: 'static-backstop',
    operation: {
      name: 'Operation Project Freedom',
      status: 'PAUSED',
      detail: 'CENTCOM blockade-enforcement posture ongoing. Ceasefire fragile and unsigned after the Jun 7-8 exchange.',
      color: 'orange',
    },
    status: {
      ceasefire: 'STRAINED — NEAR COLLAPSE AFTER JUN 9-10 US/IRAN EXCHANGE',
      hormuz: 'EFFECTIVELY CLOSED ~102 DAYS',
      blockade: 'PARTIAL — US/IRAN BOTH ENFORCING',
      talks: 'UNDER REVIEW — QATAR MEDIATING IN TEHRAN',
      threat_level: 'CRITICAL',
      war_day: warDay,
      summary_one_line: 'Jun 9: US struck ~20 Iran air-defense/radar sites near Hormuz; Jun 10: Iran hit US Al-Azraq base (Jordan) + Kuwait & Bahrain, US says nearly all intercepted; Trump warns Iran will pay the price',
    },
    stats: {
      vessels_trapped: 'HUNDREDS',
      seafarers_trapped: '20,000+',
      oil_brent: null,
      oil_wti: null,
      ships_fired_on: 'JUN 9-10 US/IRAN EXCHANGE — BASES HIT, FEW CIVILIAN SHIPS',
      tankers_crossed: 'CONTESTED — LANE EFFECTIVELY CLOSED ~102 DAYS',
      ships_seized: 'NONE REPORTED (24H)',
      us_forces_theater: '90,000+',
      insurance_premium_multiplier: '20x',
    },
    events: BACKSTOP_EVENTS,
    ticker: buildDefaultTicker(),
    vessels: STATIC_VESSELS,
    naval_assets: STATIC_NAVAL_ASSETS,
    oil: { brent: null, wti: null },
    ais: { count: 0 },
  };
}

function buildOpFreedomStatus(intel) {
  const threat = intel?.status?.threat_level || 'HIGH';
  return {
    name: 'Operation Project Freedom',
    status: 'PAUSED',
    detail: 'CENTCOM blockade-enforcement posture ongoing. Fragile, unsigned ceasefire; escalation risk remains high after Jun 7-8 exchange.',
    color: threat === 'CRITICAL' ? 'red' : 'orange',
  };
}

function buildDefaultStatus(warDay) {
  return {
    ceasefire: 'FRAGILE',
    hormuz: 'CONTESTED — LANE EFFECTIVELY CLOSED',
    blockade: 'PARTIAL — US/IRAN BOTH ENFORCING',
    talks: 'UNDER REVIEW',
    threat_level: 'HIGH',
    war_day: warDay,
    summary_one_line: 'Iran-US-Israel conflict ongoing with high escalation risk',
    ships_fired_on: 'NONE CIVILIAN (24H) — JUN 9-10 STRIKES HIT BASES',
    tankers_crossed: 'CONTESTED LANE — MINIMAL CIVILIAN',
    ships_seized: 'NONE REPORTED (24H)',
  };
}

function buildDefaultStats(oil) {
  return {
    vessels_trapped: 'HUNDREDS',
    seafarers_trapped: '20,000+',
    oil_brent: oil?.brent || null,
    oil_wti: oil?.wti || null,
    ships_fired_on: 'NONE CIVILIAN (24H) — JUN 9-10 STRIKES HIT BASES',
    tankers_crossed: 'CONTESTED LANE — MINIMAL CIVILIAN',
    ships_seized: 'NONE REPORTED (24H)',
    us_forces_theater: '90,000+',
    insurance_premium_multiplier: '20x',
  };
}

function buildDefaultTicker() {
  return [
    '🟥 US Apache down off Oman Jun 8 — crew saved by Navy drone, cause UNCONFIRMED, Iran claims nothing',
    '💥 First Israel-Iran direct exchange since April ceasefire — Jun 7-8, both paused after',
    '⚓ Strait of Hormuz effectively closed ~101 days',
    '📜 60-day US-Iran Hormuz MOU negotiated but UNSIGNED — both sides contradict terms',
    '✈️ US losses mount: 5+ jets, 7 KC-135s, SAR heli, 2+ dozen drones, now 1 Apache',
    '🛢 Brent ~$92-93 after >$97 intraday spike Monday',
    '🕊 Netanyahu: "the fire has ceased" — Iran warns it resumes if Israel hits S. Lebanon',
    '🌐 Trump says deal "2-3 days" away — a claim repeated for ~2 months',
  ];
}
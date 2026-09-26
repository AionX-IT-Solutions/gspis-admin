import type { ReactNode } from 'react'
import {
  LayoutDashboard,
  Megaphone,
  CalendarRange,
  ShoppingCart,
  Boxes,
  Users,
  FileText,
  Wallet2,
  Truck,
  Ticket,
  BarChart3,
  Award,
  Tent,
  Target,
  ClipboardList,
  GraduationCap,
  UserCog,
  Fingerprint,
  CalendarClock,
  Wallet,
  Network,
  Building2,
  UserCheck,
  CalendarDays,
  UserCog2,
  Settings as SettingsIcon,
  Usb,
  Info,
  Landmark,
  Briefcase,
  IdCard,
  ClipboardCheck
} from 'lucide-react'

/**
 * Manual copy is kept here (not in the i18n locale files) because it's long-form,
 * page-specific prose rather than short reusable UI strings — bilingual pairs are
 * inlined per field so the two languages stay next to each other and easy to keep
 * in sync as modules change.
 */
export interface Bilingual {
  en: string
  tl: string
}

export interface ManualModule {
  /** Matches a key in MODULE_PERMISSIONS / MODULE_LABELS / MODULE_ROUTES, or 'settings' | 'devices' | 'about'. */
  key: string
  icon: ReactNode
  summary: Bilingual
  steps: { en: string[]; tl: string[] }
  tips?: { en: string[]; tl: string[] }
}

export interface ManualSection {
  key: string
  icon: ReactNode
  modules: ManualModule[]
}

export const manualSections: ManualSection[] = [
  {
    key: 'core',
    icon: <LayoutDashboard size={16} />,
    modules: [
      {
        key: 'dashboard',
        icon: <LayoutDashboard size={16} />,
        summary: {
          en: 'A snapshot of the whole council: sales, collections, low-stock items, attendance, pending leave, upcoming birthdays, and the latest announcements.',
          tl: 'Buod ng buong konseho: benta, koleksyon, mababang stock, attendance, nakabinbing leave, paparating na kaarawan, at pinakabagong anunsyo.'
        },
        steps: {
          en: [
            'Sign in — you land here automatically unless your role has a different home page (Cashier → Point of Sale, HR → Employees).',
            'Scan the summary cards for anything that needs attention, e.g. low-stock items or pending leave requests.',
            'Use "View all" on any card to jump straight to that module.'
          ],
          tl: [
            'Mag-sign in — dadalhin ka rito automatic maliban kung ibang home page ang role mo (Cashier → Point of Sale, HR → Employees).',
            'Tingnan ang mga summary card kung may kailangang aksyon, hal. mababang stock o nakabinbing leave request.',
            'Gamitin ang "View all" sa kahit anong card para diretso sa module na iyon.'
          ]
        },
        tips: {
          en: [
            'Upcoming Birthdays pulls from every registry with a birthdate on file — Troop Members, Training Profiles, Employees, Council Board, and User Accounts — showing anyone with a birthday today or within the next 30 days. It only appears once at least one is found.'
          ],
          tl: [
            'Ang Upcoming Birthdays ay kinukuha mula sa bawat registry na may naitalang kaarawan — Troop Members, Training Profiles, Employees, Council Board, at User Accounts — ipinapakita ang sinumang may kaarawan ngayon o sa susunod na 30 araw. Lalabas lang ito kapag may nakitang kahit isa.'
          ]
        }
      },
      {
        key: 'announcements',
        icon: <Megaphone size={16} />,
        summary: {
          en: 'Council-wide announcements board, also highlighted on the Dashboard — read by every signed-in user, posted only by Admins.',
          tl: 'Board ng mga anunsyo ng buong konseho, kasama sa Dashboard — nababasa ng lahat, pero ang Admin lang ang nakakapag-post.'
        },
        steps: {
          en: [
            'Open Announcements to read the full feed, newest first.',
            'If you are a Super Admin or Admin, use the compose button to post a new announcement.',
            'Edit or remove a post you no longer need — it disappears from every device, including gspi-app (mobile).'
          ],
          tl: [
            'Buksan ang Announcements para basahin ang buong feed, pinakabago muna.',
            'Kung Super Admin o Admin ka, gamitin ang compose button para mag-post ng bagong anunsyo.',
            'I-edit o tanggalin ang post na hindi na kailangan — mawawala ito sa lahat ng device, kasama ang gspi-app (mobile).'
          ]
        }
      },
      {
        key: 'activities',
        icon: <CalendarRange size={16} />,
        summary: {
          en: 'Schedule and track council/troop activities — meetings, camps, trainings, community service, and ceremonies — with a list view and a monthly calendar.',
          tl: 'Mag-iskedyul at subaybayan ang mga aktibidad ng konseho/troop — miting, kampo, pagsasanay, serbisyo sa komunidad, at seremonya — may list view at buwanang calendar.'
        },
        steps: {
          en: [
            'Click "New Activity" to schedule one — set its category, start date, an end date too if it spans several days (e.g. a camp), time, location, and organizer.',
            'Switch to the Calendar tab to see everything scheduled for a month at a glance; click any day to see its full list.',
            'Edit or delete an activity from the list view, and update its status as it happens (Scheduled → Ongoing → Completed, or Cancelled).'
          ],
          tl: [
            'I-click ang "New Activity" para mag-iskedyul — itakda ang category, start date, at end date kung ilang araw ito (hal. kampo), oras, lokasyon, at organizer.',
            'Lumipat sa Calendar tab para makita lahat ng naka-iskedyul sa isang buwan; i-click ang kahit anong araw para makita ang buong listahan doon.',
            'I-edit o tanggalin ang aktibidad mula sa list view, at i-update ang status habang nagaganap (Scheduled → Ongoing → Completed, o Cancelled).'
          ]
        },
        tips: {
          en: [
            "The calendar doesn't look earlier than 2026 — the council's first tracked year for this app."
          ],
          tl: [
            'Hindi tumitingin ang calendar sa mas maaga sa 2026 — ang unang taong sinusubaybayan ng app na ito.'
          ]
        }
      },
      {
        key: 'pos',
        icon: <ShoppingCart size={16} />,
        summary: {
          en: 'The checkout screen — ring up sales of council merchandise and Girl Scout supplies.',
          tl: 'Ang checkout screen — mag-benta ng merchandise ng konseho at gamit pang-Girl Scout.'
        },
        steps: {
          en: [
            'Search or scan a product to add it to the current sale (a connected barcode scanner works automatically — see Devices).',
            'Adjust quantities, apply any discount, and pick a payment method.',
            'Complete the sale to print or reprint a receipt; every sale is saved to Sales History.',
            'Rung up by mistake? Void it from Sales History with a reason — this restores the stock and excludes it from collections, without deleting the sale record.',
            'Accountants can view Point of Sale for the Daily Collections report, but only Cashiers and Admins can ring up a sale.'
          ],
          tl: [
            'Maghanap o i-scan ang produkto para idagdag sa kasalukuyang benta (automatic gumagana ang naka-connect na barcode scanner — tingnan ang Devices).',
            'I-adjust ang quantity, ilagay ang discount kung meron, at piliin ang paraan ng bayad.',
            'Kumpletuhin ang benta para mag-print o magprint-ulit ng resibo; naka-save ang bawat benta sa Sales History.',
            'Nagkamali sa pagbenta? I-void ito mula sa Sales History kasama ang dahilan — ibabalik nito ang stock at hindi na ito isasama sa collections, pero hindi tatanggalin ang record ng benta.',
            'Makikita ng Accountant ang Point of Sale para sa Daily Collections report, pero Cashier at Admin lang ang pwedeng magbenta.'
          ]
        }
      },
      {
        key: 'products',
        icon: <Boxes size={16} />,
        summary: {
          en: 'Inventory of everything sold through Point of Sale — stock levels, prices, categories, and low-stock alerts.',
          tl: 'Inventory ng lahat ng binebenta sa Point of Sale — stock level, presyo, category, at low-stock alert.'
        },
        steps: {
          en: [
            'Add a product with its name, SKU/barcode, price, category, and starting stock.',
            "Edit stock counts as inventory comes in — the Dashboard's Low Stock card watches these levels.",
            "Categories are a shared system list (seeded once) used by this app and gspi-app — you can't add or rename one here."
          ],
          tl: [
            'Magdagdag ng produkto kasama ang pangalan, SKU/barcode, presyo, category, at starting stock.',
            'I-edit ang stock count kapag may dumating na paninda — sinusubaybayan ito ng Low Stock card sa Dashboard.',
            'Ang categories ay shared system list (naka-seed na, minsan lang) na ginagamit ng app na ito at ng gspi-app — hindi ka pwedeng magdagdag o magpalit ng pangalan dito.'
          ]
        }
      },
      {
        key: 'members',
        icon: <Users size={16} />,
        summary: {
          en: 'Point-of-Sale members (e.g. for member pricing/loyalty) — a different list from the Girl Scout roster under Troops.',
          tl: 'Mga miyembro para sa Point of Sale (hal. para sa member pricing/loyalty) — iba ito sa roster ng Girl Scout na nasa Troops.'
        },
        steps: {
          en: [
            'Add a member with their basic details before checking them out at the POS for any member-specific pricing.',
            "Search here whenever a cashier needs to look up or update a member's record."
          ],
          tl: [
            'Magdagdag ng miyembro kasama ang basic details bago i-checkout sa POS para sa member-specific na presyo.',
            'Maghanap dito kapag kailangan ng cashier na hanapin o i-update ang record ng isang miyembro.'
          ]
        },
        tips: {
          en: [
            'Looking for the Girl Scout troop roster instead? That lives under Troops, not here.'
          ],
          tl: ['Hinahanap ang roster ng troop ng Girl Scout? Nasa Troops iyon, hindi dito.']
        }
      }
    ]
  },
  {
    key: 'troopsMembership',
    icon: <Tent size={16} />,
    modules: [
      {
        key: 'troops',
        icon: <Tent size={16} />,
        summary: {
          en: 'Every troop in the council and its Girl Scout member roster.',
          tl: 'Bawat troop sa konseho at ang roster ng miyembrong Girl Scout nito.'
        },
        steps: {
          en: [
            'Open a troop to see its member roster, or add a new troop.',
            "Add or edit a scout member's record from within their troop's profile.",
            "Record a Membership, Training, or Camping fee payment per member as they pay — the full amount collected always feeds Daily Collections. Training and Camping Fees (no National HQ split) also feed SCRD and their Council Budget line immediately; the GSP Membership Fee's Council-retained share only counts once its own second Council Share Receipt is printed from the Payment tab (see the tip below).",
            'Open View on a member to see their full profile alongside their payment history.'
          ],
          tl: [
            'Buksan ang troop para makita ang roster ng miyembro, o magdagdag ng bagong troop.',
            'Magdagdag o mag-edit ng record ng scout member mula sa profile ng kanilang troop.',
            'I-record ang Membership, Training, o Camping fee ng bawat miyembro kapag nagbayad sila — palaging bahagi ng Daily Collections ang buong halagang nakolekta. Ang Training at Camping Fees (walang National HQ split) ay agad ding bahagi ng SCRD at ng Council Budget line nito; ang Council-retained share ng GSP Membership Fee ay nabibilang lang kapag na-print na ang sarili nitong pangalawang Council Share Receipt mula sa Payment tab (tingnan ang tip sa ibaba).',
            'Buksan ang View sa isang miyembro para makita ang buong profile kasama ang history ng bayad nila.'
          ]
        },
        tips: {
          en: [
            "A troop or member with any payment history can't be deleted outright — Daily Collections, SCRD, and the Council Budget all pull those payments live, so removing one would quietly shrink an already-reported day. Deactivate them instead; that hides them from the active roster without touching their history.",
            'A payment posts to its Council Budget line the same way any other auto-tracked figure does — open Edit on that line in Budget and apply the live suggestion; it never fills in on its own.',
            "The Registrations tab's Paid/Unpaid badge is read-only — it just reflects whether the Payment tab has already recorded that troop's current Membership Fee remittance; there's no separate place to mark it paid. To recognize the Council's own retained share of that fee in SCRD/Budget, use \"Print Council Share Receipt\" on the matching row in the Payment tab — a second, internal receipt distinct from the Acknowledgment/Official Receipt already given for the full amount collected."
          ],
          tl: [
            'Hindi puwedeng burahin nang tuluyan ang troop o miyembrong may payment history — kinukuha ito nang live ng Daily Collections, SCRD, at ng Council Budget, kaya kapag tinanggal ay babawasan nito ang report ng araw na na-record na. I-deactivate na lang sila; itatago sila sa active roster nang hindi nawawala ang history.',
            'Kapareho ng ibang auto-tracked figure, ang isang bayad ay nakikita sa Council Budget line nito — buksan ang Edit doon at i-apply ang live suggestion; hindi ito awtomatikong napupunan nang mag-isa.',
            'Read-only lang ang Paid/Unpaid badge sa Registrations tab — sinasalamin lang nito kung na-record na ng Payment tab ang kasalukuyang Membership Fee remittance ng troop na iyon; walang hiwalay na lugar para markahan itong bayad na. Para mabilang ang Council-retained share ng fee na iyon sa SCRD/Budget, gamitin ang "Print Council Share Receipt" sa tumutugmang row sa Payment tab — pangalawa, internal na resibo na hiwalay sa Acknowledgment/Official Receipt na naibigay na para sa buong halagang nakolekta.'
          ]
        }
      },
      {
        key: 'troopRegistration',
        icon: <ClipboardList size={16} />,
        summary: {
          en: 'The national GSP Troop Registration Form — filed with National HQ once per troop per school year.',
          tl: 'Ang pambansang GSP Troop Registration Form — isinusumite sa National HQ isang beses bawat troop kada school year.'
        },
        steps: {
          en: [
            'Click New Registration and pick a troop — its header info and current member roster pre-fill automatically from the Troop page (one flat list, not grouped by Patrol/Cluster).',
            "A member typed in fresh here (not yet on the roster) is added to that troop's roster automatically once saved.",
            'Fill in the Leaders table, the member list, the two signatures, and the Council Action Remittance section (fees, Troop No., card series, ROR/DCCR numbers).',
            'Save to file it — each school year is kept as its own record, so a past year can always be reopened and reprinted exactly as filed.',
            'Export prints the form in the same layout as the paper original — including the "Name of Patrol/Cluster:" line, printed blank — in Excel, PDF, or Word.'
          ],
          tl: [
            'I-click ang New Registration at pumili ng troop — awtomatikong mapupunan ang header info at kasalukuyang member roster nito (iisang flat na listahan, hindi nakagroup ayon sa Patrol/Cluster) mula sa Troop page.',
            'Ang miyembrong bagong itype dito (wala pa sa roster) ay awtomatikong madaragdag sa roster ng troop na iyon pagka-save.',
            'Punan ang Leaders table, ang listahan ng miyembro, ang dalawang lagda, at ang Council Action Remittance section (bayad, Troop No., card series, ROR/DCCR numbers).',
            'I-save para maisumite ito — hiwalay na record ang bawat school year, kaya puwede palaging buksan at i-print muli ang nakaraang taon nang eksakto sa isinumite.',
            'Ipi-print ng Export ang form gamit ang parehong layout ng orihinal na papel — kasama ang "Name of Patrol/Cluster:" na linya, naka-print na blangko — sa Excel, PDF, o Word.'
          ]
        },
        tips: {
          en: [
            'A new registration defaults the Troop Fee to ₱7.50 and the Thinking Day Fund to ₱10 — both editable per filing.'
          ],
          tl: [
            'Ang bagong registration ay default sa ₱7.50 para sa Troop Fee at ₱10 para sa Thinking Day Fund — pareho itong pwedeng baguhin bawat filing.'
          ]
        }
      },
      {
        key: 'districtCommittee',
        icon: <Landmark size={16} />,
        summary: {
          en: 'District Committees across the council — their officer roster, national registration filings, and D.C. Group Fee payments.',
          tl: 'Mga District Committee ng konseho — roster ng opisyales, pambansang registration filing, at bayad ng D.C. Group Fee.'
        },
        steps: {
          en: [
            'Open a committee to see its officer roster (Chairman, Vice-Chairman, Secretary, Treasurer, Dist. Commissioner, and the other positions the paper form lists), or click "Add Committee" to add one.',
            "Set the committee's District so it counts under the right row on the Membership Status Report.",
            'File a yearly Registration for the committee under the Registration tab — one record per school year, reopenable in later years exactly as filed.',
            "Record its D.C. Group Fee and each officer's membership fee from the Payment tab — it prints the Acknowledgment Receipt/Official Receipt automatically."
          ],
          tl: [
            'Buksan ang committee para makita ang roster ng opisyales (Chairman, Vice-Chairman, Secretary, Treasurer, Dist. Commissioner, at iba pang posisyon sa paper form), o i-click ang "Add Committee" para magdagdag.',
            'Itakda ang District ng committee para mabilang ito sa tamang row sa Membership Status Report.',
            'Mag-file ng taunang Registration para sa committee sa Registration tab — isang record bawat school year, mabubuksan muli sa susunod na taon nang eksakto sa isinumite.',
            'I-record ang D.C. Group Fee at membership fee ng bawat opisyal mula sa Payment tab — awtomatiko nitong ipi-print ang Acknowledgment Receipt/Official Receipt.'
          ]
        },
        tips: {
          en: [
            "The D.C. Group Fee is one flat amount per committee, not amount × member count — it prints and posts separately from each officer's own membership fee."
          ],
          tl: [
            'Ang D.C. Group Fee ay iisang flat amount bawat committee, hindi amount × bilang ng miyembro — hiwalay itong naka-print at naitatala sa sariling membership fee ng bawat opisyal.'
          ]
        }
      },
      {
        key: 'barangayCommittee',
        icon: <Landmark size={16} />,
        summary: {
          en: 'Barangay Committees across the council — their officer roster, national registration filings, and B.C. Group Fee payments, same structure as District Committee.',
          tl: 'Mga Barangay Committee ng konseho — roster ng opisyales, pambansang registration filing, at bayad ng B.C. Group Fee, kaparehong istruktura ng District Committee.'
        },
        steps: {
          en: [
            'Open a committee to see its officer roster, or click "Add Committee" to add one — optionally link it to the District Committee it falls under.',
            'File a yearly Registration under the Registration tab, one record per school year.',
            "Record its B.C. Group Fee and each officer's membership fee from the Payment tab — prints the Acknowledgment Receipt/Official Receipt automatically."
          ],
          tl: [
            'Buksan ang committee para makita ang roster ng opisyales, o i-click ang "Add Committee" para magdagdag — opsyonal na i-link ito sa District Committee na kinabibilangan nito.',
            'Mag-file ng taunang Registration sa Registration tab, isang record bawat school year.',
            'I-record ang B.C. Group Fee at membership fee ng bawat opisyal mula sa Payment tab — awtomatiko nitong ipi-print ang Acknowledgment Receipt/Official Receipt.'
          ]
        },
        tips: {
          en: [
            "Each officer's own membership fee (₱50 default, editable) is a pure pass-through to National HQ with no Council share, so it never counts toward SCRD/Council Budget — only the B.C. Group Fee (₱15 default, one flat amount per committee, not × member count) is the Council's retained income, and it counts as soon as the Payment tab records it."
          ],
          tl: [
            'Ang sariling membership fee ng bawat opisyal (₱50 default, pwedeng baguhin) ay pure pass-through sa National HQ na walang Council share, kaya hindi ito nabibilang sa SCRD/Council Budget — ang B.C. Group Fee lang (₱15 default, iisang flat amount bawat committee, hindi × bilang ng miyembro) ang retained income ng Council, at nabibilang ito agad kapag na-record na ng Payment tab.'
          ]
        }
      },
      {
        key: 'trefoilGuild',
        icon: <Landmark size={16} />,
        summary: {
          en: 'Trefoil Guilds across the council — adult/alumnae member roster, national registration filings, and T.G. Group Fee payments, same structure as District/Barangay Committee.',
          tl: 'Mga Trefoil Guild ng konseho — roster ng miyembrong alumnae/adult, pambansang registration filing, at bayad ng T.G. Group Fee, kaparehong istruktura ng District/Barangay Committee.'
        },
        steps: {
          en: [
            'Open a guild to see its member roster, or click "Add Guild" to add one, with its Guild Number.',
            'File a yearly Registration under the Registration tab, one record per school year.',
            "Record its T.G. Group Fee and each member's ₱50 (default, editable) membership fee from the Payment tab."
          ],
          tl: [
            'Buksan ang guild para makita ang roster ng miyembro, o i-click ang "Add Guild" para magdagdag, kasama ang Guild Number.',
            'Mag-file ng taunang Registration sa Registration tab, isang record bawat school year.',
            'I-record ang T.G. Group Fee at ang ₱50 (default, pwedeng baguhin) na membership fee ng bawat miyembro mula sa Payment tab.'
          ]
        },
        tips: {
          en: [
            "Each member's own ₱50 membership fee is a pure pass-through to National HQ with no Council share, so it never counts toward SCRD/Council Budget — only the T.G. Group Fee (₱200 default, one flat amount per guild, not × member count) is the Council's retained income, and it counts as soon as the Payment tab records it."
          ],
          tl: [
            'Ang sariling ₱50 na membership fee ng bawat miyembro ay pure pass-through sa National HQ na walang Council share, kaya hindi ito nabibilang sa SCRD/Council Budget — ang T.G. Group Fee lang (₱200 default, iisang flat amount bawat guild, hindi × bilang ng miyembro) ang retained income ng Council, at nabibilang ito agad kapag na-record na ng Payment tab.'
          ]
        }
      },
      {
        key: 'oavf',
        icon: <Briefcase size={16} />,
        summary: {
          en: 'Other Adult Volunteer and Career Woman Member applicants — a bio profile plus a yearly Registration filing and its own Payment tab.',
          tl: 'Mga aplikante ng Other Adult Volunteer at Career Woman Member — bio profile kasama ang taunang Registration filing at sariling Payment tab.'
        },
        steps: {
          en: [
            'Add the applicant under Members — their bio details can be corrected anytime.',
            "File their yearly Registration under the Registration tab (Girl Scout history, school year) — a past year stays exactly as filed even if the member's own profile changes later.",
            'Use the Payment tab\'s "Record Payment" to pick an unpaid Registration and collect the fee — it prints the Acknowledgment Receipt/Official Receipt automatically. Reprint or correct a past payment from the same tab.'
          ],
          tl: [
            'Idagdag ang aplikante sa Members — pwedeng iwasto ang bio details nila anumang oras.',
            'I-file ang taunang Registration nila sa Registration tab (Girl Scout history, school year) — mananatiling eksakto sa isinumite ang nakaraang taon kahit magbago pa ang profile ng miyembro mamaya.',
            'Gamitin ang "Record Payment" sa Payment tab para pumili ng unpaid Registration at kolektahin ang bayad — awtomatiko nitong ipi-print ang Acknowledgment Receipt/Official Receipt. Mag-reprint o mag-wasto ng nakaraang bayad mula sa parehong tab.'
          ]
        },
        tips: {
          en: [
            "The Membership Fee is ₱100 — only ₱25 of that is the Council's own retained income (the other ₱75 goes to National HQ). That ₱25 only counts toward SCRD/Council Budget once its own second Council Share Receipt is printed from the Registration row — the Acknowledgment/Official Receipt given at Record Payment already covers the full ₱100 collected.",
            'The Members table shows an Active/Expired badge for each applicant based on their most recently filed Registration — the membership is treated as valid for 1 year from that date.',
            "Deleting a Member also removes their Registrations — if a payment (and Council Share Receipt) was already recorded, you'll be asked to confirm a second time before it proceeds."
          ],
          tl: [
            'Ang Membership Fee ay ₱100 — ₱25 lang doon ang talagang retained income ng Council (ang ₱75 ay napupunta sa National HQ). Nabibilang lang ang ₱25 na iyon sa SCRD/Council Budget kapag na-print na ang sarili nitong pangalawang Council Share Receipt mula sa row ng Registration — ang Acknowledgment/Official Receipt na naibigay na sa Record Payment ay sakop na ang buong ₱100 na nakolekta.',
            'Nagpapakita ang Members table ng Active/Expired badge para sa bawat aplikante base sa pinakahuling na-file na Registration nila — itinuturing na valid ang membership sa loob ng 1 taon mula sa petsang iyon.',
            'Kapag binura ang isang Member, matatanggal din ang mga Registration nila — kung may nakolekta nang bayad (at Council Share Receipt), hihilingin sa iyo na kumpirmahin muli bago ito magpatuloy.'
          ]
        }
      },
      {
        key: 'honoraryMember',
        icon: <Award size={16} />,
        summary: {
          en: 'Honorary Member applicants — same Member + yearly Registration + Payment structure as OAVF/Career Woman.',
          tl: 'Mga aplikante ng Honorary Member — kaparehong Member + taunang Registration + Payment na istruktura ng OAVF/Career Woman.'
        },
        steps: {
          en: [
            'Add the honoree under Members, then file their yearly Registration under the Registration tab.',
            'Record and reprint payments from the Payment tab, same as OAVF/Career Woman.'
          ],
          tl: [
            'Idagdag ang honoree sa Members, pagkatapos i-file ang taunang Registration nila sa Registration tab.',
            'I-record at i-reprint ang bayad mula sa Payment tab, kagaya ng OAVF/Career Woman.'
          ]
        },
        tips: {
          en: [
            "The Membership Fee is ₱150 — only ₱60 of that is the Council's own retained income (the other ₱90 goes to National HQ). That ₱60 only counts toward SCRD/Council Budget once its own second Council Share Receipt is printed from the Registration row — the Acknowledgment/Official Receipt given at Record Payment already covers the full ₱150 collected.",
            'The Members table shows an Active/Expired badge for each honoree based on their most recently filed Registration — the membership is treated as valid for 3 years from that date.',
            "Deleting a Member also removes their Registrations — if a payment (and Council Share Receipt) was already recorded, you'll be asked to confirm a second time before it proceeds."
          ],
          tl: [
            'Ang Membership Fee ay ₱150 — ₱60 lang doon ang talagang retained income ng Council (ang ₱90 ay napupunta sa National HQ). Nabibilang lang ang ₱60 na iyon sa SCRD/Council Budget kapag na-print na ang sarili nitong pangalawang Council Share Receipt mula sa row ng Registration — ang Acknowledgment/Official Receipt na naibigay na sa Record Payment ay sakop na ang buong ₱150 na nakolekta.',
            'Nagpapakita ang Members table ng Active/Expired badge para sa bawat honoree base sa pinakahuling na-file na Registration nila — itinuturing na valid ang membership sa loob ng 3 taon mula sa petsang iyon.',
            'Kapag binura ang isang Member, matatanggal din ang mga Registration nila — kung may nakolekta nang bayad (at Council Share Receipt), hihilingin sa iyo na kumpirmahin muli bago ito magpatuloy.'
          ]
        }
      },
      {
        key: 'associateMember',
        icon: <UserCheck size={16} />,
        summary: {
          en: "Associate Member applicants — same Member + yearly Registration + Payment structure as OAVF/Career Woman, plus the AMF booklet's No./Series control number.",
          tl: "Mga aplikante ng Associate Member — kaparehong Member + taunang Registration + Payment na istruktura ng OAVF/Career Woman, kasama ang AMF booklet's No./Series control number."
        },
        steps: {
          en: [
            'Add the applicant under Members, then file their yearly Registration under the Registration tab — enter the AMF No. and Series from the pre-printed booklet page, since a new page is used each year.',
            'Record and reprint payments from the Payment tab, same as OAVF/Career Woman and Honorary Member.'
          ],
          tl: [
            'Idagdag ang aplikante sa Members, pagkatapos i-file ang taunang Registration nila sa Registration tab — ilagay ang AMF No. at Series mula sa pre-printed na booklet page, dahil bagong page ang ginagamit bawat taon.',
            'I-record at i-reprint ang bayad mula sa Payment tab, kagaya ng OAVF/Career Woman at Honorary Member.'
          ]
        },
        tips: {
          en: [
            'This is the one module whose Acknowledgment Receipt maps to the booklet\'s real fixed "Associate Members" row — every other individual-registration module here prints under a free-text "Others" line instead.',
            "The Membership Fee is ₱50 — only ₱20 of that is the Council's own retained income (the other ₱30 goes to National HQ). That ₱20 only counts toward SCRD/Council Budget once its own second Council Share Receipt is printed from the Registration row — the Acknowledgment/Official Receipt given at Record Payment already covers the full ₱50 collected.",
            'The Members table shows an Active/Expired badge for each applicant based on their most recently filed Registration — the membership is treated as valid for 1 year from that date.',
            "Deleting a Member also removes their Registrations — if a payment (and Council Share Receipt) was already recorded, you'll be asked to confirm a second time before it proceeds."
          ],
          tl: [
            'Ito ang tanging module na ang Acknowledgment Receipt ay tumutugma sa tunay na nakatakdang "Associate Members" row ng booklet — lahat ng ibang individual-registration module dito ay naka-print sa ilalim ng free-text na "Others" line.',
            'Ang Membership Fee ay ₱50 — ₱20 lang doon ang talagang retained income ng Council (ang ₱30 ay napupunta sa National HQ). Nabibilang lang ang ₱20 na iyon sa SCRD/Council Budget kapag na-print na ang sarili nitong pangalawang Council Share Receipt mula sa row ng Registration — ang Acknowledgment/Official Receipt na naibigay na sa Record Payment ay sakop na ang buong ₱50 na nakolekta.',
            'Nagpapakita ang Members table ng Active/Expired badge para sa bawat aplikante base sa pinakahuling na-file na Registration nila — itinuturing na valid ang membership sa loob ng 1 taon mula sa petsang iyon.',
            'Kapag binura ang isang Member, matatanggal din ang mga Registration nila — kung may nakolekta nang bayad (at Council Share Receipt), hihilingin sa iyo na kumpirmahin muli bago ito magpatuloy.'
          ]
        }
      },
      {
        key: 'iccgRegistration',
        icon: <IdCard size={16} />,
        summary: {
          en: 'ICCG (Catholic Guiding Section) — a persistent per-Troop girl/adult roster, national Registration filings, and an ongoing Payment ledger, same three-tab structure as Trefoil Guild/Barangay/District Committee, but tied to an existing Troop instead of its own entity.',
          tl: 'ICCG (Catholic Guiding Section) — permanenteng roster ng girl/adult kada Troop, pambansang Registration filing, at ongoing Payment ledger, kaparehong tatlong-tab na istruktura ng Trefoil Guild/Barangay/District Committee, pero naka-link sa umiiral na Troop sa halip na sariling entity.'
        },
        steps: {
          en: [
            'Open the Members tab to see the roster, or click "Add Member" to add a girl or adult directly — pick the Troop they belong to, then Role, Name, and (for girls) Grade/Year.',
            'Click "New Registration" to file the yearly CGS Membership Registration Form — pick the Troop, list its registered girls and adults (pre-filled from the Members tab if any are already on file), and fill in the CGS Registration Fee box.',
            'Use the Payment tab\'s "Record Payment" to collect ongoing per-member fees — pick a Troop, it covers that Troop\'s active roster by default, and it prints the Acknowledgment Receipt/Official Receipt automatically. Reprint or correct a past payment from the same tab.'
          ],
          tl: [
            'Buksan ang Members tab para makita ang roster, o i-click ang "Add Member" para magdagdag ng girl o adult direkta — piliin ang Troop nila, tapos ang Role, Pangalan, at (para sa girls) Grade/Year.',
            'I-click ang "New Registration" para i-file ang taunang CGS Membership Registration Form — piliin ang Troop, ilista ang mga rehistradong girls at adults (pre-filled na mula sa Members tab kung mayroon nang naka-file), at punan ang CGS Registration Fee box.',
            'Gamitin ang "Record Payment" sa Payment tab para kolektahin ang ongoing na bayad kada miyembro — pumili ng Troop, saklaw nito ang aktibong roster ng Troop na iyon by default, at awtomatiko nitong ipi-print ang Acknowledgment Receipt/Official Receipt. Mag-reprint o mag-wasto ng nakaraang bayad mula sa parehong tab.'
          ]
        },
        tips: {
          en: [
            "The GSP Membership Fee is ₱20 per member — only ₱5 of that is the Council's own retained income (the other ₱15 is forwarded to National HQ as a pure pass-through). That ₱5 only counts toward SCRD/Council Budget once its own second Council Share Receipt is printed for that payment from the Payment tab — the ICCG Registration's own fee box is filing paperwork only and never posts anything on its own; only an actual Payment tab collection can be receipted. Both rates are editable in case National's split ever changes.",
            'You can record a Payment for a Troop before ever filing an ICCG Registration for it — the fee inputs default to the standard ₱20/₱5 split. Filing a Registration afterward keeps the rate suggestion in sync going forward.'
          ],
          tl: [
            'Ang GSP Membership Fee ay ₱20 kada miyembro — ₱5 lang doon ang talagang retained income ng Council (ang ₱15 ay ipapasa sa National HQ bilang pure pass-through). Nabibilang lang ang ₱5 na iyon sa SCRD/Council Budget kapag na-print na ang sarili nitong pangalawang Council Share Receipt para sa bayad na iyon mula sa Payment tab — ang fee box ng ICCG Registration mismo ay filing paperwork lamang at hindi kailanman awtomatikong nagpo-post; isang aktwal na koleksyon sa Payment tab lang ang puwedeng ma-receipt. Pareho itong maeedit kung sakaling magbago ang split ng National.',
            'Puwede kang magtala ng Payment para sa isang Troop kahit wala pang naisumiteng ICCG Registration para dito — ang fee inputs ay default sa standard na ₱20/₱5 split. Ang pagsumite ng Registration pagkatapos ay pinapanatiling naka-sync ang mungkahing rate paglipas ng panahon.'
          ]
        }
      },
      {
        key: 'membershipStatusReport',
        icon: <ClipboardCheck size={16} />,
        summary: {
          en: "A district-by-district roll-up of every registration module above (Troops, District/Barangay Committee, Trefoil Guild, OAVF, Honorary/Associate Member, ICCG), computed live, against the year's Goal.",
          tl: 'District-by-district na roll-up ng lahat ng registration module sa itaas (Troops, District/Barangay Committee, Trefoil Guild, OAVF, Honorary/Associate Member, ICCG), live na kinukwenta, laban sa Goal ng taon.'
        },
        steps: {
          en: [
            "Switch Membership Year with the selector, or start a new one — it carries over the last year's Goal targets as a starting point.",
            "Click a number in the table to jump straight to that module's Members list, already filtered to that district.",
            'Use "Edit Goals" to set the year\'s per-item Goal so Achieved/Balance compute automatically, and "Edit Report Links" to change which module a column jumps to.',
            'Export the full matrix as Excel, PDF, or Word.'
          ],
          tl: [
            'Lumipat ng Membership Year gamit ang selector, o magsimula ng bago — ang Goal target ng nakaraang taon ang gagamiting panimula.',
            'I-click ang numero sa table para diretso sa Members list ng module na iyon, naka-filter na sa district na iyon.',
            'Gamitin ang "Edit Goals" para itakda ang Goal ng bawat item sa taong ito para awtomatikong makwenta ang Achieved/Balance, at "Edit Report Links" para baguhin kung saang module tumatalon ang isang column.',
            'I-export ang buong matrix bilang Excel, PDF, o Word.'
          ]
        },
        tips: {
          en: [
            'Every figure here is computed live from the modules above — nothing on this report is typed in directly except the Goal targets.'
          ],
          tl: [
            'Lahat ng figure dito ay live na kinukwenta mula sa mga module sa itaas — walang direktang tina-type dito maliban sa Goal targets.'
          ]
        }
      },
      {
        key: 'membershipReports',
        icon: <BarChart3 size={16} />,
        summary: {
          en: "Troops & Membership's own Daily Cash Collection Report — one record per calendar date, listing the original/gross fee collected from every payor across all 9 registration modules, matching the Council's paper form.",
          tl: 'Sariling Daily Cash Collection Report ng Troops & Membership — isang record bawat petsa, nakalista ang orihinal/gross na bayad na nakolekta mula sa bawat payor sa lahat ng 9 na registration module, tumutugma sa paper form ng Council.'
        },
        steps: {
          en: [
            'Pick a date — every payment/remittance event recorded that day across Troops, District/Barangay Committee, Trefoil Guild, OAVF, Honorary/Associate Member, and ICCG pre-fills as its own row automatically.',
            'Widen the date range to review a past stretch read-only, or use "Add Line" to log a same-day collection that hasn\'t gone through its own module yet.',
            "Fill in each row's Total Deposited and Date Deposited as the cash actually gets banked, so (Under) Over Deposit reconciles to zero.",
            "Attach scanned proof (deposit slips, etc.) the same way Accounting's own Daily Collections does, and Save once the day is complete.",
            'Export the report as Excel, PDF, or Word, or View to preview it first.'
          ],
          tl: [
            'Pumili ng petsa — bawat payment/remittance event na na-record sa araw na iyon sa Troops, District/Barangay Committee, Trefoil Guild, OAVF, Honorary/Associate Member, at ICCG ay awtomatikong mapupunan bilang sariling row.',
            'Palawakin ang date range para suriin nang read-only ang nakaraang saklaw, o gamitin ang "Add Line" para itala ang koleksyon sa parehong araw na wala pang dumaan sa sariling module.',
            'Punan ang Total Deposited at Date Deposited ng bawat row habang aktwal na naideposito ang cash, para maging zero ang (Under) Over Deposit.',
            'Mag-attach ng scanned proof (deposit slips, atbp.) tulad ng ginagawa ng Daily Collections ng Accounting, at i-Save kapag kumpleto na ang araw.',
            'I-export ang report bilang Excel, PDF, o Word, o View para i-preview muna.'
          ]
        },
        tips: {
          en: [
            "This report deliberately shows the ORIGINAL/gross amount collected per payor, not the Council-retained share Accounting's own Daily Collections/SCRD/Council Budget recognize — the two reports track different things on purpose and won't match line for line.",
            "Rows sharing the same physical receipt number (a Troop Leader paying more than one fee in one remittance) are merged into a single line, same as SCRD's own Cash Receipts Journal."
          ],
          tl: [
            'Sadyang ipinapakita ng report na ito ang ORIHINAL/gross na halagang nakolekta bawat payor, hindi ang Council-retained share na kinikilala ng sariling Daily Collections/SCRD/Council Budget ng Accounting — sinasadyang magkaiba ang dalawang report at hindi ito magtutugma linya-por-linya.',
            'Ang mga row na magkapareho ang pisikal na receipt number (nagbayad ang Troop Leader ng higit sa isang fee sa isang remittance) ay pinagsasama sa iisang linya, kagaya ng sariling Cash Receipts Journal ng SCRD.'
          ]
        }
      },
      {
        key: 'troopLeaderSubmissions',
        icon: <ClipboardList size={16} />,
        summary: {
          en: 'Review queue for self-registrations filed from the mobile app — a Troop Leader or member submits from their phone, and staff here Approve (creating the real Troop/Committee/Guild/Member record) or Reject it.',
          tl: 'Review queue para sa mga self-registration na isinumite mula sa mobile app — nagsusumite ang isang Troop Leader o miyembro gamit ang kanilang telepono, at dito ina-Approve (gumagawa ng tunay na Troop/Committee/Guild/Member record) o ina-Reject ito ng staff.'
        },
        steps: {
          en: [
            'Switch tabs to review a specific category — Troop, District/Barangay Committee, Trefoil Guild, OAVF, Honorary/Associate Member, or ICCG.',
            'Click View to see everything the mobile submitter entered before deciding.',
            'Approve to create the real record from the submission; Reject to send it back with a required note, which the submitter sees in their own My Registrations screen.',
            'A still-pending submission can also be deleted outright if it was filed in error.'
          ],
          tl: [
            'Lumipat ng tab para suriin ang partikular na category — Troop, District/Barangay Committee, Trefoil Guild, OAVF, Honorary/Associate Member, o ICCG.',
            'I-click ang View para makita lahat ng inilagay ng mobile submitter bago magpasya.',
            'I-Approve para gawin ang tunay na record mula sa submission; I-Reject para ibalik ito na may kasamang required na note, na makikita ng submitter sa sarili nilang My Registrations screen.',
            'Puwede ring buburahin nang tuluyan ang submission na pending pa kung mali itong naisumite.'
          ]
        },
        tips: {
          en: [
            "Approving doesn't touch Cash Receipts/SCRD/Council Budget by itself — those still only recognize a fee once it's actually recorded through the resulting record's own Payment tab, same as any other registration filed directly by staff."
          ],
          tl: [
            'Hindi direktang nagbabago ang Approve sa Cash Receipts/SCRD/Council Budget — nakikilala pa rin ang isang bayad kapag na-record na talaga ito sa Payment tab ng resultang record, kagaya ng kahit anong registration na direktang inisumite ng staff.'
          ]
        }
      }
    ]
  },
  {
    key: 'accounting',
    icon: <BarChart3 size={16} />,
    modules: [
      {
        key: 'budget',
        icon: <Wallet2 size={16} />,
        summary: {
          en: "This year's Council Budget — how much was budgeted per line item versus what's actually been spent, month by month.",
          tl: 'Ang Council Budget para sa taong ito — kung magkano ang budget bawat line item kumpara sa aktwal na nagastos, bawat buwan.'
        },
        steps: {
          en: [
            "Review each line item's budgeted amount against its actual monthly spend.",
            "Accountants can update a line item's budgeted amount or monthly actuals; Managers can view but not edit.",
            'Open Edit on a line item and use its "Source" section to link it to where its actual figures should come from — for an income line, tick the Cash Receipt categories that fund it (every registration module\'s fee, e.g. "Membership", "BC Group Fee", "ICCG Registration Fee" — Troop\'s own per-member roster payments are checkboxes here too, not a separate source), Point of Sale, or Rentals; for an expense line, pick voucher account names or a Payroll field. A line can combine more than one source at once.',
            'Switch between fiscal years with the selector at the top, or start a new one with "New Fiscal Year" once the current one wraps up.',
            'Use Export (top right) to download the report as Excel, PDF, or Word, or View to preview it first.'
          ],
          tl: [
            'Suriin ang budgeted amount ng bawat line item kumpara sa aktwal na ginastos bawat buwan.',
            'Pwedeng i-update ng Accountant ang budgeted amount o monthly actuals; ang Manager ay makakatingin lang, hindi makakapag-edit.',
            'Buksan ang Edit sa isang line item at gamitin ang "Source" section nito para i-link kung saan dapat kunin ang aktwal na figures — para sa income line, tsekan ang mga Cash Receipt category na pinagmumulan nito (bayad ng bawat registration module, hal. "Membership", "BC Group Fee", "ICCG Registration Fee" — checkbox din dito ang sariling per-member roster payments ng Troop, hindi ito hiwalay na source), Point of Sale, o Rentals; para sa expense line, pumili ng voucher account name o Payroll field. Pwedeng pagsamahin ang higit sa isang source sa isang line.',
            'Lumipat sa ibang fiscal year gamit ang selector sa itaas, o magsimula ng bago gamit ang "New Fiscal Year" kapag tapos na ang kasalukuyan.',
            'Gamitin ang Export (kanang itaas) para i-download ang report bilang Excel, PDF, o Word, o View para i-preview muna.'
          ]
        },
        tips: {
          en: [
            'Sub-totals and group totals (e.g. Total Operating Income, Total Capital Expense) are bold both on screen and in every exported format.',
            'A lightning-bolt icon next to a line item means it has a Source linked and the app has a live figure ready for it — open Edit to review and apply it; it never overwrites your entry on its own. A line with no Source configured stays fully manual — there is no automatic guessing.',
            "An income line's Source is a fixed checklist, so there's no typo risk — every category you can tick is a real one some module actually posts under. An expense line's Source is still free text (matched against a Check Voucher's GL Account) — spell it exactly the same, or nothing will match and the figure stays at zero (see the Vouchers module).",
            "Every export prints each line item's own Jul-Jun monthly breakdown, and closes Income and Expenses out with their own SUMMARY recap (Operations/Capital/Other, then a Grand Total) — matching the Council's own paper budget form."
          ],
          tl: [
            'Bold ang mga sub-total at group total (hal. Total Operating Income, Total Capital Expense) sa screen at sa lahat ng na-export na format.',
            'Ang lightning-bolt icon sa tabi ng isang line item ay nangangahulugang may naka-link nang Source at may live figure na ang app para dito — buksan ang Edit para suriin at ilapat ito; hindi ito automatic na papalit sa iyong entry. Ang line na walang naka-configure na Source ay mananatiling fully manual — walang automatic na paghula.',
            'Ang Source ng income line ay fixed na checklist, kaya walang typo risk — bawat category na puwede mong tsekan ay tunay na ginagamit ng ilang module. Ang Source ng expense line ay free text pa rin (itinutugma sa GL Account ng Check Voucher) — i-spell nang eksakto, kung hindi walang mata-match at mananatiling zero ang figure (tingnan ang Vouchers module).',
            'Isinasama ng bawat export ang buwanang breakdown (Jul-Jun) ng bawat line item, at tinatapos ang Income at Expenses ng sarili nilang SUMMARY (Operations/Capital/Other, tapos Grand Total) — tulad ng orihinal na paper budget form ng Council.'
          ]
        }
      },
      {
        key: 'vendors',
        icon: <Truck size={16} />,
        summary: {
          en: 'The vendor directory for anything the council buys or pays for — used when recording expenses and purchase orders.',
          tl: 'Directory ng vendor para sa kahit anong binibili o binabayaran ng konseho — ginagamit sa pagrekord ng gastos at purchase order.'
        },
        steps: {
          en: [
            'Add a vendor once with their contact and payment details.',
            'Reuse the vendor whenever you record a purchase, bill, or voucher tied to them.'
          ],
          tl: [
            'Magdagdag ng vendor minsan lang kasama ang contact at payment details.',
            'Gamitin ulit ang vendor kapag nagrerecord ng purchase, bill, o voucher na may kinalaman sa kanila.'
          ]
        }
      },
      {
        key: 'vouchers',
        icon: <Ticket size={16} />,
        summary: {
          en: 'Disbursement and Journal Vouchers — the paper trail for money the council pays out, and (via Journal Voucher) money it takes in.',
          tl: 'Disbursement at Journal Voucher — ang paper trail para sa pera na binayaran ng konseho, at (sa pamamagitan ng Journal Voucher) ang pera na natanggap nito.'
        },
        steps: {
          en: [
            "Create a Disbursement Voucher for each payment out: who it's paid to, the amount, and what it covers. Voucher No. is suggested automatically but editable, to match a pre-numbered paper voucher already written by hand.",
            "To record incoming cash instead — a grant, interest income, or other receipt not already covered by Point of Sale, Invoices, Rentals, or a Troops & Membership module's own fee/Payment tab (those already post on their own; see each module's Payment tab / SCRD) — create a Journal Voucher and enter it under Account Titles (Credit) instead of (Debit). A Disbursement Voucher can itemize its credit side too (e.g. splitting between a bank account and a payable) instead of relying on the single Bank Account field.",
            'Add an optional Description next to any account title — it prints on the export as "Account - Description" (e.g. "Salary - March 16-31, 2026").',
            'Liquidating a cash advance? On a Journal Voucher, use the Cash Advance Liquidation section: pick the Disbursement Voucher that released the advance, then enter Total Amount Spent, Amount Refunded, and the refund O.R. number/date.',
            "Recording a receipt-direction (income) voucher? Attach the physical Service Invoice or Acknowledgment Receipt booklet number used for it — it then shows on the voucher itself and in SCRD's Cash Receipts Journal, and you can print or reprint it straight from the Vouchers list.",
            'Attach or reference supporting documents so the entry is audit-ready.'
          ],
          tl: [
            'Gumawa ng Disbursement Voucher para sa bawat binayaran: kanino binayaran, magkano, at para saan. Automatic na iminumungkahi ang Voucher No. pero pwedeng i-edit, para tumugma sa numero na nakasulat na sa pre-numbered na papel na voucher.',
            'Para magrekord ng papasok na pera — grant, interest income, o ibang resibo na hindi pa saklaw ng Point of Sale, Invoices, Rentals, o sariling fee/Payment tab ng isang Troops & Membership module (awtomatiko na itong naitatala sa sarili nito; tingnan ang Payment tab ng bawat module / SCRD) — gumawa ng Journal Voucher at ilagay ito sa Account Titles (Credit) sa halip na (Debit). Pwede ring i-itemize ang credit side ng isang Disbursement Voucher (hal. hatiin sa bank account at payable) sa halip na umasa lang sa iisang Bank Account field.',
            'Magdagdag ng opsyonal na Description sa tabi ng kahit anong account title — lalabas ito sa export bilang "Account - Description" (hal. "Salary - March 16-31, 2026").',
            'Nag-liliquidate ng cash advance? Sa Journal Voucher, gamitin ang Cash Advance Liquidation section: piliin ang Disbursement Voucher na naglabas ng advance, pagkatapos ilagay ang Total Amount Spent, Amount Refunded, at ang O.R. number/date ng refund.',
            'Nagrerecord ng receipt-direction (income) na voucher? I-attach ang booklet number ng aktwal na Service Invoice o Acknowledgment Receipt na ginamit — lalabas ito sa voucher mismo at sa Cash Receipts Journal ng SCRD, at puwede mo itong i-print o i-reprint direkta mula sa Vouchers list.',
            'Mag-attach o mag-refer ng supporting documents para audit-ready ang entry.'
          ]
        },
        tips: {
          en: [
            "Account Titles (Debit) on a Disbursement Voucher is a dropdown of the current fiscal year's budget expense lines, not free text — this keeps every voucher matched to a real budget category so it can post automatically to the Council Budget's actuals.",
            'Only an Approved voucher counts — a Pending one is not yet treated as money that actually moved, on either the disbursement or receipt side.',
            "The form warns you if total Debit and total Credit don't balance — fix the amounts before saving.",
            "The Total Amount Spent/Amount Refunded fields on a Cash Advance Liquidation only unlock once you've picked the source Disbursement Voucher; if the advance was overspent, the excess owed back to the payee shows as its own Reimbursement figure and is counted in the bank balance.",
            'Deleting a voucher also removes any Expense Summary linked to it, so nothing gets left behind.'
          ],
          tl: [
            'Ang Account Titles (Debit) sa Disbursement Voucher ay dropdown ng budget expense lines ng kasalukuyang fiscal year, hindi free text — para tama ang pagtugma ng bawat voucher sa tunay na budget category at automatic itong nakapag-post sa actuals ng Council Budget.',
            'Approved na voucher lang ang binibilang — ang Pending pa ay hindi pa itinuturing na pera na aktwal na gumalaw, maging disbursement man o receipt.',
            'Bibigyan ka ng babala ng form kung hindi pantay ang total Debit at total Credit — ayusin ang amounts bago mag-save.',
            'Magbubukas lang ang Total Amount Spent/Amount Refunded fields sa Cash Advance Liquidation kapag napili na ang pinagmulang Disbursement Voucher; kung na-overspend ang advance, lalabas bilang sariling Reimbursement figure ang labis na dapat ibalik sa payee at nabibilang ito sa bank balance.',
            'Kapag binura ang isang voucher, matatanggal din ang Expense Summary na naka-link dito, para walang matirang datos.'
          ]
        }
      },
      {
        key: 'reports',
        icon: <BarChart3 size={16} />,
        summary: {
          en: "Balance Sheet, Income Statement, and Daily Collections — the council's core financial reports, generated from live data.",
          tl: 'Balance Sheet, Income Statement, at Daily Collections — ang pangunahing financial reports ng konseho, buhat sa live data.'
        },
        steps: {
          en: [
            'Pick the report and period you need.',
            'Daily Collections automatically rolls up cash from Point of Sale sales, paid invoices, confirmed rental bookings, and registration fees — the Council-retained share of BC Group Fee and ICCG Registration Fee payments land in their own "BC Fee"/"ICCG" columns, the same way Membership and Rentals do; anything else that doesn\'t fit a fixed column lands under "Others".',
            "Use the manual rows only to log same-day cash that hasn't gone through its own module yet (e.g. dues collected in person before the Registration is filed) — avoid re-entering an amount that's already showing up as an automatic row.",
            "This is Accounting's own daily cash blotter (every peso physically collected, in full) — Troops & Membership has its own parallel Daily Cash Collection Report under Membership Reports, which instead shows each payor's original/gross amount collected, not the Council-retained share this one tracks.",
            "Attach scanned proof (deposit slips, etc.) to a day's report, and open one to preview it in-app or download it — nothing opens in an outside browser.",
            'Export a report when you need a printable or shareable copy.'
          ],
          tl: [
            'Piliin ang report at panahon na kailangan.',
            'Ang Daily Collections ay automatic na nagro-roll up ng cash mula sa Point of Sale sales, bayad na invoice, kumpirmadong rental booking, at registration fees — ang Council-retained share ng BC Group Fee at ICCG Registration Fee payments ay napupunta sa sarili nilang "BC Fee"/"ICCG" column, kagaya ng Membership at Rentals; anumang hindi nababagay sa nakatakdang column ay napupunta sa "Others".',
            'Gamitin lang ang manual rows para itala ang cash na nakolekta sa parehong araw na wala pang dumaan sa sariling module (hal. dues na nakolekta in person bago pa ma-file ang Registration) — iwasan ang muling pag-enter ng amount na lumalabas na bilang automatic row.',
            'Ito ang sariling daily cash blotter ng Accounting (bawat pisong pisikal na nakolekta, buo) — may sarili namang parehong Daily Cash Collection Report ang Troops & Membership sa ilalim ng Membership Reports, na sa halip ay nagpapakita ng orihinal/gross na halagang nakolekta ng bawat payor, hindi ang Council-retained share na sinusubaybayan nito.',
            'Mag-attach ng scanned proof (deposit slips, atbp.) sa report ng isang araw, at buksan ang isa para i-preview ito sa loob ng app o i-download — walang bubukas sa panlabas na browser.',
            'I-export ang report kapag kailangan ng printable o mai-share na kopya.'
          ]
        }
      },
      {
        key: 'scrd',
        icon: <FileText size={16} />,
        summary: {
          en: 'Cash Receipts & Disbursements — bank account balances and the ledger of money moving in and out of them.',
          tl: 'Cash Receipts & Disbursements — balanse ng bank account at ang ledger ng pera na papasok at palabas.'
        },
        steps: {
          en: [
            "Receipts and disbursements here aren't entered directly — they roll up automatically from Point of Sale, Invoices, Rentals, every Troops & Membership registration module's own fee/Payment tab records, and approved Vouchers (see Vouchers for recording a receipt that isn't covered elsewhere).",
            "The account's current balance recalculates automatically — you never type that number in directly.",
            'The Cash Receipts Journal shows which physical receipt booklet (Service Invoice or Acknowledgment Receipt) and O.R./A.R. number backs each entry, when one was recorded for it.',
            'Rows sharing the same O.R./A.R. number are the same physical receipt handed over together (e.g. a Troop Leader paying Membership and Troop Fee in one remittance) — the Journal (and its Excel/PDF/Word export) merges them into a single line with a combined amount and category, "isang resibo, isang entry".'
          ],
          tl: [
            'Hindi dito direktang inilalagay ang mga receipt at disbursement — awtomatiko itong buhat sa Point of Sale, Invoices, Rentals, sariling fee/Payment tab record ng bawat Troops & Membership registration module, at Approved na Vouchers (tingnan ang Vouchers para magrekord ng receipt na wala pang saklaw dito).',
            'Automatic na nagre-recalculate ang current balance ng account — hindi mo ito direktang tina-type.',
            'Ipinapakita ng Cash Receipts Journal kung aling physical receipt booklet (Service Invoice o Acknowledgment Receipt) at O.R./A.R. number ang bumabalik sa bawat entry, kapag mayroon nitong naitala.',
            'Ang mga row na magkapareho ang O.R./A.R. number ay iisang pisikal na resibo na sabay na inabot (hal. nagbayad ang Troop Leader ng Membership at Troop Fee sa isang remittance) — pinagsasama ito ng Journal (at ng Excel/PDF/Word export nito) sa iisang linya na may pinagsamang halaga at kategorya, "isang resibo, isang entry".'
          ]
        }
      },
      {
        key: 'ptdg',
        icon: <Award size={16} />,
        summary: {
          en: "Program & Training Development Grant applications — grant requests to the Regional Office, funded from the Region's own PTDG allocation rather than the Council budget.",
          tl: 'Application para sa Program & Training Development Grant — hiling ng grant sa Regional Office, buhat sa PTDG allocation ng Region, hindi sa Council budget.'
        },
        steps: {
          en: [
            'Click "New Application" and fill in the purpose/event and its date, then list Projected Sources (other funding already lined up) and Projected Expenses — Amount Requested is the gap between the two, computed automatically. Regional Executive Director is optional here if you already know who currently holds the post.',
            "Save as Draft to keep working on it later, or Submit once it's ready to send to the Region.",
            'Once the Region mails back its decision, open "Record Decision" on a Submitted application to mark it Approved (with the approved amount and any remarks) or Disapproved — this is also where you can set or correct the Regional Executive Director\'s name if it wasn\'t entered earlier.',
            'Use the export icon on any application to View, or download it as Excel, PDF, or Word.'
          ],
          tl: [
            'I-click ang "New Application" at punan ang purpose/event at petsa nito, pagkatapos ilista ang Projected Sources (ibang pondo na nakahanda) at Projected Expenses — automatic na kinakalkula ang Amount Requested bilang agwat sa dalawa. Opsyonal ang Regional Executive Director dito kung alam mo na kung sino ang kasalukuyang nanunungkulan.',
            'I-save bilang Draft kung ituloy pa mamaya, o I-submit kapag handa na ipadala sa Region.',
            'Kapag dumating na ang desisyon ng Region, buksan ang "Record Decision" sa isang Submitted application para markahan itong Approved (kasama ang approved amount at remarks) o Disapproved — dito mo rin pwedeng itakda o iwasto ang pangalan ng Regional Executive Director kung hindi pa nailagay dati.',
            'Gamitin ang export icon sa kahit anong application para View, o i-download bilang Excel, PDF, o Word.'
          ]
        },
        tips: {
          en: [
            "This is separate from the Council Budget — PTDG amounts never post to it, since the grant is the Region's money, not the council's own.",
            'Only Accountants can create, edit, delete, or record a decision; Managers can view only.'
          ],
          tl: [
            'Hiwalay ito sa Council Budget — hindi kailanman nakikita ang PTDG amounts dito, dahil pera ito ng Region, hindi ng konseho.',
            'Accountant lang ang makakagawa, mag-edit, magtanggal, o magrekord ng desisyon; ang Manager ay makakatingin lang.'
          ]
        }
      },
      {
        key: 'councilDeposits',
        icon: <Landmark size={16} />,
        summary: {
          en: "PTDG, MMAF & Josefa Llanes Escoda Memento Fund balances retained at the Regional Office — a manually re-entered snapshot of RHQ's own periodic statement, not a live ledger.",
          tl: 'Balanse ng PTDG, MMAF, at Josefa Llanes Escoda Memento Fund na hawak ng Regional Office — snapshot na manually inilagay mula sa panaka-nakang statement ng RHQ, hindi live na ledger.'
        },
        steps: {
          en: [
            'Each RHQ statement becomes its own dated snapshot — click "New Snapshot" whenever one arrives, rather than overwriting the last one.',
            'Use the As of Date dropdown to switch between every snapshot on file; the table and every export always reflect whichever one is selected.',
            "Add, edit, or remove fund lines freely inside a snapshot — the four standard funds (PTDG - Girl, PTDG - Adult, MMAF, Escoda Memento Fund) are pre-filled as a starting point, but the list isn't fixed.",
            'Mark a fund line "By Event Type" if RHQ broke it down by National/Regional/Council/International event, or "Lump Sum" if it reported a single figure with no breakdown.'
          ],
          tl: [
            'Ang bawat RHQ statement ay nagiging sarili nitong dated snapshot — i-click ang "New Snapshot" tuwing may dumarating, sa halip na patungan ang huling isa.',
            'Gamitin ang As of Date dropdown para lumipat sa bawat naitalang snapshot; palaging susundin ng table at ng export ang napiling snapshot.',
            'Magdagdag, mag-edit, o magtanggal ng fund line nang malaya sa loob ng isang snapshot — paunang naka-fill na ang apat na standard na pondo (PTDG - Girl, PTDG - Adult, MMAF, Escoda Memento Fund) bilang panimula, pero hindi ito fixed na listahan.',
            'Markahan ang isang fund line na "By Event Type" kung hinati ito ng RHQ ayon sa National/Regional/Council/International event, o "Lump Sum" kung iisang figure lang ang inireport nang walang breakdown.'
          ]
        },
        tips: {
          en: [
            'Figures show as ₱0.00 until an accountant encodes the first snapshot — this is expected, not an error.',
            "Only Accountants (plus Admin/Super Admin) can view or manage this module by default — unlike PTDG, Managers don't get view access here."
          ],
          tl: [
            "Lalabas na ₱0.00 ang mga figure hangga't hindi pa na-encode ng accountant ang unang snapshot — inaasahan ito, hindi error.",
            'Accountant lang (kasama ang Admin/Super Admin) ang may access sa module na ito by default — hindi tulad ng PTDG, walang view access dito ang Manager.'
          ]
        }
      }
    ]
  },
  {
    key: 'councilPrograms',
    icon: <Tent size={16} />,
    modules: [
      {
        key: 'trainingProfiles',
        icon: <IdCard size={16} />,
        summary: {
          en: "The Council's credential registry for Troop Leaders, Field Advisers, and Trainers — one record per person, separate from Training Reports which logs training events instead.",
          tl: 'Ang credential registry ng konseho para sa Troop Leaders, Field Advisers, at Trainers — isang record bawat tao, iba ito sa Training Reports na naglo-log ng training events sa halip.'
        },
        steps: {
          en: [
            "Add a profile with the person's basic info, District, and which Council roles they hold (Troop Leader, Field Adviser, Credentialed Trainer, etc.).",
            "Check off which trainings and certificates they've completed — Age-Level Specialization only asks for a level once that course is checked.",
            "If they lead a Troop, pick it under Troop Leader — this fills that Troop's Leader/Assistant Leader name automatically.",
            'Set First Registration Date once; Total Years in Scouting then computes itself from today, no need to update it by hand.'
          ],
          tl: [
            'Magdagdag ng profile kasama ang basic info ng tao, District, at kung anong Council role ang hawak nila (Troop Leader, Field Adviser, Credentialed Trainer, atbp).',
            'Markahan kung anong training at certificate ang nakumpleto na nila — hihingi lang ng level ang Age-Level Specialization kapag naka-check ang course na iyon.',
            'Kung namumuno sila ng isang Troop, piliin ito sa Troop Leader — awtomatiko nitong mapupunan ang Leader/Assistant Leader name ng Troop na iyon.',
            'Itakda ang First Registration Date minsan lang; awtomatiko nang kinukwenta ang Total Years in Scouting mula rito papunta ngayon, hindi na kailangang i-update nang manual.'
          ]
        }
      },
      {
        key: 'goals',
        icon: <Target size={16} />,
        summary: {
          en: "The council's Goals & Objectives for the program year, tracked against progress.",
          tl: 'Ang Goals & Objectives ng konseho para sa taong ito, sinusubaybayan ang progreso.'
        },
        steps: {
          en: [
            'Add a goal with its target and track progress as the year goes on.',
            'Accountants and Managers can both keep these updated.',
            'Switch between program years with the selector at the top, or start a new one with "New Program Year" once the current one wraps up.'
          ],
          tl: [
            'Magdagdag ng goal kasama ang target at subaybayan ang progreso habang tumatagal ang taon.',
            'Pwedeng i-update ito ng Accountant at Manager.',
            'Lumipat sa ibang program year gamit ang selector sa itaas, o magsimula ng bago gamit ang "New Program Year" kapag tapos na ang kasalukuyan.'
          ]
        }
      },
      {
        key: 'programReports',
        icon: <ClipboardList size={16} />,
        summary: {
          en: "Monthly detail reports for Badgework, Troop Camps, Improved Image, and International Affairs — National HQ's program goals for the council.",
          tl: 'Buwanang detalyadong ulat para sa Badgework, Troop Camps, Improved Image, at International Affairs — mga programa na itinakda ng National HQ para sa konseho.'
        },
        steps: {
          en: [
            'Pick a program section and add its monthly line items.',
            'The section title/Goal heading printed above each report can be edited — National HQ changes its wording between program years.'
          ],
          tl: [
            'Piliin ang program section at magdagdag ng buwanang line items nito.',
            'Ang section title/Goal heading na naka-print sa itaas ng bawat ulat ay pwedeng i-edit — nagbabago ang wording nito ayon sa National HQ bawat program year.'
          ]
        }
      },
      {
        key: 'trainingReports',
        icon: <GraduationCap size={16} />,
        summary: {
          en: 'Training activities conducted for troop leaders and members, logged for council reporting.',
          tl: 'Mga training na isinagawa para sa mga troop leader at miyembro, naka-log para sa ulat ng konseho.'
        },
        steps: {
          en: ["Log each training with its date, topic, and attendees for the council's records."],
          tl: [
            'I-log ang bawat training kasama ang petsa, paksa, at mga dumalo para sa record ng konseho.'
          ]
        }
      }
    ]
  },
  {
    key: 'hrPayroll',
    icon: <UserCog size={16} />,
    modules: [
      {
        key: 'employees',
        icon: <UserCog size={16} />,
        summary: {
          en: 'The staff directory — profiles, employment details, and documents for every council employee.',
          tl: 'Ang directory ng staff — profile, detalye ng trabaho, at dokumento ng bawat empleyado ng konseho.'
        },
        steps: {
          en: [
            "Open an employee's profile to view or update their employment details and documents.",
            "This is separate from their login account under Users — changing role/login here doesn't apply; that's handled in Users.",
            "Set a Birth Date if you have it — it's optional, but feeds the Dashboard's Upcoming Birthdays widget."
          ],
          tl: [
            'Buksan ang profile ng empleyado para tingnan o i-update ang detalye ng trabaho at dokumento.',
            'Iba ito sa kanilang login account sa Users — ang pagbabago ng role/login ay hindi dito ginagawa; sa Users iyon.',
            'Ilagay ang Birth Date kung meron — opsyonal ito, pero ginagamit sa Upcoming Birthdays widget ng Dashboard.'
          ]
        }
      },
      {
        key: 'councilBoard',
        icon: <Landmark size={16} />,
        summary: {
          en: "The council's governing board — trustees and officers, separate from paid staff.",
          tl: 'Ang lupon ng konseho — mga trustee at opisyal, hiwalay sa may-sweldong staff.'
        },
        steps: {
          en: [
            'Add a board member with their position (e.g. Council President, Board Chairperson, Trustee) and, optionally, who they report to on the Board.',
            'Set a Birth Date if you have it — feeds the Dashboard’s Upcoming Birthdays widget, same as Employees.',
            'Their reporting line shows on the Organizational Chart above the Employees tree — the Board governs, staff report up through it.'
          ],
          tl: [
            'Magdagdag ng board member kasama ang kanilang posisyon (hal. Council President, Board Chairperson, Trustee) at, opsyonal, kung kanino sila sumasagot sa Board.',
            'Ilagay ang Birth Date kung meron — ginagamit sa Upcoming Birthdays widget ng Dashboard, kagaya ng Employees.',
            'Ang reporting line nila ay lalabas sa Organizational Chart, sa itaas ng Employees tree — ang Board ang namamahala, ang staff ay umuulat pataas dito.'
          ]
        }
      },
      {
        key: 'attendance',
        icon: <Fingerprint size={16} />,
        summary: {
          en: 'Daily time-in/time-out records, either logged manually or captured live from a connected biometric terminal.',
          tl: 'Araw-araw na time-in/time-out, maaaring i-log manually o awtomatikong makuha mula sa naka-connect na biometric terminal.'
        },
        steps: {
          en: [
            "Review today's attendance — present, absent, and on-leave counts feed the Dashboard.",
            "Enroll an employee's face at Attendance > Enrollment so the Hikvision terminal recognizes them (the terminal itself is set up under Settings > Devices).",
            'The official shift is 8:00 AM-5:00 PM with a 15-minute grace period (Late starts at 8:15). A 1-hour lunch (12:00 NN-1:00 PM) is deducted from hours worked whenever the employee was present for any part of it.',
            'Clocking in at or after 12:00 NN always logs the day as Half Day — even if they end up working late that evening; overtime past 5:00 PM still earns Compensatory Time Off on top of that.'
          ],
          tl: [
            'Tingnan ang attendance ngayong araw — present, absent, at on-leave na bilang ay lumalabas din sa Dashboard.',
            'I-enroll ang mukha ng empleyado sa Attendance > Enrollment para makilala sila ng Hikvision terminal (ang terminal mismo ay ise-setup sa Settings > Devices).',
            'Ang opisyal na shift ay 8:00 AM-5:00 PM na may 15-minutong grace period (Late na simula 8:15). Ibinabawas ang 1-oras na lunch (12:00 NN-1:00 PM) sa hours worked kung nandoon sila sa kahit anong bahagi nito.',
            'Ang pag-time in ng 12:00 NN pataas ay palaging Half Day — kahit magtagal pa sila ng out; ang overtime na lampas 5:00 PM ay may Compensatory Time Off pa rin kahit Half Day ang status.'
          ]
        },
        tips: {
          en: [
            "The Status field in Add/Edit Attendance is only used as typed for Absent or Leave — for any other status, the app recalculates it automatically from the clock-in/out times you enter, so it can't drift from what actually happened.",
            'The Overtime status only shows once someone works 4+ hours past 5:00 PM in one day — the same bar that has to be cleared to earn any Compensatory Time Off. A clock-out a few minutes late (e.g. walking to the biometric scanner) just reads Present, not Overtime.'
          ],
          tl: [
            'Ang Status field sa Add/Edit Attendance ay ginagamit lang nang direkta kapag Absent o Leave — sa ibang status, awtomatiko itong kino-compute ng app mula sa time in/out na inilagay mo, kaya hindi ito lalayo sa totoong nangyari.',
            'Lalabas lang ang Overtime status kapag 4+ oras na ang lampas sa 5:00 PM sa isang araw — ang parehong minimum bago makakuha ng Compensatory Time Off. Kung ilang minuto lang ang huli sa clock-out (hal. naglalakad papunta sa biometric scanner), Present lang ang lalabas, hindi Overtime.'
          ]
        }
      },
      {
        key: 'leave',
        icon: <CalendarClock size={16} />,
        summary: {
          en: "Leave requests and each employee's leave credit balance.",
          tl: 'Mga leave request at ang balanse ng leave credit ng bawat empleyado.'
        },
        steps: {
          en: [
            'File a leave request for an employee, with an optional Half Day checkbox.',
            'Review a pending request and approve or reject it — the Dashboard flags anything still waiting.',
            'Made a mistake? Revert an approved request to undo it and restore its credits, or delete any request outright.',
            'Grant leave credits (e.g. at the start of a cycle) from the credit grants screen — Compensatory Time Off is the one exception, since it can only be earned from logged overtime, never set here.'
          ],
          tl: [
            'Mag-file ng leave request para sa isang empleyado, may opsyonal na Half Day checkbox.',
            'Suriin ang nakabinbing request at aprubahan o tanggihan ito — ipapakita rin ito sa Dashboard kung may nakabinbin pa.',
            'Nagkamali? I-revert ang aprubadong request para bawiin ito at ibalik ang credits nito, o tanggalin nang tuluyan ang kahit anong request.',
            'Magbigay ng leave credit (hal. sa simula ng cycle) mula sa credit grants screen — maliban ang Compensatory Time Off, dahil sa logged overtime lang ito nanggagaling, hindi ito naitatakda dito.'
          ]
        }
      },
      {
        key: 'payroll',
        icon: <Wallet size={16} />,
        summary: {
          en: 'Payroll runs for every pay period, including 13th Month Pay and the year-end Cash Gift.',
          tl: 'Payroll para sa bawat pay period, kasama ang 13th Month Pay at ang Cash Gift sa katapusan ng taon.'
        },
        steps: {
          en: [
            "Filter by pay period and generate/review each employee's payroll entry.",
            "13th Month Pay computes automatically from each employee's actual basic pay for the year; the council-wide Cash Gift default amount is set once under Settings, by an Admin."
          ],
          tl: [
            'I-filter ayon sa pay period at bumuo/suriin ang payroll entry ng bawat empleyado.',
            'Automatic na kinakalkula ang 13th Month Pay batay sa aktwal na basic pay ng empleyado sa buong taon; ang default na Cash Gift amount ng buong konseho ay itinatakda minsan sa Settings, ng Admin.'
          ]
        },
        tips: {
          en: [
            "A Paid entry can no longer be edited or deleted — it's already been disbursed, so the figures stay locked in as a permanent record of what the employee actually received."
          ],
          tl: [
            'Hindi na puwedeng i-edit o i-delete ang Paid na entry — nabayaran na ito, kaya nananatiling naka-lock ang mga numero bilang permanenteng record ng aktwal na natanggap ng empleyado.'
          ]
        }
      },
      {
        key: 'orgChart',
        icon: <Network size={16} />,
        summary: {
          en: 'A visual reporting-line chart of the council — its governing Board, then its staff.',
          tl: 'Visual na chart ng reporting line ng konseho — ang namamahalang Board, tapos ang staff.'
        },
        steps: {
          en: [
            'The Council Board tier appears first (when it has any members), followed by the Employees tree — drawn from the Council Board and Employee profiles’ "Reports To" fields.',
            'Turn on Edit Layout and drag a card onto another to change who they report to, or onto the drop zone to clear it — each tier only accepts drops if you can manage that tier.'
          ],
          tl: [
            'Lalabas muna ang Council Board (kapag may miyembro), sinusundan ng Employees tree — batay sa "Reports To" field ng profile ng Council Board at Employee.',
            'I-on ang Edit Layout at i-drag ang card papunta sa iba para baguhin kung kanino sila umuulat, o papunta sa drop zone para alisin ito — tanggap lang ang drop sa bawat tier kung may access kang mamahala nito.'
          ]
        }
      }
    ]
  },
  {
    key: 'facility',
    icon: <Building2 size={16} />,
    modules: [
      {
        key: 'rentals',
        icon: <Building2 size={16} />,
        summary: {
          en: 'Rentable spaces the council owns, and the bookings made against them.',
          tl: 'Mga puwedeng paupahan na pag-aari ng konseho, at ang mga booking dito.'
        },
        steps: {
          en: [
            'Add a rental space once with its rate, capacity, and Category (Room, Hall, or Space) — the category is what lets its income post to the right Council Budget line.',
            'Optionally set Base Hours and an Excess Hourly Rate for a space that bills extra for overtime (e.g. "first 5 hours included, then ₱1,000/hour") — a booking with a start and end time then computes the excess automatically instead of it being worked out by hand.',
            'Create a booking for a client, then confirm it once payment is settled — confirmed/completed bookings feed Daily Collections.'
          ],
          tl: [
            'Magdagdag ng rental space minsan lang kasama ang rate, capacity, at Category (Room, Hall, o Space) — ang category ang nagpapahintulot sa income nitong mapunta sa tamang Council Budget line.',
            'Opsyonal na itakda ang Base Hours at Excess Hourly Rate para sa space na may dagdag na singil kapag lumagpas sa oras (hal. "unang 5 oras kasama na, tapos ₱1,000/oras") — awtomatiko nang kinukwenta ang labis kapag may start at end time ang booking, hindi na kailangang manwal na kwentahin.',
            'Gumawa ng booking para sa client, pagkatapos kumpirmahin kapag nabayaran na — ang kumpirmado/tapos na booking ay bahagi ng Daily Collections.'
          ]
        },
        tips: {
          en: [
            "SCRD's Rental Income always sums every category together, but the Council Budget breaks it out per category (Room vs. Hall vs. Space) — set a space's Category correctly so its income lands on the right budget line."
          ],
          tl: [
            'Palaging pinagsasama ng SCRD ang Rental Income ng lahat ng category, pero hinahati ito ng Council Budget per category (Room, Hall, o Space) — itakda nang tama ang Category ng space para tamang budget line ang mapuntahan ng income nito.'
          ]
        }
      },
      {
        key: 'visitors',
        icon: <UserCheck size={16} />,
        summary: {
          en: 'The front-desk logbook — who came in, when, and why.',
          tl: 'Ang logbook sa front desk — sino ang pumasok, kailan, at bakit.'
        },
        steps: {
          en: [
            'Log each visitor as they arrive; Cashier, HR, and Manager can all record entries here.'
          ],
          tl: [
            'I-log ang bawat bisita paglabas nila; ang Cashier, HR, at Manager ay pwedeng magrekord dito.'
          ]
        }
      },
      {
        key: 'facilityCalendar',
        icon: <CalendarDays size={16} />,
        summary: {
          en: 'A calendar view of all rental bookings, so double-bookings are easy to spot at a glance.',
          tl: 'Calendar view ng lahat ng rental booking, para madaling makita ang double-booking.'
        },
        steps: {
          en: [
            "Browse by day/week/month to see what's already booked before confirming a new one."
          ],
          tl: [
            'I-browse ayon sa araw/linggo/buwan para makita kung ano ang booked na bago kumpirmahin ang bago.'
          ]
        },
        tips: {
          en: [
            "The calendar doesn't look earlier than 2026 — the council's first tracked year for this app."
          ],
          tl: [
            'Hindi tumitingin ang calendar sa mas maaga sa 2026 — ang unang taong sinusubaybayan ng app na ito.'
          ]
        }
      }
    ]
  },
  {
    key: 'admin',
    icon: <UserCog2 size={16} />,
    modules: [
      {
        key: 'users',
        icon: <UserCog2 size={16} />,
        summary: {
          en: 'Staff login accounts, their roles, and the Role Permissions matrix that controls what each role can see.',
          tl: 'Mga login account ng staff, ang kanilang role, at ang Role Permissions matrix na kumokontrol kung ano ang makikita ng bawat role.'
        },
        steps: {
          en: [
            'Add a new staff account with their email, full name, and role.',
            "Use Enable/Disable to suspend a departed or temporarily inactive staff member's access without deleting their history.",
            "Rename a user, set their birth date (feeds the Dashboard's Upcoming Birthdays), or update their status directly; a role change goes through the Edit User dialog.",
            'Scroll down to Role Permissions to view or fine-tune exactly which modules each role (built-in or custom) can view/manage, or to create a custom role with its own label.'
          ],
          tl: [
            'Magdagdag ng bagong staff account kasama ang email, buong pangalan, at role.',
            'Gamitin ang Enable/Disable para suspindihin ang access ng nag-resign o pansamantalang hindi aktibong staff nang hindi tinatanggal ang history nila.',
            'Palitan ang pangalan, itakda ang kaarawan (ginagamit sa Upcoming Birthdays ng Dashboard), o i-update ang status nang diretso; ang pagbabago ng role ay sa Edit User dialog dinadaan.',
            'I-scroll pababa sa Role Permissions para tingnan o i-fine-tune kung anong module ang makikita/magagawa ng bawat role (built-in man o custom), o gumawa ng custom role na may sariling label.'
          ]
        },
        tips: {
          en: [
            "Only Super Admin and Admin can reach this page — everyone else's access is governed by what's set here."
          ],
          tl: [
            'Super Admin at Admin lang ang may access sa page na ito — ang access ng iba ay batay dito.'
          ]
        }
      },
      {
        key: 'auditLog',
        icon: <ClipboardList size={16} />,
        summary: {
          en: 'A read-only, tamper-proof trail of important actions taken across every module.',
          tl: 'Read-only, hindi maaaring baguhin na trail ng mahahalagang aksyon sa lahat ng module.'
        },
        steps: {
          en: [
            'Review the log to see who did what and when — every module writes to it automatically.',
            "Nothing here can be edited or deleted by anyone, including Admins — it's the system's permanent record."
          ],
          tl: [
            'Suriin ang log para makita kung sino ang gumawa ng ano at kailan — automatic na naisusulat dito ang bawat module.',
            'Walang makapag-eedit o magtatanggal dito, kahit ang Admin — ito ang permanenteng record ng system.'
          ]
        }
      }
    ]
  },
  {
    key: 'system',
    icon: <SettingsIcon size={16} />,
    modules: [
      {
        key: 'settings',
        icon: <SettingsIcon size={16} />,
        summary: {
          en: 'Your personal app preferences, plus a few council-wide settings that only Admins can change.',
          tl: 'Ang sarili mong app preferences, kasama ang ilang setting ng buong konseho na Admin lang ang pwedeng magbago.'
        },
        steps: {
          en: [
            'Appearance: switch language (English/Tagalog), theme, accent color, font size, and compact mode.',
            'Security: change your own password.',
            'Notifications and Privacy: control what alerts you get and your data preferences.',
            'Membership Year and 13th Month Pay/Cash Gift: council-wide values that only a Super Admin or Admin can change — they apply on every device.'
          ],
          tl: [
            'Appearance: palitan ang wika (English/Tagalog), theme, accent color, font size, at compact mode.',
            'Security: palitan ang sarili mong password.',
            'Notifications at Privacy: kontrolin ang mga alert na natatanggap mo at ang iyong data preferences.',
            'Membership Year at 13th Month Pay/Cash Gift: mga value ng buong konseho na Super Admin o Admin lang ang pwedeng magbago — apektado ang lahat ng device.'
          ]
        }
      },
      {
        key: 'devices',
        icon: <Usb size={16} />,
        summary: {
          en: 'Connect and test the hardware GSPIS Admin talks to: a barcode scanner, the Hikvision biometric terminal, and the receipt printer.',
          tl: 'I-connect at i-test ang hardware na ginagamit ng GSPIS Admin: barcode scanner, Hikvision biometric terminal, at receipt printer.'
        },
        steps: {
          en: [
            'Barcode Scanner: plug in a USB scanner (works immediately) or pair one over Bluetooth, then scan a barcode below to confirm it works.',
            "Biometric Terminal: enter the Hikvision device's IP address, port, and credentials, then Test Connection before connecting — this feeds live attendance into the Attendance module.",
            'Receipt Printer: pick a Windows-installed printer and send a test print; turn on auto-print if you want a receipt every sale automatically.'
          ],
          tl: [
            'Barcode Scanner: i-plug ang USB scanner (gagana agad) o i-pair sa Bluetooth, pagkatapos i-scan ang barcode sa ibaba para ma-confirm.',
            'Biometric Terminal: ilagay ang IP address, port, at credentials ng Hikvision device, pagkatapos i-Test Connection bago i-connect — ito ang nagpapadala ng live attendance sa Attendance module.',
            'Receipt Printer: pumili ng naka-install na printer sa Windows at magpadala ng test print; i-on ang auto-print kung gusto mong automatic na mag-print ng resibo sa bawat benta.'
          ]
        },
        tips: {
          en: [
            'Only Super Admin and Admin can open this page by default.',
            'The terminal itself keeps recognizing faces and logging scans even while the app is closed. Reopening the app (or reconnecting here) automatically catches up on anything missed — up to the last 7 days — so a scan from while you were closed still gets its correct clock-in/out date.'
          ],
          tl: [
            'Super Admin at Admin lang ang may access dito by default.',
            'Patuloy pa ring kikilalanin ng terminal ang mga mukha at ilo-log ang mga scan kahit sarado ang app. Ang muling pagbukas ng app (o pag-reconnect dito) ay awtomatikong nagcacatch-up sa anumang na-miss — hanggang 7 araw pababa — kaya tama pa rin ang petsa ng time in/out kahit sarado ang app noong nag-scan.'
          ]
        }
      },
      {
        key: 'about',
        icon: <Info size={16} />,
        summary: {
          en: "The app's version number and the technology it's built on.",
          tl: 'Ang version number ng app at ang teknolohiyang ginamit dito.'
        },
        steps: {
          en: ['Check here for the installed version number, useful when reporting an issue.'],
          tl: [
            'Tingnan dito ang naka-install na version number, kapaki-pakinabang kapag nag-rereport ng problema.'
          ]
        }
      }
    ]
  }
]

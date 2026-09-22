const tl = {
  common: {
    signIn: 'Mag-sign In',
    signOut: 'Mag-sign Out',
    loading: 'Naglo-load...',
    error: 'Error',
    save: 'I-save',
    refresh: 'I-refresh',
    cancel: 'Kanselahin',
    confirm: 'Kumpirmahin',
    undo: 'I-undo',
    reset: 'I-reset',
    settings: 'Mga Setting',
    dashboard: 'Dashboard',
    about: 'Tungkol',
    welcome: 'Maligayang pagdating',
    beta: 'Beta',
    add: 'Magdagdag',
    edit: 'I-edit',
    delete: 'Tanggalin',
    view: 'Tingnan',
    preview: 'Preview',
    download: 'I-download',
    downloadHint: 'I-download kung kailangan ang mismong file',
    close: 'Isara',
    back: 'Bumalik',
    search: 'Maghanap…',
    or: 'o',
    export: 'I-export',
    columns: 'Mga Column',
    toggleColumns: 'Ipakita/Itago ang Column',
    noRecordsFound: 'Walang nahanap na record',
    showing: 'Ipinapakita',
    of: 'sa',
    page: 'Pahina',
    perPageOption: '{{count}} bawat pahina',
    row: 'row',
    rows: 'rows',
    filteredByDistrict: 'Naka-filter sa district: {{district}}',
    clearFilter: 'Alisin ang filter',
    yes: 'Oo',
    no: 'Hindi',
    actions: 'Mga Aksyon',
    processing: 'Pinoproseso…',
    active: 'Aktibo',
    inactive: 'Hindi Aktibo',
    pending: 'Nakabinbin',
    approved: 'Aprubado',
    rejected: 'Tinanggihan',
    completed: 'Tapos na',
    cancelled: 'Kinansela',
    draft: 'Draft',
    paid: 'Bayad na',
    unpaid: 'Hindi pa Bayad',
    overdue: 'Lagpas na sa Deadline'
  },
  roles: {
    super_admin: 'Super Admin',
    admin: 'Admin',
    cashier: 'Cashier',
    accountant: 'Accountant',
    hr: 'HR',
    inventory_clerk: 'Inventory Clerk',
    manager: 'Manager'
  },
  sidebar: {
    orgTooltip: 'Girl Scouts of the Philippines · Ilocos Sur',
    collapseSidebar: 'I-collapse ang sidebar',
    expandSidebar: 'I-expand ang sidebar',
    guest: 'Bisita',
    myProfile: 'Aking Profile',
    groups: {
      troopsMembership: 'Mga Troop at Membership',
      councilPrograms: 'Mga Programa ng Konseho',
      hrPayroll: 'HR at Payroll',
      facility: 'Facility',
      accounting: 'Accounting',
      admin: 'Admin'
    },
    nav: {
      dashboard: 'Dashboard',
      announcements: 'Mga Anunsyo',
      budget: 'Badyet ng Konseho',
      pos: 'Point of Sale',
      products: 'Inventory',
      members: 'Mga Miyembro',
      employees: 'Mga Empleyado',
      councilBoard: 'Council Board',
      troops: 'Mga Troop',
      districtCommittee: 'District Committee',
      barangayCommittee: 'Barangay Committee',
      trefoilGuild: 'Trefoil Guild',
      oavf: 'OAVF / Career Woman',
      honoraryMember: 'Honorary Members',
      associateMember: 'Associate Members',
      iccgRegistration: 'ICCG',
      membershipStatusReport: 'Membership Status Report',
      activities: 'Mga Aktibidad',
      attendance: 'Attendance',
      leave: 'Mga Leave Request',
      payroll: 'Payroll',
      orgChart: 'Organizational Chart',
      vouchers: 'Mga Voucher',
      rentals: 'Mga Rental Booking',
      visitors: 'Logbook ng mga Bisita',
      facilityCalendar: 'Kalendaryo',
      vendors: 'Mga Vendor',
      reports: 'Mga Ulat',
      scrd: 'Cash Receipts & Disb.',
      users: 'Mga User Account',
      auditLog: 'Audit Log',
      settings: 'Mga Setting',
      devices: 'Mga Device',
      about: 'Tungkol',
      manual: 'Gabay sa Paggamit',
      enrollment: 'Pag-enroll',
      goals: 'Mga Layunin at Tunguhin',
      programReports: 'Mga Ulat ng Programa',
      trainingReports: 'Mga Ulat ng Pagsasanay',
      trainingProfiles: 'Mga Profile ng Pagsasanay',
      ptdg: 'PTDG',
      councilDeposits: 'Council Deposits (RHQ)'
    }
  },
  titleBar: {
    minimize: 'I-minimize',
    maximize: 'I-maximize',
    close: 'Isara',
    switchToLight: 'Lumipat sa maliwanag na mode',
    switchToDark: 'Lumipat sa madilim na mode',
    searchShortcut: 'Maghanap (Ctrl+K)',
    searchPlaceholder: 'Maghanap kahit saan…',
    noResults: 'Walang nakitang resulta',
    esc: 'Esc',
    notifications: 'Mga Notipikasyon',
    clearAll: 'I-clear lahat',
    noNotifications: 'Walang notipikasyon',
    home: 'Home',
    searchTypes: {
      module: 'Module',
      vendor: 'Vendor',
      employee: 'Empleyado',
      troop: 'Troop',
      member: 'Miyembro',
      product: 'Produkto',
      voucher: 'Voucher',
      leave: 'Leave',
      payroll: 'Payroll',
      rental: 'Rental',
      visitor: 'Bisita',
      activity: 'Aktibidad',
      goal: 'Layunin',
      programReport: 'Ulat ng Programa',
      trainingReport: 'Ulat ng Pagsasanay',
      cashReceipt: 'Cash Receipt',
      bank: 'Bank'
    }
  },
  auth: {
    welcomeBack: 'Maligayang pagbabalik',
    signInSubtitle: 'Mag-sign in para magpatuloy',
    email: 'Email',
    password: 'Password',
    emailPlaceholder: 'Ilagay ang iyong email address',
    passwordPlaceholder: 'Ilagay ang iyong password',
    demo: 'Makipag-ugnayan sa iyong administrator kung wala ka pang account.',
    emailRequired: 'Kailangan ng valid na email address.',
    passwordMinLength: 'Ang password ay dapat hindi bababa sa 6 na character.',
    errors: {
      invalidCredentials: 'Maling email o password.',
      userDisabled: 'Naka-disable ang account na ito. Makipag-ugnayan sa iyong administrator.',
      tooManyRequests: 'Sobrang dami ng pagtatangka. Maghintay saglit at subukan muli.',
      network: 'May problema sa network — tingnan ang iyong koneksyon at subukan muli.',
      generic: 'Hindi matagumpay ang pag-sign in. Subukan muli.'
    }
  },
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Ganito ang kalagayan ng iyong negosyo.',
    refreshButton: 'I-refresh',
    refreshToast: 'Na-refresh na ang data',
    newExpenseButton: 'Bagong Gastos',
    statCashBalance: 'Kabuuang Cash & Bank Balance',
    cashBalanceNote: 'Sa {{count}} bank account',
    bankBalancesTitle: 'Mga Balanse ng Bangko',
    statExpenses: 'Mga Gastos',
    vsLastPeriod: 'kumpara sa nakaraang panahon',
    expensesByCategoryTitle: 'Mga Gastos ayon sa Kategorya',
    noExpensesRecorded: 'Wala pang naitalang gastos.',
    lowStockLabel: 'Mababa ang Stock',
    lowStockExample: 'hal. {{name}}',
    lowStockAllStocked: 'Sapat ang stock ng lahat ng item',
    attendanceLabel: 'Attendance Ngayong Araw',
    attendanceDetail: '{{onLeave}} nasa leave · {{absent}} absent',
    pendingLeaveLabel: 'Mga Nakabinbing Leave Request',
    pendingLeaveNeedsReview: 'Kailangan ng review',
    pendingLeaveAllCaughtUp: 'Wala nang naghihintay',
    recentActivityTitle: 'Kamakailang Aktibidad',
    viewAll: 'Tingnan lahat',
    birthdaysTitle: 'Mga Paparating na Kaarawan',
    birthdaysToday: 'Ngayon!',
    birthdaysTomorrow: 'Bukas',
    birthdaysInDays: 'sa loob ng {{count}} araw',
    birthdaysTurning: 'magiging {{age}}',
    birthdayCategory: {
      troopMember: 'Troop Member',
      trainingProfile: 'Training Profile',
      employee: 'Empleyado',
      councilBoard: 'Council Board',
      userAccount: 'User Account'
    },
    announcementsTitle: 'Mga Anunsyo',
    budgetTitle: 'Badyet ng Konseho {{year}}'
  },
  settings: {
    title: 'Mga Setting',
    subtitle: 'I-customize ang iyong karanasan sa GSPIS Admin.',
    appearance: 'Hitsura',
    appearanceDesc: 'I-customize ang hitsura at pakiramdam',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Lumipat sa pagitan ng madilim at maliwanag na interface',
    accentColor: 'Accent Color',
    accentColorDesc: 'Piliin ang iyong pangunahing kulay ng interface',
    fontSize: 'Laki ng Font',
    fontSizeDesc: 'Ayusin ang laki ng base font para sa kakayahang mabasa',
    compactMode: 'Compact Mode',
    compactModeDesc: 'Bawasan ang espasyo para sa mas siksik na display ng impormasyon',
    language: 'Wika',
    notifications: 'Mga Notipikasyon',
    notificationsDesc: 'Kontrolin ang mga notipikasyong natatanggap mo',
    enableNotifications: 'Paganahin ang Mga Notipikasyon',
    enableNotificationsDesc:
      'Magpakita ng mga notipikasyon ng system para sa mahahalagang kaganapan',
    soundAlerts: 'Mga Sound Alert',
    soundAlertsDesc: 'Mag-play ng tunog kapag dumating ang mga notipikasyon',
    securityAlerts: 'Mga Security Alert',
    securityAlertsDesc: 'Mag-alerto sa kahina-hinalang aktibidad',
    marketingEmails: 'Mga Marketing Email',
    marketingEmailsDesc: 'Tumanggap ng mga update ng produkto at anunsyo',
    security: {
      title: 'Seguridad',
      description: 'Baguhin ang password ng iyong account',
      currentPasswordLabel: 'Kasalukuyang Password',
      newPasswordLabel: 'Bagong Password',
      confirmPasswordLabel: 'Kumpirmahin ang Bagong Password',
      updateButton: 'I-update ang Password',
      toast: {
        updated: 'Matagumpay na na-update ang password'
      },
      errors: {
        wrongCurrentPassword: 'Mali ang kasalukuyang password.',
        weakPassword:
          'Masyadong mahina ang bagong password — gumamit ng hindi bababa sa 6 na character.',
        requiresRecentLogin: 'Mag-sign out at mag-sign in muli, pagkatapos ay subukan ulit.',
        mismatch: 'Hindi magkatugma ang bagong password at kumpirmasyon.',
        generic: 'Hindi na-update ang password. Subukan muli.'
      }
    },
    barcodeScanner: {
      title: 'Barcode Scanner',
      description:
        'Ikonekta ang USB o Bluetooth barcode scanner para sa mabilis na paghahanap sa Point of Sale.',
      status: {
        idle: 'Hindi pa na-te-test',
        detected: 'Nadetect ang scanner'
      },
      usbTitle: 'USB (wired o wireless dongle)',
      usbStep1: 'I-plug ang scanner, o ang USB receiver nito, sa isang USB port.',
      usbStep2:
        'Awtomatikong made-detect ito ni Windows bilang keyboard — walang kailangang driver sa karamihan ng models.',
      usbStep3: 'I-scan ang barcode ng isang produkto sa ibaba para ma-confirm na gumagana ito.',
      bluetoothTitle: 'Bluetooth',
      bluetoothStep1: 'Buksan ang Windows Settings → Bluetooth & devices → Add device.',
      bluetoothStep2:
        'Ilagay ang scanner sa pairing mode (pindutin nang matagal ang pairing button, o i-scan ang "pairing" barcode sa manual nito).',
      bluetoothStep3: 'Piliin ang scanner sa listahan at i-pair.',
      bluetoothStep4:
        'I-scan ang barcode ng isang produkto sa ibaba para ma-confirm na gumagana ito.',
      openBluetoothSettings: 'Buksan ang Bluetooth Settings',
      testTitle: 'I-test ang iyong scanner',
      testHint:
        'I-scan ang kahit anong barcode — lalabas ang resulta sa ibaba. Gumagana ito kahit saan sa page na ito maliban kapag nagta-type sa isang text field.',
      waiting: 'Naghihintay ng scan…',
      lastScanLabel: 'Huling scan',
      clearButton: 'I-clear',
      posNote: 'Sa Point of Sale, itinutugma ang na-scan na code sa SKU ng bawat produkto.'
    },
    biometricDevice: {
      title: 'Biometric Terminal',
      description:
        'Ikonekta ang Hikvision face recognition terminal para sa real-time na attendance',
      hostLabel: 'IP Address',
      portLabel: 'Port',
      usernameLabel: 'Username',
      passwordLabel: 'Password',
      passwordSavedPlaceholder: 'Naka-save — iwanang blangko para hindi baguhin',
      useHttpsLabel: 'Gumagamit ng HTTPS ang device',
      testButton: 'I-test ang Koneksyon',
      connectButton: 'Kumonekta',
      disconnectButton: 'Idiskonekta',
      status: {
        disconnected: 'Naka-disconnect',
        connecting: 'Kumokonekta…',
        connected: 'Nakakonekta',
        error: 'May Error'
      },
      toast: {
        hostRequired: 'Kailangan ang IP address ng device',
        saved: 'Na-save ang settings ng device',
        testFailed: 'Nabigo ang connection test',
        connectFailed: 'Hindi nakakonekta sa device',
        saveFailed: 'Hindi na-save ang settings ng device',
        apiUnavailable:
          'Kailangan i-restart nang buo ang app para gumana ito — isara at buksan muli ang GSPIS Admin, subukan ulit.'
      }
    },
    receiptPrinter: {
      title: 'Receipt & Invoice Printer',
      description:
        'I-print nang tahimik, walang OS print dialog, papunta sa printer na naka-install sa Windows — POS Sales Invoices, at Service Invoice/Acknowledgment Receipt mula sa Record Payment ng Invoices at bulk payment ng Troop/District Committee.',
      printerLabel: 'Printer',
      systemDefault: 'System default na printer',
      default: 'Default',
      autoPrintLabel: 'I-auto-print ang resibo pagkatapos ng benta',
      autoPrintDesc:
        'Kapag naka-on, awtomatikong mag-p-print ang Sales Invoice pagkatapos ng bawat kumpletong benta sa POS. Pwede pa rin itong i-off ng cashier per-sale mula sa Point of Sale screen.',
      testButton: 'Magpadala ng Test Print',
      testSuccess: 'Naipadala ang test receipt sa printer',
      testFailure: 'Nabigo ang test print: {{error}}',
      drawerNote:
        'Tip sa cash drawer (thermal receipt printer lang): kung naka-wire ang drawer mo sa RJ11/RJ12 port ng printer na ito, i-enable ang "Open cash drawer when printing" (tinatawag din na "kick drawer") sa Windows driver ng printer — Devices & Printers → right-click sa printer → Printer properties → Device settings. Kapag naka-on na iyon, bubukas na rin ang drawer sa tuwing may naka-print na resibo. Hindi ito applicable sa dot-matrix/carbon-copy na printer.'
    },
    membershipYear: {
      title: 'Membership Year',
      description:
        'Ang buwan kung saan nagsisimula ang taunang membership cycle ng Girl Scout — dito nakabatay ang renewal ng bawat troop at miyembro.',
      startMonthLabel: 'Nagsisimula ang cycle sa',
      currentCycle: 'Kasalukuyang cycle: {{year}}',
      adminOnlyNote:
        'Super Admin at Admin lang ang makakapagbago nito — apektado ang buong council, sa lahat ng device.',
      months: [
        'Enero',
        'Pebrero',
        'Marso',
        'Abril',
        'Mayo',
        'Hunyo',
        'Hulyo',
        'Agosto',
        'Setyembre',
        'Oktubre',
        'Nobyembre',
        'Disyembre'
      ],
      toast: {
        saved: 'Na-update ang membership year cycle'
      }
    },
    payroll: {
      title: '13th Month Pay at Cash Gift',
      description:
        'Council-wide na halaga ng Cash Gift na ibibigay sa payroll entry ng bawat empleyado sa Nobyembre/Disyembre. Ang 13th Month Pay ay hindi dito itinatakda — awtomatiko itong kinakalkula per empleyado batay sa aktwal nilang batayang sahod para sa buong taon.',
      cashGiftLabel: 'Default na halaga ng Cash Gift',
      adminOnlyNote:
        'Super Admin at Admin lang ang makakapagbago nito — apektado ang buong council, sa lahat ng device.',
      toast: {
        saved: 'Na-update ang default na halaga ng Cash Gift'
      }
    },
    privacy: 'Privacy',
    privacyDesc: 'Pamahalaan ang iyong data at mga kagustuhan sa privacy',
    dataCollection: 'Usage Analytics',
    dataCollectionDesc:
      'Tulungan na mapabuti ang GSPIS Admin sa pamamagitan ng pagbabahagi ng anonymized na data',
    crashReports: 'Mga Crash Report',
    crashReportsDesc:
      'Awtomatikong magpadala ng mga crash report para makatulong sa pag-aayos ng mga bug',
    telemetry: 'Telemetry',
    telemetryDesc: 'Ibahagi ang mga sukatan ng pagganap sa team',
    advanced: 'Advanced',
    advancedDesc: 'Mga setting ng developer at maintenance',
    resetSettings: 'I-reset ang mga Setting',
    resetSettingsDesc: 'I-reset ang lahat ng setting sa mga default na halaga',
    resetConfirmTitle: 'I-reset ang mga Setting',
    resetConfirmDesc:
      'Ire-reset nito ang lahat ng setting sa kanilang mga default. Hindi maaaring i-undo ang aksyong ito.',
    dark: 'Madilim',
    light: 'Maliwanag'
  },
  devices: {
    title: 'Mga Device',
    subtitle: 'Ikonekta at i-test ang mga hardware na ginagamit ng GSPIS Admin.'
  },
  profile: {
    title: 'Aking Profile',
    subtitle: 'Detalye at larawan ng iyong account.',
    changePhoto: 'Palitan ang larawan',
    toast: {
      photoUpdated: 'Na-update ang larawan',
      photoFailed: 'Nabigo ang pag-upload ng larawan'
    }
  },
  manual: {
    title: 'Gabay sa Paggamit',
    subtitle: 'Paano gamitin ang bawat module sa GSPIS Admin.',
    searchPlaceholder: 'Maghanap sa gabay…',
    noResults: 'Walang tugmang paksa. Subukan ang ibang search.',
    tocHeading: 'Mga Nilalaman',
    stepsHeading: 'Paano gamitin',
    tipsHeading: 'Dapat malaman',
    rolesHeading: 'Sino ang may access dito',
    rolesFootnote:
      'Batay ito sa kasalukuyang Role Permissions setup ng inyong konseho — pwede itong baguhin ng Admin anumang oras sa Users > Role Permissions.',
    everyone: 'Sinumang naka-sign in',
    customRoles: 'custom role(s)',
    intro: {
      title: 'Mga Unang Hakbang',
      body: 'Ang GSPIS Admin ang desktop system ng GSP Ilocos Sur Council — Business, HR, at Financial Management sa iisang lugar. May ilang bagay na totoo saan mang bahagi ng app:',
      points: [
        'Ang mga staff account ay ginagawa ng Admin/Super Admin sa Users page — walang public sign-up. Kung hindi ka makapag-log in, magtanong sa isang Admin.',
        'Ang unang makikita mo pagkatapos mag-sign in ay depende sa iyong role: karamihan ng role ay napupunta sa Dashboard, ang Cashier ay sa Point of Sale, at ang HR ay sa Employees.',
        'Ang sidebar sa kaliwa ang buong mapa ng system — i-click ang collapse arrow sa taas para gawing icons na lang ito, o i-click ang logo ng organisasyon para i-expand ulit.',
        'Pindutin ang Ctrl+K (o i-click ang search bar sa title bar) para diretsong makapunta sa kahit anong record o page saan ka man naroroon.',
        'I-click ang iyong avatar sa ibaba ng sidebar para buksan ang My Profile, kung saan pwede mong i-update ang iyong sariling profile photo. Ang pangalan at role mo ay itinakda ng Admin — magtanong sa isa kung kailangan itong baguhin.',
        'Sa Settings, pwede mong palitan ang wika ng interface sa English o Tagalog, i-toggle ang light/dark mode, at i-adjust ang accent color, font size, at notifications — lahat sa ilalim ng Settings > Appearance.',
        'Bawat module sa ibaba ay lalabas lang sa iyong sidebar kung binigyan ng access ang iyong role — kaya huwag mag-alala kung mas maikli ang menu mo kaysa sa gabay na ito.'
      ]
    },
    groups: {
      core: 'Overview',
      troopsMembership: 'Troops & Membership',
      accounting: 'Accounting',
      councilPrograms: 'Mga Programa ng Konseho',
      hrPayroll: 'HR at Payroll',
      facility: 'Facility',
      admin: 'Admin',
      system: 'Account at System'
    }
  },
  about: {
    tagline:
      'Sistema ng Pamamahala sa Negosyo, HR, at Pananalapi para sa Girl Scouts of the Philippines — Ilocos Sur Council.',
    techStackHeading: 'Tech Stack',
    buildInfoHeading: 'Impormasyon ng Build',
    buildToolLabel: 'Build Tool',
    nodeTargetLabel: 'Node Target',
    rendererTargetLabel: 'Renderer Target',
    architectureLabel: 'Arkitektura',
    licenseLabel: 'Lisensya',
    footerCredits: 'Ginawa gamit ang electron-vite · React 19 · TypeScript · Tailwind CSS',
    footerDevelopedBy: 'Dinebelop ng AionX IT Solutions para sa GSP Ilocos Sur Council.'
  },
  updates: {
    checking: 'Sinusuri ang mga update...',
    available: 'Available ang update',
    notAvailable: 'Updated na ang iyong app',
    downloading: 'Dina-download ang update...',
    downloaded: 'Na-download na ang update',
    readyToInstall: 'I-restart para i-install ang update',
    error: 'Error sa update',
    installNow: 'I-install Ngayon'
  },
  employees: {
    title: 'Pamamahala ng Empleyado',
    addButton: 'Magdagdag ng Empleyado',
    searchPlaceholder: 'Maghanap ng empleyado…',
    empty: 'Walang nahanap na empleyado',
    table: {
      employeeNumber: 'Employee #',
      name: 'Pangalan',
      position: 'Posisyon',
      department: 'Departamento',
      branch: 'Sangay',
      salary: 'Sahod',
      status: 'Katayuan',
      deactivate: 'I-deactivate',
      reactivate: 'I-reactivate'
    },
    modal: {
      addTitle: 'Magdagdag ng Empleyado',
      editTitle: 'I-edit ang Empleyado',
      saveChanges: 'I-save ang mga Pagbabago'
    },
    form: {
      employeeNumber: 'Employee #',
      hireDate: 'Petsa ng Pagkuha',
      birthDate: 'Petsa ng Kaarawan',
      fullName: 'Buong Pangalan',
      position: 'Posisyon',
      department: 'Departamento',
      branch: 'Sangay',
      reportsTo: 'Nag-uulat Kay (Reports To)',
      noManager: 'Walang manager (pinakatuktok ng chart)',
      linkedUser: 'Naka-link na User Account',
      noLinkedUser: 'Walang naka-link na account',
      salary: 'Buwanang Sahod',
      email: 'Email',
      phone: 'Telepono',
      payrollDefaultsHeading:
        'Default na Halaga sa Payroll (awtomatikong ilalagay sa bagong Payroll Entry)',
      defaultCola: 'COLA',
      defaultRepresentation: 'Representation',
      defaultSss: 'SSS',
      defaultPhilhealth: 'PhilHealth',
      defaultPagibig: 'Pag-IBIG',
      defaultWithholdingTax: 'Withholding Tax'
    },
    toast: {
      validationRequired: 'Kailangan ang Employee #, pangalan, at posisyon',
      updated: 'Na-update ang empleyado',
      created: '{{name}} ay naidagdag sa mga empleyado',
      deactivated: '{{name}} ay na-deactivate',
      reactivated: '{{name}} ay na-reactivate',
      deleted: '{{name}} ay natanggal'
    },
    confirmDeactivate: {
      title: 'I-deactivate ang Empleyado',
      message:
        'I-deactivate si {{name}}? Sila ay hindi na lalabas sa mga listahan ng aktibong empleyado na ginagamit sa Attendance at Payroll.'
    },
    confirmReactivate: {
      title: 'I-reactivate ang Empleyado',
      message: 'I-reactivate si {{name}}?'
    },
    confirmDelete: {
      title: 'Tanggalin ang Empleyado',
      message:
        'Tanggalin si {{name}}? Permanenteng mabubura ang kanilang employee record. Ang mga umiiral na attendance, leave, at payroll record na naka-link sa kanila ay hindi matatanggal. Hindi na ito maibabalik.'
    },
    profile: {
      viewProfile: 'Tingnan ang Profile',
      changePhoto: 'Palitan ang larawan',
      uploadingPhoto: 'Ina-upload…',
      removePhoto: 'Alisin ang larawan',
      documentsHeading: 'Mga Dokumento',
      noDocuments: 'Wala pang na-upload na dokumento',
      documentLabelPlaceholder: 'Label (opsyonal — default sa pangalan ng file)',
      chooseFiles: 'Pumili ng mga file',
      uploadButton: 'I-upload',
      viewDocument: 'Tingnan',
      downloadDocument: 'I-download',
      documentTypes: {
        resume: 'Resume',
        transcript: 'Transcript / Grado',
        certification: 'Certification',
        other: 'Iba pa'
      },
      confirmDeleteDocument: {
        title: 'Burahin ang Dokumento',
        message: 'Burahin ang dokumentong ito? Hindi na ito maibabalik.'
      },
      confirmDeletePhoto: {
        title: 'Alisin ang Larawan',
        message: 'Alisin ang larawan ng empleyadong ito? Hindi na ito maibabalik.'
      },
      toast: {
        photoUpdated: 'Na-update ang larawan',
        photoFailed: 'Nabigo ang pag-upload ng larawan',
        photoRemoved: 'Naalis ang larawan',
        photoRemoveFailed: 'Nabigo ang pag-alis ng larawan',
        documentUploaded: 'Na-upload ang dokumento',
        documentFailed: 'Nabigo ang pag-upload ng dokumento',
        documentDeleted: 'Nabura ang dokumento',
        documentDownloadFailed: 'Nabigo ang pag-download ng dokumento'
      }
    }
  },
  troops: {
    title: 'Mga Troop at Membership',
    subtitle: 'Membership year {{year}}',
    addButton: 'Magdagdag ng Troop',
    exportButton: 'I-export',
    searchPlaceholder: 'Maghanap ng troop…',
    empty: 'Walang nahanap na troop',
    viewRoster: 'Tingnan ang Roster',
    tabTroops: 'Mga Troop',
    tabRegistrations: 'Mga Registration',
    tabPayments: 'Mga Bayad',
    table: {
      troopNumber: 'Troop #',
      troopName: 'Pangalan ng Troop',
      level: 'Level',
      leaderName: 'Troop Leader',
      members: 'Miyembro',
      needsRenewal: '{{count}} kailangang mag-renew',
      status: 'Katayuan',
      deactivate: 'I-deactivate',
      reactivate: 'I-reactivate'
    },
    modal: {
      addTitle: 'Magdagdag ng Troop',
      editTitle: 'I-edit ang Troop',
      saveChanges: 'I-save ang mga Pagbabago'
    },
    form: {
      troopNumber: 'Troop #',
      level: 'Level',
      levelPlaceholder: 'Piliin ang level',
      troopName: 'Pangalan ng Troop',
      leaderName: 'Troop Leader',
      leaderNamePlaceholder: 'hal. Juana Dela Cruz',
      trainingsCompletedCount: '{{count}} training ang natapos',
      assistantLeaderName: 'Assistant Troop Leader',
      school: 'Paaralan / Komunidad',
      barangay: 'Barangay',
      meetingPlace: 'Lugar ng Pagpupulong',
      registrationDetailsHeading: 'Mga Detalye ng Registration',
      troopAddress: 'Address ng Troop',
      troopTelNo: 'Tel. No. ng Troop',
      troopType: 'Uri ng Troop',
      troopTypePlaceholder: 'Piliin ang uri ng troop',
      districtCommitteeName: 'Pangalan ng District Committee / Munisipyo',
      district: 'District',
      districtPlaceholder: 'Pumili ng district…',
      barangayCommitteeName: 'Pangalan ng Barangay Committee',
      sponsoringGroup: 'Sponsoring Group',
      troopBirthday: 'Kaarawan ng Troop',
      completeMailingAddress: 'Kumpletong Mailing Address',
      leaderDetailsHeading: 'Detalye ng Troop Leader',
      leaderDetailsHint:
        'Ang Petsa ng Kapanganakan at Katayuan ng Training ay galing sa naka-link na Training Profile ng leader, kung meron — buksan ang Training Profiles para baguhin ang mga iyon.',
      assistantLeaderDetailsHeading: 'Detalye ng Co-Leader',
      leaderBeneficiary: 'Beneficiary',
      leaderRboStatus: 'RBO Status',
      rboStatusPlaceholder: 'Piliin ang RBO status'
    },
    confirmDeactivate: {
      title: 'I-deactivate ang Troop',
      message:
        'I-deactivate ang Troop {{troopNumber}}? Maitatago ito sa active troop pickers. Hindi ito makakaapekto sa mga miyembro nito.'
    },
    confirmReactivate: {
      title: 'I-reactivate ang Troop',
      message: 'I-reactivate ang Troop {{troopNumber}}?'
    },
    confirmDelete: {
      title: 'Burahin ang Troop',
      message:
        'Burahin ang Troop {{troopNumber}}? Permanenteng mabubura rin ang lahat ng miyembro sa roster nito. Hindi na ito maibabalik.'
    },
    confirmForceDelete: {
      title: 'Buburahin pa rin ang Troop?',
      message:
        'May mga miyembrong may recorded payment history ang Troop {{troopNumber}}. Kapag binura ito, mabubura rin ang payment history nila, na maaaring magbago sa mga na-reconcile na nang Daily Collections total para sa mga petsang iyon. Buburahin pa rin ba? Hindi na ito maibabalik.'
    },
    toast: {
      validationRequired: 'Kailangan ang Troop #, level, at troop leader',
      created: 'Naidagdag ang Troop {{troopNumber}}',
      updated: 'Na-update ang Troop',
      deleted: 'Nabura ang Troop {{troopNumber}}',
      deactivated: 'Na-deactivate ang Troop {{troopNumber}}',
      reactivated: 'Na-reactivate ang Troop {{troopNumber}}',
      noneToExport: 'Walang troop na ie-export',
      exportedExcel: 'Na-export ang Troops & Membership sa Excel',
      exportedPdf: 'Na-export ang Troops & Membership bilang PDF',
      exportedWord: 'Na-export ang Troops & Membership bilang Word document'
    },
    profile: {
      notLinkedToProfile: 'Hindi naka-link sa isang Training Profile'
    },
    roster: {
      heading: 'Member Roster',
      addButton: 'Magdagdag ng Miyembro',
      exportButton: 'I-export',
      searchPlaceholder: 'Maghanap sa roster…',
      empty: 'Wala pang nakarehistrong miyembro sa troop na ito',
      renewButton: 'I-renew para sa membership year na ito',
      paymentButton: 'Magtala ng Bayad',
      table: {
        fullName: 'Pangalan',
        birthdate: 'Petsa ng Kapanganakan',
        level: 'Level',
        guardian: 'Guardian',
        membership: 'Membership',
        current: 'Kasalukuyan — {{year}}',
        needsRenewalBadge: 'Kailangan i-renew — huling {{year}}'
      },
      modal: {
        addTitle: 'Magdagdag ng Miyembro',
        editTitle: 'I-edit ang Miyembro'
      },
      form: {
        fullName: 'Buong Pangalan',
        birthdate: 'Petsa ng Kapanganakan',
        level: 'Level',
        guardianName: 'Pangalan ng Guardian',
        guardianContact: 'Contact ng Guardian',
        address: 'Address',
        patrol: 'Patrol / Cluster',
        gradeYear: 'Grade / Year',
        beneficiary: 'Beneficiary'
      },
      payment: {
        title: 'Magtala ng Bayad — {{name}}',
        amountLabel: 'Halaga',
        categoryLabel: 'Kategorya',
        categoryMembership: 'Membership',
        categoryTraining: 'Training',
        categoryCamping: 'Camping',
        dateLabel: 'Petsa',
        submitButton: 'Itala ang Bayad',
        historyTitle: 'Kasaysayan ng Bayad',
        historyEmpty: 'Wala pang naitalang bayad',
        toast: {
          validationRequired: 'Maglagay ng halagang higit sa zero',
          recorded: 'Naitala ang bayad ni {{name}}'
        }
      },
      confirmDeactivate: {
        title: 'I-deactivate ang Miyembro',
        message: 'I-deactivate si {{name}}? Maitatago sila sa active roster at renewal tracking.'
      },
      confirmReactivate: {
        title: 'I-reactivate ang Miyembro',
        message: 'I-reactivate si {{name}}?'
      },
      confirmDelete: {
        title: 'Burahin ang Miyembro',
        message: 'Burahin si {{name}} mula sa troop na ito? Hindi na ito maibabalik.'
      },
      confirmForceDelete: {
        title: 'Buburahin pa rin?',
        message:
          'May recorded payment history si {{name}}. Kapag binura sila, mabubura rin ang payment history nila, na maaaring magbago sa mga na-reconcile na nang Daily Collections total para sa mga petsang iyon. Buburahin pa rin ba? Hindi na ito maibabalik.'
      },
      toast: {
        validationRequired: 'Kailangan ang buong pangalan at petsa ng kapanganakan',
        created: 'Naidagdag si {{name}} sa roster',
        updated: 'Na-update ang miyembro',
        deleted: 'Naalis si {{name}} sa roster',
        deactivated: 'Na-deactivate si {{name}}',
        reactivated: 'Na-reactivate si {{name}}',
        renewed: 'Na-renew si {{name}} para sa membership year {{year}}',
        noneToExport: 'Walang miyembrong ie-export',
        exportedExcel: 'Na-export ang member roster sa Excel',
        exportedPdf: 'Na-export ang member roster bilang PDF',
        exportedWord: 'Na-export ang member roster bilang Word document'
      }
    },
    payment: {
      subtitle:
        'Mga bulk na bayad kada troop — isang entry bawat remittance, kahit ilang miyembro ang saklaw nito',
      addButton: 'Magtala ng Bayad',
      searchPlaceholder: 'Maghanap gamit ang troop o paid by…',
      empty: 'Wala pang naitalang bayad',
      modalTitle: 'Magtala ng Bulk Payment',
      editModalTitle: 'I-edit ang Bayad',
      submitButton: 'Itala ang Bayad',
      troopLabel: 'Troop',
      troopPlaceholder: 'Pumili ng troop',
      membersLabel: 'Mga saklaw na miyembro ({{count}})',
      noMembers: 'Walang aktibong miyembro sa troop na ito',
      perMemberLinesHeading: 'Bayad kada miyembro',
      flatLinesHeading: 'Flat na bayad kada troop',
      troopFeeLabel: 'Troop Fee',
      thinkingDayFeeLabel: 'Thinking Day Fee',
      categoryLabel: 'Kategorya',
      amountPerMemberLabel: 'Halaga kada miyembro',
      totalLabel: 'Kabuuan',
      dateLabel: 'Petsa',
      paidByLabel: 'Nagbayad',
      printReceiptLabel: 'Mag-print ng resibo para sa bayad na ito',
      ratesFromRegistration:
        'Mula sa {{schoolYear}} registration na isinumite noong {{date}} — hindi na maeedit dito',
      noRegistrationNote:
        'Wala pang naisumiteng Troop Registration para sa troop na ito. Magsumite muna — jan hahalawin ang mga fee rate para sa bayad na ito.',
      table: {
        troopNumber: 'Troop #',
        date: 'Petsa',
        category: 'Kategorya',
        paidBy: 'Nagbayad',
        memberCount: 'Miyembro',
        totalAmount: 'Kabuuang Halaga'
      },
      confirmDelete: {
        title: 'Burahin ang Bayad',
        message:
          'Burahin itong {{category}} na bayad para sa Troop {{troopNumber}}? Maaalis din ang kaugnay na voucher kung mayroon. Hindi na ito maibabalik.'
      },
      toast: {
        troopRequired: 'Pumili ng troop',
        membersRequired: 'Pumili ng kahit isang miyembro',
        amountRequired: 'Maglagay ng halagang higit sa zero',
        paidByRequired: 'Ilagay kung sino ang nagbayad',
        noRegistration:
          'Magsumite muna ng Troop Registration para sa troop na ito bago magtala ng bayad',
        recorded: 'Naitala ang bayad'
      }
    }
  },
  troopRegistration: {
    title: 'Troop Registration',
    subtitle: 'Mga naisumiteng Troop Registration Form, isa bawat troop kada school year',
    addButton: 'Bagong Registration',
    exportButton: 'I-export',
    searchPlaceholder: 'Maghanap gamit ang troop, school year, o troop no…',
    empty: 'Wala pang naisumiteng registration',
    troopNotFound: 'Hindi nahanap ang troop para sa registration na ito.',
    table: {
      troopNumber: 'Troop #',
      troopName: 'Pangalan ng Troop',
      schoolYear: 'School Year',
      dateApplied: 'Petsa ng Aplikasyon',
      troopStatus: 'Katayuan',
      troopNo: 'Troop No.'
    },
    troopPicker: {
      title: 'Bagong Troop Registration',
      selectTroop: 'Troop',
      placeholder: 'Pumili ng troop',
      continue: 'Magpatuloy'
    },
    confirmDelete: {
      title: 'Burahin ang Registration',
      message:
        'Burahin ang {{schoolYear}} registration para sa Troop {{troopNumber}}? Hindi na ito maibabalik.'
    },
    toast: {
      validationRequired: 'Kailangan ang school year',
      created: 'Naisumite ang Troop Registration',
      updated: 'Na-update ang Troop Registration',
      deleted: 'Nabura ang Troop Registration',
      exportedExcel: 'Na-export ang Troop Registration sa Excel',
      exportedPdf: 'Na-export ang Troop Registration bilang PDF',
      exportedWord: 'Na-export ang Troop Registration bilang Word document'
    },
    form: {
      newTitle: 'Bagong Registration — Troop {{troopNumber}}',
      editTitle: 'Registration — Troop {{troopNumber}}',
      headerSection: 'Impormasyon ng Troop',
      schoolYear: 'School Year',
      dateApplied: 'Petsa ng Aplikasyon',
      troopStatus: 'Katayuan ng Troop',
      statusNew: 'Bago',
      statusReRegistered: 'Re-registered',
      ageLevel: 'Age Level',
      leadersSection: 'Registration ng mga Leader',
      addLeader: 'Magdagdag ng Leader',
      position: 'Posisyon',
      name: 'Pangalan',
      trained: 'T/NT',
      rboStatus: 'RBO Status',
      birthdate: 'Petsa ng Kapanganakan',
      beneficiary: 'Beneficiary',
      membersSection: 'Registration ng mga Miyembro ng Troop',
      addPatrol: 'Magdagdag ng Patrol/Cluster',
      addMember: 'Magdagdag ng Miyembro',
      removePatrol: 'Alisin ang Patrol/Cluster',
      gradeYear: 'Gr/Yr',
      regStatus: 'Reg. Status',
      signaturesSection: 'Mga Lagda',
      submittedByName: 'Isinumite Ni (Troop Leader)',
      submittedByDate: 'Petsa',
      notedByName: 'Napansin Ni (Principal / School Head / BC Chairman)',
      notedByDate: 'Petsa',
      remittanceSection: 'Council Action Remittance',
      gspMembershipFee: 'A. GSP Membership Fee',
      girlsReReg: 'Girls — Re-Reg',
      girlsNew: 'Girls — Bago',
      leaderReReg: 'Leader — Re-Reg',
      leaderNew: 'Leader — Bago',
      coLeaderReReg: 'Co-Leader — Re-Reg',
      coLeaderNew: 'Co-Leader — Bago',
      membershipFeePerMemberTotal: 'Bayad kada miyembro (kabuuang na-remit)',
      membershipFeePerMemberCouncilShare: 'Bayad kada miyembro (share ng Council)',
      councilRetainedShare: 'Retained share ng Council',
      thinkingDayFee: 'Thinking Day Fee (retained ng Council)',
      programDevelopmentFund: 'B. Program Development Fund',
      mutualAssistanceFund: 'C. Kontribusyon sa Mutual Assistance Fund',
      magazineSubscriptionFee: 'D. GS Magazine Troop Subscription Fee',
      totalRemittance: 'Kabuuang Remittance',
      troopNo: 'Troop No.',
      girlsCardsFrom: 'Girls Cards — Mula',
      girlsCardsTo: 'Girls Cards — Hanggang',
      girlsIdCardSeriesYear: 'Girls ID Card Series Year',
      adultsCardsFrom: 'Adults Cards — Mula',
      adultsCardsTo: 'Adults Cards — Hanggang',
      adultsIdCardSeriesYear: 'Adults ID Card Series Year',
      troopFee: 'Troop Fee (Retained ng Konseho)',
      rorNo: 'ROR No.',
      rorDate: 'Petsa ng ROR',
      dccrNo: 'DCCR No.',
      dateOfDeposit: 'Petsa ng Deposito',
      branchCode: 'Branch Code',
      processedByName: 'Pinoseso Ni (Registration Processor)',
      approvedByName: 'Inaprubahan Ni (Council Executive)'
    }
  },
  districtCommittee: {
    title: 'District Committee',
    subtitle: 'Mga District Committee sa ilalim ng Konseho',
    addButton: 'Magdagdag ng Committee',
    searchPlaceholder: 'Maghanap gamit ang pangalan, address, o council…',
    empty: 'Wala pang District Committee',
    addModalTitle: 'Magdagdag ng District Committee',
    editModalTitle: 'I-edit ang District Committee',
    tabCommittees: 'Mga Committee',
    tabRegistrations: 'Registration',
    tabPayments: 'Payment',
    form: {
      name: 'Pangalan ng District Committee',
      address: 'Address',
      telNo: 'Tel. No.',
      region: 'Region',
      council: 'Council',
      district: 'District',
      districtPlaceholder: 'Pumili ng district…'
    },
    table: {
      name: 'Pangalan',
      address: 'Address',
      telNo: 'Tel. No.',
      members: 'Miyembro',
      status: 'Katayuan',
      deactivate: 'I-deactivate',
      reactivate: 'I-reactivate'
    },
    toast: {
      deactivated: '"{{name}}" ay na-deactivate',
      reactivated: '"{{name}}" ay na-reactivate',
      deleted: '"{{name}}" ay natanggal'
    },
    confirmDeactivate: {
      title: 'I-deactivate ang Committee',
      message:
        'I-deactivate ang "{{name}}"? Mananatili ito sa record pero hindi na lalabas sa mga active picker.'
    },
    confirmReactivate: {
      title: 'I-reactivate ang Committee',
      message: 'I-reactivate ang "{{name}}"?'
    },
    confirmDelete: {
      title: 'Burahin ang Committee',
      message: 'Burahin ang "{{name}}"? Hindi na ito maibabalik.'
    },
    confirmForceDelete: {
      title: 'Burahin Kahit May Payment History',
      message:
        'May naitalang payment history ang mga miyembro ng "{{name}}" — kung ipipilit ang pagbura, maaapektuhan ang mga nakaraang Daily Collections report. Ipagpatuloy pa rin?'
    },
    payment: {
      subtitle:
        'Mga bulk na bayad kada District Committee — isang entry bawat remittance, kahit ilang miyembro ang saklaw nito',
      addButton: 'Magtala ng Bayad',
      searchPlaceholder: 'Maghanap gamit ang committee o paid by…',
      empty: 'Wala pang naitalang bayad',
      modalTitle: 'Magtala ng Bulk Payment',
      editModalTitle: 'I-edit ang Bayad',
      submitButton: 'Itala ang Bayad',
      committeeLabel: 'District Committee',
      committeePlaceholder: 'Pumili ng committee',
      membersLabel: 'Mga saklaw na miyembro ({{count}})',
      noMembers: 'Walang aktibong miyembro sa committee na ito',
      perMemberLinesHeading: 'Bayad kada miyembro',
      categoryMembership: 'Membership',
      flatLinesHeading: 'Flat na bayad kada committee',
      dcGroupFeeLabel: 'D.C. Group Fee',
      totalLabel: 'Kabuuan',
      dateLabel: 'Petsa',
      paidByLabel: 'Nagbayad',
      printReceiptLabel: 'Mag-print ng resibo para sa bayad na ito',
      ratesFromRegistration:
        'Mula sa {{schoolYear}} registration na isinumite noong {{date}} — hindi na maeedit dito',
      noRegistrationNote:
        'Wala pang naisumiteng District Committee Registration para sa committee na ito. Magsumite muna — jan hahalawin ang mga fee rate para sa bayad na ito.',
      table: {
        committeeName: 'Committee',
        date: 'Petsa',
        category: 'Kategorya',
        paidBy: 'Nagbayad',
        memberCount: 'Miyembro',
        totalAmount: 'Kabuuang Halaga'
      },
      confirmDelete: {
        title: 'Burahin ang Bayad',
        message:
          'Burahin itong {{category}} na bayad para sa "{{name}}"? Maaalis din ang kaugnay na voucher kung mayroon. Hindi na ito maibabalik.'
      },
      toast: {
        committeeRequired: 'Pumili ng committee',
        membersRequired: 'Pumili ng kahit isang miyembro',
        amountRequired: 'Maglagay ng halagang higit sa zero',
        paidByRequired: 'Ilagay kung sino ang nagbayad',
        noRegistration:
          'Magsumite muna ng District Committee Registration para sa committee na ito bago magtala ng bayad',
        recorded: 'Naitala ang bayad'
      }
    }
  },
  districtCommitteeRegistration: {
    title: 'District Committee Registration',
    subtitle:
      'Mga naisumiteng District Committee Registration Form, isa bawat committee kada school year',
    addButton: 'Bagong Registration',
    exportButton: 'I-export',
    searchPlaceholder: 'Maghanap gamit ang committee o school year…',
    empty: 'Wala pang naisumiteng registration',
    committeeNotFound: 'Hindi nahanap ang District Committee para sa registration na ito.',
    table: {
      committeeName: 'Committee',
      schoolYear: 'School Year',
      dateApplied: 'Petsa ng Aplikasyon',
      registrationStatus: 'Katayuan'
    },
    committeePicker: {
      title: 'Bagong District Committee Registration',
      selectCommittee: 'District Committee',
      placeholder: 'Pumili ng committee',
      continue: 'Magpatuloy'
    },
    confirmDelete: {
      title: 'Burahin ang Registration',
      message:
        'Burahin ang {{schoolYear}} registration para sa "{{name}}"? Hindi na ito maibabalik.'
    },
    toast: {
      validationRequired: 'Kailangan ang school year',
      deleted: 'Natanggal ang District Committee Registration',
      created: 'Naisumite ang District Committee Registration',
      updated: 'Na-update ang District Committee Registration',
      exportedExcel: 'Na-export ang District Committee Registration sa Excel',
      exportedPdf: 'Na-export ang District Committee Registration bilang PDF',
      exportedWord: 'Na-export ang District Committee Registration bilang Word document'
    },
    form: {
      newTitle: 'Bagong Registration — {{name}}',
      editTitle: 'I-edit ang Registration — {{name}}',
      headerSection: 'District Committee Registration Form',
      schoolYear: 'School Year',
      dateApplied: 'Petsa ng Aplikasyon',
      registrationStatus: 'Registration Status',
      statusNew: 'Bago',
      statusReRegistered: 'Re-registered',
      membersSection: 'Registration of Committee Members',
      addMember: 'Magdagdag ng Miyembro',
      position: 'Posisyon',
      fullName: 'Pangalan (Apelyido, Pangalan, M.I.)',
      birthdate: 'Kaarawan',
      groupRepresented: 'Group Represented',
      regStatus: 'Reg. Status',
      beneficiary: 'Beneficiary',
      signaturesSection: 'Mga Lagda',
      submittedByName: 'Isinumite Ni (District Field Adviser)',
      submittedByDate: 'Petsa',
      notedByName: 'Napansin Ni (Dist. Com. Chairman/Dist. Commissioner)',
      notedByDate: 'Petsa',
      remittanceSection: 'Council Action Remittance',
      memberFeeTotal: 'Members Fee (Kabuuan)',
      memberCountsHint: '{{reReg}} Re-Reg, {{new}} Bago — binilang mula sa roster sa itaas',
      memberFeePerMember: 'Fee kada Miyembro',
      programDevelopmentFund: 'Program Development Fund',
      mutualAssistanceFund: 'Contribution to the Mutual Assistance Fund',
      totalRemittance: 'Kabuuang Remittance',
      dcGroupFee: 'D.C. Group Fee (Retained ng Konseho)',
      adultsCardsFrom: 'Adult Cards Issued — Mula',
      adultsCardsTo: 'Adult Cards Issued — Hanggang',
      rorNo: 'ROR No.',
      rorDate: 'Petsa ng ROR',
      dccrNo: 'DCCR No.',
      dateOfDeposit: 'Petsa ng Deposito',
      dccrSumNo: 'DCCR Sum No.',
      branchCode: 'Branch Code',
      processedByName: 'Pinoseso Ni (Registration Processor)',
      approvedByName: 'Inaprubahan Ni (Council Executive)'
    }
  },
  barangayCommittee: {
    title: 'Barangay Committee',
    subtitle: 'Mga Barangay Committee sa ilalim ng Konseho',
    addButton: 'Magdagdag ng Committee',
    searchPlaceholder: 'Maghanap gamit ang pangalan, address, o council…',
    empty: 'Wala pang Barangay Committee',
    addModalTitle: 'Magdagdag ng Barangay Committee',
    editModalTitle: 'I-edit ang Barangay Committee',
    tabCommittees: 'Mga Committee',
    tabRegistrations: 'Registration',
    tabPayments: 'Payment',
    form: {
      name: 'Pangalan ng Barangay Committee',
      address: 'Address',
      telNo: 'Tel. No.',
      districtCommitteeName: 'Pangalan ng District Committee',
      region: 'Region',
      council: 'Council',
      district: 'District',
      districtPlaceholder: 'Pumili ng district…'
    },
    table: {
      name: 'Pangalan',
      address: 'Address',
      districtCommitteeName: 'District Committee',
      telNo: 'Tel. No.',
      members: 'Miyembro',
      status: 'Katayuan',
      deactivate: 'I-deactivate',
      reactivate: 'I-reactivate'
    },
    toast: {
      deactivated: '"{{name}}" ay na-deactivate',
      reactivated: '"{{name}}" ay na-reactivate',
      deleted: '"{{name}}" ay natanggal'
    },
    confirmDeactivate: {
      title: 'I-deactivate ang Committee',
      message:
        'I-deactivate ang "{{name}}"? Mananatili ito sa record pero hindi na lalabas sa mga active picker.'
    },
    confirmReactivate: {
      title: 'I-reactivate ang Committee',
      message: 'I-reactivate ang "{{name}}"?'
    },
    confirmDelete: {
      title: 'Burahin ang Committee',
      message: 'Burahin ang "{{name}}"? Hindi na ito maibabalik.'
    },
    confirmForceDelete: {
      title: 'Burahin Kahit May Payment History',
      message:
        'May naitalang payment history ang mga miyembro ng "{{name}}" — kung ipipilit ang pagbura, maaapektuhan ang mga nakaraang Daily Collections report. Ipagpatuloy pa rin?'
    },
    payment: {
      subtitle:
        'Mga bulk na bayad kada Barangay Committee — isang entry bawat remittance, kahit ilang miyembro ang saklaw nito',
      addButton: 'Magtala ng Bayad',
      searchPlaceholder: 'Maghanap gamit ang committee o paid by…',
      empty: 'Wala pang naitalang bayad',
      modalTitle: 'Magtala ng Bulk Payment',
      editModalTitle: 'I-edit ang Bayad',
      submitButton: 'Itala ang Bayad',
      committeeLabel: 'Barangay Committee',
      committeePlaceholder: 'Maghanap ng pangalan ng committee…',
      membersLabel: 'Mga saklaw na miyembro ({{count}})',
      noMembers: 'Walang aktibong miyembro sa committee na ito',
      categoryMembership: 'Membership',
      bcGroupFeeLabel: 'B.C. Group Fee',
      totalLabel: 'Kabuuan',
      dateLabel: 'Petsa',
      paidByLabel: 'Nagbayad',
      ratesFromRegistration:
        'Mula sa {{schoolYear}} registration na isinumite noong {{date}} — hindi na maeedit dito',
      noRegistrationNote:
        'Wala pang naisumiteng Barangay Committee Registration para sa committee na ito. Magsumite muna — jan hahalawin ang mga fee rate para sa bayad na ito.',
      table: {
        committeeName: 'Committee',
        date: 'Petsa',
        category: 'Kategorya',
        paidBy: 'Nagbayad',
        memberCount: 'Miyembro',
        totalAmount: 'Kabuuang Halaga'
      },
      confirmDelete: {
        title: 'Burahin ang Bayad',
        message:
          'Burahin itong {{category}} na bayad para sa "{{name}}"? Maaalis din ang kaugnay na voucher kung mayroon. Hindi na ito maibabalik.'
      },
      toast: {
        committeeRequired: 'Pumili ng committee',
        membersRequired: 'Pumili ng kahit isang miyembro',
        amountRequired: 'Maglagay ng halagang higit sa zero',
        paidByRequired: 'Ilagay kung sino ang nagbayad',
        noRegistration:
          'Magsumite muna ng Barangay Committee Registration para sa committee na ito bago magtala ng bayad',
        recorded: 'Naitala ang bayad'
      }
    }
  },
  barangayCommitteeRegistration: {
    title: 'Barangay Committee Registration',
    subtitle:
      'Mga naisumiteng Barangay Committee Registration Form, isa bawat committee kada school year',
    addButton: 'Bagong Registration',
    exportButton: 'I-export',
    searchPlaceholder: 'Maghanap gamit ang committee o school year…',
    empty: 'Wala pang naisumiteng registration',
    committeeNotFound: 'Hindi nahanap ang Barangay Committee para sa registration na ito.',
    table: {
      committeeName: 'Committee',
      schoolYear: 'School Year',
      dateApplied: 'Petsa ng Aplikasyon',
      registrationStatus: 'Katayuan'
    },
    committeePicker: {
      title: 'Bagong Barangay Committee Registration',
      selectCommittee: 'Barangay Committee',
      placeholder: 'Pumili ng committee',
      continue: 'Magpatuloy'
    },
    confirmDelete: {
      title: 'Burahin ang Registration',
      message:
        'Burahin ang {{schoolYear}} registration para sa "{{name}}"? Hindi na ito maibabalik.'
    },
    toast: {
      validationRequired: 'Kailangan ang school year',
      deleted: 'Natanggal ang Barangay Committee Registration',
      created: 'Naisumite ang Barangay Committee Registration',
      updated: 'Na-update ang Barangay Committee Registration',
      exportedExcel: 'Na-export ang Barangay Committee Registration sa Excel',
      exportedPdf: 'Na-export ang Barangay Committee Registration bilang PDF',
      exportedWord: 'Na-export ang Barangay Committee Registration bilang Word document'
    },
    form: {
      newTitle: 'Bagong Registration — {{name}}',
      editTitle: 'I-edit ang Registration — {{name}}',
      headerSection: 'Barangay Committee Registration Form',
      schoolYear: 'School Year',
      dateApplied: 'Petsa ng Aplikasyon',
      registrationStatus: 'Registration Status',
      statusNew: 'Bago',
      statusReRegistered: 'Re-registered',
      membersSection: 'Registration of Committee Members',
      addMember: 'Magdagdag ng Miyembro',
      position: 'Posisyon',
      fullName: 'Pangalan (Apelyido, Pangalan, M.I.)',
      birthdate: 'Kaarawan',
      groupRepresented: 'Group Represented',
      regStatus: 'Reg. Status',
      beneficiary: 'Beneficiary',
      signaturesSection: 'Mga Lagda',
      submittedByName: 'Isinumite Ni (BC Chairman)',
      submittedByDate: 'Petsa',
      remittanceSection: 'Council Action Remittance',
      memberFeeTotal: 'Members Fee (Kabuuan)',
      memberCountsHint: '{{reReg}} Re-Reg, {{new}} Bago — binilang mula sa roster sa itaas',
      memberFeePerMember: 'Fee kada Miyembro',
      programDevelopmentFund: 'Program Development Fund',
      mutualAssistanceFund: 'Contribution to the Mutual Assistance Fund',
      totalRemittance: 'Kabuuang Remittance',
      bcGroupFee: 'B.C. Group Fee (Retained ng Konseho)',
      adultsCardsFrom: 'Adult Cards Issued — Mula',
      adultsCardsTo: 'Adult Cards Issued — Hanggang',
      rorNo: 'ROR No.',
      rorDate: 'Petsa ng ROR',
      dccrNo: 'DCCR No.',
      dateOfDeposit: 'Petsa ng Deposito',
      branchCode: 'Branch Code',
      processedByName: 'Pinoseso Ni (Registration Processor)',
      approvedByName: 'Inaprubahan Ni (Council Executive)'
    }
  },
  trefoilGuild: {
    title: 'Trefoil Guild',
    subtitle: 'Mga Trefoil Guild sa ilalim ng Konseho',
    addButton: 'Magdagdag ng Guild',
    searchPlaceholder: 'Maghanap gamit ang pangalan, address, o council…',
    empty: 'Wala pang Trefoil Guild',
    addModalTitle: 'Magdagdag ng Trefoil Guild',
    editModalTitle: 'I-edit ang Trefoil Guild',
    tabGuilds: 'Mga Guild',
    tabRegistrations: 'Registration',
    tabPayments: 'Payment',
    form: {
      name: 'Pangalan ng Trefoil Guild',
      guildNumber: 'Trefoil Guild Number',
      address: 'Address',
      telNo: 'Tel. No.',
      email: 'Email Address',
      region: 'Region',
      council: 'Council',
      district: 'District',
      districtPlaceholder: 'Pumili ng district…'
    },
    table: {
      name: 'Pangalan',
      guildNumber: 'Guild No.',
      address: 'Address',
      telNo: 'Tel. No.',
      members: 'Miyembro',
      status: 'Katayuan',
      deactivate: 'I-deactivate',
      reactivate: 'I-reactivate'
    },
    toast: {
      deactivated: '"{{name}}" ay na-deactivate',
      reactivated: '"{{name}}" ay na-reactivate',
      deleted: '"{{name}}" ay natanggal'
    },
    confirmDeactivate: {
      title: 'I-deactivate ang Guild',
      message:
        'I-deactivate ang "{{name}}"? Mananatili ito sa record pero hindi na lalabas sa mga active picker.'
    },
    confirmReactivate: {
      title: 'I-reactivate ang Guild',
      message: 'I-reactivate ang "{{name}}"?'
    },
    confirmDelete: {
      title: 'Burahin ang Guild',
      message: 'Burahin ang "{{name}}"? Hindi na ito maibabalik.'
    },
    confirmForceDelete: {
      title: 'Burahin Kahit May Payment History',
      message:
        'May naitalang payment history ang mga miyembro ng "{{name}}" — kung ipipilit ang pagbura, maaapektuhan ang mga nakaraang Daily Collections report. Ipagpatuloy pa rin?'
    },
    payment: {
      subtitle:
        'Mga bulk na bayad kada Trefoil Guild — isang entry bawat remittance, kahit ilang miyembro ang saklaw nito',
      addButton: 'Magtala ng Bayad',
      searchPlaceholder: 'Maghanap gamit ang guild o paid by…',
      empty: 'Wala pang naitalang bayad',
      modalTitle: 'Magtala ng Bulk Payment',
      editModalTitle: 'I-edit ang Bayad',
      submitButton: 'Itala ang Bayad',
      guildLabel: 'Trefoil Guild',
      guildPlaceholder: 'Maghanap ng pangalan ng guild…',
      membersLabel: 'Mga saklaw na miyembro ({{count}})',
      noMembers: 'Walang aktibong miyembro sa guild na ito',
      categoryMembership: 'Membership',
      tgGroupFeeLabel: 'T.G. Group Fee',
      totalLabel: 'Kabuuan',
      dateLabel: 'Petsa',
      paidByLabel: 'Nagbayad',
      ratesFromRegistration:
        'Mula sa {{schoolYear}} registration na isinumite noong {{date}} — hindi na maeedit dito',
      noRegistrationNote:
        'Wala pang naisumiteng Trefoil Guild Registration para sa guild na ito. Magsumite muna — jan hahalawin ang mga fee rate para sa bayad na ito.',
      table: {
        guildName: 'Guild',
        date: 'Petsa',
        category: 'Kategorya',
        paidBy: 'Nagbayad',
        memberCount: 'Miyembro',
        totalAmount: 'Kabuuang Halaga'
      },
      confirmDelete: {
        title: 'Burahin ang Bayad',
        message:
          'Burahin itong {{category}} na bayad para sa "{{name}}"? Maaalis din ang kaugnay na voucher kung mayroon. Hindi na ito maibabalik.'
      },
      toast: {
        guildRequired: 'Pumili ng guild',
        membersRequired: 'Pumili ng kahit isang miyembro',
        amountRequired: 'Maglagay ng halagang higit sa zero',
        paidByRequired: 'Ilagay kung sino ang nagbayad',
        noRegistration:
          'Magsumite muna ng Trefoil Guild Registration para sa guild na ito bago magtala ng bayad',
        recorded: 'Naitala ang bayad'
      }
    }
  },
  trefoilGuildRegistration: {
    title: 'Trefoil Guild Registration',
    subtitle: 'Mga naisumiteng Trefoil Guild Registration Form, isa bawat guild kada school year',
    addButton: 'Bagong Registration',
    exportButton: 'I-export',
    searchPlaceholder: 'Maghanap gamit ang guild o school year…',
    empty: 'Wala pang naisumiteng registration',
    guildNotFound: 'Hindi nahanap ang Trefoil Guild para sa registration na ito.',
    table: {
      guildName: 'Guild',
      schoolYear: 'School Year',
      dateApplied: 'Petsa ng Aplikasyon',
      registrationStatus: 'Katayuan'
    },
    guildPicker: {
      title: 'Bagong Trefoil Guild Registration',
      selectGuild: 'Trefoil Guild',
      placeholder: 'Pumili ng guild',
      continue: 'Magpatuloy'
    },
    confirmDelete: {
      title: 'Burahin ang Registration',
      message:
        'Burahin ang {{schoolYear}} registration para sa "{{name}}"? Hindi na ito maibabalik.'
    },
    toast: {
      validationRequired: 'Kailangan ang school year',
      deleted: 'Natanggal ang Trefoil Guild Registration',
      created: 'Naisumite ang Trefoil Guild Registration',
      updated: 'Na-update ang Trefoil Guild Registration',
      exportedExcel: 'Na-export ang Trefoil Guild Registration sa Excel',
      exportedPdf: 'Na-export ang Trefoil Guild Registration bilang PDF',
      exportedWord: 'Na-export ang Trefoil Guild Registration bilang Word document'
    },
    form: {
      newTitle: 'Bagong Registration — {{name}}',
      editTitle: 'I-edit ang Registration — {{name}}',
      headerSection: 'Trefoil Guild Registration Form',
      schoolYear: 'School Year',
      dateApplied: 'Petsa ng Aplikasyon',
      registrationStatus: 'Registration Status',
      statusNew: 'Bago',
      statusReRegistered: 'Re-registered',
      membersSection: 'Registration of Guild Members',
      addMember: 'Magdagdag ng Miyembro',
      position: 'Posisyon',
      fullName: 'Pangalan (Apelyido, Pangalan, M.I.)',
      birthdate: 'Kaarawan',
      regStatus: 'Reg. Status',
      beneficiary: 'Beneficiary',
      signaturesSection: 'Mga Lagda',
      submittedByName: 'Isinumite Ni (TG Chairman)',
      submittedByDate: 'Petsa',
      remittanceSection: 'Council Action Remittance',
      memberFeeTotal: 'Members Fee (Kabuuan)',
      memberCountsHint: '{{reReg}} Re-Reg, {{new}} Bago — binilang mula sa roster sa itaas',
      memberFeePerMember: 'Fee kada Miyembro',
      programDevelopmentFund: 'Program Development Fund',
      mutualAssistanceFund: 'Contribution to the Mutual Assistance Fund',
      totalRemittance: 'Kabuuang Remittance',
      tgGroupFee: 'T.G. Group Fee (Retained ng Konseho)',
      adultsCardsFrom: 'No. of Cards Issued — Mula',
      adultsCardsTo: 'No. of Cards Issued — Hanggang',
      orNo: 'O.R. No.',
      orDate: 'Petsa ng O.R.',
      dccrNo: 'DCCR No.',
      dateOfDeposit: 'Petsa ng Deposito',
      branchCode: 'Branch Code',
      processedByName: 'Pinoseso Ni (Registration Processor)',
      approvedByName: 'Inaprubahan Ni (Council Executive)'
    }
  },
  oavf: {
    title: 'OAVF / Career Woman Members',
    subtitle: 'Mga profile ng Other Adult Volunteer at Career Woman Members',
    addButton: 'Bagong Miyembro',
    exportLabel: 'I-export',
    searchPlaceholder: 'Maghanap gamit ang pangalan o address…',
    empty: 'Wala pang OAVF/Career Woman member',
    addModalTitle: 'Bagong OAVF/Career Woman Member',
    editModalTitle: 'I-edit ang OAVF/Career Woman Member',
    tabMembers: 'Mga Miyembro',
    tabRegistrations: 'Registration',
    tabPayments: 'Payment',
    table: {
      name: 'Pangalan',
      district: 'District',
      dateApplied: 'Petsa ng Aplikasyon',
      mobileNo: 'Mobile No.',
      wasGirlScout: 'Dating Girl Scout',
      membershipFeeTotal: 'Bayad',
      paymentStatus: 'Bayad',
      paid: 'Bayad na',
      unpaid: 'Hindi pa bayad',
      membershipStatus: 'Membership',
      active: 'Aktibo',
      expired: 'Expired',
      noRegistration: 'Walang Registration'
    },
    confirmDelete: {
      title: 'Burahin ang Miyembro',
      message: 'Burahin ang miyembrong "{{name}}"? Hindi na ito maibabalik.'
    },
    confirmForceDelete: {
      title: 'Burahin Kahit May Payment History',
      message:
        'May Registration si "{{name}}" na may naitalang payment history — kung ituloy ang pagbura, mabubura rin ang Registration na iyon at ang kaugnay na voucher kung mayroon, na maaapektuhan ang mga nakaraang Daily Collections report. Ituloy pa rin?'
    },
    payment: {
      subtitle: 'Mga naitalang bayad ng OAVF/Career Woman Membership Fee',
      searchPlaceholder: 'Maghanap gamit ang pangalan o school year…',
      empty: 'Wala pang naitalang bayad',
      recordButton: 'Magtala ng Bayad',
      modalTitle: 'Magtala ng Bayad — {{name}}',
      submitButton: 'Itala ang Bayad',
      membershipFeeTotal: 'Membership Fee (Kabuuan)',
      membershipFeeCouncilShare: 'Bahagi ng Council',
      dateLabel: 'Petsa',
      totalLabel: 'Kabuuan',
      feeLabel: 'OAVF/Career Woman Membership Fee',
      pickerTitle: 'Pumili ng Registration na Babayaran',
      pickerPlaceholder: 'Maghanap gamit ang pangalan o school year…',
      pickerEmpty: 'Walang nahanap na unpaid registration',
      table: {
        name: 'Aplikante',
        schoolYear: 'School Year',
        date: 'Petsa',
        arNumber: 'AR No.',
        amount: 'Halaga'
      },
      toast: {
        recorded: 'Naitala ang bayad'
      }
    },
    toast: {
      missingFields: 'Kailangan ang Apelyido at Pangalan',
      created: 'Naisave ang OAVF/Career Woman member',
      updated: 'Na-update ang OAVF/Career Woman member',
      deleted: 'Natanggal ang OAVF/Career Woman member',
      exportedExcel: 'Na-export sa Excel',
      exportedPdf: 'Na-export bilang PDF',
      exportedWord: 'Na-export bilang Word document'
    },
    form: {
      createButton: 'I-save ang Miyembro',
      selectPlaceholder: 'Pumili…',
      dateApplied: 'Petsa',
      council: 'Council',
      region: 'Region',
      district: 'District',
      lastName: 'Apelyido',
      firstName: 'Pangalan',
      middleInitial: 'M.I.',
      civilStatus: 'Civil Status',
      sex: 'Kasarian',
      birthdate: 'Kaarawan',
      mobileNo: 'Mobile No.',
      email: 'E-mail',
      homeAddress: 'Home Address',
      religion: 'Relihiyon',
      educationalAttainment: 'Educational Attainment',
      profession: 'Propesyon',
      occupation: 'Trabaho',
      interests: 'Interes',
      otherOrgAffiliated: 'Ibang Organisasyong Kinabibilangan',
      beneficiary: 'Beneficiary',
      beneficiaryContactNo: 'Contact Number/s',
      wasGirlScout: 'Kasaysayan bilang Girl Scout',
      wasGirlScoutLabel: 'Naging Girl Scout ka na ba?',
      gsRegion: 'Region',
      gsCouncil: 'Council',
      dateLastRegistered: 'Huling Petsa ng Rehistro',
      gsPosition: 'Posisyon'
    },
    registration: {
      subtitle: 'Mga OAVF/Career Woman filing, isa bawat aplikante kada school year',
      addButton: 'Bagong Registration',
      searchPlaceholder: 'Maghanap gamit ang pangalan o school year…',
      empty: 'Wala pang naisumiteng registration',
      addModalTitle: 'Bagong OAVF/Career Woman Registration',
      editModalTitle: 'I-edit ang OAVF/Career Woman Registration',
      table: {
        name: 'Aplikante',
        schoolYear: 'School Year',
        dateApplied: 'Petsa ng Aplikasyon'
      },
      confirmDelete: {
        title: 'Burahin ang Registration',
        message: 'Burahin ang {{schoolYear}} registration ni "{{name}}"? Hindi na ito maibabalik.'
      },
      toast: {
        memberRequired: 'Pumili ng aplikante',
        schoolYearRequired: 'Kailangan ang school year',
        created: 'Naisumite ang registration',
        updated: 'Na-update ang registration',
        deleted: 'Natanggal ang registration'
      },
      form: {
        createButton: 'I-save ang Registration',
        applicant: 'Aplikante',
        applicantPlaceholder: 'Maghanap ng miyembro…',
        schoolYear: 'School Year',
        dateApplied: 'Petsa ng Aplikasyon'
      }
    }
  },
  honoraryMember: {
    title: 'Honorary Members',
    subtitle: 'Mga profile ng Honorary Member',
    addButton: 'Bagong Miyembro',
    exportLabel: 'I-export',
    searchPlaceholder: 'Maghanap gamit ang pangalan o address…',
    empty: 'Wala pang Honorary Member',
    addModalTitle: 'Bagong Honorary Member',
    editModalTitle: 'I-edit ang Honorary Member',
    tabMembers: 'Mga Miyembro',
    tabRegistrations: 'Registration',
    tabPayments: 'Payment',
    table: {
      name: 'Pangalan',
      district: 'District',
      dateApplied: 'Petsa ng Aplikasyon',
      phone: 'Telepono',
      wasGirlScout: 'Dating Girl Scout',
      feeAmount: 'Bayad',
      paymentStatus: 'Bayad',
      paid: 'Bayad na',
      unpaid: 'Hindi pa bayad',
      membershipStatus: 'Membership',
      active: 'Aktibo',
      expired: 'Expired',
      noRegistration: 'Walang Registration'
    },
    confirmDelete: {
      title: 'Burahin ang Miyembro',
      message: 'Burahin ang miyembrong "{{name}}"? Hindi na ito maibabalik.'
    },
    confirmForceDelete: {
      title: 'Burahin Kahit May Payment History',
      message:
        'May Registration si "{{name}}" na may naitalang payment history — kung ituloy ang pagbura, mabubura rin ang Registration na iyon at ang kaugnay na voucher kung mayroon, na maaapektuhan ang mga nakaraang Daily Collections report. Ituloy pa rin?'
    },
    payment: {
      subtitle: 'Mga naitalang bayad ng Honorary Member fee',
      searchPlaceholder: 'Maghanap gamit ang pangalan o school year…',
      empty: 'Wala pang naitalang bayad',
      recordButton: 'Magtala ng Bayad',
      modalTitle: 'Magtala ng Bayad — {{name}}',
      submitButton: 'Itala ang Bayad',
      membershipFeeTotal: 'Membership Fee (Kabuuan)',
      membershipFeeCouncilShare: 'Bahagi ng Council',
      dateLabel: 'Petsa',
      totalLabel: 'Kabuuan',
      feeLabel: 'Honorary Member Fee',
      pickerTitle: 'Pumili ng Registration na Babayaran',
      pickerPlaceholder: 'Maghanap gamit ang pangalan o school year…',
      pickerEmpty: 'Walang nahanap na unpaid registration',
      table: {
        name: 'Honoree',
        schoolYear: 'School Year',
        date: 'Petsa',
        arNumber: 'AR No.',
        amount: 'Halaga'
      },
      toast: {
        amountRequired: 'Maglagay ng halagang higit sa zero',
        recorded: 'Naitala ang bayad'
      }
    },
    toast: {
      missingFields: 'Kailangan ang Apelyido at Pangalan',
      created: 'Naisave ang Honorary Member',
      updated: 'Na-update ang Honorary Member',
      deleted: 'Natanggal ang Honorary Member',
      exportedExcel: 'Na-export sa Excel',
      exportedPdf: 'Na-export bilang PDF',
      exportedWord: 'Na-export bilang Word document'
    },
    form: {
      createButton: 'I-save ang Miyembro',
      selectPlaceholder: 'Pumili…',
      dateApplied: 'Petsa',
      lastName: 'Apelyido',
      firstName: 'Pangalan',
      middleInitial: 'M.I.',
      civilStatus: 'Civil Status',
      sex: 'Kasarian',
      council: 'Council',
      region: 'Region',
      nhq: 'NHQ',
      district: 'District',
      homeAddress: 'Home Address',
      phone: 'Telepono',
      email: 'E-mail',
      businessAddress: 'Business Address',
      businessPhone: 'Telepono',
      profession: 'Propesyon',
      occupation: 'Trabaho',
      beneficiary: 'Beneficiary',
      wasGirlScout: 'Kasaysayan bilang Girl Scout',
      wasGirlScoutLabel: 'Pakisaad kung ikaw ay naging Girl Scout',
      dateLastRegistered: 'Huling Petsa ng Rehistro',
      position: 'Posisyon'
    },
    registration: {
      subtitle: 'Mga Honorary Member filing, isa bawat honoree kada school year',
      addButton: 'Bagong Registration',
      searchPlaceholder: 'Maghanap gamit ang pangalan o school year…',
      empty: 'Wala pang naisumiteng registration',
      addModalTitle: 'Bagong Honorary Member Registration',
      editModalTitle: 'I-edit ang Honorary Member Registration',
      table: {
        name: 'Honoree',
        schoolYear: 'School Year',
        dateApplied: 'Petsa ng Aplikasyon'
      },
      confirmDelete: {
        title: 'Burahin ang Registration',
        message: 'Burahin ang {{schoolYear}} registration ni "{{name}}"? Hindi na ito maibabalik.'
      },
      toast: {
        memberRequired: 'Pumili ng honoree',
        schoolYearRequired: 'Kailangan ang school year',
        created: 'Naisumite ang registration',
        updated: 'Na-update ang registration',
        deleted: 'Natanggal ang registration'
      },
      form: {
        createButton: 'I-save ang Registration',
        honoree: 'Honoree',
        honoreePlaceholder: 'Maghanap ng miyembro…',
        schoolYear: 'School Year',
        dateApplied: 'Petsa ng Aplikasyon'
      }
    }
  },
  associateMember: {
    title: 'Associate Members',
    subtitle: 'Mga profile ng Associate Member',
    addButton: 'Bagong Miyembro',
    exportLabel: 'I-export',
    searchPlaceholder: 'Maghanap gamit ang pangalan o address…',
    empty: 'Wala pang Associate Member',
    addModalTitle: 'Bagong Associate Member',
    editModalTitle: 'I-edit ang Associate Member',
    tabMembers: 'Mga Miyembro',
    tabRegistrations: 'Registration',
    tabPayments: 'Payment',
    table: {
      amfNumber: 'AMF No.',
      name: 'Pangalan',
      district: 'District',
      dateApplied: 'Petsa ng Aplikasyon',
      phone: 'Telepono',
      wasGirlScout: 'Dating Girl Scout',
      feeAmount: 'Bayad',
      paymentStatus: 'Bayad',
      paid: 'Bayad na',
      unpaid: 'Hindi pa bayad',
      membershipStatus: 'Membership',
      active: 'Aktibo',
      expired: 'Expired',
      noRegistration: 'Walang Registration'
    },
    confirmDelete: {
      title: 'Burahin ang Miyembro',
      message: 'Burahin ang miyembrong "{{name}}"? Hindi na ito maibabalik.'
    },
    confirmForceDelete: {
      title: 'Burahin Kahit May Payment History',
      message:
        'May Registration si "{{name}}" na may naitalang payment history — kung ituloy ang pagbura, mabubura rin ang Registration na iyon at ang kaugnay na voucher kung mayroon, na maaapektuhan ang mga nakaraang Daily Collections report. Ituloy pa rin?'
    },
    payment: {
      subtitle: 'Mga naitalang bayad ng Associate Member fee',
      searchPlaceholder: 'Maghanap gamit ang pangalan o school year…',
      empty: 'Wala pang naitalang bayad',
      recordButton: 'Magtala ng Bayad',
      modalTitle: 'Magtala ng Bayad — {{name}}',
      submitButton: 'Itala ang Bayad',
      membershipFeeTotal: 'Membership Fee (Kabuuan)',
      membershipFeeCouncilShare: 'Bahagi ng Council',
      dateLabel: 'Petsa',
      totalLabel: 'Kabuuan',
      pickerTitle: 'Pumili ng Registration na Babayaran',
      pickerPlaceholder: 'Maghanap gamit ang pangalan o school year…',
      pickerEmpty: 'Walang nahanap na unpaid registration',
      table: {
        name: 'Aplikante',
        schoolYear: 'School Year',
        date: 'Petsa',
        arNumber: 'AR No.',
        amount: 'Halaga'
      },
      toast: {
        amountRequired: 'Maglagay ng halagang higit sa zero',
        recorded: 'Naitala ang bayad'
      }
    },
    toast: {
      missingFields: 'Kailangan ang Apelyido at Pangalan',
      created: 'Naisave ang Associate Member',
      updated: 'Na-update ang Associate Member',
      deleted: 'Natanggal ang Associate Member',
      exportedExcel: 'Na-export sa Excel',
      exportedPdf: 'Na-export bilang PDF',
      exportedWord: 'Na-export bilang Word document'
    },
    form: {
      createButton: 'I-save ang Miyembro',
      selectPlaceholder: 'Pumili…',
      amfNumber: 'AMF No.',
      series: 'Series',
      dateApplied: 'Petsa',
      council: 'Council',
      region: 'Region',
      district: 'District',
      lastName: 'Apelyido',
      firstName: 'Pangalan',
      middleInitial: 'M.I.',
      civilStatus: 'Civil Status',
      sex: 'Kasarian',
      homeAddress: 'Home Address',
      phone: 'Telepono',
      email: 'E-mail',
      businessAddress: 'Business Address',
      businessPhone: 'Telepono',
      profession: 'Propesyon',
      occupation: 'Trabaho',
      beneficiary: 'Beneficiary',
      wasGirlScout: 'Kasaysayan bilang Girl Scout',
      wasGirlScoutLabel: 'Pakisaad kung ikaw ay naging Girl Scout',
      dateLastRegistered: 'Huling Petsa ng Rehistro',
      position: 'Posisyon'
    },
    registration: {
      subtitle: 'Mga Associate Member filing, isa bawat aplikante kada school year',
      addButton: 'Bagong Registration',
      searchPlaceholder: 'Maghanap gamit ang pangalan o school year…',
      empty: 'Wala pang naisumiteng registration',
      addModalTitle: 'Bagong Associate Member Registration',
      editModalTitle: 'I-edit ang Associate Member Registration',
      table: {
        name: 'Aplikante',
        schoolYear: 'School Year',
        dateApplied: 'Petsa ng Aplikasyon'
      },
      confirmDelete: {
        title: 'Burahin ang Registration',
        message: 'Burahin ang {{schoolYear}} registration ni "{{name}}"? Hindi na ito maibabalik.'
      },
      toast: {
        memberRequired: 'Pumili ng aplikante',
        schoolYearRequired: 'Kailangan ang school year',
        created: 'Naisumite ang registration',
        updated: 'Na-update ang registration',
        deleted: 'Natanggal ang registration'
      },
      form: {
        createButton: 'I-save ang Registration',
        applicant: 'Aplikante',
        applicantPlaceholder: 'Maghanap ng miyembro…',
        schoolYear: 'School Year',
        dateApplied: 'Petsa ng Aplikasyon'
      }
    }
  },
  iccgRegistration: {
    title: 'ICCG Registration',
    subtitle:
      'Mga naisumiteng ICCG (Catholic Guiding Section) Membership Registration Form, isa bawat school/troop kada school year',
    addButton: 'Bagong Registration',
    exportButton: 'I-export',
    searchPlaceholder: 'Maghanap gamit ang school, troop, o school year…',
    empty: 'Wala pang naisumiteng registration',
    troopNotFound: 'Hindi nahanap ang troop para sa registration na ito.',
    tabMembers: 'Members',
    tabRegistrations: 'Registration',
    tabPayments: 'Payment',
    table: {
      school: 'School',
      troopNumber: 'Troop #',
      schoolYear: 'School Year',
      dateApplied: 'Petsa ng Aplikasyon',
      girls: 'Girls',
      adults: 'Adults',
      total: 'Total'
    },
    troopPicker: {
      title: 'Bagong ICCG Registration',
      selectTroop: 'Troop',
      placeholder: 'Pumili ng troop',
      continue: 'Magpatuloy'
    },
    confirmDelete: {
      title: 'Burahin ang Registration',
      message:
        'Burahin ang {{schoolYear}} ICCG registration para sa "{{school}}"? Hindi na ito maibabalik.'
    },
    toast: {
      validationRequired: 'Kailangan ang school',
      created: 'Naisumite ang ICCG Registration',
      updated: 'Na-update ang ICCG Registration',
      deleted: 'Nabura ang ICCG Registration',
      exportedExcel: 'Na-export ang ICCG Registration sa Excel',
      exportedPdf: 'Na-export ang ICCG Registration bilang PDF',
      exportedWord: 'Na-export ang ICCG Registration bilang Word document'
    },
    form: {
      newTitle: 'Bagong Registration — Troop {{troopNumber}}',
      editTitle: 'Registration — Troop {{troopNumber}}',
      headerSection: 'Impormasyon ng CGS',
      school: 'School',
      ageLevel: 'Age Level',
      schoolYear: 'School Year',
      dateApplied: 'Petsa ng Aplikasyon',
      formNo: 'Form No.',
      seriesYear: 'Series Year',
      girlsSection: 'CGS Registered Girl Members',
      addGirl: 'Magdagdag ng Girl',
      adultsSection: 'CGS Registered Adult Members (at least 2)',
      addAdult: 'Magdagdag ng Adult',
      name: 'Pangalan (Last, First, M.I.)',
      gradeYear: 'Grade/Year',
      email: 'e-mail address',
      signaturesSection: 'Mga Lagda',
      submittedByName: 'Isinumite Ni (CGS Adult Leader)',
      submittedByDate: 'Petsa',
      notedByName: 'Napansin Ni (School Principal)',
      notedByDate: 'Petsa',
      feeSection: 'CGS Registration Fee',
      noOfGirls: 'No. of Girls',
      amountGirls: 'Halaga — Girls',
      noOfAdults: 'No. of Adult',
      amountAdults: 'Halaga — Adult',
      feePerMemberTotal: 'Bayad kada miyembro (kabuuang na-remit)',
      feePerMemberCouncilShare: 'Bayad kada miyembro (share ng Council)',
      councilRetainedShare: 'Retained share ng Council',
      total: 'Total',
      arNo: 'AR No.',
      dateOfDeposit: 'Petsa ng Deposito',
      dccrNo: 'DCCR No.',
      processedByName: 'Pinoseso Ni (Registration Processor)',
      approvedByName: 'Inaprubahan Ni (Council Executive)'
    },
    members: {
      subtitle:
        'Permanenteng ICCG roster kada Troop (girls + adults), mula sa mga naisumiteng registration',
      addButton: 'Magdagdag ng Miyembro',
      searchPlaceholder: 'Maghanap gamit ang pangalan o troop…',
      empty: 'Wala pang ICCG members',
      addModalTitle: 'Magdagdag ng ICCG Member',
      editModalTitle: 'I-edit ang ICCG Member',
      roleGirl: 'Girl',
      roleAdult: 'Adult',
      deactivate: 'I-deactivate',
      reactivate: 'I-reactivate',
      table: {
        troopNumber: 'Troop #',
        name: 'Pangalan',
        role: 'Role',
        gradeYear: 'Grade/Year',
        email: 'e-mail address',
        status: 'Katayuan'
      },
      form: {
        troop: 'Troop',
        troopPlaceholder: 'Pumili ng troop',
        role: 'Role',
        fullName: 'Pangalan (Last, First, M.I.)',
        gradeYear: 'Grade/Year',
        email: 'e-mail address'
      },
      toast: {
        troopRequired: 'Pumili ng troop',
        nameRequired: 'Kailangan ang pangalan',
        created: 'Naidagdag ang ICCG member',
        updated: 'Na-update ang ICCG member',
        deactivated: '"{{name}}" na-deactivate',
        reactivated: '"{{name}}" na-reactivate',
        deleted: '"{{name}}" nabura'
      },
      confirmDeactivate: {
        title: 'I-deactivate ang Miyembro',
        message:
          'I-deactivate si "{{name}}"? Mananatili sila sa record pero hindi na sila lalabas bilang aktibong roster member.'
      },
      confirmReactivate: {
        title: 'I-reactivate ang Miyembro',
        message: 'I-reactivate si "{{name}}"?'
      },
      confirmDelete: {
        title: 'Burahin ang Miyembro',
        message: 'Burahin si "{{name}}"? Hindi na ito maibabalik.'
      },
      confirmForceDelete: {
        title: 'Burahin Kahit May Payment History',
        message:
          'May naitalang payment history si "{{name}}" — kung ituloy ang pagbura, maaapektuhan ang mga nakaraang Daily Collections report. Ituloy pa rin?'
      }
    },
    payment: {
      subtitle:
        'Mga bulk na bayad kada ICCG roster ng Troop — isang entry bawat remittance, kahit ilang babae/adulto ang saklaw nito',
      addButton: 'Magtala ng Bayad',
      searchPlaceholder: 'Maghanap gamit ang troop o paid by…',
      empty: 'Wala pang naitalang bayad',
      modalTitle: 'Magtala ng Bulk Payment',
      editModalTitle: 'I-edit ang Bayad',
      submitButton: 'Itala ang Bayad',
      troopLabel: 'Troop',
      troopPlaceholder: 'Maghanap gamit ang troop number o pangalan…',
      membersLabel: 'Mga babaeng saklaw ({{girls}}), Mga adultong saklaw ({{adults}})',
      girlsFeeLabel: 'Bayad — Girls',
      adultsFeeLabel: 'Bayad — Adults',
      councilShareLabel: 'Share ng Council (kada miyembro)',
      councilRetainedTotal: 'Retained share ng Council',
      totalLabel: 'Kabuuan',
      dateLabel: 'Petsa',
      paidByLabel: 'Nagbayad',
      ratesFromRegistration:
        'Mungkahing rate mula sa {{schoolYear}} registration na isinumite noong {{date}} — maeedit dito',
      noRegistrationNote:
        'Wala pang naisumiteng ICCG Registration para sa troop na ito — gagamitin ang standard na ₱20/₱5 rate. Puwede ka pa ring magtala ng bayad; magsumite na lang ng registration mamaya para naka-sync ang mungkahing rate.',
      table: {
        troopNumber: 'Troop #',
        date: 'Petsa',
        category: 'Kategorya',
        paidBy: 'Nagbayad',
        memberCount: 'Miyembro',
        totalAmount: 'Kabuuang Halaga'
      },
      confirmDelete: {
        title: 'Burahin ang Bayad',
        message:
          'Burahin itong {{category}} na bayad para sa Troop {{troopNumber}}? Maaalis din ang kaugnay na voucher kung mayroon. Hindi na ito maibabalik.'
      },
      toast: {
        troopRequired: 'Pumili ng troop',
        amountRequired: 'Maglagay ng halagang higit sa zero',
        paidByRequired: 'Ilagay kung sino ang nagbayad',
        recorded: 'Naitala ang bayad'
      }
    }
  },
  membershipStatusReport: {
    title: 'Membership Status Report',
    subtitle:
      'Council-wide na bilang ng miyembro, kinokompyut mula sa lahat ng registration module',
    exportLabel: 'I-export',
    schoolYear: 'Membership Year',
    newYearButton: 'Bagong Membership Year',
    newYearModal: {
      title: 'Magsimula ng Bagong Membership Year',
      yearLabel: 'Membership Year',
      createButton: 'Gawin',
      hint: 'Kokopyahin ang mga Goal target ng {{year}} bilang panimula para sa bagong taon — pwede itong baguhin anumang oras sa Edit Goals. Wala nang ibang kailangan bago ito — awtomatikong lalabas dito ang mga registration na ifa-file sa bagong taon.'
    },
    table: {
      district: 'District',
      troopsUnits: 'No. of Troops & Units',
      girlsAdults: 'No. of Girls & Adults',
      totalNo: 'Total No.',
      girls: 'Girls',
      adults: 'Adults'
    },
    goals: {
      title: 'Goal / Achieved / Balance',
      editButton: 'I-edit ang Goals',
      editTitle: 'I-edit ang Goals — {{schoolYear}}',
      category: 'Kategorya',
      goal: 'Goal',
      achieved: 'Achieved',
      balance: 'Balance',
      membershipPotential: 'Membership potential registered',
      barangayCommittee: 'Barangay Committee registered',
      districtCommittee: 'District Committee registered',
      associateMember: 'Associate Member registered',
      honoraryMember: 'Honorary Member',
      trefoilGuild: 'Trefoil Guild',
      careerWoman: 'Career Woman',
      iccg: 'ICCG'
    },
    toast: {
      exportedExcel: 'Na-export sa Excel',
      exportedPdf: 'Na-export bilang PDF',
      exportedWord: 'Na-export bilang Word document',
      yearRequired: 'Maglagay ng membership year',
      yearExists: 'May membership year na ito',
      yearCreated: 'Nagawa na ang {{year}}'
    }
  },
  attendance: {
    title: 'Pagdalo',
    enrollmentButton: 'Pag-enroll',
    manualEntryButton: 'Manwal na Entry',
    empty: 'Walang tala ng pagdalo para sa saklaw na ito',
    summary: {
      records: 'Mga Tala',
      present: 'Pumasok',
      late: 'Huli',
      overtime: 'Overtime',
      overtimeHours: '{{hours}}h',
      overtimeRecords: '{{count}} tala',
      onLeave: 'Naka-leave',
      absent: 'Lumiban'
    },
    filters: {
      to: 'hanggang',
      allEmployees: 'Lahat ng empleyado'
    },
    table: {
      date: 'Petsa',
      employee: 'Empleyado',
      clockIn: 'Time In',
      clockOut: 'Time Out',
      hours: 'Oras',
      status: 'Katayuan',
      notes: 'Tala',
      action: 'Aksyon'
    },
    status: {
      present: 'Pumasok',
      late: 'Huli',
      'half-day': 'Kalahating Araw',
      absent: 'Lumiban',
      leave: 'Naka-leave',
      overtime: 'Overtime'
    },
    modal: {
      title: 'Manwal na Entry ng Pagdalo',
      editTitle: 'I-edit ang Tala ng Pagdalo'
    },
    form: {
      selectEmployee: 'Pumili ng empleyado'
    },
    toast: {
      selectEmployee: 'Pumili ng empleyado',
      recorded: 'Naitala ang pagdalo',
      updated: 'Na-update ang tala ng pagdalo',
      deleted: 'Nabura ang tala ng pagdalo'
    },
    confirmDelete: {
      title: 'Burahin ang Tala ng Pagdalo',
      message: 'Burahin ang tala ng pagdalo ni {{name}} noong {{date}}? Hindi na ito maibabalik.'
    }
  },
  leave: {
    title: 'Pamamahala ng Leave',
    fileLeaveButton: 'Mag-file ng Leave',
    approveButton: 'Aprubahan',
    rejectButton: 'Tanggihan',
    revertButton: 'Ibalik sa Tinanggihan',
    empty: 'Wala pang na-file na leave request',
    previewDaysPrefix: 'Ang kahilingang ito ay sasaklaw ng',
    previewDaysSuffix: 'araw.',
    searchPlaceholder: 'Maghanap ng leave request…',
    balances: {
      title: 'Balanse ng Leave',
      days: 'araw',
      searchPlaceholder: 'Maghanap ng empleyado…'
    },
    balancesModal: {
      editButton: 'I-edit ang Default na Balanse',
      title: 'I-edit ang Default na Balanse ng Leave',
      description:
        'Itakda ang taunang credit para sa bawat uri ng leave, para sa lahat. Kung may sarili nang override ang isang empleyado (I-edit sa kanyang row), gagamitin iyon sa halip. Ang Compensatory Time Off ay galing sa overtime kaya hindi ito ma-eedit dito.',
      saved: 'Na-update ang balanse ng leave'
    },
    employeeBalanceModal: {
      editButton: 'I-edit ang balanse ng empleyadong ito',
      titleWithName: 'I-edit ang Balanse ng Leave — {{name}}',
      description:
        'I-override ang taunang credit ng empleyadong ito para sa isang uri ng leave. I-reset para bumalik sa default na pantay sa lahat.',
      resetToDefault: 'I-reset sa default ({{default}})',
      saved: 'Na-update ang balanse ng leave ni {{name}}'
    },
    confirmRevert: {
      title: 'Ibalik ang Pag-apruba',
      reasonPlaceholder: 'hal. Naipasa nang mali'
    },
    confirmDeleteRequest: {
      title: 'Burahin ang Leave Request',
      message: 'Burahin ang {{leaveType}} request ni {{name}}? Hindi na ito maibabalik.'
    },
    table: {
      employee: 'Empleyado',
      leaveType: 'Uri ng Leave',
      from: 'Mula',
      to: 'Hanggang',
      days: 'Araw',
      reason: 'Dahilan',
      status: 'Katayuan',
      action: 'Aksyon'
    },
    modal: {
      fileTitle: 'Mag-file ng Leave Request',
      submit: 'Isumite',
      approveTitle: 'Aprubahan ang Leave Request',
      rejectTitle: 'Tanggihan ang Leave Request',
      confirmApproval: 'Kumpirmahin ang Pag-apruba',
      confirmRejection: 'Kumpirmahin ang Pagtanggi',
      summary: '{{employee}} — {{leaveType}} ({{start}} hanggang {{end}}, {{days}} na araw)'
    },
    form: {
      selectEmployee: 'Pumili ng empleyado',
      selectLeaveType: 'Pumili ng uri ng leave',
      startDate: 'Petsa ng Simula',
      endDate: 'Petsa ng Katapusan',
      halfDay: 'Kalahating araw (0.5 day)',
      notesOptional: 'Tala (opsyonal)',
      notesPlaceholder: 'hal. Medical certificate na nakalagak'
    },
    toast: {
      validationRequired: 'Kailangan ang empleyado at uri ng leave',
      endDateInvalid: 'Ang petsa ng katapusan ay dapat kasabay o pagkatapos ng petsa ng simula',
      insufficientBalance:
        'Kulang ang balanse ng {{leaveType}} — {{remaining}} araw na lang ang natitira, {{days}} ang hiniling',
      filed: 'Na-file ang leave request',
      decided: 'Ang leave request ay {{status}}',
      approvedSynced: 'Ang mga naaprubahang petsa ay na-sync sa Attendance bilang "leave"',
      reverted: 'Naibalik ang pag-apruba sa tinanggihan',
      requestDeleted: 'Nabura ang leave request'
    }
  },
  payroll: {
    title: 'Payroll',
    exportButton: 'I-export ang Register',
    newEntryButton: 'Bagong Payroll Entry',
    pullFromAttendance: 'Kunin mula sa Attendance at Leave',
    computeYearEndPay: 'Kalkulahin ang 13th Month Pay at Cash Gift',
    approveButton: 'Aprubahan',
    markPaidButton: 'Markahan bilang Bayad',
    empty: 'Wala pang payroll entry',
    searchPlaceholder: 'Maghanap ng empleyado o payroll #…',
    summary: {
      totalNet: 'Kabuuang Net Payroll',
      pending: 'Nakabinbin',
      paid: 'Bayad na'
    },
    filters: {
      allYears: 'Lahat ng taon',
      allPeriods: 'Lahat ng period'
    },
    table: {
      payrollNumber: 'Payroll #',
      employee: 'Empleyado',
      period: 'Panahon',
      basic: 'Basic',
      representation: 'Representation',
      unpaidLeave: 'Unpaid Leave',
      deductions: 'Mga Kaltas',
      netPay: 'Net Pay',
      status: 'Katayuan',
      action: 'Aksyon'
    },
    payslipTooltip: 'Payslip',
    modal: {
      title: 'Bagong Payroll Entry',
      editTitle: 'I-edit ang Payroll Entry',
      createEntry: 'Gumawa ng Entry',
      saveChanges: 'I-save ang Pagbabago'
    },
    form: {
      selectEmployee: 'Pumili ng empleyado',
      periodStart: 'Simula ng Panahon',
      periodEnd: 'Katapusan ng Panahon',
      basicSalary: 'Batayang Sweldo',
      monthlySalaryReference: 'Buwanang Sahod: {{amount}}',
      daysWorked: 'Mga Araw na Trinabaho',
      overtimePay: 'Bayad sa Overtime',
      cola: 'COLA',
      representation: 'Representation',
      sss: 'SSS',
      philhealth: 'PhilHealth',
      pagibig: 'Pag-IBIG',
      withholdingTax: 'Withholding Tax',
      unpaidLeaveDays: 'Mga Araw ng Unpaid Leave',
      yearEndTitle: '13th Month Pay at Cash Gift (Nobyembre/Disyembre)',
      thirteenthMonthPay: '13th Month Pay',
      cashGift: 'Cash Gift'
    },
    preview: {
      basicPay: 'Batayang sahod (araw-araw na rate × araw na trinabaho)',
      unpaidLeaveDeduction: 'Kaltas sa unpaid leave',
      totalDeductions: 'Kabuuang kaltas',
      netPay: 'Net Pay'
    },
    toast: {
      selectEmployeePeriod: 'Piliin muna ang empleyado at panahon',
      attendanceSummary:
        'Pagdalo: {{present}} pumasok, {{absent}} lumiban, {{leave}} nasa leave, {{unpaid}} araw na unpaid leave (≈{{deduction}} na kaltas)',
      thirteenthMonthComputed:
        '13th Month Pay: {{thirteenth}} (year-to-date na batayang sahod ÷ 12), Cash Gift: {{cashGift}}',
      selectEmployee: 'Pumili ng empleyado',
      entryCreated: 'Nagawa ang payroll entry',
      entryUpdated: 'Na-update ang payroll entry',
      entryDeleted: 'Natanggal ang payroll entry {{number}}',
      noEntriesToExport: 'Walang payroll entry na ie-export',
      exportedExcel: 'Na-export ang payroll register sa opisyal na format ng Council',
      exportedPdf: 'Na-export ang payroll register bilang PDF',
      exportedWord: 'Na-export ang payroll register bilang Word document',
      statusUpdated: 'Ang Payroll {{number}} ay minarkahan bilang {{status}}',
      payslipExportedExcel: 'Na-export ang payslip bilang Excel',
      payslipExportedPdf: 'Na-export ang payslip bilang PDF',
      payslipExportedWord: 'Na-export ang payslip bilang Word document'
    },
    confirmApprove: {
      title: 'Aprubahan ang Payroll',
      message: 'Aprubahan ang payroll entry {{number}} na {{amount}}?'
    },
    confirmMarkPaid: {
      title: 'Markahan ang Payroll bilang Bayad',
      message:
        'Markahan ang payroll entry {{number}} ({{amount}}) bilang bayad na? Hindi na ito maaaring bawiin.'
    },
    confirmDelete: {
      title: 'Tanggalin ang Payroll Entry',
      message:
        'Tanggalin ang payroll entry {{number}} para kay {{name}}? Hindi na ito maaaring bawiin.'
    }
  },
  orgChart: {
    title: 'Organizational Chart',
    subtitle:
      '{{count}} aktibong empleyado — i-click ang kahit sino para buksan ang kanilang profile',
    boardSubtitle: '{{count}} miyembro ng Council Board',
    empty:
      'Wala pang aktibong empleyado — magdagdag ng empleyado at itakda kung sino ang kanilang sinasagutan sa Employee form.',
    directReportsCount: '{{count}} direct report',
    editLayout: 'I-edit ang Layout',
    doneEditing: 'Tapos na',
    editHint: 'I-drag ang card papunta sa iba para baguhin kung kanino sila nag-uulat.',
    unassignDropZone: 'I-drop dito para tanggalin ang reporting manager'
  },
  councilBoard: {
    title: 'Council Board',
    subtitle: 'Ang lupon ng konseho — mga trustee at opisyal.',
    addButton: 'Magdagdag ng Board Member',
    searchPlaceholder: 'Maghanap ng board member…',
    table: {
      name: 'Pangalan',
      position: 'Posisyon',
      contactNumber: 'Contact Number',
      email: 'Email',
      birthDate: 'Kaarawan',
      empty: 'Wala pang miyembro ng Council Board.'
    },
    addModal: { title: 'Magdagdag ng Board Member' },
    editModal: { title: 'I-edit ang Board Member' },
    form: {
      fullName: 'Buong Pangalan',
      position: 'Posisyon',
      positionPlaceholder: 'hal. Council President, Board Chairperson, Trustee',
      reportsTo: 'Sumasagot Kay',
      noSuperior: 'Wala (pinakataas sa Board)',
      contactNumber: 'Contact Number',
      email: 'Email',
      birthDate: 'Kaarawan'
    },
    toast: {
      missingFields: 'Kailangan ang buong pangalan at posisyon',
      created: 'Naidagdag si "{{name}}" sa Council Board',
      updated: 'Na-update ang board member',
      deleted: 'Natanggal ang board member'
    },
    confirmDelete: {
      title: 'Tanggalin ang Board Member',
      message: 'Tanggalin si "{{name}}" sa Council Board? Hindi na ito maaaring ibalik.'
    },
    profile: {
      viewProfile: 'Tingnan ang Profile',
      changePhoto: 'Palitan ang larawan',
      uploadingPhoto: 'Ina-upload…',
      removePhoto: 'Alisin ang larawan',
      confirmDeletePhoto: {
        title: 'Alisin ang Larawan',
        message: 'Alisin ang larawan ng board member na ito? Hindi na ito maaaring ibalik.'
      },
      toast: {
        photoUpdated: 'Na-update ang larawan',
        photoFailed: 'Nabigo ang pag-upload ng larawan',
        photoRemoved: 'Naalis ang larawan',
        photoRemoveFailed: 'Nabigo ang pag-alis ng larawan'
      }
    }
  },
  biometricKiosk: {
    title: 'Biometric Enrollment',
    subtitle: 'Pamahalaan kung aling mga empleyado ang naka-enroll para sa biometric attendance',
    backButton: 'Bumalik sa Attendance',
    enrolledEmployees: 'Mga Naka-enroll na Empleyado',
    unenrollButton: 'I-unenroll',
    enrollButton: 'I-enroll',
    empty: 'Walang nahanap na empleyado',
    searchPlaceholder: 'Maghanap ng empleyado…',
    table: {
      employee: 'Empleyado',
      position: 'Posisyon',
      method: 'Paraan',
      status: 'Katayuan',
      action: 'Aksyon'
    },
    status: {
      enrolled: 'Naka-enroll',
      notEnrolled: 'Hindi Naka-enroll'
    },
    modal: {
      enrollTitle: 'I-enroll si {{name}}',
      note: 'Sinasagawa nito ang pagkuha ng biometric template ng empleyado sa isang enrollment device.',
      methodOptions: {
        fingerprintOnly: 'Fingerprint lang',
        faceOnly: 'Face recognition lang',
        both: 'Fingerprint + Face'
      },
      deviceEnrollLabel: 'I-register din sa terminal (optional)',
      deviceEnrollNote:
        'Mag-upload ng malinaw na front-facing na litrato para ma-register ang mukha ng empleyadong ito sa nakakonektang terminal.',
      deviceNotConnected:
        'Hindi nakakonekta ang terminal — ikonekta ito sa Settings para makapag-enroll din doon.'
    },
    toast: {
      unenrolled: '{{name}} ay na-unenroll',
      enrolled: '{{name}} ay na-enroll para sa biometric attendance',
      deviceEnrolled: 'Na-register ang mukha ni {{name}} sa terminal',
      deviceEnrollFailed: 'Hindi na-register ang mukha sa terminal'
    },
    confirmUnenroll: {
      title: 'I-unenroll ang Empleyado',
      message:
        "I-unenroll si {{name}} sa biometric attendance? Hindi sila makaka-clock in/out sa terminal hangga't hindi ulit na-enroll."
    }
  },
  activities: {
    title: 'Mga Aktibidad',
    newActivityButton: 'Bagong Aktibidad',
    empty: 'Wala pang naka-iskedyul na aktibidad',
    searchPlaceholder: 'Maghanap ng aktibidad…',
    tabs: {
      list: 'Listahan',
      calendar: 'Kalendaryo'
    },
    table: {
      title: 'Aktibidad',
      category: 'Kategorya',
      date: 'Petsa',
      location: 'Lokasyon',
      status: 'Katayuan',
      action: 'Aksyon'
    },
    category: {
      meeting: 'Miting',
      camp: 'Kampo',
      training: 'Pagsasanay',
      communityService: 'Serbisyo sa Komunidad',
      ceremony: 'Seremonya',
      other: 'Iba pa'
    },
    status: {
      scheduled: 'Naka-iskedyul',
      ongoing: 'Kasalukuyang Nagaganap'
    },
    modal: {
      title: 'Bagong Aktibidad',
      editTitle: 'I-edit ang Aktibidad',
      createButton: 'Gumawa ng Aktibidad'
    },
    form: {
      title: 'Pamagat',
      category: 'Kategorya',
      status: 'Katayuan',
      startDate: 'Petsa ng Simula',
      endDate: 'Petsa ng Tapos (opsyonal)',
      startTime: 'Oras ng Simula',
      endTime: 'Oras ng Tapos',
      location: 'Lokasyon',
      organizer: 'Organisador / Troop na Namamahala',
      description: 'Deskripsyon'
    },
    toast: {
      validationRequired: 'Kailangan ang pamagat at petsa ng simula',
      created: 'Nagawa ang aktibidad',
      updated: 'Na-update ang aktibidad',
      deleted: 'Naalis ang aktibidad',
      statusUpdated: 'Na-update ang katayuan ng aktibidad'
    },
    confirmDelete: {
      title: 'Alisin ang aktibidad na ito?',
      message: 'Permanenteng aalisin ang "{{title}}".'
    },
    calendar: {
      todayButton: 'Ngayon',
      moreCount: '+{{count}} pa',
      summary: {
        activities: 'Mga Aktibidad'
      },
      dayModal: {
        noActivities: 'Walang aktibidad sa araw na ito.'
      }
    }
  },
  rentals: {
    title: 'Pamamahala ng Facility at Rental',
    newBookingButton: 'Bagong Booking',
    addSpaceButton: 'Magdagdag ng Room',
    perDay: '/araw',
    capacity: 'Kapasidad',
    bookingsTitle: 'Mga Booking',
    empty: 'Wala pang booking',
    searchPlaceholder: 'Maghanap ng booking…',
    noSpaces: 'Wala pang room o espasyo — i-click ang "Magdagdag ng Room" para gumawa.',
    confirmButton: 'Kumpirmahin',
    markCompletedButton: 'Markahan bilang Tapos',
    table: {
      space: 'Espasyo',
      date: 'Petsa',
      renter: 'Umuupa / Layunin',
      amount: 'Halaga',
      excessIncluded: 'kasama ang {{hours}}h excess ({{amount}})',
      payment: 'Bayad',
      status: 'Katayuan',
      action: 'Aksyon'
    },
    status: {
      reserved: 'Nakareserba',
      confirmed: 'Nakumpirma'
    },
    payment: {
      unpaid: 'Walang Bayad',
      downPayment: 'May Down Payment',
      fullyPaid: 'Bayad na Lahat'
    },
    modal: {
      title: 'Bagong Booking',
      editTitle: 'I-edit ang Booking',
      bookButton: 'I-book ang Espasyo',
      addSpaceTitle: 'Magdagdag ng Room / Espasyo',
      editSpaceTitle: 'I-edit ang Room / Espasyo',
      saveSpace: 'I-save ang Room'
    },
    form: {
      space: 'Espasyo',
      selectSpace: 'Pumili ng espasyo',
      bookingDate: 'Petsa ng Booking',
      startTime: 'Oras ng Simula',
      endTime: 'Oras ng Tapos',
      renterName: 'Pangalan ng Umuupa / Layunin',
      discount: 'Diskwento',
      discountNone: 'Wala',
      discountPwdSenior: 'PWD / Senior Citizen (-20%)',
      discountAmountLabel: 'Diskwento',
      excessHoursLabel: 'Sobrang oras ({{hours}}h)',
      requiredDownPayment: 'Kinakailangang down payment (50%)',
      amountPaid: 'Nabayarang Halaga',
      notes: 'Tala',
      image: 'Larawan',
      spaceName: 'Pangalan ng Room / Espasyo',
      description: 'Deskripsyon',
      category: 'Kategorya',
      categoryRoom: 'Room',
      categoryHall: 'Hall',
      categorySpace: 'Space',
      ratePerDay: 'Rate kada Araw',
      capacityField: 'Kapasidad',
      baseHours: 'Base Hours (kasama na sa Rate kada Araw)',
      excessHourlyRate: 'Excess Hourly Rate (kada oras lampas sa Base Hours)',
      excessRateSummary: 'Unang {{hours}}h kasama na, tapos {{rate}}/oras'
    },
    toast: {
      validationRequired: 'Kailangan ang espasyo at pangalan ng umuupa',
      created: 'Nagawa ang booking',
      updated: 'Na-update ang booking',
      deleted: 'Naalis ang booking',
      confirmed: 'Nakumpirma ang booking',
      completed: 'Natapos ang booking',
      nameRequired: 'Kailangan ang pangalan ng room / espasyo',
      spaceAdded: 'Naidagdag ang "{{name}}"',
      spaceUpdated: 'Na-update ang "{{name}}"',
      spaceDeleted: 'Naalis ang "{{name}}"'
    },
    confirmDeleteSpace: {
      title: 'Alisin ang room/espasyong ito?',
      message: 'Aalisin ang "{{name}}" at hindi na ito magagamit para sa bagong booking.'
    },
    confirmDeleteBooking: {
      title: 'Alisin ang booking na ito?',
      message: 'Permanenteng aalisin ang booking para kay "{{name}}".'
    },
    confirmStatusChange: {
      confirmTitle: 'Kumpirmahin ang booking na ito?',
      confirmMessage: 'Mamarkahan bilang confirmed ang booking para kay "{{name}}".',
      completeTitle: 'Markahang tapos na ang booking na ito?',
      completeMessage: 'Mamarkahan bilang completed ang booking para kay "{{name}}".'
    }
  },
  visitors: {
    title: 'Logbook ng mga Bisita',
    logVisitorButton: 'Mag-log ng Bisita',
    checkOutButton: 'I-check Out',
    empty: 'Wala pang naka-log na bisita',
    searchPlaceholder: 'Maghanap ng bisita…',
    table: {
      name: 'Pangalan',
      purpose: 'Layunin',
      host: 'Taong Bibisitahin / Opisina',
      timeIn: 'Oras ng Pagdating',
      timeOut: 'Oras ng Pag-alis',
      status: 'Katayuan',
      action: 'Aksyon'
    },
    status: {
      checkedIn: 'Naka-check In',
      checkedOut: 'Naka-check Out'
    },
    modal: {
      title: 'Mag-log ng Bisita',
      logButton: 'I-log ang Bisita'
    },
    form: {
      fullName: 'Buong Pangalan',
      purpose: 'Layunin ng Pagbisita',
      personToVisit: 'Taong Bibisitahin / Opisina',
      contactNumber: 'Numero ng Contact'
    },
    toast: {
      validationRequired: 'Kailangan ang buong pangalan, layunin, at taong bibisitahin',
      logged: 'Na-log ang bisita',
      checkedOut: 'Na-check out ang bisita',
      deleted: 'Naalis ang log ng bisita'
    },
    confirmDelete: {
      title: 'Alisin ang log ng bisitang ito?',
      message: 'Permanenteng aalisin ang log para kay "{{name}}".'
    },
    confirmCheckOut: {
      title: 'I-check out ang bisitang ito?',
      message: 'Mamarkahan bilang checked out si "{{name}}".'
    }
  },
  announcements: {
    title: 'Mga Anunsyo',
    newButton: 'Bagong Anunsyo',
    empty: 'Wala pang naipost na anunsyo',
    postedBy: 'Ni-post ni {{name}} · {{date}}',
    pinButton: 'I-pin',
    unpinButton: 'Alisin sa pin',
    priority: {
      normal: 'Normal',
      important: 'Mahalaga',
      urgent: 'Urgent'
    },
    modal: {
      newTitle: 'Bagong Anunsyo',
      editTitle: 'I-edit ang Anunsyo',
      postButton: 'I-post'
    },
    form: {
      title: 'Pamagat',
      message: 'Mensahe',
      priority: 'Priyoridad',
      pinned: 'I-pin sa itaas ng Dashboard highlight'
    },
    toast: {
      validationRequired: 'Kailangan ang pamagat at mensahe',
      posted: 'Na-post ang anunsyo',
      updated: 'Na-update ang anunsyo',
      deleted: 'Naalis ang anunsyo'
    },
    confirmDelete: {
      title: 'Alisin ang anunsyong ito?',
      message: 'Permanenteng aalisin ang "{{title}}".'
    }
  },
  budget: {
    title: 'Badyet ng Konseho',
    fiscalYear: 'Fiscal Year {{year}}',
    addLineButton: 'Magdagdag ng Linya',
    newFiscalYearButton: 'Bagong Fiscal Year',
    deleteFiscalYearButton: 'Tanggalin ang fiscal year na ito',
    newFiscalYearModal: {
      title: 'Magsimula ng Bagong Fiscal Year',
      yearLabel: 'Fiscal Year',
      createButton: 'Gawin',
      hint: 'Kokopyahin ang lahat ng line item mula {{year}} papunta sa bagong taon na parehong istruktura — magsisimula sa 0 ang mga budgeted amount hanggang aprubahan ng board, at ang mga figure ng {{year}} ang magiging bagong prior-year reference.'
    },
    incomeTitle: 'Kita',
    expensesTitle: 'Mga Gastos',
    summary: {
      income: 'Kita',
      expenses: 'Mga Gastos',
      net: 'Net',
      ofBudgeted: 'sa {{amount}} na badyet'
    },
    table: {
      budgeted: 'Badyet',
      actual: 'Aktwal Hanggang Ngayon',
      variance: 'Variance',
      subtotal: 'Sub-total',
      groupTotal: 'Kabuuan ng {{group}}',
      addLine: 'Magdagdag ng Linya'
    },
    addLineModal: {
      title: 'Magdagdag ng Budget Line',
      lockedSubtitle: 'Bagong linya sa ilalim ng {{group}} — {{subGroup}}.',
      unlockedSubtitle:
        'Magdagdag ng bagong budget line — pumili ng existing na group/subgroup, o mag-type ng bago para simulan ito.',
      noSubGroup: '(wala)',
      section: 'Seksyon',
      group: 'Group',
      groupPlaceholder: 'hal. I. OPERATIONS',
      subGroup: 'Subgroup',
      subGroupPlaceholder: 'hal. A. Fees',
      subGroupHint: 'Iwanang blangko kung walang karagdagang subdivision ang group na ito.',
      name: 'Pangalan ng Line Item',
      namePlaceholder: 'hal. 5. Bagong Uri ng Fee',
      budgetedAmount: 'Halaga ng Badyet',
      createButton: 'Idagdag ang Linya'
    },
    editModal: {
      subtitle: 'I-update ang badyet at buwanang aktwal na halaga ng line item na ito.',
      budgetedAmount: 'Halaga ng Badyet',
      monthlyActuals: 'Buwanang Aktwal',
      totalActual: 'Kabuuang Aktwal',
      useAllLiveData: 'Gamitin lahat ng live data',
      liveDataHint:
        'Kinuwenta mula sa benta ng POS, rental bookings, vouchers, o payroll — i-click para punan ang buwang ito',
      source: {
        heading: 'Source',
        hintIncome:
          'I-link ang line na ito sa tunay na pinagmumulan ng pera nito — Vouchers/Cash Receipts, Troops & Membership payments, Point of Sale (NES), o Rentals. Kapag may nadagdag kang rule dito, papalitan nito ang built-in default ng line na ito; kapag inalis lahat ng rule, babalik sa default.',
        hintExpense:
          'I-link ang line na ito sa mga voucher o payroll field na aktwal na nagbabayad dito — kapaki-pakinabang kapag hindi eksaktong tugma ang GL Account text ng Check Voucher sa pangalan ng line na ito. Kapag may nadagdag kang rule dito, papalitan nito ang built-in default ng line na ito; kapag inalis lahat ng rule, babalik sa default.',
        addRule: 'Magdagdag ng Source',
        empty:
          'Wala pang na-link na source — mananatiling manual ang line na ito maliban kung may umiiral nang built-in default.',
        removeRule: 'Alisin ang source na ito',
        sourceTypeNotSpecified: 'Hindi Tinukoy',
        sourceTypeVoucher: 'Vouchers / Cash Receipts',
        sourceTypeTroopPayment: 'Troops & Membership (Roster payments)',
        sourceTypePos: 'Point of Sale (NES)',
        sourceTypeRental: 'Rentals',
        sourceTypePayroll: 'Payroll',
        voucherCategoriesLabel: 'Aling voucher/receipt categories ang kasama',
        voucherCategoryPlaceholder: 'I-type o pumili ng category…',
        rentalCategoryAny: 'Kahit anong rental space',
        payrollFieldPlaceholder: 'Pumili ng payroll field'
      }
    },
    autoSourceHint:
      'May live na halaga ang line na ito mula sa totoong data — buksan ang Edit para tignan/gamitin ito',
    autoSource: {
      userConfigured: 'Naka-link sa source na sinet-up mo — buksan ang Edit para tignan o baguhin.'
    },
    toast: {
      updated: 'Na-update ang budget line',
      categoryAdded: 'Naidagdag ang budget line',
      categoryDeleted: 'Natanggal ang "{{name}}"',
      addLineMissingFields: 'Kailangan ang group, pangalan, at halaga ng badyet na higit sa 0',
      fiscalYearRequired: 'Maglagay ng fiscal year',
      fiscalYearExists: 'Mayroon nang ganitong fiscal year',
      noSourceYear: 'Walang existing fiscal year na kokopyahin',
      fiscalYearCreated: 'Nagawa ang {{year}}',
      fiscalYearDeleted: 'Natanggal ang {{year}}',
      excel: 'Na-export ang budget sa Excel',
      pdf: 'Na-export ang budget sa PDF',
      word: 'Na-export ang budget sa Word'
    },
    confirmDelete: {
      title: 'Tanggalin ang Budget Line',
      message:
        'Tanggalin ang "{{name}}"? Mawawala rin ang budgeted amount at monthly actuals nito — hindi na ito mababawi.'
    },
    confirmDeleteYear: {
      title: 'Tanggalin ang Fiscal Year',
      message:
        'Tanggalin ang {{year}}? Mawawala rin lahat ng budget line ng fiscal year na ito — hindi na ito mababawi.'
    }
  },
  facilityCalendar: {
    title: 'Kalendaryo ng Facility',
    todayButton: 'Ngayon',
    summary: {
      bookings: 'Mga booking ngayong buwan',
      visitors: 'Mga bisita ngayong buwan'
    },
    moreCount: '+{{count}} pa',
    dayModal: {
      bookingsTitle: 'Mga Booking',
      visitorsTitle: 'Mga Bisita',
      noBookings: 'Walang booking sa araw na ito',
      noVisitors: 'Walang bisitang na-log sa araw na ito'
    }
  },
  vouchers: {
    title: 'Mga Voucher',
    subtitle: 'Disbursement (Check) at Journal Vouchers',
    newVoucherButton: 'Bagong Voucher',
    editVoucherTitle: 'I-edit ang Voucher',
    searchPlaceholder: 'Maghanap ng voucher…',
    type: {
      checkVoucher: 'Disbursement / Check Voucher',
      journalVoucher: 'Journal Voucher'
    },
    actions: {
      approve: 'Aprubahan'
    },
    table: {
      number: 'Voucher #',
      type: 'Uri',
      payee: 'Payee',
      particulars: 'Mga Detalye',
      amount: 'Halaga',
      date: 'Petsa',
      status: 'Katayuan',
      orNumber: 'OR No.',
      reimbursement: 'Reimbursement',
      empty: 'Walang nakitang voucher',
      exportTooltip: 'I-export ang voucher',
      expenseSummaryTooltip: 'Pamahalaan ang Expense Summary'
    },
    form: {
      voucherType: 'Uri ng Voucher',
      voucherNumber: 'Voucher No.',
      modeOfPayment: 'Paraan ng Pagbabayad',
      modeCash: 'Cash',
      modeCheck: 'Check',
      checkNumber: 'Numero ng Check',
      payee: 'Payee',
      payeePlaceholder: 'Pangalan ng vendor o tatanggap',
      payeeAddress: 'Address ng Payee',
      bankAccount: 'Bank Account',
      bankAccountPlaceholder: 'Pumili ng Bank Account (default sa Cash on Hand)',
      accountLinesLabel: 'Mga Account Title (Debit)',
      accountLinesLabelCredit: 'Mga Account Title (Credit)',
      accountPlaceholder: 'Account title, hal. Office Supplies',
      descriptionPlaceholder: 'Paglalarawan, hal. March 16-31, 2026',
      addAccountLine: 'Magdagdag ng Account Line',
      totalAmount: 'Kabuuang Halaga',
      totalCredit: 'Kabuuang Credit',
      particulars: 'Mga Detalye',
      createButton: 'Gumawa ng Voucher',
      cashAdvanceSection: 'Liquidation ng Cash Advance (iwanang blangko kung hindi aplikable)',
      cashAdvanceSource: 'Liniliquidate na Cash Advance Mula sa',
      cashAdvanceSourcePlaceholder: 'Piliin ang Check Voucher na naglabas ng cash advance',
      cashAdvanceSourceEmptyHint:
        'Walang nahanap na tugmang Check Voucher — gumawa muna ng isa na may debit line na ang Account Title ay eksaktong "Cash Advance".',
      cashAdvanceSourceRequiredHint: 'Pumili muna ng Cash Advance source sa itaas.',
      cashAdvanceAmount: 'Halaga ng Cash Advance',
      cashAdvanceDate: 'Petsa ng Cash Advance',
      totalAmountSpent: 'Kabuuang Nagastos',
      amountRefunded: 'Halagang Ni-refund',
      refundOrNumber: 'O.R. No. ng Refund',
      refundDate: 'Petsa ng Refund',
      cashAdvanceAutoLinesNote:
        'Awtomatikong bubuuin ang account lines mula sa Summary of Expenses kapag na-log na ang mga gastos — gamitin ang receipt icon sa Vouchers list matapos i-save ang voucher na ito.',
      autoCalculatedField: 'Awtomatikong kinukuwenta mula sa Summary of Expenses.',
      unbalancedHint:
        'Hindi balanse — Debit {{debit}} vs Credit {{credit}}. Dapat balanse ang bawat voucher: kabuuang debit = kabuuang credit.'
    },
    toast: {
      missingFields: 'Kailangan ang payee at kahit isang account line na may halaga',
      unbalanced:
        'Hindi tugma ang kabuuang debit at credit (₱{{debit}} vs ₱{{credit}}) — dapat balanse muna bago ito ma-save',
      cashAdvanceSourceRequired:
        'Piliin muna kung aling Check Voucher talaga ang naglabas ng cash advance na ito bago ito i-liquidate',
      created: 'Nagawa na ang voucher',
      updated: 'Na-update ang voucher',
      deleted: 'Nabura ang voucher',
      statusChanged: '{{number}} ay minarkahan bilang {{status}}',
      excelGenerated: 'Nagawa na ang Excel file sa opisyal na format ng Council',
      pdfGenerated: 'Nagawa na ang PDF file',
      wordGenerated: 'Nagawa na ang Word document'
    },
    confirmApprove: {
      title: 'Aprubahan ang Voucher',
      message: 'Aprubahan ang voucher {{number}}?'
    },
    confirmDelete: {
      title: 'Burahin ang Voucher',
      message: 'Burahin ang voucher {{number}}? Hindi na ito maaaring bawiin.'
    }
  },
  expenseSummary: {
    title: 'Expense Summary',
    subtitle: 'Detalyadong resibo backup para sa voucher {{number}}',
    field: {
      budgetCategory: 'I-charge sa (Council Budget)',
      budgetCategoryPlaceholder: 'hal. 6. Trainings',
      date: 'Petsa',
      particulars: 'Mga Detalye',
      particularsPlaceholder: 'hal. Cupcakes and Juice',
      orNumber: 'OR No.',
      category: 'Kategorya',
      categoryPlaceholder: 'hal. Meals and Snacks',
      amount: 'Halaga'
    },
    addItem: 'Magdagdag ng Item',
    total: 'Kabuuan',
    exportButton: 'I-export',
    exportTooltip: 'I-export ang expense summary',
    toast: {
      saved: 'Na-save ang expense summary',
      excelGenerated: 'Nagawa na ang Excel file sa opisyal na format ng Council',
      pdfGenerated: 'Nagawa na ang PDF file',
      wordGenerated: 'Nagawa na ang Word document'
    }
  },
  ptdg: {
    title: 'Program & Training Development Grant',
    subtitle:
      'Mga hiling na grant sa Regional Office — pondo mula sa sariling PTDG allocation ng Region, hindi sa badyet ng Konseho.',
    newButton: 'Bagong Application',
    editButton: 'I-edit ang Application',
    searchPlaceholder: 'Maghanap ng PTDG application…',
    filter: {
      all: 'Lahat'
    },
    status: {
      submitted: 'Naisumite',
      approved: 'Naaprubahan',
      disapproved: 'Hindi Naaprubahan'
    },
    table: {
      number: 'App. #',
      purpose: 'Purpose/Event/Activity',
      eventDate: 'Petsa ng Event',
      amountRequested: 'Hiniling na Halaga',
      status: 'Status',
      empty: 'Walang nahanap na PTDG application',
      exportTooltip: 'I-export ang application'
    },
    actions: {
      recordDecision: 'I-record ang Desisyon'
    },
    form: {
      purpose: 'Purpose/Event/Activity',
      purposePlaceholder: 'hal. Regional Committee Meeting',
      eventDate: 'Date of Event/Activity',
      eventDatePlaceholder: 'hal. September 5, 2026',
      executiveDirector: 'Regional Executive Director',
      executiveDirectorPlaceholder: 'hal. Juan Dela Cruz',
      projectedSources: 'Projected Sources',
      projectedExpenses: 'Projected Expenses',
      particularsPlaceholder: 'Particulars',
      addLine: 'Magdagdag ng Line',
      subTotal: 'Sub Total',
      total: 'Total',
      amountRequested: 'Hiniling na Halaga',
      saveAsDraft: 'I-save bilang Draft',
      submitButton: 'Isumite'
    },
    decisionModal: {
      title: 'I-record ang Desisyon ng Region',
      decision: 'Desisyon',
      approvedAmount: 'Naaprubahang Halaga',
      remarks: 'Mga Puna',
      executiveDirector: 'Regional Executive Director',
      executiveDirectorPlaceholder: 'hal. Juan Dela Cruz',
      saveButton: 'I-save ang Desisyon'
    },
    toast: {
      missingFields: 'Kailangan ang purpose at petsa ng event',
      created: 'Nagawa ang PTDG application',
      updated: 'Na-update ang PTDG application',
      deleted: 'Nabura ang {{number}}',
      approved: 'Naaprubahan ang {{number}}',
      disapproved: 'Hindi naaprubahan ang {{number}}',
      excelGenerated: 'Nagawa ang Excel file',
      pdfGenerated: 'Nagawa ang PDF file',
      wordGenerated: 'Nagawa ang Word document'
    },
    confirmDelete: {
      title: 'Burahin ang Application',
      message: 'Burahin ang PTDG application {{number}}? Hindi na ito maaaring bawiin.'
    }
  },
  councilDeposits: {
    title: 'Council Deposits (RHQ)',
    subtitle:
      'PTDG, MMAF at Josefa Llanes Escoda Memento Fund — mga deposito ng Konseho na nasa Regional Office.',
    notRecordedYet:
      'Wala pang naitala — magdagdag ng snapshot kapag na-encode na ng accountant ang RHQ statement.',
    editButton: 'I-edit ang mga Figure',
    newButton: 'Bagong Snapshot',
    selectDate: 'Petsa Noong',
    undatedOption: 'Walang petsa',
    noSnapshots: 'Wala pang snapshot',
    exportTooltip: 'I-export ang report',
    table: {
      fund: 'Council Deposits',
      nationalEvent: 'National Event',
      regionalEvent: 'Regional Event',
      councilEvent: 'Council Event',
      internationalEvent: 'International Event',
      total: 'Total',
      grandTotal: 'TOTAL',
      noBreakdown: '—',
      noFunds: 'Wala pang fund line — i-click ang Edit Figures para magdagdag.'
    },
    editModal: {
      title: 'I-edit ang Council Deposits',
      newTitle: 'Bagong Council Deposits Snapshot',
      subtitle: 'I-encode ang mga figure mula sa pinakabagong deposits statement ng RHQ.',
      asOfDate: 'Petsa Noong',
      fundNamePlaceholder: 'hal. PTDG - Girl',
      byEventType: 'Ayon sa Event Type',
      lumpSum: 'Lump Sum',
      addFund: 'Magdagdag ng Fund Line',
      preparedBy: 'Inihanda ni',
      notedBy: 'Nabatid ni',
      namePlaceholder: 'Buong pangalan',
      titlePlaceholder: 'Posisyon/Titulo'
    },
    confirmDelete: {
      title: 'Burahin ang Snapshot',
      message: 'Permanenteng mabubura ang Council Deposits snapshot na ito. Magpatuloy?'
    },
    toast: {
      saved: 'Na-update ang Council Deposits',
      deleted: 'Nabura ang snapshot',
      excelGenerated: 'Nagawa ang Excel file',
      pdfGenerated: 'Nagawa ang PDF file',
      wordGenerated: 'Nagawa ang Word document'
    }
  },
  // Shared "which receipt template, what breakdown" fields — used by both Invoices' Record
  // Payment and Troops & Membership's Record Bulk Payment (see ReceiptFieldsSection).
  receipts: {
    printButton: 'I-print ang Resibo',
    reprintButton: 'I-reprint ang Resibo',
    tabServiceInvoice: 'Service Invoice',
    tabAcknowledgmentReceipt: 'Acknowledgment Receipt',
    receiptNumber: 'SI/AR Number',
    tin: 'TIN',
    address: 'Address',
    businessStyle: 'Business Style',
    modeOfPayment: 'Mode of Payment',
    othersPlaceholder: 'Iba pa (tukuyin)',
    breakdownTotal: 'Kabuuan ng Breakdown / Target na Halaga',
    descriptionColumn: 'Detalye',
    amountColumn: 'Halaga',
    toast: {
      receiptNumberRequired: 'Mangyaring ilagay ang SI/AR number.',
      breakdownRequired: 'Magdagdag ng kahit isang halaga.',
      breakdownMismatch: 'Ang kabuuan ng breakdown ay dapat kapareho ng kabuuang halaga.',
      printFailed:
        'Na-record ang resibo, pero hindi na-print — tignan kung nakakonekta at naka-configure ang printer sa Settings'
    }
  },
  vendors: {
    title: 'Mga Vendor',
    addButton: 'Magdagdag ng Vendor',
    modalTitle: 'Bagong Vendor',
    saveButton: 'I-save ang Vendor',
    emptyMessage: 'Walang nahanap na vendor',
    searchPlaceholder: 'Maghanap ng vendor…',
    validation: {
      nameEmailRequired: 'Kailangan ang pangalan at email.'
    },
    toast: {
      added: 'Naidagdag si {{name}} sa mga vendor'
    },
    columns: {
      vendor: 'Vendor',
      company: 'Kompanya',
      email: 'Email',
      phone: 'Telepono',
      category: 'Kategorya',
      balance: 'Balanse',
      status: 'Status'
    },
    form: {
      contactName: 'Pangalan ng Contact',
      contactNamePlaceholder: 'Pangalan ng contact',
      company: 'Kompanya',
      companyPlaceholder: 'Pangalan ng kompanya',
      email: 'Email',
      emailPlaceholder: 'name@company.ph',
      phone: 'Telepono',
      phonePlaceholder: '+63 9XX XXX XXXX',
      category: 'Kategorya'
    }
  },
  reports: {
    title: 'Mga Ulat',
    tabs: {
      pnl: 'Kita at Gastos',
      dailyCollections: 'Daily Collections'
    },
    pnl: {
      chartTitle: 'Kita kumpara sa Gastos',
      chartSubtitle: 'Huling 6 na buwan · cash basis',
      cardTitle: 'Kita at Gastos',
      cardSubtitle: 'Cash basis · bayad na gastos',
      income: 'Kita',
      expenses: 'Mga Gastos',
      totalIncome: 'Kabuuang Kita',
      totalExpenses: 'Kabuuang Gastos',
      netIncome: 'Net Income',
      exportLabel: 'I-export ang Income Statement',
      toast: {
        excel: 'Na-export ang Income Statement sa Excel',
        pdf: 'Na-export ang Income Statement bilang PDF',
        word: 'Na-export ang Income Statement bilang Word document'
      }
    },
    dailyCollections: {
      cardTitle: 'Daily Cash Collection Report',
      cardSubtitle: 'Beginning balance, mga resibo, at bank deposit para sa isang araw',
      rangeSubtitle:
        'Pinagsama-samang view sa napiling mga petsa — lumipat sa iisang araw para mag-edit o mag-save.',
      exportLabel: 'I-export ang Daily Collections',
      saved: 'Na-save',
      draft: 'Hindi pa naka-save',
      rangeBadge: 'Saklaw na Petsa (view lang)',
      beginningBalance: 'Beginning Balance',
      addCashReceipts: 'Add: Cash Receipts',
      lessCashDeposit: 'Less: Cash Deposit',
      addLine: 'Magdagdag ng Linya',
      addDeposit: 'Magdagdag ng Deposit',
      selectBank: 'Pumili ng bangko',
      totalCashCollection: 'Total Cash Collection During the Day',
      totalCashOnHand: 'Total Cash on Hand',
      totalDeposited: 'Total Cash Collection Deposit in Bank',
      balanceUndeposited: 'Balance/Undeposited Cash Collection',
      attachments: 'Mga Attachment',
      noAttachments: 'Wala pang naka-attach na file',
      uploadAttachment: 'Mag-attach ng File',
      saveButton: 'I-save ang Report',
      deleteAttachmentTitle: 'Burahin ang Attachment',
      deleteAttachmentMessage:
        'Sigurado ka bang gusto mong burahin ang "{{name}}"? Permanenteng maaalis ang file na ito. Hindi na ito maibabalik pa.',
      table: {
        siNo: 'SI No.',
        receivedFrom: 'Natanggap Mula Kay',
        amount: 'Halaga',
        total: 'Kabuuan',
        bank: 'Bangko',
        saNo: 'S/A No.',
        purpose: 'Layunin',
        covers: 'Sakop',
        coversHint:
          'Saklaw na petsa ng koleksyong kinakatawan ng deposit na ito. Default ay isang araw lang — palawakin kung nagde-deposit ng naipong cash mula sa ilang araw na hindi pa na-deposit sa iisang biyahe sa bangko.'
      },
      walkIn: 'Walk-in',
      toast: {
        saved: 'Na-save ang Daily Collection Report',
        attachmentUploaded: 'Na-upload ang attachment',
        attachmentFailed: 'Hindi na-upload ang attachment',
        attachmentDeleted: 'Nabura ang attachment',
        excel: 'Na-export ang Daily Collection Report sa Excel',
        pdf: 'Na-export ang Daily Collection Report bilang PDF',
        word: 'Na-export ang Daily Collection Report bilang Word document'
      },
      depositReceipt: {
        printButton: 'I-print ang Resibo',
        title: 'I-print ang Deposit Receipt',
        hint: 'Patunay na inabot ang cash na ito para i-deposito — hindi ito bagong benta, kaya hindi na ito idadagdag ulit bilang income. Ang halagang nakolekta ay nabilang na noong unang natanggap ito.',
        payorLabel: 'Natanggap Mula Kay (nag-abot ng cash)',
        cashierLabel: 'Tinanggap Ni (kumilala para sa deposit)',
        toast: {
          payorRequired: 'Mangyaring ilagay kung sino ang nag-abot ng cash.'
        }
      }
    }
  },
  scrd: {
    title: 'Cash Receipts & Disbursements',
    tabs: {
      receipts: 'Cash Receipts Journal',
      disbursements: 'Cash Disbursement Journal',
      summary: 'SCRD Summary'
    },
    exportJournalLabel: 'I-export ang Journal',
    exportSummaryLabel: 'I-export ang SCRD',
    journalSearchPlaceholder: 'Maghanap sa journal…',
    emptyReceipts: 'Walang naitalang cash receipt',
    emptyDisbursements: 'Walang posted/approved na disbursement voucher',
    beginningBalanceLabel: 'Beginning Balance:',
    interestIncomeLabel: 'Interest Income:',
    otherIncomeLabel: 'Other Income:',
    openingBalancesTitle: 'Opening Balance ng mga Bank Account',
    banks: {
      addButton: 'Magdagdag ng Bank',
      addTitle: 'Magdagdag ng Bank Account',
      name: 'Pangalan ng Bangko',
      namePlaceholder: 'hal. BDO, Cash on Hand',
      accountNumber: 'Account Number',
      accountNumberPlaceholder: 'Opsyonal',
      openingBalance: 'Opening Balance',
      toast: {
        nameRequired: 'Kailangan ang pangalan ng bangko',
        added: 'Naidagdag ang bank account',
        deleted: 'Natanggal ang bank account'
      },
      confirmDelete: {
        title: 'Tanggalin ang Bank Account',
        message:
          'Tanggalin ang "{{name}}" mula sa Bank Opening Balances? Hindi maaapektuhan ang naunang Cash Receipts at Voucher entries nito.'
      }
    },
    columns: {
      date: 'Petsa',
      payorPayee: 'Payor / Payee',
      particulars: 'Particulars',
      reference: 'Ref #',
      category: 'Kategorya',
      receiptType: 'Resibong Ginamit',
      bankAccount: 'Bank Account',
      amount: 'Halaga'
    },
    summary: {
      beginningBalance: 'Beginning Balance',
      totalReceipts: 'Kabuuang Resibo',
      totalDisbursements: 'Kabuuang Disbursement',
      endingBalance: 'Ending Balance',
      receiptsByCategory: 'Mga Resibo ayon sa Kategorya',
      disbursementsByCategory: 'Mga Disbursement ayon sa Kategorya',
      generalOperations: 'A. General Operations',
      nesSales: 'B. National Equipment Service — Benta',
      rentalIncome: 'II. Rental Income',
      interestIncome: 'III. Interest Income',
      otherIncome: 'IV. Other Income',
      otherIncomeManualEntry: 'Other Income (Manual na Entry)',
      operatingExpenses: 'A. Operating Expenses',
      nesPurchases: 'B. National Equipment Services — Purchases',
      capitalOutlay: 'II. Capital Outlay',
      otherExpenses: 'III. Other Expenses',
      accountedForAsFollows: 'Accounted For As Follows',
      account: 'Account',
      opening: 'Opening Balance',
      closing: 'Closing Balance'
    },
    toast: {
      receiptsExcel: 'Na-export ang Cash Receipts Journal sa opisyal na format ng Council',
      receiptsPdf: 'Na-export ang Cash Receipts Journal bilang PDF',
      receiptsWord: 'Na-export ang Cash Receipts Journal bilang Word document',
      disbursementsExcel: 'Na-export ang Cash Disbursement Journal sa opisyal na format ng Council',
      disbursementsPdf: 'Na-export ang Cash Disbursement Journal bilang PDF',
      disbursementsWord: 'Na-export ang Cash Disbursement Journal bilang Word document',
      summaryExcel: 'Na-export ang SCRD sa opisyal na format ng Council',
      summaryPdf: 'Na-export ang SCRD bilang PDF',
      summaryWord: 'Na-export ang SCRD bilang Word document'
    }
  },
  pos: {
    title: 'Point of Sale',
    searchPlaceholder: 'Hanapin ang pangalan ng produkto o SKU…',
    stockLabel: 'Stock: {{count}}',
    noProductsMatch: 'Walang produktong tumugma sa iyong hanap.',
    completeSale: 'Tapusin ang Benta',
    tabs: {
      register: 'Sell',
      history: 'Kasaysayan ng Benta'
    },
    history: {
      emptyMessage: 'Wala pang benta.',
      searchPlaceholder: 'Maghanap ng benta…',
      itemsCount: '{{count}} item',
      printButton: 'I-print',
      voidButton: 'I-void',
      deleteButton: 'Tanggalin',
      table: {
        saleNumber: 'Sale #',
        date: 'Petsa',
        cashier: 'Cashier',
        items: 'Items',
        payment: 'Paraan ng Bayad',
        total: 'Kabuuan',
        status: 'Status',
        actions: 'Aksyon'
      },
      status: {
        completed: 'Nakumpleto',
        voided: 'Na-void'
      },
      voidReasonTooltip: 'Dahilan ng pag-void: {{reason}}'
    },
    cart: {
      title: 'Cart ({{count}})',
      empty: 'Walang laman ang cart — mag-scan o mag-click ng produkto para idagdag.',
      memberSearchPlaceholder: 'Maghanap ng miyembro o mag-type ng pangalan…',
      printReceipt: 'I-print ang resibo',
      subtotal: 'Subtotal',
      discount: 'Diskwento',
      total: 'Kabuuan'
    },
    paymentMethods: {
      cash: 'Cash',
      card: 'Card',
      eWallet: 'E-Wallet'
    },
    toast: {
      codeNotFound: 'Walang natagpuang produkto o miyembro para sa code na "{{code}}"',
      memberScanned: 'Napili si {{name}} — {{rate}}% diskwento ang inilapat',
      cartEmpty: 'Walang laman ang cart',
      saleCompleted: 'Nakumpleto ang Benta {{saleNumber}} — {{amount}}',
      silentPrintFailed:
        'Hindi ma-print ang resibo — siguraduhing naka-connect at naka-configure ang receipt printer sa Settings',
      saleVoided: 'Na-void ang Benta {{saleNumber}} — naibalik ang stock',
      voidReasonRequired: 'Maglagay ng dahilan bago i-void ang bentang ito',
      saleDeleted: 'Natanggal ang Benta {{saleNumber}}'
    },
    modal: {
      saleCompleteTitle: 'Nakumpleto ang Benta — {{saleNumber}}',
      printReceipt: 'I-print ang Resibo',
      paymentReceivedVia: 'Natanggap ang bayad sa pamamagitan ng {{method}}',
      undoSale: 'I-undo ang Benta',
      undoSaleConfirmTitle: 'I-undo ang bentang ito?',
      undoSaleConfirmMessage:
        'Ma-void ang Benta {{saleNumber}} at maibabalik ang mga item sa stock. Hindi na ito maaaring bawiin.',
      undoSaleReasonLabel: 'Dahilan ng void/refund',
      undoSaleReasonPlaceholder: 'hal. Maling item ang na-ring up, humingi ng refund ang customer…',
      deleteSaleConfirmTitle: 'Tanggalin ang bentang ito?',
      deleteSaleConfirmMessage:
        'Permanenteng matatanggal ang Benta {{saleNumber}}. Hindi na ito maaaring bawiin.'
    }
  },
  products: {
    title: 'Inventory',
    addButton: 'Magdagdag ng Produkto',
    searchPlaceholder: 'Maghanap ng produkto…',
    lowStockAlert: '{{count}} produkto ang nasa o mababa na sa reorder level: {{names}}',
    restockButton: 'I-restock',
    printLabelButton: 'I-print ang Label',
    export: {
      salesReport: 'Ulat ng Benta',
      inventoryReport: 'Ulat ng Inventory',
      incomeStatement: 'Income Statement'
    },
    period: {
      daily: 'Araw-araw',
      weekly: 'Lingguhan',
      monthly: 'Buwanan',
      quarterly: 'Quarterly',
      annually: 'Taun-taon',
      custom: 'Piliin ang Petsa',
      to: 'hanggang'
    },
    table: {
      emptyMessage: 'Walang nahanap na produkto',
      image: 'Larawan',
      skuBarcode: 'SKU / Barcode',
      product: 'Produkto',
      category: 'Kategorya',
      cost: 'Halaga ng Puhunan',
      price: 'Presyo',
      stock: 'Stock',
      status: 'Katayuan'
    },
    form: {
      image: 'Larawan ng Produkto',
      uploadImage: 'Mag-upload ng Larawan',
      skuBarcode: 'SKU / Barcode',
      category: 'Kategorya',
      selectCategory: 'Pumili ng kategorya…',
      description: 'Paglalarawan',
      unit: 'Yunit',
      productName: 'Pangalan ng Produkto',
      costPrice: 'Halaga ng Puhunan',
      sellingPrice: 'Presyong Ibebenta',
      stockQuantity: 'Dami ng Stock',
      reorderLevel: 'Reorder Level',
      numberOfLabels: 'Bilang ng label',
      quantityToAdd: 'Dami na Idadagdag',
      unitCost: 'Halaga bawat Yunit'
    },
    modal: {
      addProductTitle: 'Magdagdag ng Produkto',
      editProductTitle: 'I-edit ang Produkto',
      saveProduct: 'I-save ang Produkto',
      printLabelsTitle: 'I-print ang Barcode Label — {{name}}',
      preview: 'Preview',
      print: 'I-print',
      restockTitle: 'Restock — {{name}}',
      addStock: 'Magdagdag ng Stock',
      currentStockLabel: 'Kasalukuyang stock:',
      units: 'yunit'
    },
    confirmDelete: {
      title: 'Burahin ang Produkto',
      message:
        'Burahin ang {{name}}? Permanenteng aalisin ito sa inventory. Hindi maaapektuhan ang mga naunang sales at purchase record na tumutukoy dito. Hindi na ito maibabalik.'
    },
    toast: {
      skuNameRequired: 'Kailangan ang SKU at pangalan',
      duplicateSku: 'May produkto nang gumagamit ng SKU na ito',
      productAdded: '{{name}} ay idinagdag sa inventory',
      productUpdated: '{{name}} ay na-update',
      deleted: '{{name}} ay binura sa inventory',
      invalidQuantity: 'Maglagay ng tamang dami',
      restockSuccess: '{{count}} yunit ng {{name}} ang idinagdag sa stock',
      noSalesToReport: 'Wala pang naitalang benta na iuulat',
      salesReportExportedExcel:
        'Na-export ang NES Monthly Sales Report sa opisyal na format ng Council',
      salesReportExportedPdf: 'Na-export ang NES Monthly Sales Report bilang PDF',
      salesReportExportedWord: 'Na-export ang NES Monthly Sales Report bilang Word document',
      inventoryReportExportedExcel:
        'Na-export ang NES Monthly Inventory Report sa opisyal na format ng Council',
      inventoryReportExportedPdf: 'Na-export ang NES Monthly Inventory Report bilang PDF',
      inventoryReportExportedWord:
        'Na-export ang NES Monthly Inventory Report bilang Word document',
      incomeStatementExportedExcel: 'Awtomatikong nakalkula at na-export ang NES Income Statement',
      incomeStatementExportedPdf: 'Na-export ang NES Income Statement bilang PDF',
      incomeStatementExportedWord: 'Na-export ang NES Income Statement bilang Word document'
    }
  },
  members: {
    title: 'Mga Miyembro',
    addButton: 'Magdagdag ng Miyembro',
    printCardButton: 'I-print ang Loyalty Card',
    searchPlaceholder: 'Maghanap ng miyembro…',
    table: {
      emptyMessage: 'Walang nahanap na miyembro',
      memberCode: 'Member Code',
      name: 'Pangalan',
      email: 'Email',
      discount: 'Diskwento'
    },
    form: {
      memberCode: 'Member Code',
      name: 'Pangalan',
      email: 'Email',
      discountRate: 'Discount Rate (%)',
      numberOfCards: 'Bilang ng card'
    },
    modal: {
      addMemberTitle: 'Magdagdag ng Miyembro',
      editMemberTitle: 'I-edit ang Miyembro',
      saveMember: 'I-save ang Miyembro',
      printCardTitle: 'Loyalty Card — {{name}}',
      preview: 'Preview',
      print: 'I-print',
      scanHint:
        'Maaaring i-scan ang barcode na ito sa Point of Sale para ilapat ang diskwento ng miyembro.'
    },
    card: {
      discountLabel: '{{rate}}% Diskwento ng Miyembro'
    },
    confirmDelete: {
      title: 'Burahin ang Miyembro',
      message: 'Burahin si {{name}}? Hindi na ito maibabalik.'
    },
    toast: {
      codeNameRequired: 'Kailangan ang member code at pangalan',
      memberAdded: '{{name}} ay idinagdag bilang miyembro',
      memberUpdated: 'Na-update si {{name}}',
      memberDeleted: 'Nabura si {{name}}'
    }
  },
  users: {
    title: 'Mga User Account',
    addButton: 'Magdagdag ng User',
    emptyState: 'Walang nahanap na user account',
    searchPlaceholder: 'Maghanap ng user…',
    statusDisabled: 'Naka-disable',
    disable: 'I-disable',
    enable: 'I-enable',
    table: {
      fullName: 'Buong Pangalan',
      email: 'Email',
      role: 'Role',
      status: 'Status',
      action: 'Aksyon'
    },
    rolePermissions: {
      title: 'Mga Permission ng Role',
      subtitle: 'Kontrolin kung anong mga module ang makikita at magagamit ng bawat role.',
      permissionsGranted: '{{granted}} / {{total}} na permission ang naibigay',
      editButton: 'I-edit ang Permissions',
      baseRoleLabel: 'Base Role',
      baseRoleHint:
        'Ang custom role ay isang label kasama ang sarili nitong permission checklist dito sa desktop — pero ang data access (at ang mobile app) ay ang 7 built-in roles lang ang kilala, kaya kailangan ng custom role ng base role. Ang user na naka-assign sa role na ito ay makukuha ang account access ng base role, sa lahat ng bagay maliban sa checklist na ito.',
      addRole: {
        button: 'Magdagdag ng Role',
        title: 'Magdagdag ng Role',
        nameLabel: 'Pangalan ng Role',
        namePlaceholder: 'hal. Front Desk',
        submitButton: 'Idagdag ang Role',
        note: 'Makikita at magagawa ng role na ito ang eksaktong ibibigay mo sa ibaba — i-check ang bawat module na dapat nitong ma-access.',
        errors: {
          required: 'Kailangan ang pangalan ng role',
          invalid: 'Dapat may kahit isang letra o numero ang pangalan ng role',
          duplicate: 'May role na gumagamit na ng pangalang ito'
        }
      },
      deleteRole: {
        confirmTitle: 'Tanggalin ang Role',
        confirmMessage: 'Tanggalin ang role na "{{role}}"? Hindi na ito maibabalik.',
        success: 'Natanggal ang role na "{{role}}"',
        inUse: 'Naka-assign sa {{count}} user — i-reassign muna sila bago tanggalin ang role na ito'
      }
    },
    addModal: {
      title: 'Magdagdag ng User Account',
      fullNameLabel: 'Buong Pangalan',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      roleLabel: 'Role',
      createButton: 'Gumawa ng Account'
    },
    editModal: {
      titleDefault: 'I-edit ang User',
      titleWithName: 'I-edit si {{fullName}}',
      birthDateLabel: 'Petsa ng Kaarawan'
    },
    permissionsModal: {
      titleDefault: 'Mga Permission ng Role',
      titleWithRole: 'Mga Permission ng {{role}}',
      doneButton: 'Tapos na',
      manage: 'Pamahalaan',
      selectAll: 'Piliin Lahat',
      grantedCount: '{{granted}} / {{total}} ang napili'
    },
    toast: {
      missingFields: 'Kailangan ang buong pangalan, email, at password',
      fullNameRequired: 'Kailangan ang buong pangalan',
      userDisabled: 'Na-disable ang user na "{{fullName}}"',
      userEnabled: 'Na-enable ang user na "{{fullName}}"',
      toggleActiveFailed: 'Hindi na-update ang account na ito. Subukan muli.',
      userCreated: 'Nagawa ang user na "{{fullName}}"',
      userCreateFailed: 'Hindi nagawa ang user account. Subukan muli.',
      roleUpdated: 'Na-update ang role ni "{{fullName}}"',
      roleUpdateFailed: 'Hindi na-update ang role. Subukan muli.',
      fullNameUpdated: 'Na-save ang "{{fullName}}"',
      fullNameUpdateFailed: 'Hindi na-save ang pangalan. Subukan muli.'
    },
    confirmDisable: {
      title: 'I-disable ang User Account',
      message:
        'I-disable ang "{{fullName}}"? Hindi na sila makaka-log in hangga\'t hindi ulit na-enable.'
    },
    confirmEnable: {
      title: 'I-enable ang User Account',
      message: 'I-enable ang "{{fullName}}"? Makakabalik sila sa pag-log in.'
    }
  },
  auditLog: {
    title: 'Audit Log',
    subtitle: '{{count}} kaganapan sa session na ito',
    emptyMessage:
      'Wala pang naitalang aktibidad sa session na ito — lalabas dito ang mga aksyon sa buong app.',
    searchPlaceholder: 'Maghanap sa audit log…',
    table: {
      when: 'Kailan',
      actor: 'Gumawa',
      entity: 'Entity',
      action: 'Aksyon',
      summary: 'Buod'
    }
  },
  goals: {
    title: 'Mga Layunin at Tunguhin',
    newProgramYearButton: 'Bagong Taon ng Programa',
    newProgramYearModal: {
      title: 'Magsimula ng Bagong Taon ng Programa',
      yearLabel: 'Taon ng Programa',
      createButton: 'Gawin',
      hint: 'Kokopyahin ang lahat ng layunin at objective mula {{year}} papunta sa bagong taon na parehong istruktura — magsisimula sa 0 ang mga taunang target hanggang aprubahan ng konseho, at mare-reset sa zero ang buwanang progress.'
    },
    exportLabel: 'I-export ang Ulat',
    goalLabel: 'Layunin {{code}}',
    empty: 'Walang nahanap na objective',
    noGoals: 'Wala pang layunin. Gumawa ng iyong unang layunin para magsimula.',
    newGoalButton: 'Bagong Layunin',
    editGoalButton: 'I-edit ang Layunin',
    deleteGoalButton: 'Burahin ang Layunin',
    addObjectiveButton: 'Magdagdag ng Objective',
    editObjectiveButton: 'I-edit ang Objective',
    table: {
      code: 'Code',
      objective: 'Objective',
      annualTarget: 'Taunang Target',
      thisMonth: 'Nakamit noong {{month}}',
      autoTracked: 'Awtomatikong kinukuha mula sa Benta',
      achievedToDate: 'Nakamit Hanggang Ngayon',
      percentAchieved: '% Nakamit'
    },
    form: {
      goalCode: 'Code ng Layunin',
      goalTitle: 'Pamagat ng Layunin',
      goalTitlePlaceholder: 'hal. More Opportunities for More Girls',
      objectiveCode: 'Code ng Objective',
      objectiveCodePlaceholder: 'hal. 1.a.1',
      objectiveLabel: 'Objective',
      objectiveLabelPlaceholder: 'hal. Membership — School-based',
      unit: 'Yunit',
      unitCount: 'Bilang',
      unitPeso: 'Piso (₱)',
      unitPercent: 'Porsyento (%)'
    },
    confirmDeleteGoal: {
      title: 'Burahin ang Layunin',
      message:
        'Sigurado ka bang buburahin ang "{{title}}"? Permanenteng mababawi ang lahat ng objectives at progress nito.'
    },
    confirmDeleteObjective: {
      title: 'Burahin ang Objective',
      message:
        'Sigurado ka bang buburahin ang "{{label}}"? Permanenteng mababawi ang history ng progress nito.'
    },
    toast: {
      exportedExcel: 'Na-export ang ulat ng Goals & Objectives sa Excel',
      exportedPdf: 'Na-export ang ulat ng Goals & Objectives bilang PDF',
      exportedWord: 'Na-export ang ulat ng Goals & Objectives bilang Word document',
      missingTitle: 'Kailangan ang pamagat ng layunin',
      missingObjectiveFields: 'Kailangan ang code at label ng objective',
      goalCreated: 'Nagawa ang layunin',
      goalUpdated: 'Na-update ang layunin',
      goalDeleted: 'Nabura ang layunin',
      objectiveCreated: 'Naidagdag ang objective',
      objectiveUpdated: 'Na-update ang objective',
      objectiveDeleted: 'Nabura ang objective',
      programYearRequired: 'Maglagay ng taon ng programa',
      programYearExists: 'Mayroon nang ganitong taon ng programa',
      noSourceYear: 'Walang existing na taon ng programa na kokopyahin',
      programYearCreated: 'Nagawa ang {{year}}'
    }
  },
  trainingReports: {
    title: 'Mga Ulat ng Pagsasanay',
    subtitle: 'Per-event na training report form, kagaya ng template ng National HQ.',
    subtitleFiltered:
      'Per-event na training report form, kagaya ng template ng National HQ — {{period}}',
    newReportButton: 'Bagong Training Report',
    editButton: 'I-edit ang Training Report',
    exportLabel: 'I-export ang Training Report',
    empty: 'Walang nakitang training report',
    searchPlaceholder: 'Maghanap ng training report…',
    filters: {
      allYears: 'Lahat ng Taon',
      allMonths: 'Lahat ng Buwan'
    },
    table: {
      reportNo: 'Report No.',
      title: 'Pamagat',
      type: 'Uri',
      date: 'Petsa',
      place: 'Lugar',
      participants: 'Kalahok'
    },
    types: {
      leaders: 'Training ng mga Leader',
      trainers: 'Training ng mga Trainer',
      dfas: 'Training ng District Field Advisors (DFAs)',
      communityWomen: 'Training ng Community Women',
      barangayCommittee: 'Training ng Barangay GS Committee',
      districtCommittee: 'Training ng District Committee',
      councilBoard: 'Training ng Council Board Members',
      councilStandingCommittee: 'Training ng Council Standing Committee Members',
      regionalCouncilStaff: 'Training ng Regional & Council Staff',
      other: 'Iba pa'
    },
    form: {
      sectionBasic: 'Pangunahing Impormasyon',
      reportNo: 'Report No.',
      seriesYear: 'Series Year',
      title: 'Pamagat ng Training Event',
      titlePlaceholder: 'hal. Training of District GS Committee',
      place: 'Lugar ng Training Event',
      dateFrom: 'Petsa Mula',
      dateTo: 'Petsa Hanggang',
      objectives: 'Mga Layunin ng Training',
      oneLineEach: 'Isang item bawat linya',
      sectionDetails: 'Detalye ng Training',
      type: 'Uri ng Training',
      hoursPerDay: 'Oras Bawat Araw',
      totalHours: 'Kabuuang Oras',
      participantClassification: 'Klasipikasyon ng mga Kalahok',
      participantCount: 'Bilang ng Kalahok',
      sectionFees: 'Bayarin',
      feePerParticipant: 'Halagang Kinolekta Bawat Kalahok',
      feeCollectedReserves: 'Halagang Kinolekta sa Training Reserves',
      feeRemitted: 'Halagang Nairemit',
      sectionTeam: 'Training Team & Staff',
      trainers: 'Mga Trainer',
      coordinator: 'Coordinator',
      dietician: 'Dietician / QM',
      assistantCoordinators: 'Mga Assistant Coordinator',
      sectionObservations: 'Mga Obserbasyon / Rekomendasyon / Mungkahi',
      observations: 'Mga Obserbasyon',
      sectionParticipants: 'Kalakip na Listahan ng mga Kalahok',
      participantName: 'Pangalan',
      participantSchool: 'Paaralan',
      addParticipant: 'Magdagdag ng Kalahok',
      sectionSubmission: 'Pagsumite',
      submittedByName: 'Isinumite ni',
      submittedByDesignation: 'Designasyon',
      submittedDate: 'Petsa'
    },
    toast: {
      requiredFields: 'Kailangan ang Report No. at Pamagat',
      created: 'Nagawa ang training report',
      updated: 'Na-update ang training report',
      deleted: 'Nabura ang training report',
      exportedExcel: 'Na-export ang training report sa Excel',
      exportedPdf: 'Na-export ang training report bilang PDF',
      exportedWord: 'Na-export ang training report bilang Word document'
    },
    confirmDelete: {
      title: 'Burahin ang Training Report',
      message: 'Buburahin ang "{{title}}"? Hindi na ito mababawi.'
    }
  },
  trainingProfiles: {
    title: 'Mga Profile ng Pagsasanay',
    subtitle: 'Council Profile at Training Information para sa mga Troop Leader at Field Adviser',
    newButton: 'Bagong Profile',
    editTitle: 'I-edit ang Profile',
    exportLabel: 'I-export ang Training Profile',
    exportButton: 'I-export',
    searchPlaceholder: 'Maghanap ayon sa pangalan, paaralan, o distrito…',
    table: {
      name: 'Pangalan',
      school: 'Paaralan',
      district: 'Distrito',
      level: 'Level',
      roles: 'Posisyon/Tungkulin',
      contactNumber: 'Numero ng Contact',
      email: 'Email Address',
      homeAddress: 'Tirahan',
      completedTrainings: 'Natapos na Training',
      ageLevelSpecialization: 'Age-Level Specialization',
      completedCertificates: 'Natapos na Certificate',
      birthday: 'Kaarawan',
      firstRegistrationDate: 'Unang Petsa ng Rehistrasyon',
      totalYearsInScouting: 'Kabuuang Taon sa Scouting',
      empty: 'Walang nakitang training profile'
    },
    level: {
      elementary: 'Elementarya',
      highSchool: 'High School'
    },
    role: {
      troop_leader: 'Troop Leader',
      district_field_adviser: 'District Field Adviser',
      field_adviser: 'Field Adviser',
      assisting_trainer: 'Assisting Trainer',
      credentialed_trainer: 'Credentialed Trainer',
      diplomad: 'Diplomad'
    },
    training: {
      basic_leadership_course: 'Basic Leadership Course',
      age_level_specialization_course: 'Age-Level Specialization Course',
      outdoor_leadership_course: 'Outdoor Leadership Course',
      campers_permit_course: "Camper's Permit Course",
      quarter_master_course: 'Quarter Master Course',
      training_for_trainers: 'Training for Trainers'
    },
    ageLevel: {
      star: 'Star',
      twinkler: 'Twinkler',
      junior: 'Junior',
      senior: 'Senior'
    },
    certificate: {
      camp_craft_certificate: 'Camp Craft Certificate',
      campers_permit_certificate: "Camper's Permit Certificate"
    },
    form: {
      name: 'Pangalan (Unang Pangalan, Gitnang Inisyal, Apelyido)',
      birthday: 'Kaarawan',
      school: 'Paaralan',
      district: 'Distrito',
      level: 'Level',
      contactNumber: 'Numero ng Contact',
      email: 'Email Address',
      homeAddress: 'Tirahan',
      roles: 'Posisyon/Tungkulin sa GSP Ilocos Sur Council',
      whichTroop: 'Aling Troop',
      whichTroopPlaceholder: 'Pumili ng troop',
      troopRole: 'Posisyon sa Troop na iyon',
      troopRoleLeader: 'Troop Leader',
      troopRoleAssistant: 'Assistant Troop Leader',
      completedTrainings: 'Natapos na Training',
      otherCompletedTraining: 'Iba pa (pakisulat)',
      ageLevelSpecialization: 'Para sa mga Nakatapos ng Age-Level Specialization Course Lamang',
      ageLevelSpecializationPlaceholder: 'Piliin ang age level',
      completedCertificates: 'Natapos na Certificate',
      firstRegistrationDate: 'Unang Petsa ng Rehistrasyon',
      totalYearsInScouting: 'Kabuuang Taon sa Scouting',
      createButton: 'Gumawa ng Profile'
    },
    toast: {
      missingFields: 'Kailangan ang Pangalan, Paaralan, at Distrito',
      created: 'Nagawa ang training profile',
      updated: 'Na-update ang training profile',
      deleted: 'Nabura ang training profile',
      exportedExcel: 'Na-export ang training profile sa Excel',
      exportedPdf: 'Na-export ang training profile bilang PDF',
      exportedWord: 'Na-export ang training profile bilang Word document',
      noneToExport: 'Walang training profile na pwedeng i-export',
      listExportedExcel: 'Na-export ang mga training profile sa Excel',
      listExportedPdf: 'Na-export ang mga training profile bilang PDF',
      listExportedWord: 'Na-export ang mga training profile bilang Word document'
    },
    confirmDelete: {
      title: 'Burahin ang Training Profile',
      message: 'Buburahin ang training profile para kay {{name}}? Hindi na ito mababawi.'
    }
  },
  programReports: {
    title: 'Mga Ulat ng Programa',
    subtitle:
      'Buwanang detalye ng Badgework, Troop Camps, Improved Image, at International Affairs — {{month}} {{year}}',
    empty: 'Walang nakitang line item',
    editLineItem: {
      title: 'I-edit ang Line Item'
    },
    exportLabel: 'I-export ang Section',
    editHeader: {
      button: 'I-edit ang Header',
      title: 'I-edit ang Header ng Ulat',
      subtitle:
        'Para lang ito sa {{month}} {{year}} — may sarili pang header ang ibang buwan/taon.',
      reportTitle: 'Pamagat ng Ulat',
      goalHeading: 'Goal Heading'
    },
    table: {
      code: 'Code',
      label: 'Line Item',
      thisMonth: '{{month}}',
      breakdownTotal: '{{count}} kabuuan',
      logEntries: '{{count}} entry'
    },
    sections: {
      badgework: 'Badgework',
      troopCamps: 'Troop Camps & Activities',
      improvedImage: 'Improved Image',
      intlAffairs: 'International Affairs'
    },
    shapes: {
      count: 'Buwanang Bilang',
      ageLevelBreakdown: 'Buwanang Bilang ayon sa Age Level',
      categoryAgeLevelBreakdown: 'Buwanang Bilang ayon sa Category & Age Level',
      log: 'Dated Log'
    },
    form: {
      code: 'Code',
      label: 'Label',
      shape: 'Uri ng Pagsubaybay',
      scope: 'Antas ng Ulat',
      district: 'District'
    },
    scopes: {
      council: 'Buong Council',
      district: 'Bawat District'
    },
    breakdownModal: {
      subtitle: '{{month}} — bilang ayon sa age level',
      districtPlaceholder: 'Pangalan ng district',
      addDistrict: 'Magdagdag ng District',
      ageLevelPlaceholder: 'Pangalan ng age level',
      addAgeLevel: 'Magdagdag ng Age Level',
      councilTotal: 'Kabuuan ng Council',
      confirmDeleteDistrict: {
        title: 'Burahin ang District',
        message:
          'Buburahin ang "{{district}}"? Permanenteng mawawala ang lahat ng progreso nito para sa line item na ito.'
      },
      confirmDeleteAgeLevel: {
        title: 'Burahin ang Age Level',
        message:
          'Buburahin ang "{{ageLevel}}"? Permanenteng mawawala ang lahat ng progreso nito para sa line item na ito.'
      }
    },
    categoryBreakdownModal: {
      subtitle: '{{month}} — bilang ayon sa category at age level',
      grandTotal: 'Kabuuang Grand Total'
    },
    goalMetrics: {
      population: 'Kabuuang Bilang ng Batang Babae',
      earned: 'Girls Earned Badges',
      targetLabel: 'Buwanang Target',
      targetPlaceholder: 'hal. 25',
      awardedAgainstGoalLabel: 'Total na Badges Awarded Against Goal',
      earnedThisMonth: '{{count}} na-earn ngayong buwan',
      againstGoal: '{{percent}}% laban sa goal'
    },
    logModal: {
      descriptionPlaceholder: 'Paglalarawan',
      quantityPlaceholder: 'Qty (opsyonal)',
      addEntry: 'Magdagdag ng Entry',
      entries: 'Mga Entry',
      empty: 'Wala pang entry'
    },
    toast: {
      exportedExcel: 'Na-export ang section sa Excel',
      exportedPdf: 'Na-export ang section bilang PDF',
      exportedWord: 'Na-export ang section bilang Word document',
      headerSaved: 'Na-update ang header ng ulat'
    }
  }
} as const

export default tl

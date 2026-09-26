const en = {
  common: {
    signIn: 'Sign In',
    signOut: 'Sign out',
    loading: 'Loading...',
    error: 'Error',
    save: 'Save',
    refresh: 'Refresh',
    cancel: 'Cancel',
    confirm: 'Confirm',
    undo: 'Undo',
    reset: 'Reset',
    settings: 'Settings',
    dashboard: 'Dashboard',
    about: 'About',
    welcome: 'Welcome',
    beta: 'Beta',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    preview: 'Preview',
    download: 'Download',
    downloadHint: 'Download if you need the file itself',
    close: 'Close',
    back: 'Back',
    search: 'Search…',
    or: 'or',
    export: 'Export',
    columns: 'Columns',
    toggleColumns: 'Toggle Columns',
    noRecordsFound: 'No records found',
    showing: 'Showing',
    of: 'of',
    page: 'Page',
    perPageOption: '{{count}} / page',
    row: 'row',
    rows: 'rows',
    filteredByDistrict: 'Filtered by district: {{district}}',
    clearFilter: 'Clear filter',
    yes: 'Yes',
    no: 'No',
    actions: 'Actions',
    processing: 'Processing…',
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    cancelled: 'Cancelled',
    draft: 'Draft',
    paid: 'Paid',
    unpaid: 'Unpaid',
    overdue: 'Overdue'
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
    collapseSidebar: 'Collapse sidebar',
    expandSidebar: 'Expand sidebar',
    guest: 'Guest',
    myProfile: 'My Profile',
    groups: {
      troopsMembership: 'Troops & Membership',
      councilPrograms: 'Council Programs',
      hrPayroll: 'HR & Payroll',
      facility: 'Facility',
      accounting: 'Accounting',
      admin: 'Admin'
    },
    nav: {
      dashboard: 'Dashboard',
      announcements: 'Announcements',
      budget: 'Council Budget',
      pos: 'Point of Sale',
      products: 'Inventory',
      members: 'Members',
      employees: 'Employees',
      councilBoard: 'Council Board',
      troops: 'Troops',
      districtCommittee: 'District Committee',
      barangayCommittee: 'Barangay Committee',
      trefoilGuild: 'Trefoil Guild',
      oavf: 'OAVF / Career Woman',
      honoraryMember: 'Honorary Members',
      associateMember: 'Associate Members',
      iccgRegistration: 'ICCG',
      membershipStatusReport: 'Membership Status Report',
      membershipReports: 'Membership Reports',
      troopLeaderSubmissions: 'Membership Submissions',
      activities: 'Activities',
      attendance: 'Attendance',
      leave: 'Leave Requests',
      payroll: 'Payroll',
      orgChart: 'Organizational Chart',
      vouchers: 'Vouchers',
      rentals: 'Rental Bookings',
      visitors: 'Visitors Logbook',
      facilityCalendar: 'Calendar',
      vendors: 'Vendors',
      reports: 'Reports',
      scrd: 'Cash Receipts & Disb.',
      users: 'User Accounts',
      auditLog: 'Audit Log',
      settings: 'Settings',
      devices: 'Devices',
      about: 'About',
      manual: 'User Manual',
      enrollment: 'Enrollment',
      goals: 'Goals & Objectives',
      programReports: 'Program Reports',
      trainingReports: 'Training Reports',
      trainingProfiles: 'Training Profiles',
      ptdg: 'PTDG',
      councilDeposits: 'Council Deposits (RHQ)'
    }
  },
  titleBar: {
    minimize: 'Minimize',
    maximize: 'Maximize',
    close: 'Close',
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
    searchShortcut: 'Search (Ctrl+K)',
    searchPlaceholder: 'Search everywhere…',
    noResults: 'No results found',
    esc: 'Esc',
    notifications: 'Notifications',
    clearAll: 'Clear all',
    noNotifications: 'No notifications',
    home: 'Home',
    searchTypes: {
      module: 'Module',
      vendor: 'Vendor',
      employee: 'Employee',
      troop: 'Troop',
      member: 'Member',
      product: 'Product',
      voucher: 'Voucher',
      leave: 'Leave',
      payroll: 'Payroll',
      rental: 'Rental',
      visitor: 'Visitor',
      activity: 'Activity',
      goal: 'Goal',
      programReport: 'Program Report',
      trainingReport: 'Training Report',
      cashReceipt: 'Cash Receipt',
      bank: 'Bank'
    }
  },
  auth: {
    welcomeBack: 'Welcome back',
    signInSubtitle: 'Sign in to continue to your workspace',
    email: 'Email',
    password: 'Password',
    emailPlaceholder: 'Enter your email address',
    passwordPlaceholder: 'Enter your password',
    demo: 'Contact your administrator if you don’t have an account yet.',
    emailRequired: 'A valid email address is required.',
    passwordMinLength: 'Password must be at least 6 characters.',
    errors: {
      invalidCredentials: 'Incorrect email or password.',
      userDisabled: 'This account has been disabled. Contact your administrator.',
      notADesktopAccount:
        'This account is a Troop Leader account and cannot sign in to the desktop app. Use the mobile app instead.',
      tooManyRequests: 'Too many attempts. Please wait a moment and try again.',
      network: 'Network error — check your connection and try again.',
      generic: 'Sign-in failed. Please try again.'
    }
  },
  dashboard: {
    title: 'Dashboard',
    subtitle: "Here's how your business is doing.",
    refreshButton: 'Refresh',
    refreshToast: 'Data refreshed',
    newExpenseButton: 'New Expense',
    statCashBalance: 'Total Cash & Bank Balance',
    cashBalanceNote: 'Across {{count}} bank account(s)',
    bankBalancesTitle: 'Bank Balances',
    statExpenses: 'Expenses',
    vsLastPeriod: 'vs last period',
    expensesByCategoryTitle: 'Expenses by Category',
    noExpensesRecorded: 'No expenses recorded yet.',
    lowStockLabel: 'Low Stock Items',
    lowStockExample: 'e.g. {{name}}',
    lowStockAllStocked: 'All items well stocked',
    attendanceLabel: "Today's Attendance",
    attendanceDetail: '{{onLeave}} on leave · {{absent}} absent',
    pendingLeaveLabel: 'Pending Leave Requests',
    pendingLeaveNeedsReview: 'Needs review',
    pendingLeaveAllCaughtUp: 'All caught up',
    recentActivityTitle: 'Recent Activity',
    viewAll: 'View all',
    birthdaysTitle: 'Upcoming Birthdays',
    birthdaysToday: 'Today!',
    birthdaysTomorrow: 'Tomorrow',
    birthdaysInDays: 'in {{count}} days',
    birthdaysTurning: 'turning {{age}}',
    birthdayCategory: {
      troopMember: 'Troop Member',
      trainingProfile: 'Training Profile',
      employee: 'Employee',
      councilBoard: 'Council Board',
      userAccount: 'User Account'
    },
    announcementsTitle: 'Announcements',
    budgetTitle: 'Council Budget {{year}}'
  },
  settings: {
    title: 'Settings',
    subtitle: 'Customize your GSPIS Admin experience.',
    appearance: 'Appearance',
    appearanceDesc: 'Customize the look and feel',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Switch between dark and light interface theme',
    accentColor: 'Accent Color',
    accentColorDesc: 'Choose your primary interface color',
    fontSize: 'Font Size',
    fontSizeDesc: 'Adjust the base font size for readability',
    compactMode: 'Compact Mode',
    compactModeDesc: 'Reduce spacing for denser information display',
    language: 'Language',
    notifications: 'Notifications',
    notificationsDesc: 'Control what notifications you receive',
    enableNotifications: 'Enable Notifications',
    enableNotificationsDesc: 'Show system notifications for important events',
    soundAlerts: 'Sound Alerts',
    soundAlertsDesc: 'Play a sound when notifications arrive',
    securityAlerts: 'Security Alerts',
    securityAlertsDesc: 'Alert on suspicious activity',
    marketingEmails: 'Marketing Emails',
    marketingEmailsDesc: 'Receive product updates and announcements',
    security: {
      title: 'Security',
      description: 'Change your account password',
      currentPasswordLabel: 'Current Password',
      newPasswordLabel: 'New Password',
      confirmPasswordLabel: 'Confirm New Password',
      updateButton: 'Update Password',
      toast: {
        updated: 'Password updated successfully'
      },
      errors: {
        wrongCurrentPassword: 'Current password is incorrect.',
        weakPassword: 'New password is too weak — use at least 6 characters.',
        requiresRecentLogin: 'Please sign out and back in, then try again.',
        mismatch: 'New password and confirmation do not match.',
        generic: 'Failed to update password. Please try again.'
      }
    },
    barcodeScanner: {
      title: 'Barcode Scanner',
      description: 'Connect a USB or Bluetooth barcode scanner for fast lookups in Point of Sale.',
      status: {
        idle: 'Not tested yet',
        detected: 'Scanner detected'
      },
      usbTitle: 'USB (wired or wireless dongle)',
      usbStep1: 'Plug the scanner, or its USB receiver, into a USB port.',
      usbStep2:
        'Windows detects it automatically as a keyboard — no driver needed for most models.',
      usbStep3: 'Scan a product barcode below to confirm it works.',
      bluetoothTitle: 'Bluetooth',
      bluetoothStep1: 'Open Windows Settings → Bluetooth & devices → Add device.',
      bluetoothStep2:
        'Put the scanner into pairing mode (hold its pairing button, or scan the "pairing" barcode in its manual).',
      bluetoothStep3: 'Select the scanner from the list and pair.',
      bluetoothStep4: 'Scan a product barcode below to confirm it works.',
      openBluetoothSettings: 'Open Bluetooth Settings',
      testTitle: 'Test your scanner',
      testHint:
        'Scan any barcode — the result appears below. This works anywhere on this page except while typing in a text field.',
      waiting: 'Waiting for a scan…',
      lastScanLabel: 'Last scan',
      clearButton: 'Clear',
      posNote: 'In Point of Sale, a scanned code is matched against each product’s SKU.'
    },
    biometricDevice: {
      title: 'Biometric Terminal',
      description: 'Connect the Hikvision face recognition terminal for real-time attendance',
      hostLabel: 'IP Address',
      portLabel: 'Port',
      usernameLabel: 'Username',
      passwordLabel: 'Password',
      passwordSavedPlaceholder: 'Saved — leave blank to keep',
      useHttpsLabel: 'Device uses HTTPS',
      testButton: 'Test Connection',
      connectButton: 'Connect',
      disconnectButton: 'Disconnect',
      status: {
        disconnected: 'Disconnected',
        connecting: 'Connecting…',
        connected: 'Connected',
        error: 'Error'
      },
      toast: {
        hostRequired: 'Device IP address is required',
        saved: 'Device settings saved',
        testFailed: 'Connection test failed',
        connectFailed: 'Failed to connect to the device',
        saveFailed: 'Failed to save device settings',
        apiUnavailable:
          'This feature needs a full app restart to load — close and reopen GSPIS Admin, then try again.'
      }
    },
    receiptPrinter: {
      title: 'Receipt & Invoice Printer',
      description:
        "Print silently, with no OS print dialog, to this Windows-installed printer — POS Sales Invoices, and Service Invoices/Acknowledgment Receipts from Invoices' Record Payment and Troop/District Committee bulk payments.",
      printerLabel: 'Printer',
      systemDefault: 'System default printer',
      default: 'Default',
      autoPrintLabel: 'Auto-print receipt after sale',
      autoPrintDesc:
        'When on, a Sales Invoice prints automatically after every completed POS sale. Cashiers can still turn this off per sale from the Point of Sale screen.',
      testButton: 'Send Test Print',
      testSuccess: 'Test receipt sent to the printer',
      testFailure: 'Test print failed: {{error}}',
      drawerNote:
        'Cash drawer tip (thermal receipt printers only): if your drawer is wired into this printer’s RJ11/RJ12 port, enable “Open cash drawer when printing” (sometimes called “kick drawer”) in the printer’s Windows driver — Devices & Printers → right-click the printer → Printer properties → Device settings. Once that’s on, every printed receipt also pops the drawer. Not applicable to a dot-matrix/carbon-copy printer.'
    },
    membershipYear: {
      title: 'Membership Year',
      description:
        'The month each annual Girl Scout membership cycle starts — every troop and member renews on this schedule.',
      startMonthLabel: 'Cycle starts in',
      currentCycle: 'Current cycle: {{year}}',
      adminOnlyNote:
        'Only Super Admin and Admin can change this — it applies to the whole council, on every device.',
      months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ],
      toast: {
        saved: 'Membership year cycle updated'
      }
    },
    payroll: {
      title: '13th Month Pay & Cash Gift',
      description:
        'Council-wide Cash Gift amount granted on every employee’s November/December payroll entry. 13th Month Pay itself isn’t set here — it’s computed automatically per employee from their actual basic pay for the year.',
      cashGiftLabel: 'Default Cash Gift amount',
      adminOnlyNote:
        'Only Super Admin and Admin can change this — it applies to the whole council, on every device.',
      toast: {
        saved: 'Default Cash Gift amount updated'
      }
    },
    privacy: 'Privacy',
    privacyDesc: 'Manage your data and privacy preferences',
    dataCollection: 'Usage Analytics',
    dataCollectionDesc: 'Help improve GSPIS Admin by sharing anonymized usage data',
    crashReports: 'Crash Reports',
    crashReportsDesc: 'Automatically send crash reports to help fix bugs',
    telemetry: 'Telemetry',
    telemetryDesc: 'Share performance metrics with the team',
    advanced: 'Advanced',
    advancedDesc: 'Developer settings and maintenance',
    resetSettings: 'Reset Settings',
    resetSettingsDesc: 'Reset all settings to default values',
    resetConfirmTitle: 'Reset Settings',
    resetConfirmDesc:
      'This will reset all settings to their defaults. This action cannot be undone.',
    dark: 'Dark',
    light: 'Light'
  },
  devices: {
    title: 'Devices',
    subtitle: 'Connect and test hardware used by GSPIS Admin.'
  },
  profile: {
    title: 'My Profile',
    subtitle: 'Your account details and photo.',
    changePhoto: 'Change photo',
    toast: {
      photoUpdated: 'Photo updated',
      photoFailed: 'Failed to upload photo'
    }
  },
  manual: {
    title: 'User Manual',
    subtitle: 'How to use every module in GSPIS Admin.',
    searchPlaceholder: 'Search the manual…',
    noResults: 'No matching topics. Try a different search.',
    tocHeading: 'Contents',
    stepsHeading: 'How to use it',
    tipsHeading: 'Good to know',
    rolesHeading: 'Who can access this',
    rolesFootnote:
      "Reflects your council's current Role Permissions setup — an Admin can change it anytime under Users > Role Permissions.",
    everyone: 'Everyone signed in',
    customRoles: 'custom role(s)',
    intro: {
      title: 'Getting started',
      body: 'GSPIS Admin is the desktop system for GSP Ilocos Sur Council — Business, HR, and Financial Management in one place. A handful of things are true everywhere in the app:',
      points: [
        "Staff accounts are created by an Admin/Super Admin from the Users page — there is no public sign-up. If you can't log in, ask an Admin.",
        'What you land on after signing in depends on your role: most roles land on the Dashboard, Cashiers land on Point of Sale, and HR lands on Employees.',
        "The sidebar on the left is your map of the whole system — click the collapse arrow at the top to shrink it to icons only, or click your organization's logo to expand it again.",
        'Press Ctrl+K (or click the search bar in the title bar) to jump straight to any record or page from anywhere.',
        'Click your avatar at the bottom of the sidebar to open My Profile, where you can update your own profile photo. Your name and role are set by an Admin — ask one if either needs to change.',
        'Settings lets you switch the interface between English and Tagalog, toggle light/dark mode, and adjust accent color, font size, and notifications — all under Settings > Appearance.',
        "Every module below only appears in your sidebar if your role has been granted access to it — so don't worry if your menu looks shorter than this manual."
      ]
    },
    groups: {
      core: 'Overview',
      troopsMembership: 'Troops & Membership',
      accounting: 'Accounting',
      councilPrograms: 'Council Programs',
      hrPayroll: 'HR & Payroll',
      facility: 'Facility',
      admin: 'Admin',
      system: 'Account & System'
    }
  },
  about: {
    tagline:
      'Business, HR & Financial Management System for the Girl Scouts of the Philippines — Ilocos Sur Council.',
    techStackHeading: 'Tech Stack',
    buildInfoHeading: 'Build Information',
    buildToolLabel: 'Build Tool',
    nodeTargetLabel: 'Node Target',
    rendererTargetLabel: 'Renderer Target',
    architectureLabel: 'Architecture',
    licenseLabel: 'License',
    footerCredits: 'Built with electron-vite · React 19 · TypeScript · Tailwind CSS',
    footerDevelopedBy: 'Developed by AionX IT Solutions for GSP Ilocos Sur Council.'
  },
  updates: {
    checking: 'Checking for updates...',
    available: 'Update available',
    notAvailable: 'You are up to date',
    downloading: 'Downloading update...',
    downloaded: 'Update downloaded',
    readyToInstall: 'Restart to install update',
    error: 'Update error',
    installNow: 'Install Now'
  },
  employees: {
    title: 'Employee Management',
    addButton: 'Add Employee',
    searchPlaceholder: 'Search employees…',
    empty: 'No employees found',
    table: {
      employeeNumber: 'Employee #',
      name: 'Name',
      position: 'Position',
      department: 'Department',
      branch: 'Branch',
      salary: 'Salary',
      status: 'Status',
      deactivate: 'Deactivate',
      reactivate: 'Reactivate'
    },
    modal: {
      addTitle: 'Add Employee',
      editTitle: 'Edit Employee',
      saveChanges: 'Save Changes'
    },
    form: {
      employeeNumber: 'Employee #',
      hireDate: 'Hire Date',
      birthDate: 'Birth Date',
      fullName: 'Full Name',
      position: 'Position',
      department: 'Department',
      branch: 'Branch',
      reportsTo: 'Reports To',
      noManager: 'No manager (top of chart)',
      linkedUser: 'Linked User Account',
      noLinkedUser: 'No linked account',
      salary: 'Monthly Salary',
      email: 'Email',
      phone: 'Phone',
      payrollDefaultsHeading: 'Default Payroll Amounts (prefilled into new Payroll Entries)',
      defaultCola: 'COLA',
      defaultRepresentation: 'Representation',
      defaultSss: 'SSS',
      defaultPhilhealth: 'PhilHealth',
      defaultPagibig: 'Pag-IBIG',
      defaultWithholdingTax: 'Withholding Tax'
    },
    toast: {
      validationRequired: 'Employee #, name, and position are required',
      updated: 'Employee updated',
      created: '{{name}} added to employees',
      deactivated: '{{name}} deactivated',
      reactivated: '{{name}} reactivated',
      deleted: '{{name}} deleted'
    },
    confirmDeactivate: {
      title: 'Deactivate Employee',
      message:
        'Deactivate {{name}}? They will be hidden from active employee pickers used in Attendance and Payroll.'
    },
    confirmReactivate: {
      title: 'Reactivate Employee',
      message: 'Reactivate {{name}}?'
    },
    confirmDelete: {
      title: 'Delete Employee',
      message:
        'Delete {{name}}? This removes their employee record permanently. Existing attendance, leave, and payroll records tied to them will not be removed. This cannot be undone.'
    },
    profile: {
      viewProfile: 'View Profile',
      changePhoto: 'Change photo',
      uploadingPhoto: 'Uploading…',
      removePhoto: 'Remove photo',
      documentsHeading: 'Documents',
      noDocuments: 'No documents uploaded yet',
      documentLabelPlaceholder: 'Label (optional — defaults to filename)',
      chooseFiles: 'Choose files',
      uploadButton: 'Upload',
      viewDocument: 'View',
      downloadDocument: 'Download',
      documentTypes: {
        resume: 'Resume',
        transcript: 'Transcript / Grades',
        certification: 'Certification',
        other: 'Other'
      },
      confirmDeleteDocument: {
        title: 'Delete Document',
        message: 'Delete this document? This cannot be undone.'
      },
      confirmDeletePhoto: {
        title: 'Remove Photo',
        message: "Remove this employee's photo? This cannot be undone."
      },
      toast: {
        photoUpdated: 'Photo updated',
        photoFailed: 'Failed to upload photo',
        photoRemoved: 'Photo removed',
        photoRemoveFailed: 'Failed to remove photo',
        documentUploaded: 'Document uploaded',
        documentFailed: 'Failed to upload document',
        documentDeleted: 'Document deleted',
        documentDownloadFailed: 'Failed to download document'
      }
    }
  },
  troops: {
    title: 'Troops & Membership',
    subtitle: 'Membership year {{year}}',
    addButton: 'Add Troop',
    exportButton: 'Export',
    searchPlaceholder: 'Search troops…',
    empty: 'No troops found',
    viewRoster: 'View Roster',
    tabTroops: 'Troops',
    tabRegistrations: 'Registrations',
    tabPayments: 'Payments',
    table: {
      troopNumber: 'Troop #',
      troopName: 'Troop Name',
      level: 'Level',
      leaderName: 'Troop Leader',
      members: 'Members',
      needsRenewal: '{{count}} need renewal',
      status: 'Status',
      deactivate: 'Deactivate',
      reactivate: 'Reactivate'
    },
    modal: {
      addTitle: 'Add Troop',
      editTitle: 'Edit Troop',
      saveChanges: 'Save Changes'
    },
    form: {
      troopNumber: 'Troop #',
      level: 'Level',
      levelPlaceholder: 'Select level',
      troopName: 'Troop Name',
      leaderName: 'Troop Leader',
      leaderNamePlaceholder: 'e.g. Juana Dela Cruz',
      trainingsCompletedCount: '{{count}} training(s) completed',
      assistantLeaderName: 'Troop Co-Leader',
      school: 'School / Community',
      barangay: 'Barangay',
      meetingPlace: 'Meeting Place',
      registrationDetailsHeading: 'Registration Details',
      troopAddress: 'Troop Address',
      troopTelNo: 'Troop Tel. No.',
      troopType: 'Troop Type',
      troopTypePlaceholder: 'Select troop type',
      districtCommitteeName: 'District Committee Name / Municipality',
      district: 'District',
      districtPlaceholder: 'Select district…',
      barangayCommitteeName: 'Barangay Committee Name',
      sponsoringGroup: 'Sponsoring Group',
      troopBirthday: 'Troop Birthday',
      completeMailingAddress: 'Complete Mailing Address',
      leaderDetailsHeading: 'Troop Leader Details',
      leaderDetailsHint:
        'Birthdate and Trained status come from the leader’s linked Training Profile when they have one — open Training Profiles to update those.',
      assistantLeaderDetailsHeading: 'Co-Leader Details',
      leaderBeneficiary: 'Beneficiary',
      leaderRboStatus: 'RBO Status',
      rboStatusPlaceholder: 'Select RBO status'
    },
    confirmDeactivate: {
      title: 'Deactivate Troop',
      message:
        'Deactivate Troop {{troopNumber}}? It will be hidden from active troop pickers. This does not affect its members.'
    },
    confirmReactivate: {
      title: 'Reactivate Troop',
      message: 'Reactivate Troop {{troopNumber}}?'
    },
    confirmDelete: {
      title: 'Delete Troop',
      message:
        'Delete Troop {{troopNumber}}? This also permanently removes every member on its roster. This cannot be undone.'
    },
    confirmForceDelete: {
      title: 'Delete Troop Anyway?',
      message:
        'Troop {{troopNumber}} has members with recorded payment history. Deleting it will remove that payment history too, which may change previously-reconciled Daily Collections totals for those dates. Delete anyway? This cannot be undone.'
    },
    toast: {
      validationRequired: 'Troop #, level, and troop leader are required',
      created: 'Troop {{troopNumber}} added',
      updated: 'Troop updated',
      deleted: 'Troop {{troopNumber}} deleted',
      deactivated: 'Troop {{troopNumber}} deactivated',
      reactivated: 'Troop {{troopNumber}} reactivated',
      noneToExport: 'No troops to export',
      exportedExcel: 'Troops & Membership exported to Excel',
      exportedPdf: 'Troops & Membership exported as PDF',
      exportedWord: 'Troops & Membership exported as Word document'
    },
    profile: {
      notLinkedToProfile: 'Not linked to a Training Profile'
    },
    roster: {
      heading: 'Member Roster',
      addButton: 'Add Member',
      exportButton: 'Export',
      searchPlaceholder: 'Search roster…',
      empty: 'No members registered in this troop yet',
      renewButton: 'Renew for this membership year',
      paymentButton: 'Record Payment',
      table: {
        fullName: 'Name',
        birthdate: 'Birthdate',
        level: 'Level',
        guardian: 'Guardian',
        membership: 'Membership',
        current: 'Current — {{year}}',
        needsRenewalBadge: 'Needs renewal — last {{year}}'
      },
      modal: {
        addTitle: 'Add Member',
        editTitle: 'Edit Member'
      },
      form: {
        fullName: 'Full Name',
        birthdate: 'Birthdate',
        level: 'Level',
        guardianName: 'Guardian Name',
        guardianContact: 'Guardian Contact',
        address: 'Address',
        patrol: 'Patrol / Cluster',
        gradeYear: 'Grade / Year',
        beneficiary: 'Beneficiary'
      },
      payment: {
        title: 'Record Payment — {{name}}',
        amountLabel: 'Amount',
        categoryLabel: 'Category',
        categoryMembership: 'Membership',
        categoryTraining: 'Training',
        categoryCamping: 'Camping',
        dateLabel: 'Date',
        submitButton: 'Record Payment',
        historyTitle: 'Payment History',
        historyEmpty: 'No payments recorded yet',
        toast: {
          validationRequired: 'Enter an amount greater than zero',
          recorded: 'Payment recorded for {{name}}'
        }
      },
      confirmDeactivate: {
        title: 'Deactivate Member',
        message:
          'Deactivate {{name}}? They will be hidden from the active roster and renewal tracking.'
      },
      confirmReactivate: {
        title: 'Reactivate Member',
        message: 'Reactivate {{name}}?'
      },
      confirmDelete: {
        title: 'Delete Member',
        message: 'Delete {{name}} from this troop? This cannot be undone.'
      },
      confirmForceDelete: {
        title: 'Delete Member Anyway?',
        message:
          '{{name}} has recorded payment history. Deleting them will remove that payment history too, which may change previously-reconciled Daily Collections totals for those dates. Delete anyway? This cannot be undone.'
      },
      toast: {
        validationRequired: 'Full name and birthdate are required',
        created: '{{name}} added to the roster',
        updated: 'Member updated',
        deleted: '{{name}} removed from the roster',
        deactivated: '{{name}} deactivated',
        reactivated: '{{name}} reactivated',
        renewed: '{{name}} renewed for membership year {{year}}',
        noneToExport: 'No members to export',
        exportedExcel: 'Member roster exported to Excel',
        exportedPdf: 'Member roster exported as PDF',
        exportedWord: 'Member roster exported as Word document'
      }
    },
    payment: {
      subtitle:
        'Bulk fee payments recorded per troop — one entry per remittance, covering however many members it paid for',
      addButton: 'Record Payment',
      searchPlaceholder: 'Search by troop or paid by…',
      empty: 'No payments recorded yet',
      modalTitle: 'Record Bulk Payment',
      editModalTitle: 'Edit Payment',
      submitButton: 'Record Payment',
      troopLabel: 'Troop',
      troopPlaceholder: 'Select troop',
      membersLabel: 'Members covered ({{count}})',
      noMembers: 'No active members in this troop',
      perMemberLinesHeading: 'Per-member fees',
      flatLinesHeading: 'Flat per-troop fees',
      troopFeeLabel: 'Troop Fee',
      thinkingDayFeeLabel: 'Thinking Day Fee',
      categoryLabel: 'Category',
      amountPerMemberLabel: 'Amount per member',
      totalLabel: 'Total',
      dateLabel: 'Date',
      paidByLabel: 'Paid By',
      printReceiptLabel: 'Print a receipt for this payment',
      ratesFromRegistration:
        'Rates from the {{schoolYear}} registration filed {{date}} — not editable here',
      noRegistrationNote:
        'No Troop Registration filed for this troop yet. File one first — its fee rates are what this payment is computed from.',
      table: {
        troopNumber: 'Troop #',
        date: 'Date',
        category: 'Category',
        paidBy: 'Paid By',
        memberCount: 'Members',
        totalAmount: 'Total Amount'
      },
      confirmDelete: {
        title: 'Delete Payment',
        message:
          'Delete this {{category}} payment for Troop {{troopNumber}}? Any linked voucher is removed too. This cannot be undone.'
      },
      toast: {
        troopRequired: 'Select a troop',
        membersRequired: 'Select at least one member',
        amountRequired: 'Enter an amount greater than zero',
        paidByRequired: 'Enter who paid',
        noRegistration: 'File a Troop Registration for this troop before recording payment',
        recorded: 'Payment recorded'
      }
    }
  },
  troopRegistration: {
    title: 'Troop Registration',
    subtitle: 'Filed national Troop Registration Forms, one per troop per school year',
    addButton: 'New Registration',
    exportButton: 'Export',
    searchPlaceholder: 'Search by troop, school year, or troop no…',
    empty: 'No registrations filed yet',
    troopNotFound: 'Troop not found for this registration.',
    table: {
      troopNumber: 'Troop #',
      troopName: 'Troop Name',
      schoolYear: 'School Year',
      dateApplied: 'Date Applied',
      troopStatus: 'Status',
      troopNo: 'Troop No.'
    },
    troopPicker: {
      title: 'New Troop Registration',
      selectTroop: 'Troop',
      placeholder: 'Select a troop',
      continue: 'Continue'
    },
    confirmDelete: {
      title: 'Delete Registration',
      message:
        'Delete the {{schoolYear}} registration for Troop {{troopNumber}}? This cannot be undone.'
    },
    payment: {
      table: { status: 'Payment' }
    },
    toast: {
      validationRequired: 'School year is required',
      created: 'Troop Registration filed',
      updated: 'Troop Registration updated',
      deleted: 'Troop Registration deleted',
      exportedExcel: 'Troop Registration exported to Excel',
      exportedPdf: 'Troop Registration exported as PDF',
      exportedWord: 'Troop Registration exported as Word document'
    },
    form: {
      newTitle: 'New Registration — Troop {{troopNumber}}',
      editTitle: 'Registration — Troop {{troopNumber}}',
      headerSection: 'Troop Information',
      schoolYear: 'School Year',
      dateApplied: 'Date Applied',
      troopStatus: 'Troop Status',
      statusNew: 'New',
      statusReRegistered: 'Re-registered',
      ageLevel: 'Age Level',
      leadersSection: 'Registration of Leaders',
      addLeader: 'Add Leader',
      position: 'Position',
      name: 'Name',
      trained: 'T/NT',
      rboStatus: 'RBO Status',
      birthdate: 'Birthdate',
      beneficiary: 'Beneficiary',
      membersSection: 'Registration of Troop Members',
      addMember: 'Add Member',
      gradeYear: 'Gr/Yr',
      regStatus: 'Reg. Status',
      signaturesSection: 'Signatures',
      submittedByName: 'Submitted By (Troop Leader)',
      submittedByDate: 'Date',
      notedByName: 'Noted By (Principal / School Head / BC Chairman)',
      notedByDate: 'Date',
      remittanceSection: 'Council Action Remittance',
      gspMembershipFee: 'A. GSP Membership Fee',
      girlsReReg: 'Girls — Re-Reg',
      girlsNew: 'Girls — New',
      leaderReReg: 'Leader — Re-Reg',
      leaderNew: 'Leader — New',
      coLeaderReReg: 'Co-Leader — Re-Reg',
      coLeaderNew: 'Co-Leader — New',
      membershipFeePerMemberTotal: 'Per-member fee (total remitted)',
      membershipFeePerMemberCouncilShare: 'Per-member fee (Council share)',
      councilRetainedShare: "Council's retained share",
      thinkingDayFee: 'Thinking Day Fee (retained by Council)',
      programDevelopmentFund: 'B. Program Development Fund',
      mutualAssistanceFund: 'C. Contribution to the Mutual Assistance Fund',
      magazineSubscriptionFee: 'D. GS Magazine Troop Subscription Fee',
      totalRemittance: 'Total Remittance',
      troopNo: 'Troop No.',
      girlsCardsFrom: 'Girls Cards — From',
      girlsCardsTo: 'Girls Cards — To',
      girlsIdCardSeriesYear: 'Girls ID Card Series Year',
      adultsCardsFrom: 'Adults Cards — From',
      adultsCardsTo: 'Adults Cards — To',
      adultsIdCardSeriesYear: 'Adults ID Card Series Year',
      troopFee: 'Troop Fee (Retained by Council)',
      rorNo: 'ROR No.',
      rorDate: 'ROR Date',
      dccrNo: 'DCCR No.',
      dateOfDeposit: 'Date of Deposit',
      branchCode: 'Branch Code',
      processedByName: 'Processed By (Registration Processor)',
      approvedByName: 'Approved By (Council Executive)'
    }
  },
  districtCommittee: {
    title: 'District Committee',
    subtitle: 'District Committees under the Council',
    addButton: 'Add Committee',
    searchPlaceholder: 'Search by name, address, or council…',
    empty: 'No District Committees yet',
    addModalTitle: 'Add District Committee',
    editModalTitle: 'Edit District Committee',
    tabCommittees: 'Committees',
    tabRegistrations: 'Registration',
    tabPayments: 'Payment',
    form: {
      name: 'District Committee Name',
      address: 'Address',
      telNo: 'Tel. No.',
      region: 'Region',
      council: 'Council',
      district: 'District',
      districtPlaceholder: 'Select district…'
    },
    table: {
      name: 'Name',
      address: 'Address',
      telNo: 'Tel. No.',
      members: 'Members',
      status: 'Status',
      deactivate: 'Deactivate',
      reactivate: 'Reactivate'
    },
    toast: {
      deactivated: '"{{name}}" deactivated',
      reactivated: '"{{name}}" reactivated',
      deleted: '"{{name}}" deleted'
    },
    confirmDeactivate: {
      title: 'Deactivate Committee',
      message: 'Deactivate "{{name}}"? It stays on record but won’t show in active pickers.'
    },
    confirmReactivate: {
      title: 'Reactivate Committee',
      message: 'Reactivate "{{name}}"?'
    },
    confirmDelete: {
      title: 'Delete Committee',
      message: 'Delete "{{name}}"? This cannot be undone.'
    },
    confirmForceDelete: {
      title: 'Delete Despite Payment History',
      message:
        '"{{name}}"’s members have recorded payment history — deleting anyway will affect past Daily Collections reports. Delete anyway?'
    },
    payment: {
      subtitle:
        'Bulk fee payments recorded per District Committee — one entry per remittance, covering however many members it paid for',
      addButton: 'Record Payment',
      searchPlaceholder: 'Search by committee or paid by…',
      empty: 'No payments recorded yet',
      modalTitle: 'Record Bulk Payment',
      editModalTitle: 'Edit Payment',
      submitButton: 'Record Payment',
      committeeLabel: 'District Committee',
      committeePlaceholder: 'Select committee',
      membersLabel: 'Members covered ({{count}})',
      noMembers: 'No active members in this committee',
      perMemberLinesHeading: 'Per-member fees',
      categoryMembership: 'Membership',
      flatLinesHeading: 'Flat per-committee fees',
      dcGroupFeeLabel: 'D.C. Group Fee',
      totalLabel: 'Total',
      dateLabel: 'Date',
      paidByLabel: 'Paid By',
      printReceiptLabel: 'Print a receipt for this payment',
      ratesFromRegistration:
        'Rates from the {{schoolYear}} registration filed {{date}} — not editable here',
      noRegistrationNote:
        'No District Committee Registration filed for this committee yet. File one first — its fee rates are what this payment is computed from.',
      table: {
        committeeName: 'Committee',
        date: 'Date',
        category: 'Category',
        paidBy: 'Paid By',
        memberCount: 'Members',
        totalAmount: 'Total Amount'
      },
      confirmDelete: {
        title: 'Delete Payment',
        message:
          'Delete this {{category}} payment for "{{name}}"? Any linked voucher is removed too. This cannot be undone.'
      },
      toast: {
        committeeRequired: 'Select a committee',
        membersRequired: 'Select at least one member',
        amountRequired: 'Enter an amount greater than zero',
        paidByRequired: 'Enter who paid',
        noRegistration:
          'File a District Committee Registration for this committee before recording payment',
        recorded: 'Payment recorded'
      }
    }
  },
  districtCommitteeRegistration: {
    title: 'District Committee Registration',
    subtitle:
      'Filed national District Committee Registration Forms, one per committee per school year',
    addButton: 'New Registration',
    exportButton: 'Export',
    searchPlaceholder: 'Search by committee or school year…',
    empty: 'No registrations filed yet',
    committeeNotFound: 'District Committee not found for this registration.',
    table: {
      committeeName: 'Committee',
      schoolYear: 'School Year',
      dateApplied: 'Date Applied',
      registrationStatus: 'Status'
    },
    committeePicker: {
      title: 'New District Committee Registration',
      selectCommittee: 'District Committee',
      placeholder: 'Select a committee',
      continue: 'Continue'
    },
    confirmDelete: {
      title: 'Delete Registration',
      message: 'Delete the {{schoolYear}} registration for "{{name}}"? This cannot be undone.'
    },
    toast: {
      validationRequired: 'School year is required',
      deleted: 'District Committee Registration deleted',
      created: 'District Committee Registration filed',
      updated: 'District Committee Registration updated',
      exportedExcel: 'District Committee Registration exported to Excel',
      exportedPdf: 'District Committee Registration exported as PDF',
      exportedWord: 'District Committee Registration exported as Word document'
    },
    form: {
      newTitle: 'New Registration — {{name}}',
      editTitle: 'Edit Registration — {{name}}',
      headerSection: 'District Committee Registration Form',
      schoolYear: 'School Year',
      dateApplied: 'Date Applied',
      registrationStatus: 'Registration Status',
      statusNew: 'New',
      statusReRegistered: 'Re-registered',
      membersSection: 'Registration of Committee Members',
      addMember: 'Add Member',
      position: 'Position',
      fullName: 'Name (Last, First, M.I.)',
      birthdate: 'Birthdate',
      groupRepresented: 'Group Represented',
      regStatus: 'Reg. Status',
      beneficiary: 'Beneficiary',
      signaturesSection: 'Signatures',
      submittedByName: 'Submitted By (District Field Adviser)',
      submittedByDate: 'Date',
      notedByName: 'Noted By (Dist. Com. Chairman/Dist. Commissioner)',
      notedByDate: 'Date',
      remittanceSection: 'Council Action Remittance',
      memberFeeTotal: 'Members Fee (Total)',
      memberCountsHint: '{{reReg}} Re-Reg, {{new}} New — counted from the roster above',
      memberFeePerMember: 'Fee per Member',
      programDevelopmentFund: 'Program Development Fund',
      mutualAssistanceFund: 'Contribution to the Mutual Assistance Fund',
      totalRemittance: 'Total Remittance',
      dcGroupFee: 'D.C. Group Fee (Retained by Council)',
      adultsCardsFrom: 'Adult Cards Issued — From',
      adultsCardsTo: 'Adult Cards Issued — To',
      rorNo: 'ROR No.',
      rorDate: 'ROR Date',
      dccrNo: 'DCCR No.',
      dateOfDeposit: 'Date of Deposit',
      dccrSumNo: 'DCCR Sum No.',
      branchCode: 'Branch Code',
      processedByName: 'Processed By (Registration Processor)',
      approvedByName: 'Approved By (Council Executive)'
    }
  },
  barangayCommittee: {
    title: 'Barangay Committee',
    subtitle: 'Barangay Committees under the Council',
    addButton: 'Add Committee',
    searchPlaceholder: 'Search by name, address, or council…',
    empty: 'No Barangay Committees yet',
    addModalTitle: 'Add Barangay Committee',
    editModalTitle: 'Edit Barangay Committee',
    tabCommittees: 'Committees',
    tabRegistrations: 'Registration',
    tabPayments: 'Payment',
    form: {
      name: 'Barangay Committee Name',
      address: 'Address',
      telNo: 'Tel. No.',
      districtCommitteeName: 'District Committee Name',
      region: 'Region',
      council: 'Council',
      district: 'District',
      districtPlaceholder: 'Select district…'
    },
    table: {
      name: 'Name',
      address: 'Address',
      districtCommitteeName: 'District Committee',
      telNo: 'Tel. No.',
      members: 'Members',
      status: 'Status',
      deactivate: 'Deactivate',
      reactivate: 'Reactivate'
    },
    toast: {
      deactivated: '"{{name}}" deactivated',
      reactivated: '"{{name}}" reactivated',
      deleted: '"{{name}}" deleted'
    },
    confirmDeactivate: {
      title: 'Deactivate Committee',
      message: 'Deactivate "{{name}}"? It stays on record but won’t show in active pickers.'
    },
    confirmReactivate: {
      title: 'Reactivate Committee',
      message: 'Reactivate "{{name}}"?'
    },
    confirmDelete: {
      title: 'Delete Committee',
      message: 'Delete "{{name}}"? This cannot be undone.'
    },
    confirmForceDelete: {
      title: 'Delete Despite Payment History',
      message:
        '"{{name}}"’s members have recorded payment history — deleting anyway will affect past Daily Collections reports. Delete anyway?'
    },
    payment: {
      subtitle:
        'Bulk fee payments recorded per Barangay Committee — one entry per remittance, covering however many members it paid for',
      addButton: 'Record Payment',
      searchPlaceholder: 'Search by committee or paid by…',
      empty: 'No payments recorded yet',
      modalTitle: 'Record Bulk Payment',
      editModalTitle: 'Edit Payment',
      submitButton: 'Record Payment',
      committeeLabel: 'Barangay Committee',
      committeePlaceholder: 'Search by committee name…',
      membersLabel: 'Members covered ({{count}})',
      noMembers: 'No active members in this committee',
      categoryMembership: 'Membership',
      bcGroupFeeLabel: 'B.C. Group Fee',
      totalLabel: 'Total',
      dateLabel: 'Date',
      paidByLabel: 'Paid By',
      ratesFromRegistration:
        'Rates from the {{schoolYear}} registration filed {{date}} — not editable here',
      noRegistrationNote:
        'No Barangay Committee Registration filed for this committee yet. File one first — its fee rates are what this payment is computed from.',
      table: {
        committeeName: 'Committee',
        date: 'Date',
        category: 'Category',
        paidBy: 'Paid By',
        memberCount: 'Members',
        totalAmount: 'Total Amount'
      },
      confirmDelete: {
        title: 'Delete Payment',
        message:
          'Delete this {{category}} payment for "{{name}}"? Any linked voucher is removed too. This cannot be undone.'
      },
      toast: {
        committeeRequired: 'Select a committee',
        membersRequired: 'Select at least one member',
        amountRequired: 'Enter an amount greater than zero',
        paidByRequired: 'Enter who paid',
        noRegistration:
          'File a Barangay Committee Registration for this committee before recording payment',
        recorded: 'Payment recorded'
      }
    }
  },
  barangayCommitteeRegistration: {
    title: 'Barangay Committee Registration',
    subtitle:
      'Filed national Barangay Committee Registration Forms, one per committee per school year',
    addButton: 'New Registration',
    exportButton: 'Export',
    searchPlaceholder: 'Search by committee or school year…',
    empty: 'No registrations filed yet',
    committeeNotFound: 'Barangay Committee not found for this registration.',
    table: {
      committeeName: 'Committee',
      schoolYear: 'School Year',
      dateApplied: 'Date Applied',
      registrationStatus: 'Status'
    },
    committeePicker: {
      title: 'New Barangay Committee Registration',
      selectCommittee: 'Barangay Committee',
      placeholder: 'Select a committee',
      continue: 'Continue'
    },
    confirmDelete: {
      title: 'Delete Registration',
      message: 'Delete the {{schoolYear}} registration for "{{name}}"? This cannot be undone.'
    },
    toast: {
      validationRequired: 'School year is required',
      deleted: 'Barangay Committee Registration deleted',
      created: 'Barangay Committee Registration filed',
      updated: 'Barangay Committee Registration updated',
      exportedExcel: 'Barangay Committee Registration exported to Excel',
      exportedPdf: 'Barangay Committee Registration exported as PDF',
      exportedWord: 'Barangay Committee Registration exported as Word document'
    },
    form: {
      newTitle: 'New Registration — {{name}}',
      editTitle: 'Edit Registration — {{name}}',
      headerSection: 'Barangay Committee Registration Form',
      schoolYear: 'School Year',
      dateApplied: 'Date Applied',
      registrationStatus: 'Registration Status',
      statusNew: 'New',
      statusReRegistered: 'Re-registered',
      membersSection: 'Registration of Committee Members',
      addMember: 'Add Member',
      position: 'Position',
      fullName: 'Name (Last, First, M.I.)',
      birthdate: 'Birthdate',
      groupRepresented: 'Group Represented',
      regStatus: 'Reg. Status',
      beneficiary: 'Beneficiary',
      signaturesSection: 'Signatures',
      submittedByName: 'Submitted By (BC Chairman)',
      submittedByDate: 'Date',
      remittanceSection: 'Council Action Remittance',
      memberFeeTotal: 'Members Fee (Total)',
      memberCountsHint: '{{reReg}} Re-Reg, {{new}} New — counted from the roster above',
      memberFeePerMember: 'Fee per Member',
      programDevelopmentFund: 'Program Development Fund',
      mutualAssistanceFund: 'Contribution to the Mutual Assistance Fund',
      totalRemittance: 'Total Remittance',
      bcGroupFee: 'B.C. Group Fee (Retained by Council)',
      adultsCardsFrom: 'Adult Cards Issued — From',
      adultsCardsTo: 'Adult Cards Issued — To',
      rorNo: 'ROR No.',
      rorDate: 'ROR Date',
      dccrNo: 'DCCR No.',
      dateOfDeposit: 'Date of Deposit',
      branchCode: 'Branch Code',
      processedByName: 'Processed By (Registration Processor)',
      approvedByName: 'Approved By (Council Executive)'
    }
  },
  trefoilGuild: {
    title: 'Trefoil Guild',
    subtitle: 'Trefoil Guilds under the Council',
    addButton: 'Add Guild',
    searchPlaceholder: 'Search by name, address, or council…',
    empty: 'No Trefoil Guilds yet',
    addModalTitle: 'Add Trefoil Guild',
    editModalTitle: 'Edit Trefoil Guild',
    tabGuilds: 'Guilds',
    tabRegistrations: 'Registration',
    tabPayments: 'Payment',
    form: {
      name: 'Trefoil Guild Name',
      guildNumber: 'Trefoil Guild Number',
      address: 'Address',
      telNo: 'Tel. No.',
      email: 'Email Address',
      region: 'Region',
      council: 'Council',
      district: 'District',
      districtPlaceholder: 'Select district…'
    },
    table: {
      name: 'Name',
      guildNumber: 'Guild No.',
      address: 'Address',
      telNo: 'Tel. No.',
      members: 'Members',
      status: 'Status',
      deactivate: 'Deactivate',
      reactivate: 'Reactivate'
    },
    toast: {
      deactivated: '"{{name}}" deactivated',
      reactivated: '"{{name}}" reactivated',
      deleted: '"{{name}}" deleted'
    },
    confirmDeactivate: {
      title: 'Deactivate Guild',
      message: 'Deactivate "{{name}}"? It stays on record but won’t show in active pickers.'
    },
    confirmReactivate: {
      title: 'Reactivate Guild',
      message: 'Reactivate "{{name}}"?'
    },
    confirmDelete: {
      title: 'Delete Guild',
      message: 'Delete "{{name}}"? This cannot be undone.'
    },
    confirmForceDelete: {
      title: 'Delete Despite Payment History',
      message:
        '"{{name}}"’s members have recorded payment history — deleting anyway will affect past Daily Collections reports. Delete anyway?'
    },
    payment: {
      subtitle:
        'Bulk fee payments recorded per Trefoil Guild — one entry per remittance, covering however many members it paid for',
      addButton: 'Record Payment',
      searchPlaceholder: 'Search by guild or paid by…',
      empty: 'No payments recorded yet',
      modalTitle: 'Record Bulk Payment',
      editModalTitle: 'Edit Payment',
      submitButton: 'Record Payment',
      guildLabel: 'Trefoil Guild',
      guildPlaceholder: 'Search by guild name…',
      membersLabel: 'Members covered ({{count}})',
      noMembers: 'No active members in this guild',
      categoryMembership: 'Membership',
      tgGroupFeeLabel: 'T.G. Group Fee',
      totalLabel: 'Total',
      dateLabel: 'Date',
      paidByLabel: 'Paid By',
      ratesFromRegistration:
        'Rates from the {{schoolYear}} registration filed {{date}} — not editable here',
      noRegistrationNote:
        'No Trefoil Guild Registration filed for this guild yet. File one first — its fee rates are what this payment is computed from.',
      table: {
        guildName: 'Guild',
        date: 'Date',
        category: 'Category',
        paidBy: 'Paid By',
        memberCount: 'Members',
        totalAmount: 'Total Amount'
      },
      confirmDelete: {
        title: 'Delete Payment',
        message:
          'Delete this {{category}} payment for "{{name}}"? Any linked voucher is removed too. This cannot be undone.'
      },
      toast: {
        guildRequired: 'Select a guild',
        membersRequired: 'Select at least one member',
        amountRequired: 'Enter an amount greater than zero',
        paidByRequired: 'Enter who paid',
        noRegistration: 'File a Trefoil Guild Registration for this guild before recording payment',
        recorded: 'Payment recorded'
      }
    }
  },
  trefoilGuildRegistration: {
    title: 'Trefoil Guild Registration',
    subtitle: 'Filed national Trefoil Guild Registration Forms, one per guild per school year',
    addButton: 'New Registration',
    exportButton: 'Export',
    searchPlaceholder: 'Search by guild or school year…',
    empty: 'No registrations filed yet',
    guildNotFound: 'Trefoil Guild not found for this registration.',
    table: {
      guildName: 'Guild',
      schoolYear: 'School Year',
      dateApplied: 'Date Applied',
      registrationStatus: 'Status'
    },
    guildPicker: {
      title: 'New Trefoil Guild Registration',
      selectGuild: 'Trefoil Guild',
      placeholder: 'Select a guild',
      continue: 'Continue'
    },
    confirmDelete: {
      title: 'Delete Registration',
      message: 'Delete the {{schoolYear}} registration for "{{name}}"? This cannot be undone.'
    },
    toast: {
      validationRequired: 'School year is required',
      deleted: 'Trefoil Guild Registration deleted',
      created: 'Trefoil Guild Registration filed',
      updated: 'Trefoil Guild Registration updated',
      exportedExcel: 'Trefoil Guild Registration exported to Excel',
      exportedPdf: 'Trefoil Guild Registration exported as PDF',
      exportedWord: 'Trefoil Guild Registration exported as Word document'
    },
    form: {
      newTitle: 'New Registration — {{name}}',
      editTitle: 'Edit Registration — {{name}}',
      headerSection: 'Trefoil Guild Registration Form',
      schoolYear: 'School Year',
      dateApplied: 'Date Applied',
      registrationStatus: 'Registration Status',
      statusNew: 'New',
      statusReRegistered: 'Re-registered',
      membersSection: 'Registration of Guild Members',
      addMember: 'Add Member',
      position: 'Position',
      fullName: 'Name (Last, First, M.I.)',
      birthdate: 'Birthdate',
      regStatus: 'Reg. Status',
      beneficiary: 'Beneficiary',
      signaturesSection: 'Signatures',
      submittedByName: 'Submitted By (TG Chairman)',
      submittedByDate: 'Date',
      remittanceSection: 'Council Action Remittance',
      memberFeeTotal: 'Members Fee (Total)',
      memberCountsHint: '{{reReg}} Re-Reg, {{new}} New — counted from the roster above',
      memberFeePerMember: 'Fee per Member',
      programDevelopmentFund: 'Program Development Fund',
      mutualAssistanceFund: 'Contribution to the Mutual Assistance Fund',
      totalRemittance: 'Total Remittance',
      tgGroupFee: 'T.G. Group Fee (Retained by Council)',
      adultsCardsFrom: 'No. of Cards Issued — From',
      adultsCardsTo: 'No. of Cards Issued — To',
      orNo: 'O.R. No.',
      orDate: 'O.R. Date',
      dccrNo: 'DCCR No.',
      dateOfDeposit: 'Date of Deposit',
      branchCode: 'Branch Code',
      processedByName: 'Processed By (Registration Processor)',
      approvedByName: 'Approved By (Council Executive)'
    }
  },
  oavf: {
    title: 'OAVF / Career Woman Members',
    subtitle: 'Other Adult Volunteer and Career Woman Member profiles',
    addButton: 'New Member',
    exportLabel: 'Export',
    searchPlaceholder: 'Search by name or address…',
    empty: 'No OAVF/Career Woman members yet',
    addModalTitle: 'New OAVF/Career Woman Member',
    editModalTitle: 'Edit OAVF/Career Woman Member',
    tabMembers: 'Members',
    tabRegistrations: 'Registration',
    tabPayments: 'Payment',
    table: {
      name: 'Name',
      district: 'District',
      dateApplied: 'Date Applied',
      mobileNo: 'Mobile No.',
      wasGirlScout: 'Former Girl Scout',
      membershipFeeTotal: 'Fee',
      paymentStatus: 'Payment',
      paid: 'Paid',
      unpaid: 'Unpaid',
      membershipStatus: 'Membership',
      active: 'Active',
      expired: 'Expired',
      noRegistration: 'No Registration'
    },
    confirmDelete: {
      title: 'Delete Member',
      message: 'Delete the member "{{name}}"? This cannot be undone.'
    },
    confirmForceDelete: {
      title: 'Delete Despite Payment History',
      message:
        '"{{name}}" has a Registration with recorded payment history — deleting anyway also removes that Registration and any linked voucher, which will affect past Daily Collections reports. Delete anyway?'
    },
    payment: {
      subtitle: 'Recorded OAVF/Career Woman membership fee payments',
      searchPlaceholder: 'Search by name or school year…',
      empty: 'No payments recorded yet',
      recordButton: 'Record Payment',
      modalTitle: 'Record Payment — {{name}}',
      submitButton: 'Record Payment',
      membershipFeeTotal: 'Membership Fee (Total)',
      membershipFeeCouncilShare: 'Council Share',
      dateLabel: 'Date',
      totalLabel: 'Total',
      feeLabel: 'Membership',
      pickerTitle: 'Select Registration to Pay',
      pickerPlaceholder: 'Search by applicant name or school year…',
      pickerEmpty: 'No unpaid registrations found',
      table: {
        name: 'Applicant',
        schoolYear: 'School Year',
        date: 'Date',
        arNumber: 'AR No.',
        amount: 'Amount'
      },
      confirmDelete: {
        title: 'Delete Payment',
        message:
          'Delete this payment for {{name}}? This reverts the registration to Unpaid. This cannot be undone.'
      },
      toast: {
        recorded: 'Payment recorded'
      }
    },
    toast: {
      missingFields: 'Last Name and First Name are required',
      created: 'OAVF/Career Woman member saved',
      updated: 'OAVF/Career Woman member updated',
      deleted: 'OAVF/Career Woman member deleted',
      exportedExcel: 'Exported to Excel',
      exportedPdf: 'Exported as PDF',
      exportedWord: 'Exported as Word document'
    },
    form: {
      createButton: 'Save Member',
      selectPlaceholder: 'Select…',
      dateApplied: 'Date',
      council: 'Council',
      region: 'Region',
      district: 'District',
      lastName: 'Last Name',
      firstName: 'First Name',
      middleInitial: 'M.I.',
      civilStatus: 'Civil Status',
      sex: 'Sex',
      birthdate: 'Birthdate',
      mobileNo: 'Mobile No.',
      email: 'E-mail',
      homeAddress: 'Home Address',
      religion: 'Religion',
      educationalAttainment: 'Educational Attainment',
      profession: 'Profession',
      occupation: 'Occupation',
      interests: 'Interest/s',
      otherOrgAffiliated: 'Other Organization Affiliated',
      beneficiary: 'Beneficiary',
      beneficiaryContactNo: 'Contact Number/s',
      wasGirlScout: 'Girl Scout History',
      wasGirlScoutLabel: 'Have you been a Girl Scout?',
      gsRegion: 'Region',
      gsCouncil: 'Council',
      dateLastRegistered: 'Date Last Registered',
      gsPosition: 'Position'
    },
    registration: {
      subtitle: 'OAVF/Career Woman filings, one per applicant per school year',
      addButton: 'New Registration',
      searchPlaceholder: 'Search by name or school year…',
      empty: 'No registrations filed yet',
      addModalTitle: 'New OAVF/Career Woman Registration',
      editModalTitle: 'Edit OAVF/Career Woman Registration',
      table: {
        name: 'Applicant',
        schoolYear: 'School Year',
        dateApplied: 'Date Applied'
      },
      confirmDelete: {
        title: 'Delete Registration',
        message: 'Delete the {{schoolYear}} registration for "{{name}}"? This cannot be undone.'
      },
      toast: {
        memberRequired: 'Select an applicant',
        schoolYearRequired: 'School year is required',
        created: 'Registration filed',
        updated: 'Registration updated',
        deleted: 'Registration deleted'
      },
      form: {
        createButton: 'Save Registration',
        applicant: 'Applicant',
        applicantPlaceholder: 'Search for a member…',
        schoolYear: 'School Year',
        dateApplied: 'Date Applied'
      }
    }
  },
  honoraryMember: {
    title: 'Honorary Members',
    subtitle: 'Honorary Member profiles',
    addButton: 'New Member',
    exportLabel: 'Export',
    searchPlaceholder: 'Search by name or address…',
    empty: 'No Honorary Members yet',
    addModalTitle: 'New Honorary Member',
    editModalTitle: 'Edit Honorary Member',
    tabMembers: 'Members',
    tabRegistrations: 'Registration',
    tabPayments: 'Payment',
    table: {
      name: 'Name',
      district: 'District',
      dateApplied: 'Date Applied',
      phone: 'Phone',
      wasGirlScout: 'Former Girl Scout',
      feeAmount: 'Fee',
      paymentStatus: 'Payment',
      paid: 'Paid',
      unpaid: 'Unpaid',
      membershipStatus: 'Membership',
      active: 'Active',
      expired: 'Expired',
      noRegistration: 'No Registration'
    },
    confirmDelete: {
      title: 'Delete Member',
      message: 'Delete the member "{{name}}"? This cannot be undone.'
    },
    confirmForceDelete: {
      title: 'Delete Despite Payment History',
      message:
        '"{{name}}" has a Registration with recorded payment history — deleting anyway also removes that Registration and any linked voucher, which will affect past Daily Collections reports. Delete anyway?'
    },
    payment: {
      subtitle: 'Recorded Honorary Member fee payments',
      searchPlaceholder: 'Search by name or school year…',
      empty: 'No payments recorded yet',
      recordButton: 'Record Payment',
      modalTitle: 'Record Payment — {{name}}',
      submitButton: 'Record Payment',
      membershipFeeTotal: 'Membership Fee (Total)',
      membershipFeeCouncilShare: 'Council Share',
      dateLabel: 'Date',
      totalLabel: 'Total',
      feeLabel: 'Honorary Member Fee',
      pickerTitle: 'Select Registration to Pay',
      pickerPlaceholder: 'Search by name or school year…',
      pickerEmpty: 'No unpaid registrations found',
      table: {
        name: 'Honoree',
        schoolYear: 'School Year',
        date: 'Date',
        arNumber: 'AR No.',
        amount: 'Amount'
      },
      confirmDelete: {
        title: 'Delete Payment',
        message:
          'Delete this payment for {{name}}? This reverts the registration to Unpaid. This cannot be undone.'
      },
      toast: {
        amountRequired: 'Enter an amount greater than zero',
        recorded: 'Payment recorded'
      }
    },
    toast: {
      missingFields: 'Last Name and First Name are required',
      created: 'Honorary Member saved',
      updated: 'Honorary Member updated',
      deleted: 'Honorary Member deleted',
      exportedExcel: 'Exported to Excel',
      exportedPdf: 'Exported as PDF',
      exportedWord: 'Exported as Word document'
    },
    form: {
      createButton: 'Save Member',
      selectPlaceholder: 'Select…',
      dateApplied: 'Date',
      lastName: 'Last Name',
      firstName: 'First Name',
      middleInitial: 'M.I.',
      civilStatus: 'Civil Status',
      sex: 'Sex',
      council: 'Council',
      region: 'Region',
      nhq: 'NHQ',
      district: 'District',
      homeAddress: 'Home Address',
      phone: 'Phone',
      email: 'E-mail',
      businessAddress: 'Business Address',
      businessPhone: 'Phone',
      profession: 'Profession',
      occupation: 'Occupation',
      beneficiary: 'Beneficiary',
      wasGirlScout: 'Girl Scout History',
      wasGirlScoutLabel: 'Please indicate if you had been a Girl Scout',
      dateLastRegistered: 'Date Last Registered',
      position: 'Position'
    },
    registration: {
      subtitle: 'Honorary Member filings, one per honoree per school year',
      addButton: 'New Registration',
      searchPlaceholder: 'Search by name or school year…',
      empty: 'No registrations filed yet',
      addModalTitle: 'New Honorary Member Registration',
      editModalTitle: 'Edit Honorary Member Registration',
      table: {
        name: 'Honoree',
        schoolYear: 'School Year',
        dateApplied: 'Date Applied'
      },
      confirmDelete: {
        title: 'Delete Registration',
        message: 'Delete the {{schoolYear}} registration for "{{name}}"? This cannot be undone.'
      },
      toast: {
        memberRequired: 'Select an honoree',
        schoolYearRequired: 'School year is required',
        created: 'Registration filed',
        updated: 'Registration updated',
        deleted: 'Registration deleted'
      },
      form: {
        createButton: 'Save Registration',
        honoree: 'Honoree',
        honoreePlaceholder: 'Search for a member…',
        schoolYear: 'School Year',
        dateApplied: 'Date Applied'
      }
    }
  },
  associateMember: {
    title: 'Associate Members',
    subtitle: 'Associate Member profiles',
    addButton: 'New Member',
    exportLabel: 'Export',
    searchPlaceholder: 'Search by name or address…',
    empty: 'No Associate Members yet',
    addModalTitle: 'New Associate Member',
    editModalTitle: 'Edit Associate Member',
    tabMembers: 'Members',
    tabRegistrations: 'Registration',
    tabPayments: 'Payment',
    table: {
      amfNumber: 'AMF No.',
      name: 'Name',
      district: 'District',
      dateApplied: 'Date Applied',
      phone: 'Phone',
      wasGirlScout: 'Former Girl Scout',
      feeAmount: 'Fee',
      paymentStatus: 'Payment',
      paid: 'Paid',
      unpaid: 'Unpaid',
      membershipStatus: 'Membership',
      active: 'Active',
      expired: 'Expired',
      noRegistration: 'No Registration'
    },
    confirmDelete: {
      title: 'Delete Member',
      message: 'Delete the member "{{name}}"? This cannot be undone.'
    },
    confirmForceDelete: {
      title: 'Delete Despite Payment History',
      message:
        '"{{name}}" has a Registration with recorded payment history — deleting anyway also removes that Registration and any linked voucher, which will affect past Daily Collections reports. Delete anyway?'
    },
    payment: {
      subtitle: 'Recorded Associate Member fee payments',
      searchPlaceholder: 'Search by name or school year…',
      empty: 'No payments recorded yet',
      recordButton: 'Record Payment',
      modalTitle: 'Record Payment — {{name}}',
      submitButton: 'Record Payment',
      membershipFeeTotal: 'Membership Fee (Total)',
      membershipFeeCouncilShare: 'Council Share',
      dateLabel: 'Date',
      totalLabel: 'Total',
      pickerTitle: 'Select Registration to Pay',
      pickerPlaceholder: 'Search by applicant name or school year…',
      pickerEmpty: 'No unpaid registrations found',
      table: {
        name: 'Applicant',
        schoolYear: 'School Year',
        date: 'Date',
        arNumber: 'AR No.',
        amount: 'Amount'
      },
      confirmDelete: {
        title: 'Delete Payment',
        message:
          'Delete this payment for {{name}}? This reverts the registration to Unpaid. This cannot be undone.'
      },
      toast: {
        amountRequired: 'Enter an amount greater than zero',
        recorded: 'Payment recorded'
      }
    },
    toast: {
      missingFields: 'Last Name and First Name are required',
      created: 'Associate Member saved',
      updated: 'Associate Member updated',
      deleted: 'Associate Member deleted',
      exportedExcel: 'Exported to Excel',
      exportedPdf: 'Exported as PDF',
      exportedWord: 'Exported as Word document'
    },
    form: {
      createButton: 'Save Member',
      selectPlaceholder: 'Select…',
      amfNumber: 'AMF No.',
      series: 'Series',
      dateApplied: 'Date',
      council: 'Council',
      region: 'Region',
      district: 'District',
      lastName: 'Last Name',
      firstName: 'First Name',
      middleInitial: 'M.I.',
      civilStatus: 'Civil Status',
      sex: 'Sex',
      homeAddress: 'Home Address',
      phone: 'Phone',
      email: 'E-mail',
      businessAddress: 'Business Address',
      businessPhone: 'Phone',
      profession: 'Profession',
      occupation: 'Occupation',
      beneficiary: 'Beneficiary',
      wasGirlScout: 'Girl Scout History',
      wasGirlScoutLabel: 'Please indicate if you had been a Girl Scout',
      dateLastRegistered: 'Date Last Registered',
      position: 'Position'
    },
    registration: {
      subtitle: 'Associate Member filings, one per applicant per school year',
      addButton: 'New Registration',
      searchPlaceholder: 'Search by name or school year…',
      empty: 'No registrations filed yet',
      addModalTitle: 'New Associate Member Registration',
      editModalTitle: 'Edit Associate Member Registration',
      table: {
        name: 'Applicant',
        schoolYear: 'School Year',
        dateApplied: 'Date Applied'
      },
      confirmDelete: {
        title: 'Delete Registration',
        message: 'Delete the {{schoolYear}} registration for "{{name}}"? This cannot be undone.'
      },
      toast: {
        memberRequired: 'Select an applicant',
        schoolYearRequired: 'School year is required',
        created: 'Registration filed',
        updated: 'Registration updated',
        deleted: 'Registration deleted'
      },
      form: {
        createButton: 'Save Registration',
        applicant: 'Applicant',
        applicantPlaceholder: 'Search for a member…',
        schoolYear: 'School Year',
        dateApplied: 'Date Applied'
      }
    }
  },
  iccgRegistration: {
    title: 'ICCG Registration',
    subtitle:
      'Filed national ICCG (Catholic Guiding Section) Membership Registration Forms, one per school/troop per school year',
    addButton: 'New Registration',
    exportButton: 'Export',
    searchPlaceholder: 'Search by school, troop, or school year…',
    empty: 'No registrations filed yet',
    troopNotFound: 'Troop not found for this registration.',
    tabMembers: 'Members',
    tabRegistrations: 'Registration',
    tabPayments: 'Payment',
    table: {
      school: 'School',
      troopNumber: 'Troop #',
      schoolYear: 'School Year',
      dateApplied: 'Date Applied',
      girls: 'Girls',
      adults: 'Adults',
      total: 'Total'
    },
    troopPicker: {
      title: 'New ICCG Registration',
      selectTroop: 'Troop',
      placeholder: 'Select a troop',
      continue: 'Continue'
    },
    confirmDelete: {
      title: 'Delete Registration',
      message:
        'Delete the {{schoolYear}} ICCG registration for "{{school}}"? This cannot be undone.'
    },
    toast: {
      validationRequired: 'School is required',
      created: 'ICCG Registration filed',
      updated: 'ICCG Registration updated',
      deleted: 'ICCG Registration deleted',
      exportedExcel: 'ICCG Registration exported to Excel',
      exportedPdf: 'ICCG Registration exported as PDF',
      exportedWord: 'ICCG Registration exported as Word document'
    },
    form: {
      newTitle: 'New Registration — Troop {{troopNumber}}',
      editTitle: 'Registration — Troop {{troopNumber}}',
      headerSection: 'CGS Information',
      school: 'School',
      ageLevel: 'Age Level',
      schoolYear: 'School Year',
      dateApplied: 'Date Applied',
      formNo: 'Form No.',
      seriesYear: 'Series Year',
      girlsSection: 'CGS Registered Girl Members',
      addGirl: 'Add Girl',
      adultsSection: 'CGS Registered Adult Members (at least 2)',
      addAdult: 'Add Adult',
      name: 'Name (Last, First, M.I.)',
      gradeYear: 'Grade/Year',
      email: 'e-mail address',
      signaturesSection: 'Signatures',
      submittedByName: 'Submitted By (CGS Adult Leader)',
      submittedByDate: 'Date',
      notedByName: 'Noted By (School Principal)',
      notedByDate: 'Date',
      feeSection: 'CGS Registration Fee',
      noOfGirls: 'No. of Girls',
      amountGirls: 'Amount — Girls',
      noOfAdults: 'No. of Adult',
      amountAdults: 'Amount — Adult',
      feePerMemberTotal: 'Per-member fee (total remitted)',
      feePerMemberCouncilShare: 'Per-member fee (Council share)',
      councilRetainedShare: "Council's retained share",
      total: 'Total',
      arNo: 'AR No.',
      dateOfDeposit: 'Date Deposited',
      dccrNo: 'DCCR No.',
      processedByName: 'Processed By (Registration Processor)',
      approvedByName: 'Approved By (Council Executive)'
    },
    members: {
      subtitle:
        'Persistent per-Troop ICCG roster (girls + adults), synced from filed registrations',
      addButton: 'Add Member',
      searchPlaceholder: 'Search by name or troop…',
      empty: 'No ICCG members yet',
      addModalTitle: 'Add ICCG Member',
      editModalTitle: 'Edit ICCG Member',
      roleGirl: 'Girl',
      roleAdult: 'Adult',
      deactivate: 'Deactivate',
      reactivate: 'Reactivate',
      table: {
        troopNumber: 'Troop #',
        name: 'Name',
        role: 'Role',
        gradeYear: 'Grade/Year',
        email: 'e-mail address',
        status: 'Status'
      },
      form: {
        troop: 'Troop',
        troopPlaceholder: 'Select a troop',
        role: 'Role',
        fullName: 'Name (Last, First, M.I.)',
        gradeYear: 'Grade/Year',
        email: 'e-mail address'
      },
      toast: {
        troopRequired: 'Select a troop',
        nameRequired: 'Name is required',
        created: 'ICCG member added',
        updated: 'ICCG member updated',
        deactivated: '"{{name}}" deactivated',
        reactivated: '"{{name}}" reactivated',
        deleted: '"{{name}}" deleted'
      },
      confirmDeactivate: {
        title: 'Deactivate Member',
        message:
          'Deactivate "{{name}}"? They stay on record but won’t be offered as an active roster member.'
      },
      confirmReactivate: {
        title: 'Reactivate Member',
        message: 'Reactivate "{{name}}"?'
      },
      confirmDelete: {
        title: 'Delete Member',
        message: 'Delete "{{name}}"? This cannot be undone.'
      },
      confirmForceDelete: {
        title: 'Delete Despite Payment History',
        message:
          '"{{name}}" has recorded payment history — deleting anyway will affect past Daily Collections reports. Delete anyway?'
      }
    },
    payment: {
      subtitle:
        'Bulk fee payments recorded per Troop’s ICCG roster — one entry per remittance, covering however many girls/adults it paid for',
      addButton: 'Record Payment',
      searchPlaceholder: 'Search by troop or paid by…',
      empty: 'No payments recorded yet',
      modalTitle: 'Record Bulk Payment',
      editModalTitle: 'Edit Payment',
      submitButton: 'Record Payment',
      troopLabel: 'Troop',
      troopPlaceholder: 'Search by troop number or name…',
      membersLabel: 'Girls covered ({{girls}}), Adults covered ({{adults}})',
      girlsFeeLabel: 'Girls Fee',
      adultsFeeLabel: 'Adults Fee',
      councilShareLabel: 'Council share (per member)',
      councilRetainedTotal: "Council's retained share",
      totalLabel: 'Total',
      dateLabel: 'Date',
      paidByLabel: 'Paid By',
      ratesFromRegistration:
        'Rates suggested from the {{schoolYear}} registration filed {{date}} — editable here',
      noRegistrationNote:
        'No ICCG Registration filed for this troop yet — using the standard ₱20/₱5 rate. You can still record payment; file a registration later to keep the rate suggestion in sync.',
      table: {
        troopNumber: 'Troop #',
        date: 'Date',
        category: 'Category',
        paidBy: 'Paid By',
        memberCount: 'Members',
        totalAmount: 'Total Amount'
      },
      confirmDelete: {
        title: 'Delete Payment',
        message:
          'Delete this {{category}} payment for Troop {{troopNumber}}? Any linked voucher is removed too. This cannot be undone.'
      },
      toast: {
        troopRequired: 'Select a troop',
        amountRequired: 'Enter an amount greater than zero',
        paidByRequired: 'Enter who paid',
        recorded: 'Payment recorded'
      }
    },
    regPayment: {
      table: { status: 'Payment' }
    }
  },
  membershipStatusReport: {
    title: 'Membership Status Report',
    subtitle: 'Council-wide membership counts computed live from every registration module',
    exportLabel: 'Export',
    schoolYear: 'Membership Year',
    newYearButton: 'New Membership Year',
    newYearModal: {
      title: 'Start a New Membership Year',
      yearLabel: 'Membership Year',
      createButton: 'Create',
      hint: 'Carries over {{year}}’s Goal targets as a starting point for the new year — adjust them anytime from Edit Goals. Nothing else needs to exist beforehand; registrations filed under the new year will show up here automatically.'
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
      editButton: 'Edit Goals',
      editTitle: 'Edit Goals — {{schoolYear}}',
      category: 'Category',
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
      exportedExcel: 'Exported to Excel',
      exportedPdf: 'Exported as PDF',
      exportedWord: 'Exported as Word document',
      yearRequired: 'Enter a membership year label',
      yearExists: 'That membership year already exists',
      yearCreated: '{{year}} created'
    }
  },
  membershipReports: {
    cardTitle: 'Daily Cash Collection Report',
    cardSubtitle:
      'Original amount collected per payor across Troops & Membership — not the council-retained share Accounting tracks',
    rangeSubtitle:
      'Consolidated view across the selected dates — switch to a single day to edit or save.',
    exportLabel: 'Export Report',
    saved: 'Saved',
    draft: 'Unsaved draft',
    rangeBadge: 'Range (read-only)',
    addLine: 'Add Line',
    totalCashCollection: 'Total Cash Collection for the Day',
    totalDeposited: 'Less Total Deposit for the Day',
    underOverDeposit: '(Under) Over Deposit',
    bankBranchCode: 'Bank Branch Code',
    remarks: 'Remarks',
    preparedBy: 'Prepared by: {{name}}',
    saveButton: 'Save Report',
    attachments: 'Attachments',
    noAttachments: 'No files attached yet',
    uploadAttachment: 'Attach File',
    deleteAttachmentTitle: 'Delete Attachment',
    deleteAttachmentMessage:
      'Are you sure you want to delete "{{name}}"? This will permanently remove the file. This action cannot be undone.',
    table: {
      payor: 'Payor',
      troopNo: 'Troop No.',
      district: 'District',
      regFormNo: 'Reg. Form No.',
      rorDate: 'R.O.R. Date',
      rorNo: 'R.O.R. No.',
      amount: 'Amount',
      totalCollected: 'Total Amount Collected',
      totalDeposited: 'Total Amount Deposited',
      dateDeposited: 'Date Deposited',
      remarks: 'Remarks',
      totals: 'TOTALS'
    },
    toast: {
      saved: 'Daily Cash Collection Report saved',
      excel: 'Report exported to Excel',
      pdf: 'Report exported as PDF',
      word: 'Report exported as Word document',
      attachmentUploaded: 'Attachment uploaded',
      attachmentFailed: 'Failed to upload attachment',
      attachmentDeleted: 'Attachment deleted'
    }
  },
  attendance: {
    title: 'Attendance',
    enrollmentButton: 'Enrollment',
    manualEntryButton: 'Manual Entry',
    empty: 'No attendance records for this range',
    summary: {
      records: 'Records',
      present: 'Present',
      late: 'Late',
      overtime: 'Overtime',
      overtimeHours: '{{hours}}h',
      overtimeRecords: '{{count}} record(s)',
      onLeave: 'On Leave',
      absent: 'Absent'
    },
    filters: {
      to: 'to',
      allEmployees: 'All employees'
    },
    table: {
      date: 'Date',
      employee: 'Employee',
      clockIn: 'Clock In',
      clockOut: 'Clock Out',
      hours: 'Hours',
      status: 'Status',
      notes: 'Notes',
      action: 'Action'
    },
    status: {
      present: 'Present',
      late: 'Late',
      'half-day': 'Half-day',
      absent: 'Absent',
      leave: 'Leave',
      overtime: 'Overtime'
    },
    modal: {
      title: 'Manual Attendance Entry',
      editTitle: 'Edit Attendance Record'
    },
    form: {
      selectEmployee: 'Select employee'
    },
    toast: {
      selectEmployee: 'Select an employee',
      recorded: 'Attendance recorded',
      updated: 'Attendance record updated',
      deleted: 'Attendance record deleted'
    },
    confirmDelete: {
      title: 'Delete Attendance Record',
      message: 'Delete the attendance record for {{name}} on {{date}}? This cannot be undone.'
    }
  },
  leave: {
    title: 'Leave Management',
    fileLeaveButton: 'File Leave',
    approveButton: 'Approve',
    rejectButton: 'Reject',
    revertButton: 'Revert to Rejected',
    empty: 'No leave requests filed yet',
    previewDaysPrefix: 'This request covers',
    previewDaysSuffix: 'day(s).',
    searchPlaceholder: 'Search leave requests…',
    balances: {
      title: 'Leave Balances',
      days: 'days',
      searchPlaceholder: 'Search employees…'
    },
    balancesModal: {
      editButton: 'Edit Default Balances',
      title: 'Edit Default Leave Balances',
      description:
        'Set the annual credit pool per leave type for everyone. An employee with their own override (Edit on their row) keeps that instead. Compensatory Time Off is earned from overtime and isn’t editable here.',
      saved: 'Leave balances updated'
    },
    employeeBalanceModal: {
      editButton: 'Edit this employee’s balances',
      titleWithName: 'Edit Leave Balances — {{name}}',
      description:
        'Override this employee’s annual credit for a leave type. Reset to fall back to the org-wide default.',
      resetToDefault: 'Reset to default ({{default}})',
      saved: 'Updated leave balances for {{name}}'
    },
    confirmRevert: {
      title: 'Revert Approval',
      reasonPlaceholder: 'e.g. Filed by mistake'
    },
    confirmDeleteRequest: {
      title: 'Delete Leave Request',
      message: 'Delete this {{leaveType}} request for {{name}}? This cannot be undone.'
    },
    table: {
      employee: 'Employee',
      leaveType: 'Leave Type',
      from: 'From',
      to: 'To',
      days: 'Days',
      reason: 'Reason',
      status: 'Status',
      action: 'Action'
    },
    modal: {
      fileTitle: 'File Leave Request',
      submit: 'Submit',
      approveTitle: 'Approve Leave Request',
      rejectTitle: 'Reject Leave Request',
      confirmApproval: 'Confirm Approval',
      confirmRejection: 'Confirm Rejection',
      summary: '{{employee}} — {{leaveType}} ({{start}} to {{end}}, {{days}} day(s))'
    },
    form: {
      selectEmployee: 'Select employee',
      selectLeaveType: 'Select leave type',
      startDate: 'Start Date',
      endDate: 'End Date',
      halfDay: 'Half day (0.5 day)',
      notesOptional: 'Notes (optional)',
      notesPlaceholder: 'e.g. Medical certificate on file'
    },
    toast: {
      validationRequired: 'Employee and leave type are required',
      endDateInvalid: 'End date must be on or after start date',
      insufficientBalance:
        'Not enough {{leaveType}} balance — {{remaining}} day(s) remaining, {{days}} requested',
      filed: 'Leave request filed',
      decided: 'Leave request {{status}}',
      approvedSynced: 'Approved dates synced to Attendance as "leave"',
      reverted: 'Leave approval reverted to rejected',
      requestDeleted: 'Leave request deleted'
    }
  },
  troopLeaderSubmissions: {
    title: 'Membership Submissions',
    approveButton: 'Approve',
    rejectButton: 'Reject',
    empty: 'No submissions yet',
    searchPlaceholder: 'Search by name or submitter…',
    accountsHeading: 'Member Accounts',
    noAccounts: 'No member accounts yet',
    tabs: {
      troop: 'Troop',
      barangayCommittee: 'Barangay Committee',
      districtCommittee: 'District Committee',
      trefoilGuild: 'Trefoil Guild',
      oavf: 'OAVF / Career Woman',
      honoraryMember: 'Honorary Member',
      associateMember: 'Associate Member',
      iccg: 'ICCG'
    },
    table: {
      primary: 'Submission',
      submittedBy: 'Submitted By',
      members: 'Members',
      status: 'Status',
      action: 'Action'
    },
    modal: {
      approveTitle: 'Approve Submission',
      rejectTitle: 'Reject Submission',
      confirmApproval: 'Confirm Approval',
      confirmRejection: 'Confirm Rejection',
      summary: '{{primary}} — submitted by {{submitter}}',
      approveHint:
        'Approving files this as the real record right away — the Troop/Committee/Member, its roster, and a Registration with auto-computed fees. Record Payment is unblocked immediately after.'
    },
    detail: {
      title: 'Submission Details',
      submittedOn: 'Submitted {{date}}',
      submittedBy: 'Submitted By',
      members: '{{count}} Member(s)',
      reviewNotes: 'Review Notes'
    },
    form: {
      notesOptional: 'Notes (optional)',
      notesPlaceholder: 'e.g. Missing troop tel. no. — followed up with leader'
    },
    confirmDelete: {
      title: 'Delete Submission',
      message: 'Delete the "{{primary}}" submission? This can\'t be undone.'
    },
    toast: {
      decided: 'Submission {{status}}',
      mergeFailed: 'Could not file this submission as a real record',
      deleted: 'Submission deleted'
    }
  },
  payroll: {
    title: 'Payroll',
    exportButton: 'Export Register',
    newEntryButton: 'New Payroll Entry',
    pullFromAttendance: 'Pull from Attendance & Leave',
    computeYearEndPay: 'Compute 13th Month Pay & Cash Gift',
    approveButton: 'Approve',
    markPaidButton: 'Mark Paid',
    empty: 'No payroll entries yet',
    searchPlaceholder: 'Search employee or payroll #…',
    summary: {
      totalNet: 'Total Net Payroll',
      pending: 'Pending',
      paid: 'Paid'
    },
    filters: {
      allYears: 'All years',
      allPeriods: 'All periods'
    },
    table: {
      payrollNumber: 'Payroll #',
      employee: 'Employee',
      period: 'Period',
      basic: 'Basic',
      representation: 'Representation',
      unpaidLeave: 'Unpaid Leave',
      deductions: 'Deductions',
      netPay: 'Net Pay',
      status: 'Status',
      action: 'Action'
    },
    payslipTooltip: 'Payslip',
    modal: {
      title: 'New Payroll Entry',
      editTitle: 'Edit Payroll Entry',
      createEntry: 'Create Entry',
      saveChanges: 'Save Changes'
    },
    form: {
      selectEmployee: 'Select employee',
      periodStart: 'Period Start',
      periodEnd: 'Period End',
      basicSalary: 'Basic Salary',
      monthlySalaryReference: 'Monthly Salary: {{amount}}',
      daysWorked: 'Days Worked',
      overtimePay: 'Overtime Pay',
      cola: 'COLA',
      representation: 'Representation',
      sss: 'SSS',
      philhealth: 'PhilHealth',
      pagibig: 'Pag-IBIG',
      withholdingTax: 'Withholding Tax',
      unpaidLeaveDays: 'Unpaid Leave Days',
      yearEndTitle: '13th Month Pay & Cash Gift (November/December)',
      thirteenthMonthPay: '13th Month Pay',
      cashGift: 'Cash Gift'
    },
    preview: {
      basicPay: 'Basic pay (daily rate × days worked)',
      unpaidLeaveDeduction: 'Unpaid leave deduction',
      totalDeductions: 'Total deductions',
      netPay: 'Net Pay'
    },
    toast: {
      selectEmployeePeriod: 'Select employee and period first',
      attendanceSummary:
        'Attendance: {{present}} present, {{absent}} absent, {{leave}} on leave, {{unpaid}} unpaid leave day(s) (≈{{deduction}} deduction)',
      thirteenthMonthComputed:
        '13th Month Pay: {{thirteenth}} (year-to-date basic pay ÷ 12), Cash Gift: {{cashGift}}',
      selectEmployee: 'Select an employee',
      entryCreated: 'Payroll entry created',
      entryUpdated: 'Payroll entry updated',
      entryDeleted: 'Payroll entry {{number}} deleted',
      noEntriesToExport: 'No payroll entries to export',
      exportedExcel: 'Payroll register exported in the Council’s official format',
      exportedPdf: 'Payroll register exported as PDF',
      exportedWord: 'Payroll register exported as Word document',
      statusUpdated: 'Payroll {{number}} marked as {{status}}',
      payslipExportedExcel: 'Payslip exported as Excel',
      payslipExportedPdf: 'Payslip exported as PDF',
      payslipExportedWord: 'Payslip exported as Word document'
    },
    confirmApprove: {
      title: 'Approve Payroll',
      message: 'Approve payroll entry {{number}} for {{amount}}?'
    },
    confirmMarkPaid: {
      title: 'Mark Payroll as Paid',
      message: 'Mark payroll entry {{number}} ({{amount}}) as paid? This cannot be undone.'
    },
    confirmDelete: {
      title: 'Delete Payroll Entry',
      message: 'Delete payroll entry {{number}} for {{name}}? This cannot be undone.'
    }
  },
  orgChart: {
    title: 'Organizational Chart',
    subtitle: '{{count}} active employee(s) — click anyone to open their profile',
    boardSubtitle: '{{count}} Council Board member(s)',
    empty:
      'No active employees yet — add employees and set who each one reports to in the Employee form.',
    directReportsCount: '{{count}} direct report(s)',
    editLayout: 'Edit Layout',
    doneEditing: 'Done Editing',
    editHint: 'Drag a card onto another to change who they report to.',
    unassignDropZone: 'Drop here to remove a reporting manager'
  },
  councilBoard: {
    title: 'Council Board',
    subtitle: 'The council’s governing board — trustees and officers.',
    addButton: 'Add Board Member',
    searchPlaceholder: 'Search board members…',
    table: {
      name: 'Name',
      position: 'Position',
      contactNumber: 'Contact Number',
      email: 'Email',
      birthDate: 'Birth Date',
      empty: 'No Council Board members yet.'
    },
    addModal: { title: 'Add Board Member' },
    editModal: { title: 'Edit Board Member' },
    form: {
      fullName: 'Full Name',
      position: 'Position',
      positionPlaceholder: 'e.g. Council President, Board Chairperson, Trustee',
      reportsTo: 'Reports To',
      noSuperior: 'None (top of the Board)',
      contactNumber: 'Contact Number',
      email: 'Email',
      birthDate: 'Birth Date'
    },
    toast: {
      missingFields: 'Full name and position are required',
      created: '"{{name}}" added to the Council Board',
      updated: 'Board member updated',
      deleted: 'Board member deleted'
    },
    confirmDelete: {
      title: 'Delete Board Member',
      message: 'Delete "{{name}}" from the Council Board? This cannot be undone.'
    },
    profile: {
      viewProfile: 'View Profile',
      changePhoto: 'Change photo',
      uploadingPhoto: 'Uploading…',
      removePhoto: 'Remove photo',
      confirmDeletePhoto: {
        title: 'Remove Photo',
        message: "Remove this board member's photo? This cannot be undone."
      },
      toast: {
        photoUpdated: 'Photo updated',
        photoFailed: 'Failed to upload photo',
        photoRemoved: 'Photo removed',
        photoRemoveFailed: 'Failed to remove photo'
      }
    }
  },
  biometricKiosk: {
    title: 'Biometric Enrollment',
    subtitle: 'Manage which employees are enrolled for biometric attendance',
    backButton: 'Back to Attendance',
    enrolledEmployees: 'Enrolled Employees',
    unenrollButton: 'Unenroll',
    enrollButton: 'Enroll',
    empty: 'No employees found',
    searchPlaceholder: 'Search employees…',
    table: {
      employee: 'Employee',
      position: 'Position',
      method: 'Method',
      status: 'Status',
      action: 'Action'
    },
    status: {
      enrolled: 'Enrolled',
      notEnrolled: 'Not enrolled'
    },
    modal: {
      enrollTitle: 'Enroll {{name}}',
      note: "Simulates capturing the employee's biometric template on an enrollment device.",
      methodOptions: {
        fingerprintOnly: 'Fingerprint only',
        faceOnly: 'Face recognition only',
        both: 'Fingerprint + Face'
      },
      deviceEnrollLabel: 'Also register on the terminal (optional)',
      deviceEnrollNote:
        "Upload a clear front-facing photo to register this employee's face on the connected terminal.",
      deviceNotConnected:
        'Terminal not connected — connect it in Settings to enroll a face there too.'
    },
    toast: {
      unenrolled: '{{name}} unenrolled',
      enrolled: '{{name}} enrolled for biometric attendance',
      deviceEnrolled: "{{name}}'s face registered on the terminal",
      deviceEnrollFailed: 'Failed to register the face on the terminal'
    },
    confirmUnenroll: {
      title: 'Unenroll Employee',
      message:
        'Unenroll {{name}} from biometric attendance? They will not be able to clock in/out via the terminal until re-enrolled.'
    }
  },
  activities: {
    title: 'Activities',
    newActivityButton: 'New Activity',
    empty: 'No activities scheduled yet',
    searchPlaceholder: 'Search activities…',
    tabs: {
      list: 'List',
      calendar: 'Calendar'
    },
    table: {
      title: 'Activity',
      category: 'Category',
      date: 'Date',
      location: 'Location',
      status: 'Status',
      action: 'Action'
    },
    category: {
      meeting: 'Meeting',
      camp: 'Camp',
      training: 'Training',
      communityService: 'Community Service',
      ceremony: 'Ceremony',
      other: 'Other'
    },
    status: {
      scheduled: 'Scheduled',
      ongoing: 'Ongoing'
    },
    modal: {
      title: 'New Activity',
      editTitle: 'Edit Activity',
      createButton: 'Create Activity'
    },
    form: {
      title: 'Title',
      category: 'Category',
      status: 'Status',
      startDate: 'Start Date',
      endDate: 'End Date (optional)',
      startTime: 'Start Time',
      endTime: 'End Time',
      location: 'Location',
      organizer: 'Organizer / Troop in Charge',
      description: 'Description'
    },
    toast: {
      validationRequired: 'Title and start date are required',
      created: 'Activity created',
      updated: 'Activity updated',
      deleted: 'Activity removed',
      statusUpdated: 'Activity status updated'
    },
    confirmDelete: {
      title: 'Delete this activity?',
      message: '"{{title}}" will be permanently removed.'
    },
    calendar: {
      todayButton: 'Today',
      moreCount: '+{{count}} more',
      summary: {
        activities: 'Activities'
      },
      dayModal: {
        noActivities: 'No activities for this day.'
      }
    }
  },
  rentals: {
    title: 'Facility & Rental Management',
    newBookingButton: 'New Booking',
    addSpaceButton: 'Add Room',
    perDay: '/day',
    capacity: 'Cap.',
    bookingsTitle: 'Bookings',
    empty: 'No bookings yet',
    searchPlaceholder: 'Search bookings…',
    noSpaces: 'No rooms or spaces yet — click "Add Room" to create one.',
    confirmButton: 'Confirm',
    markCompletedButton: 'Mark Completed',
    table: {
      space: 'Space',
      date: 'Date',
      renter: 'Renter / Purpose',
      amount: 'Amount',
      excessIncluded: 'incl. {{hours}}h excess ({{amount}})',
      payment: 'Payment',
      status: 'Status',
      action: 'Action'
    },
    status: {
      reserved: 'Reserved',
      confirmed: 'Confirmed'
    },
    payment: {
      unpaid: 'Unpaid',
      downPayment: 'Down Payment',
      fullyPaid: 'Fully Paid'
    },
    modal: {
      title: 'New Booking',
      editTitle: 'Edit Booking',
      bookButton: 'Book Space',
      addSpaceTitle: 'Add Room / Space',
      editSpaceTitle: 'Edit Room / Space',
      saveSpace: 'Save Room'
    },
    form: {
      space: 'Space',
      selectSpace: 'Select space',
      bookingDate: 'Booking Date',
      startTime: 'Start Time',
      endTime: 'End Time',
      renterName: 'Renter Name / Purpose',
      discount: 'Discount',
      discountNone: 'None',
      discountPwdSenior: 'PWD / Senior Citizen (-20%)',
      discountAmountLabel: 'Discount',
      excessHoursLabel: 'Excess hours ({{hours}}h)',
      requiredDownPayment: 'Required down payment (50%)',
      amountPaid: 'Amount Paid',
      notes: 'Notes',
      image: 'Photo',
      spaceName: 'Room / Space Name',
      description: 'Description',
      category: 'Category',
      categoryRoom: 'Room',
      categoryHall: 'Hall',
      categorySpace: 'Space',
      ratePerDay: 'Rate per Day',
      capacityField: 'Capacity',
      baseHours: 'Base Hours (included in Rate per Day)',
      excessHourlyRate: 'Excess Hourly Rate (per hour beyond Base Hours)',
      excessRateSummary: 'First {{hours}}h included, then {{rate}}/hour'
    },
    toast: {
      validationRequired: 'Space and renter name are required',
      created: 'Booking created',
      updated: 'Booking updated',
      deleted: 'Booking removed',
      confirmed: 'Booking confirmed',
      completed: 'Booking completed',
      nameRequired: 'Room / space name is required',
      spaceAdded: '"{{name}}" added',
      spaceUpdated: '"{{name}}" updated',
      spaceDeleted: '"{{name}}" removed'
    },
    confirmDeleteSpace: {
      title: 'Delete this room/space?',
      message: '"{{name}}" will be removed and will no longer be available for new bookings.'
    },
    confirmDeleteBooking: {
      title: 'Delete this booking?',
      message: 'The booking for "{{name}}" will be permanently removed.'
    },
    confirmStatusChange: {
      confirmTitle: 'Confirm this booking?',
      confirmMessage: 'The booking for "{{name}}" will be marked as confirmed.',
      completeTitle: 'Mark this booking completed?',
      completeMessage: 'The booking for "{{name}}" will be marked as completed.'
    },
    bookingReceipt: {
      title: 'Print Receipt — {{name}}',
      hint: 'Prints the Council’s official receipt for what this renter has paid so far on this booking.',
      lineLabel: 'Rental of {{space}}',
      dateLabel: 'Date',
      payorLabel: 'Received From',
      cashierLabel: 'Received By (acknowledging for the Council)',
      recordAndPrint: 'Record & Print',
      toast: {
        payorRequired: 'Please enter who the payment was received from.'
      }
    }
  },
  visitors: {
    title: 'Visitors Logbook',
    logVisitorButton: 'Log Visitor',
    checkOutButton: 'Check Out',
    empty: 'No visitors logged yet',
    searchPlaceholder: 'Search visitors…',
    table: {
      name: 'Name',
      purpose: 'Purpose',
      host: 'Person / Office to Visit',
      timeIn: 'Time In',
      timeOut: 'Time Out',
      status: 'Status',
      action: 'Action'
    },
    status: {
      checkedIn: 'Checked In',
      checkedOut: 'Checked Out'
    },
    modal: {
      title: 'Log Visitor',
      logButton: 'Log Visitor'
    },
    form: {
      fullName: 'Full Name',
      purpose: 'Purpose of Visit',
      personToVisit: 'Person / Office to Visit',
      contactNumber: 'Contact Number'
    },
    toast: {
      validationRequired: 'Full name, purpose, and person to visit are required',
      logged: 'Visitor logged',
      checkedOut: 'Visitor checked out',
      deleted: 'Visitor log removed'
    },
    confirmDelete: {
      title: 'Delete this visitor log?',
      message: 'The log entry for "{{name}}" will be permanently removed.'
    },
    confirmCheckOut: {
      title: 'Check out this visitor?',
      message: '"{{name}}" will be marked as checked out.'
    }
  },
  announcements: {
    title: 'Announcements',
    newButton: 'New Announcement',
    empty: 'No announcements posted yet',
    postedBy: 'Posted by {{name}} · {{date}}',
    pinButton: 'Pin',
    unpinButton: 'Unpin',
    priority: {
      normal: 'Normal',
      important: 'Important',
      urgent: 'Urgent'
    },
    modal: {
      newTitle: 'New Announcement',
      editTitle: 'Edit Announcement',
      postButton: 'Post'
    },
    form: {
      title: 'Title',
      message: 'Message',
      priority: 'Priority',
      pinned: 'Pin to the top of the Dashboard highlight'
    },
    toast: {
      validationRequired: 'Title and message are required',
      posted: 'Announcement posted',
      updated: 'Announcement updated',
      deleted: 'Announcement removed'
    },
    confirmDelete: {
      title: 'Delete this announcement?',
      message: '"{{title}}" will be permanently removed.'
    }
  },
  budget: {
    title: 'Council Budget',
    fiscalYear: 'Fiscal Year {{year}}',
    addLineButton: 'Add Line',
    newFiscalYearButton: 'New Fiscal Year',
    deleteFiscalYearButton: 'Delete this fiscal year',
    newFiscalYearModal: {
      title: 'Start a New Fiscal Year',
      yearLabel: 'Fiscal Year',
      createButton: 'Create',
      hint: 'Copies every line item from {{year}} into the new year with the same structure — budgeted amounts start at 0 pending board approval, and {{year}}’s figures become the new prior-year reference.'
    },
    incomeTitle: 'Income',
    expensesTitle: 'Expenses',
    summary: {
      income: 'Income',
      expenses: 'Expenses',
      net: 'Net',
      ofBudgeted: 'of {{amount}} budgeted'
    },
    table: {
      budgeted: 'Budgeted',
      actual: 'Actual to Date',
      variance: 'Variance',
      subtotal: 'Sub-total',
      groupTotal: '{{group}} Total',
      addLine: 'Add Line'
    },
    addLineModal: {
      title: 'Add Budget Line',
      lockedSubtitle: 'New line under {{group}} — {{subGroup}}.',
      unlockedSubtitle:
        'Add a new budget line — pick an existing group/subgroup, or type a new one to start it.',
      noSubGroup: '(none)',
      section: 'Section',
      group: 'Group',
      groupPlaceholder: 'e.g. I. OPERATIONS',
      subGroup: 'Subgroup',
      subGroupPlaceholder: 'e.g. A. Fees',
      subGroupHint: 'Leave blank if this group has no further subdivision.',
      name: 'Line Item Name',
      namePlaceholder: 'e.g. 5. New Fee Type',
      budgetedAmount: 'Budgeted Amount',
      createButton: 'Add Line'
    },
    editModal: {
      subtitle: 'Update this line item’s budgeted amount and monthly actuals.',
      budgetedAmount: 'Budgeted Amount',
      monthlyActuals: 'Monthly Actuals',
      totalActual: 'Total Actual',
      useAllLiveData: 'Use all live data',
      liveDataHint:
        'Computed from POS sales, rental bookings, vouchers, or payroll — click to fill in this month',
      source: {
        heading: 'Source',
        hintIncome:
          'All income comes from Membership & Fees (every Troops & Membership registration module, including a Troop\'s own per-member roster payments), Rentals, or NES (Point of Sale) — link this line to whichever of those actually funds it. "Vouchers / Cash Receipts" covers every registration module\'s fee (Troop, Barangay/District Committee, Trefoil Guild, OAVF, ICCG, Honorary/Associate Member). Once you add a rule here, it replaces the built-in default for this line; clearing every rule reverts to that default.',
        hintExpense:
          "Link this line to the vouchers or payroll fields that actually pay for it — useful when a Check Voucher's GL Account text doesn't already match this line's name exactly. Once you add a rule here, it replaces the built-in default for this line; clearing every rule reverts to that default.",
        addRule: 'Add Source',
        empty:
          'No source linked yet — this line stays fully manual unless a built-in default already applies.',
        removeRule: 'Remove this source',
        sourceTypeNotSpecified: 'Not Specified',
        sourceTypeVoucher: 'Vouchers / Cash Receipts',
        sourceTypePos: 'Point of Sale (NES)',
        sourceTypeRental: 'Rentals',
        sourceTypePayroll: 'Payroll',
        voucherCategoriesLabel: 'Which categories count',
        voucherCategoryPlaceholder: 'Type or pick a category…',
        rentalCategoryAny: 'Any rental space',
        payrollFieldPlaceholder: 'Select a payroll field'
      }
    },
    autoSourceHint:
      'This line has a live figure computed from real data — open Edit to review/apply it',
    autoSource: {
      userConfigured: 'Linked to a source you configured — open Edit to review or change it.'
    },
    toast: {
      updated: 'Budget line updated',
      categoryAdded: 'Budget line added',
      categoryDeleted: '"{{name}}" deleted',
      addLineMissingFields: 'Group, name, and a budgeted amount greater than 0 are required',
      fiscalYearRequired: 'Enter a fiscal year label',
      fiscalYearExists: 'That fiscal year already exists',
      noSourceYear: 'No existing fiscal year to copy from',
      fiscalYearCreated: '{{year}} created',
      fiscalYearDeleted: '{{year}} deleted',
      excel: 'Budget exported to Excel',
      pdf: 'Budget exported to PDF',
      word: 'Budget exported to Word'
    },
    confirmDelete: {
      title: 'Delete Budget Line',
      message:
        'Delete "{{name}}"? Its budgeted amount and monthly actuals go with it — this cannot be undone.'
    },
    confirmDeleteYear: {
      title: 'Delete Fiscal Year',
      message:
        'Delete {{year}}? Every budget line for this fiscal year goes with it — this cannot be undone.'
    }
  },
  facilityCalendar: {
    title: 'Facility Calendar',
    todayButton: 'Today',
    summary: {
      bookings: 'Bookings this month',
      visitors: 'Visitors this month'
    },
    moreCount: '+{{count}} more',
    dayModal: {
      bookingsTitle: 'Bookings',
      visitorsTitle: 'Visitors',
      noBookings: 'No bookings this day',
      noVisitors: 'No visitors logged this day'
    }
  },
  vouchers: {
    title: 'Vouchers',
    subtitle: 'Disbursement (Check) & Journal Vouchers',
    newVoucherButton: 'New Voucher',
    editVoucherTitle: 'Edit Voucher',
    searchPlaceholder: 'Search vouchers…',
    type: {
      checkVoucher: 'Disbursement / Check Voucher',
      journalVoucher: 'Journal Voucher'
    },
    actions: {
      approve: 'Approve'
    },
    table: {
      number: 'Voucher #',
      type: 'Type',
      payee: 'Payee',
      particulars: 'Particulars',
      amount: 'Amount',
      date: 'Date',
      status: 'Status',
      orNumber: 'OR No.',
      reimbursement: 'Reimbursement',
      empty: 'No vouchers found',
      exportTooltip: 'Export voucher',
      expenseSummaryTooltip: 'Manage Expense Summary'
    },
    form: {
      voucherType: 'Voucher Type',
      voucherNumber: 'Voucher No.',
      modeOfPayment: 'Mode of Payment',
      modeCash: 'Cash',
      modeCheck: 'Check',
      checkNumber: 'Check Number',
      payee: 'Payee',
      payeePlaceholder: 'Vendor or recipient name',
      payeeAddress: 'Payee Address',
      bankAccount: 'Bank Account',
      bankAccountPlaceholder: 'Select Bank Account (defaults to Cash on Hand)',
      accountLinesLabel: 'Account Titles (Debit)',
      accountLinesLabelCredit: 'Account Titles (Credit)',
      accountPlaceholder: 'Account title, e.g. Office Supplies',
      descriptionPlaceholder: 'Description, e.g. March 16-31, 2026',
      addAccountLine: 'Add Account Line',
      totalAmount: 'Total Amount',
      totalCredit: 'Total Credit',
      particulars: 'Particulars',
      createButton: 'Create Voucher',
      cashAdvanceSection: 'Cash Advance Liquidation (leave blank if not applicable)',
      cashAdvanceSource: 'Liquidates Cash Advance From',
      cashAdvanceSourcePlaceholder: 'Select the Check Voucher that released the cash advance',
      cashAdvanceSourceEmptyHint:
        'No matching Check Voucher found — first create one with a debit line whose Account Title is exactly "Cash Advance".',
      cashAdvanceSourceRequiredHint: 'Select a Cash Advance source above first.',
      cashAdvanceAmount: 'Amount of Cash Advance',
      cashAdvanceDate: 'Cash Advance Dated',
      totalAmountSpent: 'Total Amount Spent',
      amountRefunded: 'Amount Refunded',
      refundOrNumber: 'Refund O.R. No.',
      refundDate: 'Refund Dated',
      cashAdvanceAutoLinesNote:
        'Account lines are generated automatically from the Summary of Expenses once expenses are logged — use the receipt icon on the Vouchers list after saving this voucher.',
      autoCalculatedField: 'Auto-calculated from Summary of Expenses.',
      unbalancedHint:
        'Out of balance — Debit {{debit}} vs Credit {{credit}}. Every voucher must balance: total debits = total credits.'
    },
    toast: {
      missingFields: 'Payee and at least one account line with an amount are required',
      unbalanced:
        'Debit and credit totals don’t match (₱{{debit}} vs ₱{{credit}}) — every entry must balance before it can be saved',
      cashAdvanceSourceRequired:
        'Select which Check Voucher actually released this cash advance before liquidating it',
      created: 'Voucher created',
      updated: 'Voucher updated',
      deleted: 'Voucher deleted',
      statusChanged: '{{number}} marked as {{status}}',
      excelGenerated: 'Excel file generated in the Council’s official format',
      pdfGenerated: 'PDF file generated',
      wordGenerated: 'Word document generated'
    },
    confirmApprove: {
      title: 'Approve Voucher',
      message: 'Approve voucher {{number}}?'
    },
    confirmDelete: {
      title: 'Delete Voucher',
      message: 'Delete voucher {{number}}? This cannot be undone.'
    }
  },
  expenseSummary: {
    title: 'Expense Summary',
    subtitle: 'Itemized receipt backup for voucher {{number}}',
    field: {
      budgetCategory: 'Charge to (Council Budget)',
      budgetCategoryPlaceholder: 'e.g. 6. Trainings',
      date: 'Date',
      particulars: 'Particulars',
      particularsPlaceholder: 'e.g. Cupcakes and Juice',
      orNumber: 'OR No.',
      category: 'Category',
      categoryPlaceholder: 'e.g. Meals and Snacks',
      amount: 'Amount'
    },
    addItem: 'Add Item',
    total: 'Total',
    exportButton: 'Export',
    exportTooltip: 'Export expense summary',
    toast: {
      saved: 'Expense summary saved',
      excelGenerated: 'Excel file generated in the Council’s official format',
      pdfGenerated: 'PDF file generated',
      wordGenerated: 'Word document generated'
    }
  },
  ptdg: {
    title: 'Program & Training Development Grant',
    subtitle:
      'Grant requests to the Regional Office — funded from the Region’s own PTDG allocation, not the Council budget.',
    newButton: 'New Application',
    editButton: 'Edit Application',
    searchPlaceholder: 'Search PTDG applications…',
    filter: {
      all: 'All'
    },
    status: {
      submitted: 'Submitted',
      approved: 'Approved',
      disapproved: 'Disapproved'
    },
    table: {
      number: 'App. #',
      purpose: 'Purpose/Event/Activity',
      eventDate: 'Date of Event',
      amountRequested: 'Amount Requested',
      status: 'Status',
      empty: 'No PTDG applications found',
      exportTooltip: 'Export application'
    },
    actions: {
      recordDecision: 'Record Decision'
    },
    form: {
      purpose: 'Purpose/Event/Activity',
      purposePlaceholder: 'e.g. Regional Committee Meeting',
      eventDate: 'Date of Event/Activity',
      eventDatePlaceholder: 'e.g. September 5, 2026',
      executiveDirector: 'Regional Executive Director',
      executiveDirectorPlaceholder: 'e.g. Juan Dela Cruz',
      projectedSources: 'Projected Sources',
      projectedExpenses: 'Projected Expenses',
      particularsPlaceholder: 'Particulars',
      addLine: 'Add Line',
      subTotal: 'Sub Total',
      total: 'Total',
      amountRequested: 'Amount Requested',
      saveAsDraft: 'Save as Draft',
      submitButton: 'Submit'
    },
    decisionModal: {
      title: 'Record Regional Decision',
      decision: 'Decision',
      approvedAmount: 'Approved Amount',
      remarks: 'Remarks',
      executiveDirector: 'Regional Executive Director',
      executiveDirectorPlaceholder: 'e.g. Juan Dela Cruz',
      saveButton: 'Save Decision'
    },
    toast: {
      missingFields: 'Purpose and date of event are required',
      created: 'PTDG application created',
      updated: 'PTDG application updated',
      deleted: '{{number}} deleted',
      approved: '{{number}} marked as approved',
      disapproved: '{{number}} marked as disapproved',
      excelGenerated: 'Excel file generated',
      pdfGenerated: 'PDF file generated',
      wordGenerated: 'Word document generated'
    },
    confirmDelete: {
      title: 'Delete Application',
      message: 'Delete PTDG application {{number}}? This cannot be undone.'
    }
  },
  councilDeposits: {
    title: 'Council Deposits (RHQ)',
    subtitle:
      'PTDG, MMAF & Josefa Llanes Escoda Memento Fund — Council deposits retained at the Regional Office.',
    notRecordedYet:
      'Not yet recorded — add a snapshot once an accountant encodes the RHQ statement.',
    editButton: 'Edit Figures',
    newButton: 'New Snapshot',
    selectDate: 'As of Date',
    undatedOption: 'Undated',
    noSnapshots: 'No snapshots yet',
    exportTooltip: 'Export report',
    table: {
      fund: 'Council Deposits',
      nationalEvent: 'National Event',
      regionalEvent: 'Regional Event',
      councilEvent: 'Council Event',
      internationalEvent: 'International Event',
      total: 'Total',
      grandTotal: 'TOTAL',
      noBreakdown: '—',
      noFunds: 'No fund lines yet — click Edit Figures to add one.'
    },
    editModal: {
      title: 'Edit Council Deposits',
      newTitle: 'New Council Deposits Snapshot',
      subtitle: 'Re-enter the figures from RHQ’s latest deposits statement.',
      asOfDate: 'As of Date',
      fundNamePlaceholder: 'e.g. PTDG - Girl',
      byEventType: 'By Event Type',
      lumpSum: 'Lump Sum',
      addFund: 'Add Fund Line',
      preparedBy: 'Prepared by',
      notedBy: 'Noted by',
      namePlaceholder: 'Full name',
      titlePlaceholder: 'Position/Title'
    },
    confirmDelete: {
      title: 'Delete Snapshot',
      message: 'This will permanently delete this Council Deposits snapshot. Continue?'
    },
    toast: {
      saved: 'Council Deposits updated',
      deleted: 'Snapshot deleted',
      excelGenerated: 'Excel file generated',
      pdfGenerated: 'PDF file generated',
      wordGenerated: 'Word document generated'
    }
  },
  // Shared "which receipt template, what breakdown" fields — used by both Invoices' Record
  // Payment and Troops & Membership's Record Bulk Payment (see ReceiptFieldsSection).
  receipts: {
    printButton: 'Print Receipt',
    reprintButton: 'Reprint Receipt',
    tabServiceInvoice: 'Service Invoice',
    tabAcknowledgmentReceipt: 'Acknowledgment Receipt',
    typePicker: {
      title: 'Select Receipt Type',
      subtitle: 'Which receipt will you issue for this payment?',
      serviceInvoiceHint:
        'Itemized billing lines — for collections that aren’t a fixed registration fee.',
      acknowledgmentReceiptHint:
        'Fixed Girl/Leader/Committee breakdown — for registration-fee collections.'
    },
    receiptNumber: 'SI/AR Number',
    tin: 'TIN',
    address: 'Address',
    businessStyle: 'Engaged in Business Style of',
    modeOfPayment: 'Mode of Payment',
    othersPlaceholder: 'Others (specify)',
    breakdownTotal: 'Breakdown Total / Target Amount',
    descriptionColumn: 'Particulars',
    amountColumn: 'Amount',
    toast: {
      receiptNumberRequired: 'Please enter the SI/AR number.',
      breakdownRequired: 'Add at least one amount.',
      breakdownMismatch: 'The breakdown total must equal the total amount.',
      printFailed:
        "Receipt was recorded, but couldn't print — check that the printer is connected and configured in Settings"
    },
    // Shared "second, internal receipt for the Council's own retained share" flow — used by
    // every module whose fee has a National-HQ-pass-through/Council-retained-share split
    // (Troops, OAVF/Career Woman, Honorary Member, Associate Member, …). {{label}} is a Troop
    // number, an applicant's name, etc. — whatever that module's own row identifies itself by.
    councilShareReceipt: {
      button: 'Print Council Share Receipt',
      reprintButton: 'Reprint Council Share Receipt',
      title: 'Print Council Share Receipt — {{label}}',
      hint: 'A second, internal receipt for the Council’s own retained share of this fee — the receipt already issued above already covered the full amount collected, so this is not posted as income again.',
      lineLabel: 'Council Share',
      amountLabel: 'Council Share',
      dateLabel: 'Date',
      payorLabel: 'Received From (handed over the council share)',
      cashierLabel: 'Received By (acknowledging for the Council)',
      recordAndPrint: 'Record & Print',
      toast: {
        payorRequired: 'Please enter who handed over the council share.'
      }
    }
  },
  vendors: {
    title: 'Vendors',
    addButton: 'New Vendor',
    modalTitle: 'New Vendor',
    saveButton: 'Save Vendor',
    emptyMessage: 'No vendors found',
    searchPlaceholder: 'Search vendors…',
    validation: {
      nameEmailRequired: 'Name and email are required.'
    },
    toast: {
      added: '{{name}} added to vendors'
    },
    columns: {
      vendor: 'Vendor',
      company: 'Company',
      email: 'Email',
      phone: 'Phone',
      category: 'Category',
      balance: 'Balance',
      status: 'Status'
    },
    form: {
      contactName: 'Contact Name',
      contactNamePlaceholder: 'Contact name',
      company: 'Company',
      companyPlaceholder: 'Company name',
      email: 'Email',
      emailPlaceholder: 'name@company.ph',
      phone: 'Phone',
      phonePlaceholder: '+63 9XX XXX XXXX',
      category: 'Category'
    }
  },
  reports: {
    title: 'Reports',
    tabs: {
      pnl: 'Profit & Loss',
      dailyCollections: 'Daily Collections'
    },
    pnl: {
      chartTitle: 'Income vs Expenses',
      chartSubtitle: 'Last 6 months · cash basis',
      cardTitle: 'Profit & Loss',
      cardSubtitle: 'Cash basis · paid expenses',
      income: 'Income',
      expenses: 'Expenses',
      totalIncome: 'Total Income',
      totalExpenses: 'Total Expenses',
      netIncome: 'Net Income',
      exportLabel: 'Export Income Statement',
      toast: {
        excel: 'Income Statement exported to Excel',
        pdf: 'Income Statement exported as PDF',
        word: 'Income Statement exported as Word document'
      }
    },
    dailyCollections: {
      cardTitle: 'Daily Cash Collection Report',
      cardSubtitle: 'Beginning balance, receipts, and bank deposits for one day',
      rangeSubtitle:
        'Consolidated view across the selected dates — switch to a single day to edit or save.',
      exportLabel: 'Export Daily Collections',
      saved: 'Saved',
      draft: 'Unsaved draft',
      rangeBadge: 'Range (read-only)',
      beginningBalance: 'Beginning Balance',
      addCashReceipts: 'Add: Cash Receipts',
      lessCashDeposit: 'Less: Cash Deposit',
      addLine: 'Add Line',
      addDeposit: 'Add Deposit',
      selectBank: 'Select bank',
      totalCashCollection: 'Total Cash Collection During the Day',
      totalCashOnHand: 'Total Cash on Hand',
      totalDeposited: 'Total Cash Collection Deposit in Bank',
      balanceUndeposited: 'Balance/Undeposited Cash Collection',
      attachments: 'Attachments',
      noAttachments: 'No files attached yet',
      uploadAttachment: 'Attach File',
      saveButton: 'Save Report',
      deleteAttachmentTitle: 'Delete Attachment',
      deleteAttachmentMessage:
        'Are you sure you want to delete "{{name}}"? This will permanently remove the file. This action cannot be undone.',
      table: {
        siNo: 'SI No.',
        receivedFrom: 'Received From',
        amount: 'Amount',
        total: 'Total',
        bank: 'Bank',
        saNo: 'S/A No.',
        purpose: 'Purpose',
        covers: 'Covers',
        coversHint:
          'Date range this deposit represents. Defaults to this day only — widen it when depositing accumulated cash from several undeposited days in one bank trip.'
      },
      walkIn: 'Walk-in',
      toast: {
        saved: 'Daily Collection Report saved',
        attachmentUploaded: 'Attachment uploaded',
        attachmentFailed: 'Failed to upload attachment',
        attachmentDeleted: 'Attachment deleted',
        excel: 'Daily Collection Report exported to Excel',
        pdf: 'Daily Collection Report exported as PDF',
        word: 'Daily Collection Report exported as Word document'
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
    exportJournalLabel: 'Export Journal',
    exportSummaryLabel: 'Export SCRD',
    journalSearchPlaceholder: 'Search journal…',
    emptyReceipts: 'No cash receipts recorded',
    emptyDisbursements: 'No posted/approved disbursement vouchers',
    beginningBalanceLabel: 'Beginning Balance:',
    interestIncomeLabel: 'Interest Income:',
    otherIncomeLabel: 'Other Income:',
    openingBalancesTitle: 'Bank Opening Balances',
    banks: {
      addButton: 'Add Bank',
      addTitle: 'Add Bank Account',
      name: 'Bank Name',
      namePlaceholder: 'e.g. BDO, Cash on Hand',
      accountNumber: 'Account Number',
      accountNumberPlaceholder: 'Optional',
      openingBalance: 'Opening Balance',
      toast: {
        nameRequired: 'Bank name is required',
        added: 'Bank account added',
        deleted: 'Bank account removed'
      },
      confirmDelete: {
        title: 'Delete Bank Account',
        message:
          'Remove "{{name}}" from Bank Opening Balances? Its past Cash Receipts and Voucher entries are not affected.'
      }
    },
    columns: {
      date: 'Date',
      payorPayee: 'Payor / Payee',
      particulars: 'Particulars',
      reference: 'Ref #',
      category: 'Category',
      receiptType: 'Receipt Used',
      bankAccount: 'Bank Account',
      amount: 'Amount'
    },
    summary: {
      beginningBalance: 'Beginning Balance',
      totalReceipts: 'Total Receipts',
      totalDisbursements: 'Total Disbursements',
      endingBalance: 'Ending Balance',
      receiptsByCategory: 'Receipts by Category',
      disbursementsByCategory: 'Disbursements by Category',
      generalOperations: 'A. General Operations',
      nesSales: 'B. National Equipment Service — Sales',
      rentalIncome: 'II. Rental Income',
      interestIncome: 'III. Interest Income',
      otherIncome: 'IV. Other Income',
      otherIncomeManualEntry: 'Other Income (Manual Entry)',
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
      receiptsExcel: 'Cash Receipts Journal exported in the Council’s official format',
      receiptsPdf: 'Cash Receipts Journal exported as PDF',
      receiptsWord: 'Cash Receipts Journal exported as Word document',
      disbursementsExcel: 'Cash Disbursement Journal exported in the Council’s official format',
      disbursementsPdf: 'Cash Disbursement Journal exported as PDF',
      disbursementsWord: 'Cash Disbursement Journal exported as Word document',
      summaryExcel: 'SCRD exported in the Council’s official format',
      summaryPdf: 'SCRD exported as PDF',
      summaryWord: 'SCRD exported as Word document'
    }
  },
  pos: {
    title: 'Point of Sale',
    searchPlaceholder: 'Search product name or SKU…',
    stockLabel: 'Stock: {{count}}',
    noProductsMatch: 'No products match your search.',
    completeSale: 'Complete Sale',
    tabs: {
      register: 'Sell',
      history: 'Sales History'
    },
    history: {
      emptyMessage: 'No sales yet.',
      searchPlaceholder: 'Search sales…',
      itemsCount: '{{count}} item(s)',
      printButton: 'Print',
      voidButton: 'Void',
      deleteButton: 'Delete',
      table: {
        saleNumber: 'Sale #',
        date: 'Date',
        cashier: 'Cashier',
        items: 'Items',
        payment: 'Payment',
        total: 'Total',
        status: 'Status',
        actions: 'Actions'
      },
      status: {
        completed: 'Completed',
        voided: 'Voided'
      },
      voidReasonTooltip: 'Void reason: {{reason}}'
    },
    cart: {
      title: 'Cart ({{count}})',
      empty: 'Cart is empty — scan or click a product to add.',
      memberSearchPlaceholder: 'Search member or type a name…',
      printReceipt: 'Print receipt',
      subtotal: 'Subtotal',
      discount: 'Discount',
      total: 'Total'
    },
    paymentMethods: {
      cash: 'Cash',
      card: 'Card',
      eWallet: 'E-Wallet'
    },
    toast: {
      codeNotFound: 'No product or member found for code "{{code}}"',
      memberScanned: '{{name}} selected — {{rate}}% discount applied',
      cartEmpty: 'Cart is empty',
      saleCompleted: 'Sale {{saleNumber}} completed — {{amount}}',
      silentPrintFailed:
        "Couldn't print the receipt — check that the receipt printer is connected and configured in Settings",
      saleVoided: 'Sale {{saleNumber}} voided — stock restored',
      voidReasonRequired: 'Please enter a reason for voiding this sale',
      saleDeleted: 'Sale {{saleNumber}} deleted'
    },
    modal: {
      saleCompleteTitle: 'Sale Complete — {{saleNumber}}',
      printReceipt: 'Print Receipt',
      paymentReceivedVia: 'Payment received via {{method}}',
      undoSale: 'Undo Sale',
      undoSaleConfirmTitle: 'Undo this sale?',
      undoSaleConfirmMessage:
        'Sale {{saleNumber}} will be voided and the items returned to stock. This cannot be undone.',
      undoSaleReasonLabel: 'Reason for void/refund',
      undoSaleReasonPlaceholder: 'e.g. Wrong item rung up, customer requested refund…',
      deleteSaleConfirmTitle: 'Delete this sale?',
      deleteSaleConfirmMessage:
        'Sale {{saleNumber}} will be permanently deleted. This cannot be undone.'
    }
  },
  products: {
    title: 'Inventory',
    addButton: 'Add Product',
    searchPlaceholder: 'Search products…',
    lowStockAlert: '{{count}} product(s) at or below reorder level: {{names}}',
    restockButton: 'Restock',
    printLabelButton: 'Print Label',
    export: {
      salesReport: 'Sales Report',
      inventoryReport: 'Inventory Report',
      incomeStatement: 'Income Statement'
    },
    period: {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      annually: 'Annually',
      custom: 'Custom Date',
      to: 'to'
    },
    table: {
      emptyMessage: 'No products found',
      image: 'Image',
      skuBarcode: 'SKU / Barcode',
      product: 'Product',
      category: 'Category',
      cost: 'Cost',
      price: 'Price',
      stock: 'Stock',
      status: 'Status'
    },
    form: {
      image: 'Product Image',
      uploadImage: 'Upload Image',
      skuBarcode: 'SKU / Barcode',
      category: 'Category',
      selectCategory: 'Select a category…',
      description: 'Description',
      unit: 'Unit',
      productName: 'Product Name',
      costPrice: 'Cost Price',
      sellingPrice: 'Selling Price',
      stockQuantity: 'Stock Quantity',
      reorderLevel: 'Reorder Level',
      numberOfLabels: 'Number of labels',
      quantityToAdd: 'Quantity to Add',
      unitCost: 'Unit Cost'
    },
    modal: {
      addProductTitle: 'Add Product',
      editProductTitle: 'Edit Product',
      saveProduct: 'Save Product',
      printLabelsTitle: 'Print Barcode Labels — {{name}}',
      preview: 'Preview',
      print: 'Print',
      restockTitle: 'Restock — {{name}}',
      addStock: 'Add Stock',
      currentStockLabel: 'Current stock:',
      units: 'unit(s)'
    },
    confirmDelete: {
      title: 'Delete Product',
      message:
        'Delete {{name}}? This removes it from inventory permanently. Past sales and purchase records referencing it will not be affected. This cannot be undone.'
    },
    toast: {
      skuNameRequired: 'SKU and name are required',
      duplicateSku: 'A product with this SKU already exists',
      productAdded: '{{name}} added to inventory',
      productUpdated: '{{name}} updated',
      deleted: '{{name}} deleted from inventory',
      invalidQuantity: 'Enter a valid quantity',
      restockSuccess: '{{count}} unit(s) of {{name}} added to stock',
      noSalesToReport: 'No sales recorded yet to report',
      salesReportExportedExcel:
        'NES Monthly Sales Report exported in the Council’s official format',
      salesReportExportedPdf: 'NES Monthly Sales Report exported as PDF',
      salesReportExportedWord: 'NES Monthly Sales Report exported as Word document',
      inventoryReportExportedExcel:
        'NES Monthly Inventory Report exported in the Council’s official format',
      inventoryReportExportedPdf: 'NES Monthly Inventory Report exported as PDF',
      inventoryReportExportedWord: 'NES Monthly Inventory Report exported as Word document',
      incomeStatementExportedExcel: 'NES Income Statement auto-computed and exported',
      incomeStatementExportedPdf: 'NES Income Statement exported as PDF',
      incomeStatementExportedWord: 'NES Income Statement exported as Word document'
    }
  },
  members: {
    title: 'Members',
    addButton: 'Add Member',
    printCardButton: 'Print Loyalty Card',
    searchPlaceholder: 'Search members…',
    table: {
      emptyMessage: 'No members found',
      memberCode: 'Member Code',
      name: 'Name',
      email: 'Email',
      discount: 'Discount'
    },
    form: {
      memberCode: 'Member Code',
      name: 'Name',
      email: 'Email',
      discountRate: 'Discount Rate (%)',
      numberOfCards: 'Number of cards'
    },
    modal: {
      addMemberTitle: 'Add Member',
      editMemberTitle: 'Edit Member',
      saveMember: 'Save Member',
      printCardTitle: 'Loyalty Card — {{name}}',
      preview: 'Preview',
      print: 'Print',
      scanHint: 'This barcode can be scanned at the Point of Sale to apply the member’s discount.'
    },
    card: {
      discountLabel: '{{rate}}% Member Discount'
    },
    confirmDelete: {
      title: 'Delete Member',
      message: 'Delete {{name}}? This cannot be undone.'
    },
    toast: {
      codeNameRequired: 'Member code and name are required',
      memberAdded: '{{name}} added as a member',
      memberUpdated: '{{name}} updated',
      memberDeleted: '{{name}} deleted'
    }
  },
  users: {
    title: 'User Accounts',
    addButton: 'Add User',
    emptyState: 'No user accounts found',
    searchPlaceholder: 'Search users…',
    statusDisabled: 'Disabled',
    disable: 'Disable',
    enable: 'Enable',
    table: {
      fullName: 'Full Name',
      email: 'Email',
      role: 'Role',
      status: 'Status',
      action: 'Action'
    },
    rolePermissions: {
      title: 'Role Permissions',
      subtitle: 'Control which modules each role can see and use.',
      permissionsGranted: '{{granted}} / {{total}} permissions granted',
      editButton: 'Edit Permissions',
      baseRoleLabel: 'Base Role',
      baseRoleHint:
        "The custom role is a label plus its own permission checklist here on desktop — but data access (and the mobile app) only understands the 7 built-in roles, so a custom role needs one as its base. A user assigned this role gets the base role's account access, everywhere except this checklist.",
      addRole: {
        button: 'Add Role',
        title: 'Add Role',
        nameLabel: 'Role Name',
        namePlaceholder: 'e.g. Front Desk',
        submitButton: 'Add Role',
        note: 'This role can see and do exactly what you grant it below — check the boxes for every module it should access.',
        errors: {
          required: 'Role name is required',
          invalid: 'Role name must contain at least one letter or number',
          duplicate: 'A role with this name already exists'
        }
      },
      deleteRole: {
        confirmTitle: 'Delete Role',
        confirmMessage: 'Delete the "{{role}}" role? This cannot be undone.',
        success: 'Role "{{role}}" deleted',
        inUse: 'Assigned to {{count}} user(s) — reassign them before deleting this role'
      }
    },
    addModal: {
      title: 'Add User Account',
      fullNameLabel: 'Full Name',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      roleLabel: 'Role',
      createButton: 'Create Account'
    },
    editModal: {
      titleDefault: 'Edit User',
      titleWithName: 'Edit {{fullName}}',
      birthDateLabel: 'Birth Date'
    },
    permissionsModal: {
      titleDefault: 'Role Permissions',
      titleWithRole: '{{role}} Permissions',
      doneButton: 'Done',
      manage: 'Manage',
      selectAll: 'Select All',
      grantedCount: '{{granted}} / {{total}} selected'
    },
    toast: {
      missingFields: 'Full name, email, and password are required',
      fullNameRequired: 'Full name is required',
      userDisabled: 'User "{{fullName}}" disabled',
      userEnabled: 'User "{{fullName}}" enabled',
      toggleActiveFailed: 'Failed to update this account. Please try again.',
      userCreated: 'User "{{fullName}}" created',
      userCreateFailed: 'Failed to create user account. Please try again.',
      roleUpdated: '"{{fullName}}" role updated',
      roleUpdateFailed: 'Failed to update the role. Please try again.',
      fullNameUpdated: '"{{fullName}}" saved',
      fullNameUpdateFailed: 'Failed to save the name. Please try again.'
    },
    confirmDisable: {
      title: 'Disable User Account',
      message: 'Disable "{{fullName}}"? They will not be able to log in until re-enabled.'
    },
    confirmEnable: {
      title: 'Enable User Account',
      message: 'Enable "{{fullName}}"? They will regain access to log in.'
    }
  },
  auditLog: {
    title: 'Audit Log',
    subtitle: '{{count}} event(s) this session',
    emptyMessage:
      'No activity recorded yet this session — actions across the app will appear here.',
    searchPlaceholder: 'Search audit log…',
    table: {
      when: 'When',
      actor: 'Actor',
      entity: 'Entity',
      action: 'Action',
      summary: 'Summary'
    }
  },
  goals: {
    title: 'Goals & Objectives',
    newProgramYearButton: 'New Program Year',
    newProgramYearModal: {
      title: 'Start a New Program Year',
      yearLabel: 'Program Year',
      createButton: 'Create',
      hint: 'Copies every goal and objective from {{year}} into the new year with the same structure — annual targets start at 0 pending council approval, and monthly progress resets to zero.'
    },
    exportLabel: 'Export Report',
    goalLabel: 'Goal {{code}}',
    empty: 'No objectives found',
    noGoals: 'No goals yet. Create your first goal to get started.',
    newGoalButton: 'New Goal',
    editGoalButton: 'Edit Goal',
    deleteGoalButton: 'Delete Goal',
    addObjectiveButton: 'Add Objective',
    editObjectiveButton: 'Edit Objective',
    table: {
      code: 'Code',
      objective: 'Objective',
      annualTarget: 'Annual Target',
      thisMonth: '{{month}} Achieved',
      autoTracked: 'Auto-tracked from Sales',
      achievedToDate: 'Achieved to Date',
      percentAchieved: '% Achieved'
    },
    form: {
      goalCode: 'Goal Code',
      goalTitle: 'Goal Title',
      goalTitlePlaceholder: 'e.g. More Opportunities for More Girls',
      objectiveCode: 'Objective Code',
      objectiveCodePlaceholder: 'e.g. 1.a.1',
      objectiveLabel: 'Objective',
      objectiveLabelPlaceholder: 'e.g. Membership — School-based',
      unit: 'Unit',
      unitCount: 'Count',
      unitPeso: 'Peso (₱)',
      unitPercent: 'Percent (%)'
    },
    confirmDeleteGoal: {
      title: 'Delete Goal',
      message:
        'Are you sure you want to delete "{{title}}"? All of its objectives and progress will be permanently removed.'
    },
    confirmDeleteObjective: {
      title: 'Delete Objective',
      message:
        'Are you sure you want to delete "{{label}}"? Its progress history will be permanently removed.'
    },
    toast: {
      exportedExcel: 'Goals & Objectives report exported to Excel',
      exportedPdf: 'Goals & Objectives report exported as PDF',
      exportedWord: 'Goals & Objectives report exported as Word document',
      missingTitle: 'Goal title is required',
      missingObjectiveFields: 'Objective code and label are required',
      goalCreated: 'Goal created',
      goalUpdated: 'Goal updated',
      goalDeleted: 'Goal deleted',
      objectiveCreated: 'Objective added',
      objectiveUpdated: 'Objective updated',
      objectiveDeleted: 'Objective deleted',
      programYearRequired: 'Enter a program year label',
      programYearExists: 'That program year already exists',
      noSourceYear: 'No existing program year to copy from',
      programYearCreated: '{{year}} created'
    }
  },
  trainingReports: {
    title: 'Training Reports',
    subtitle: 'Per-event training report forms, matching the National HQ template.',
    subtitleFiltered:
      'Per-event training report forms, matching the National HQ template — {{period}}',
    newReportButton: 'New Training Report',
    editButton: 'Edit Training Report',
    exportLabel: 'Export Training Report',
    empty: 'No training reports found',
    searchPlaceholder: 'Search training reports…',
    filters: {
      allYears: 'All Years',
      allMonths: 'All Months'
    },
    table: {
      reportNo: 'Report No.',
      title: 'Title',
      type: 'Type',
      date: 'Date',
      place: 'Place',
      participants: 'Participants'
    },
    types: {
      leaders: "Leaders' Training",
      trainers: "Trainers' Training",
      dfas: "District Field Advisors' (DFAs) Training",
      communityWomen: "Community Women's Training",
      barangayCommittee: 'Training of Barangay GS Committee',
      districtCommittee: 'Training of District Committee',
      councilBoard: 'Training of Council Board Members',
      councilStandingCommittee: 'Training of Council Standing Committee Members',
      regionalCouncilStaff: 'Training of Regional & Council Staff',
      other: 'Other'
    },
    form: {
      sectionBasic: 'Basic Info',
      reportNo: 'Report No.',
      seriesYear: 'Series Year',
      title: 'Title of Training Event',
      titlePlaceholder: 'e.g. Training of District GS Committee',
      place: 'Place of Training Event',
      dateFrom: 'Date From',
      dateTo: 'Date To',
      objectives: 'Objectives of Training',
      oneLineEach: 'One item per line',
      sectionDetails: 'Training Details',
      type: 'Type of Training',
      hoursPerDay: 'Hours per Day',
      totalHours: 'Total Hours',
      participantClassification: 'Classification of Participants',
      participantCount: 'No. of Participants',
      sectionFees: 'Fees',
      feePerParticipant: 'Amount Collected per Participant',
      feeCollectedReserves: 'Amount Collected in Training Reserves',
      feeRemitted: 'Amount Remitted and Enclosed',
      sectionTeam: 'Training Team & Staff',
      trainers: 'Trainers',
      coordinator: 'Coordinator',
      dietician: 'Dietician / QM',
      assistantCoordinators: 'Assistant Coordinators',
      sectionObservations: 'Observations / Recommendations / Suggestions',
      observations: 'Observations',
      sectionParticipants: 'Enclosed List of Participants',
      participantName: 'Name',
      participantSchool: 'School',
      addParticipant: 'Add Participant',
      sectionSubmission: 'Submission',
      submittedByName: 'Submitted By',
      submittedByDesignation: 'Designation',
      submittedDate: 'Date'
    },
    toast: {
      requiredFields: 'Report No. and Title are required',
      created: 'Training report created',
      updated: 'Training report updated',
      deleted: 'Training report deleted',
      exportedExcel: 'Training report exported to Excel',
      exportedPdf: 'Training report exported as PDF',
      exportedWord: 'Training report exported as Word document'
    },
    confirmDelete: {
      title: 'Delete Training Report',
      message: 'Delete "{{title}}"? This cannot be undone.'
    }
  },
  trainingProfiles: {
    title: 'Training Profiles',
    subtitle: 'Council Profile and Training Information for Troop Leaders and Field Advisers',
    newButton: 'New Profile',
    editTitle: 'Edit Profile',
    exportLabel: 'Export Training Profile',
    exportButton: 'Export',
    searchPlaceholder: 'Search by name, school, or district…',
    table: {
      name: 'Name',
      school: 'School',
      district: 'District',
      level: 'Level',
      roles: 'Position/Role',
      contactNumber: 'Contact Number',
      email: 'Email Address',
      homeAddress: 'Home Address',
      completedTrainings: 'Completed Training',
      ageLevelSpecialization: 'Age-Level Specialization',
      completedCertificates: 'Certificate Completed',
      birthday: 'Birthday',
      firstRegistrationDate: 'First Registration Date',
      totalYearsInScouting: 'Total Years in Scouting',
      empty: 'No training profiles found'
    },
    level: {
      elementary: 'Elementary',
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
      name: 'Name (First Name, Middle Initial, Last Name)',
      birthday: 'Birthday',
      school: 'School',
      district: 'District',
      level: 'Level',
      contactNumber: 'Contact Number',
      email: 'Email Address',
      homeAddress: 'Home Address',
      roles: 'Position/Role in the GSP Ilocos Sur Council',
      whichTroop: 'Which Troop',
      whichTroopPlaceholder: 'Select troop',
      troopRole: 'Position on that Troop',
      troopRoleLeader: 'Troop Leader',
      troopRoleAssistant: 'Troop Co-Leader',
      completedTrainings: 'Completed Training',
      otherCompletedTraining: 'Others (please specify)',
      ageLevelSpecialization: 'For Age-Level Specialization Course Completers Only',
      ageLevelSpecializationPlaceholder: 'Select age level',
      completedCertificates: 'Certificate Completed',
      firstRegistrationDate: 'First Registration Date',
      totalYearsInScouting: 'Total Years in Scouting',
      createButton: 'Create Profile'
    },
    toast: {
      missingFields: 'Name, School, and District are required',
      created: 'Training profile created',
      updated: 'Training profile updated',
      deleted: 'Training profile deleted',
      exportedExcel: 'Training profile exported to Excel',
      exportedPdf: 'Training profile exported as PDF',
      exportedWord: 'Training profile exported as Word document',
      noneToExport: 'No training profiles to export',
      listExportedExcel: 'Training profiles exported to Excel',
      listExportedPdf: 'Training profiles exported as PDF',
      listExportedWord: 'Training profiles exported as Word document'
    },
    confirmDelete: {
      title: 'Delete Training Profile',
      message: 'Delete the training profile for {{name}}? This cannot be undone.'
    }
  },
  programReports: {
    title: 'Program Reports',
    subtitle:
      'Monthly Badgework, Troop Camps, Improved Image, and International Affairs detail — {{month}} {{year}}',
    empty: 'No line items found',
    editLineItem: {
      title: 'Edit Line Item'
    },
    exportLabel: 'Export Section',
    editHeader: {
      button: 'Edit Header',
      title: 'Edit Report Header',
      subtitle: 'Applies only to {{month}} {{year}} — other months/years keep their own header.',
      reportTitle: 'Report Title',
      goalHeading: 'Goal Heading'
    },
    table: {
      code: 'Code',
      label: 'Line Item',
      thisMonth: '{{month}}',
      breakdownTotal: '{{count}} total',
      logEntries: '{{count}} entries'
    },
    sections: {
      badgework: 'Badgework',
      troopCamps: 'Troop Camps & Activities',
      improvedImage: 'Improved Image',
      intlAffairs: 'International Affairs'
    },
    shapes: {
      count: 'Monthly Count',
      ageLevelBreakdown: 'Monthly Count by Age Level',
      categoryAgeLevelBreakdown: 'Monthly Count by Category & Age Level',
      log: 'Dated Log'
    },
    form: {
      code: 'Code',
      label: 'Label',
      shape: 'Tracking Type',
      scope: 'Reporting Level',
      district: 'District'
    },
    scopes: {
      council: 'Council-wide',
      district: 'Per District'
    },
    breakdownModal: {
      subtitle: '{{month}} — count by age level',
      districtPlaceholder: 'District name',
      addDistrict: 'Add District',
      ageLevelPlaceholder: 'Age level name',
      addAgeLevel: 'Add Age Level',
      councilTotal: 'Council Total',
      confirmDeleteDistrict: {
        title: 'Delete District',
        message:
          'Delete "{{district}}"? All of its tracked progress for this line item will be permanently removed.'
      },
      confirmDeleteAgeLevel: {
        title: 'Delete Age Level',
        message:
          'Delete "{{ageLevel}}"? All of its tracked progress for this line item will be permanently removed.'
      }
    },
    categoryBreakdownModal: {
      subtitle: '{{month}} — count by category & age level',
      grandTotal: 'Grand Total'
    },
    goalMetrics: {
      population: 'Total No. of Girls',
      earned: 'Girls Earned Badges',
      targetLabel: 'Monthly Target',
      targetPlaceholder: 'e.g. 25',
      awardedAgainstGoalLabel: 'Total No. of Badges Awarded Against Goal',
      earnedThisMonth: '{{count}} earned this month',
      againstGoal: '{{percent}}% against goal'
    },
    logModal: {
      descriptionPlaceholder: 'Description',
      quantityPlaceholder: 'Qty (optional)',
      addEntry: 'Add Entry',
      entries: 'Entries',
      empty: 'No entries yet'
    },
    toast: {
      exportedExcel: 'Section exported to Excel',
      exportedPdf: 'Section exported as PDF',
      exportedWord: 'Section exported as Word document',
      headerSaved: 'Report header updated'
    }
  }
} as const

export default en
export type Translations = typeof en

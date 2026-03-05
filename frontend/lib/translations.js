const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    orders: "Orders",
    inventory: "Inventory",
    customers: "Customers",
    schedule: "Schedule",
    reports: "Reports",
    compliance: "Compliance",
    quality: "Quality Control",
    settings: "Settings",
    logout: "Logout",
    
    // Dashboard
    totalOrders: "Total Orders",
    pendingOrders: "Pending Orders",
    inProgress: "In Progress",
    delivered: "Delivered",
    todayOrders: "Today's Orders",
    todayRevenue: "Today's Revenue",
    totalRevenue: "Total Revenue",
    totalCustomers: "Total Customers",
    lowStock: "Low Stock Alerts",
    recentOrders: "Recent Orders",
    weeklyRevenue: "Weekly Revenue",
    
    // Orders
    orderNumber: "Order Number",
    customer: "Customer",
    status: "Status",
    priority: "Priority",
    pickupDate: "Pickup Date",
    deliveryDate: "Delivery Date",
    weight: "Weight (kg)",
    totalCost: "Total Cost",
    specialInstructions: "Special Instructions",
    createOrder: "Create Order",
    updateStatus: "Update Status",
    
    // Status labels
    pending: "Pending",
    picked_up: "Picked Up",
    washing: "Washing",
    drying: "Drying",
    folding: "Folding",
    quality_check: "Quality Check",
    ready: "Ready",
    cancelled: "Cancelled",
    
    // Priority
    normal: "Normal",
    high: "High",
    urgent: "Urgent",
    
    // Inventory
    itemName: "Item Name",
    category: "Category",
    quantity: "Quantity",
    minQuantity: "Min Quantity",
    rfidTag: "RFID Tag",
    condition: "Condition",
    addItem: "Add Item",
    
    // Customers
    name: "Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    type: "Type",
    addCustomer: "Add Customer",
    
    // Schedule
    title: "Title",
    scheduleType: "Schedule Type",
    scheduledAt: "Scheduled At",
    assignedTo: "Assigned To",
    createSchedule: "Create Schedule",
    
    // Quality
    temperature: "Temperature (°C)",
    detergent: "Detergent Used",
    washCycle: "Wash Cycle",
    result: "Result",
    pass: "Pass",
    fail: "Fail",
    reprocess: "Reprocess",
    addQCRecord: "Add QC Record",
    
    // Common
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    search: "Search...",
    loading: "Loading...",
    noData: "No data found",
    actions: "Actions",
    notes: "Notes",
    createdAt: "Created At",
    all: "All",
    filter: "Filter",
    exportReport: "Export Report",
    
    // Auth
    login: "Login",
    emailAddress: "Email Address",
    password: "Password",
    signIn: "Sign In",
    loginTitle: "Laundry Management System",
    loginSubtitle: "Sign in to manage your operations",
    
    // Categories
    linen: "Linen",
    uniform: "Uniform",
    towel: "Towel",
    healthcare: "Healthcare",
    other: "Other",
    
    // Wash types
    standard: "Standard",
    delicate: "Delicate",
    heavy: "Heavy Duty",
    sanitize: "Sanitize",
    dry_clean: "Dry Clean",
    
    // KPIs
    avgTurnaround: "Avg. Turnaround (hrs)",
    avgCostPerKg: "Avg. Cost Per Kg",
    completionRate: "Completion Rate",
    totalWeight: "Total Weight Processed",
    topCustomers: "Top Customers",
    
    // Compliance
    auditTrail: "Audit Trail",
    action: "Action",
    description: "Description",
    performedBy: "Performed By",
    
    appName: "LaundryPro",
    appTagline: "Professional Laundry Management"
  },
  km: {
    // Navigation
    dashboard: "ផ្ទាំងគ្រប់គ្រង",
    orders: "កម្មង់",
    inventory: "សារពើភ័ណ្ឌ",
    customers: "អតិថិជន",
    schedule: "កាលវិភាគ",
    reports: "របាយការណ៍",
    compliance: "ការអនុលោម",
    quality: "ការត្រួតពិនិត្យគុណភាព",
    settings: "ការកំណត់",
    logout: "ចាកចេញ",
    
    // Dashboard
    totalOrders: "កម្មង់សរុប",
    pendingOrders: "កម្មង់រង់ចាំ",
    inProgress: "កំពុងដំណើរការ",
    delivered: "បានដឹកជញ្ជូន",
    todayOrders: "កម្មង់ថ្ងៃនេះ",
    todayRevenue: "ចំណូលថ្ងៃនេះ",
    totalRevenue: "ចំណូលសរុប",
    totalCustomers: "អតិថិជនសរុប",
    lowStock: "ការជូនដំណឹងស្តុកទាប",
    recentOrders: "កម្មង់ថ្មីៗ",
    weeklyRevenue: "ចំណូលប្រចាំសប្តាហ៍",
    
    // Orders
    orderNumber: "លេខកម្មង់",
    customer: "អតិថិជន",
    status: "ស្ថានភាព",
    priority: "អាទិភាព",
    pickupDate: "កាលបរិច្ឆេទទទួល",
    deliveryDate: "កាលបរិច្ឆេទដឹក",
    weight: "ទម្ងន់ (គីឡូ)",
    totalCost: "តម្លៃសរុប",
    specialInstructions: "សេចក្តីណែនាំពិសេស",
    createOrder: "បង្កើតកម្មង់",
    updateStatus: "ធ្វើបច្ចុប្បន្នភាពស្ថានភាព",
    
    // Status labels
    pending: "រង់ចាំ",
    picked_up: "បានទទួល",
    washing: "កំពុងបោក",
    drying: "កំពុងស្តក",
    folding: "កំពុងបត់",
    quality_check: "ត្រួតពិនិត្យ",
    ready: "រួចរាល់",
    cancelled: "បានលុប",
    
    // Priority
    normal: "ធម្មតា",
    high: "ខ្ពស់",
    urgent: "បន្ទាន់",
    
    // Inventory
    itemName: "ឈ្មោះទំនិញ",
    category: "ប្រភេទ",
    quantity: "បរិមាណ",
    minQuantity: "បរិមាណអប្បបរមា",
    rfidTag: "ស្លាក RFID",
    condition: "ស្ថានភាព",
    addItem: "បន្ថែមទំនិញ",
    
    // Customers
    name: "ឈ្មោះ",
    email: "អ៊ីមែល",
    phone: "ទូរស័ព្ទ",
    address: "អាសយដ្ឋាន",
    type: "ប្រភេទ",
    addCustomer: "បន្ថែមអតិថិជន",
    
    // Schedule
    title: "ចំណងជើង",
    scheduleType: "ប្រភេទកាលវិភាគ",
    scheduledAt: "កំណត់ពេល",
    assignedTo: "ចាត់ឱ្យ",
    createSchedule: "បង្កើតកាលវិភាគ",
    
    // Quality
    temperature: "សីតុណ្ហភាព (°C)",
    detergent: "សាប៊ូប្រើ",
    washCycle: "វដ្តបោក",
    result: "លទ្ធផល",
    pass: "ឆ្លង",
    fail: "បរាជ័យ",
    reprocess: "ដំណើរការឡើងវិញ",
    addQCRecord: "បន្ថែមកំណត់ត្រា QC",
    
    // Common
    save: "រក្សាទុក",
    cancel: "បោះបង់",
    edit: "កែប្រែ",
    delete: "លុប",
    search: "ស្វែងរក...",
    loading: "កំពុងផ្ទុក...",
    noData: "រកមិនឃើញទិន្នន័យ",
    actions: "សកម្មភាព",
    notes: "កំណត់ចំណាំ",
    createdAt: "បង្កើតនៅ",
    all: "ទាំងអស់",
    filter: "តម្រង",
    exportReport: "នាំចេញរបាយការណ៍",
    
    // Auth
    login: "ចូល",
    emailAddress: "អាសយដ្ឋានអ៊ីមែល",
    password: "ពាក្យសម្ងាត់",
    signIn: "ចូលប្រើ",
    loginTitle: "ប្រព័ន្ធគ្រប់គ្រងបោកគក់",
    loginSubtitle: "ចូលដើម្បីគ្រប់គ្រងប្រតិបត្តិការ",
    
    // Categories
    linen: "ក្រណាត់",
    uniform: "យុទ្ធភូមិ",
    towel: "កន្សែង",
    healthcare: "សុខភាព",
    other: "ផ្សេងៗ",
    
    // Wash types
    standard: "ស្តង់ដារ",
    delicate: "ស្រាល",
    heavy: "ធ្ងន់",
    sanitize: "សម្លាប់មេរោគ",
    dry_clean: "ហាត់ស្ងួត",
    
    // KPIs
    avgTurnaround: "ពេលវេលាជាមធ្យម (ម៉ោង)",
    avgCostPerKg: "តម្លៃជាមធ្យមក្នុង ១គីឡូ",
    completionRate: "អត្រាបញ្ចប់",
    totalWeight: "ទម្ងន់សរុបបានដំណើរការ",
    topCustomers: "អតិថិជនកំពូល",
    
    // Compliance
    auditTrail: "ដំណើរការត្រួតពិនិត្យ",
    action: "សកម្មភាព",
    description: "ការពិពណ៌នា",
    performedBy: "អ្នកបំពេញ",
    
    appName: "LaundryPro",
    appTagline: "ប្រព័ន្ធគ្រប់គ្រងបោកគក់វិជ្ជាជីវៈ"
  }
};

export default translations;

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, ChevronUp, CircleCheck, CirclePlus, FileText, Folder, FolderOpen, FolderPlus, Home as HomeIcon, Languages, Mail, MessageCircle, MessageSquare, Pencil, Search, Send, Settings, Trash2, Users, WalletCards, X } from 'lucide-react';

type Student = { id: string; name: string; phone: string; level: string; gmail?: string; fatherName?: string };
type StudentGroup = { id: string; name: string; students: Student[] };
type PaymentEntry = { amount: number; date: string };
type PriceItem = Student & { price: number; originalPrice?: number; totalPaid?: number; paymentHistory?: Array<PaymentEntry | number> };
type RecordItem = { id: string; name: string; createdAt: string; students: PriceItem[] };
type Step = 'name' | 'students' | 'pricing' | 'review';
type PaymentRow = PriceItem & { originalPrice: number; totalPaid: number; paymentHistory: PaymentEntry[]; remainingAmount: number; isPaid: boolean };

const defaultStudents: Student[] = [
  { id: 'STD-26001', name: 'Abdul Karim Lamongan', phone: '62 857-0614-8175', level: 'Tsaniy' },
  { id: 'STD-26002', name: 'Abdul Halim', phone: '0823-3600-4405', level: 'Tsaniy' },
  { id: 'STD-26003', name: 'Muhammad Izzul Fadli', phone: '0877-6408-3464', level: 'Tsaniy' },
  { id: 'STD-26004', name: 'Muhammad Amin', phone: '0882-9069-0773', level: 'Tsaniy' },
  { id: 'STD-26005', name: 'Muhammad Ihsanuddin Luthfi', phone: '62 838-1711-0434', level: 'Tsaniy' },
  { id: 'STD-26006', name: 'Muhammad Ismail Utsman Zain', phone: '62 852-0350-9208', level: 'Tsaniy' },
  { id: 'STD-26007', name: 'Muhammad Nur Saif', phone: '62 819-0818-1326', level: 'Tsaniy' },
  { id: 'STD-26008', name: 'Zaki Khasanul Arfan', phone: '0823-3772-8536', level: 'Tsaniy' },
  { id: 'STD-26009', name: 'Zulfiqor Baehaqi', phone: '0882-3143-0846', level: 'Tsaniy' },
  { id: 'STD-26010', name: 'Ahsin Kama', phone: '0812-1190-165', level: 'Awwal' },
  { id: 'STD-26011', name: 'Ali Zainal Abidin Iskandar', phone: '62 858-6316-6043', level: 'Awwal' },
  { id: 'STD-26012', name: 'Hamid', phone: '0851-7334-2219', level: 'Awwal' },
  { id: 'STD-26013', name: 'Jovansyah Raiza Al Jabbar Damario', phone: '62 896-4989-8080', level: 'Awwal' },
  { id: 'STD-26014', name: 'Kenzo Bintang Atarahman Damario', phone: '62 896-4989-8080', level: 'Awwal' },
  { id: 'STD-26015', name: 'Mohammad Al Azzamul Kheir', phone: '0852-6590-7210', level: 'Awwal' },
  { id: 'STD-26016', name: 'Muhamad Najih Husein', phone: '62 857-7729-9966', level: 'Awwal' },
  { id: 'STD-26017', name: 'Muhammad Abyan Syafiq', phone: '0857-9703-4983', level: 'Awwal' },
  { id: 'STD-26018', name: 'Muhammad Aufa Rakha Akbar', phone: '0822-6863-3457', level: 'Awwal' },
  { id: 'STD-26019', name: 'Muhammad Azmi Mubarok', phone: '0877-8235-8998', level: 'Awwal' },
  { id: 'STD-26020', name: 'Muhammad Ibnu Hibban', phone: '0855-9153-6049', level: 'Awwal' },
  { id: 'STD-26021', name: 'Muhammad Kholil', phone: '0831-9074-0184', level: 'Awwal' },
  { id: 'STD-26022', name: 'Muhammad Syamsul Arsyad', phone: '0812-9327-399', level: 'Awwal' },
  { id: 'STD-26023', name: 'Muhammad Umair Al Ghozi', phone: '0812-1015-1490', level: 'Awwal' },
  { id: 'STD-26024', name: 'Muhammad Yuusuf Abdurrahman', phone: '0812-8748-0254', level: 'Awwal' },
  { id: 'STD-26025', name: 'Muhammad Ziyadatul Khoir', phone: '0812-9920-907', level: 'Awwal' },
  { id: 'STD-26026', name: 'Zaim Ahmad Wafy', phone: '0852-8323-2785', level: 'Awwal' },
  { id: 'STD-26027', name: 'Zanki Hamizan Radlan', phone: '0858-8340-1644', level: 'Awwal' },
  { id: 'STD-26028', name: 'Zayan Shadra Avasa', phone: '62 813-1058-5357', level: 'Awwal' },
  { id: 'STD-26029', name: 'Muhammad Usamah', phone: '0895-2477-9349', level: 'Awwal' },
  { id: 'STD-26030', name: "Muhammad 'Atiqur Rohman", phone: '0821-7360-6830', level: 'Awwal' },
];

const groupsStorageKey = 'student-pricing-groups';
const readGroups = (): StudentGroup[] => {
  try {
    const raw = localStorage.getItem(groupsStorageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  const initial: StudentGroup[] = [
    { id: 'grp-tsaniy', name: 'Tsaniy', students: defaultStudents.filter((s) => s.level === 'Tsaniy') },
    { id: 'grp-awwal', name: 'Awwal', students: defaultStudents.filter((s) => s.level === 'Awwal') },
  ];
  try {
    localStorage.setItem(groupsStorageKey, JSON.stringify(initial));
  } catch {}
  return initial;
};

const saveGroups = (groups: StudentGroup[]) => {
  try {
    localStorage.setItem(groupsStorageKey, JSON.stringify(groups));
  } catch {}
};

const readAllStudents = (): Student[] => {
  const groups = readGroups();
  const all: Student[] = [];
  const seen = new Set<string>();
  for (const g of groups) {
    for (const s of g.students) {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        all.push({ ...s, level: g.name });
      }
    }
  }
  return all.length > 0 ? all : defaultStudents;
};

const generateStudentId = (groups: StudentGroup[]) => {
  let max = 26030;
  for (const g of groups) {
    for (const s of g.students) {
      const match = s.id.match(/^STD-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > max) max = num;
      }
    }
  }
  return `STD-${max + 1}`;
};

const currency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
const rosterVersion = 'students-26001-26030';
const readRecords = (): RecordItem[] => {
  try {
    if (localStorage.getItem('student-pricing-roster-version') !== rosterVersion) {
      localStorage.removeItem('student-pricing-records');
      localStorage.setItem('student-pricing-roster-version', rosterVersion);
      return [];
    }
    return JSON.parse(localStorage.getItem('student-pricing-records') || '[]');
  } catch { return []; }
};
const saveRecords = (items: RecordItem[]) => localStorage.setItem('student-pricing-records', JSON.stringify(items));
type Language = 'id' | 'en';
const languageKey = 'student-pricing-language';
const translations: Record<Language, Record<string, string>> = {
  id: {
    appName: 'Arsip biaya', schoolAdmin: 'Administrasi sekolah', workspace: 'Ruang kerja · 2024/25', settings: 'Pengaturan',
    savedRecords: 'Catatan tersimpan', studentPrices: 'Harga siswa', homeDescription: 'Buat dan simpan daftar harga siswa dalam beberapa langkah.',
    createRecord: 'Buat catatan', emptyRecords: 'Belum ada catatan', emptyRecordsDescription: 'Catatan harga yang dibuat akan muncul di sini.',
    createFirstRecord: 'Buat catatan pertama', record: 'Catatan', students: 'Siswa', total: 'Total', edit: 'Edit', delete: 'Hapus',
    back: 'Kembali', backToRecords: 'Kembali ke catatan', paymentDashboard: 'Dashboard pembayaran', searchStudent: 'Cari nomor atau nama siswa',
    filter: 'Filter', lowToHigh: 'Rendah → tinggi', highToLow: 'Tinggi → rendah', paid: 'Sudah bayar', unpaid: 'Belum bayar', remaining: 'Sisa',
    payment: 'Pembayaran', payAll: 'Bayar semua', confirm: 'Konfirmasi', confirmPayRemaining: 'Bayar seluruh sisa pembayaran?', whatsapp: 'WhatsApp',
    paidStatus: 'Sudah bayar', history: 'Riwayat', paymentTotal: 'Pembayaran', paymentNumber: 'Pembayaran', date: 'Tanggal', noStudents: 'Siswa tidak ditemukan.',
    amountRequired: 'Masukkan jumlah pembayaran.', maxAmount: 'Maksimal', cancel: 'Batal', save: 'Simpan',
    settingsDescription: 'Atur bahasa yang digunakan di aplikasi.', language: 'Bahasa', chooseLanguage: 'Pilih bahasa tampilan',
    indonesian: 'Bahasa Indonesia', english: 'English', languageSaved: 'Perubahan bahasa tersimpan otomatis.',
    stepName: 'Nama', stepStudents: 'Siswa', stepPrice: 'Harga', stepReview: 'Tinjau',
    stepLabel: 'Langkah', recordNameTitle: 'Beri nama catatan', recordNameDescription: 'Gunakan nama yang mudah ditemukan kembali.',
    recordNameLabel: 'Nama catatan', recordNamePlaceholder: 'Contoh: SPP Semester Ganjil', next: 'Lanjut',
    chooseStudentsTitle: 'Pilih siswa', chooseStudentsDescription: 'Tentukan siswa yang masuk dalam catatan ini.',
    all: 'Semua', chooseOwn: 'Pilih sendiri', selected: 'dipilih', selectAll: 'Pilih semua', deselectAll: 'Batalkan semua',
    noSelection: 'Pilih setidaknya satu siswa untuk melanjutkan.', setPriceTitle: 'Atur harga',
    setPriceDescription: 'Satu harga untuk semua, atau atur satu per satu.', onePrice: 'Satu harga', differentPrices: 'Harga berbeda',
    pricePerStudent: 'Harga per siswa', inspectTitle: 'Periksa catatan', inspectDescription: 'Pastikan semua detail sudah sesuai.',
    recordDetails: 'Rincian siswa', saveChanges: 'Simpan perubahan', saveRecord: 'Simpan catatan',
    studentManager: 'Student Manager', studentManagerDesc: 'Kelola grup dan daftar siswa dengan nomor WhatsApp dan akun Gmail.',
    addGroup: 'Tambah grup', createGroup: 'Buat grup baru', newGroup: 'Grup baru', groupName: 'Nama grup',
    groupNamePlaceholder: 'Contoh: Tsaniy, Awwal, atau Kelas A', addStudent: 'Tambah siswa', studentName: 'Nama siswa',
    studentNamePlaceholder: 'Nama lengkap siswa', phoneNumber: 'Nomor telepon', phoneNumberPlaceholder: 'Contoh: 0812-3456-7890',
    gmail: 'Gmail', gmailOptional: 'Gmail (opsional)', gmailPlaceholder: 'nama@gmail.com', noGroups: 'Belum ada grup siswa',
    noGroupsDesc: 'Buat grup baru untuk mulai menambahkan dan mengelompokkan siswa.', createFirstGroup: 'Buat grup pertama',
    noStudentsInGroup: 'Belum ada siswa di grup ini.', deleteGroup: 'Hapus grup', deleteStudent: 'Hapus siswa',
    confirmDeleteGroup: 'Hapus grup ini?', groupStudentsCount: 'siswa', totalGroups: 'Total grup', totalStudents: 'Total siswa',
    namePhoneRequired: 'Nama dan nomor telepon wajib diisi.', searchManager: 'Cari nama, nomor telepon, atau Gmail...',
    groupManager: 'Group Manager', allStudentsTab: 'Semua Siswa', groupsOverview: 'Daftar Grup',
    backToGroups: 'Kembali ke Daftar Grup', openGroup: 'Buka Grup', navStudentManager: 'Student Manager',
    filterByGroup: 'Filter Grup', allGroups: 'Semua Siswa', allGroupOption: 'Semua Grup', selectGroup: 'Pilih Grup',
    readyMessage: 'Pesan Siap Pakai', readyMessageDesc: 'Atur pesan otomatis yang akan dikirim saat tombol WhatsApp diklik.',
    enableReadyMessage: 'Aktifkan Pesan Siap Pakai', readyMessageText: 'Isi Pesan Siap Pakai',
    readyMessagePlaceholder: 'Tulis pesan di sini. Contoh: Yth. Bapak/Ibu {father_name}, ini pemberitahuan untuk siswa ananda {son_name}...',
    saveMessage: 'Simpan Pesan', readyMessageSaved: 'Pesan siap pakai berhasil disimpan.',
    sendAutoMessage: 'Kirim pesan otomatis', sendOther: 'Lainnya (tanpa pesan)', chooseSendMode: 'Pilih cara kirim WhatsApp',
    sendTo: 'Kirim ke',
    insertVariables: 'Sisipkan variabel:',
    varSonName: '{son_name}', varSonNameLabel: 'Nama Siswa / Anak',
    varFatherName: '{father_name}', varFatherNameLabel: 'Nama Wali / Ayah',
    varPhone: '{phone}', varPhoneLabel: 'Nomor Telepon',
    varGroup: '{group}', varGroupLabel: 'Grup / Kelas',
    previewMessage: 'Pratinjau Pesan:',
    fatherNameOptional: 'Nama Wali / Ayah (opsional)',
    fatherNamePlaceholder: 'Misal: Bapak Fauzi',
    guardian: 'Wali',
    home: 'Beranda',
  },
  en: {
    appName: 'Cost archive', schoolAdmin: 'School administration', workspace: 'Workspace · 2024/25', settings: 'Settings',
    savedRecords: 'Saved records', studentPrices: 'Student prices', homeDescription: 'Create and save student price lists in a few steps.',
    createRecord: 'Create record', emptyRecords: 'No records yet', emptyRecordsDescription: 'Your saved price records will appear here.',
    createFirstRecord: 'Create your first record', record: 'Record', students: 'Students', total: 'Total', edit: 'Edit', delete: 'Delete',
    back: 'Back', backToRecords: 'Back to records', paymentDashboard: 'Payment dashboard', searchStudent: 'Search student number or name',
    filter: 'Filter', lowToHigh: 'Low → high', highToLow: 'High → low', paid: 'Paid', unpaid: 'Not paid', remaining: 'Remaining',
    payment: 'Payment', payAll: 'Pay all', confirm: 'Confirm', confirmPayRemaining: 'Pay the full remaining balance?', whatsapp: 'WhatsApp',
    paidStatus: 'Paid', history: 'History', paymentTotal: 'Payments', paymentNumber: 'Payment', date: 'Date', noStudents: 'No students found.',
    amountRequired: 'Enter a payment amount.', maxAmount: 'Maximum', cancel: 'Cancel', save: 'Save',
    settingsDescription: 'Choose the language and messaging preferences used in the app.', language: 'Language', chooseLanguage: 'Choose display language',
    indonesian: 'Bahasa Indonesia', english: 'English', languageSaved: 'Language changes are saved automatically.',
    stepName: 'Name', stepStudents: 'Students', stepPrice: 'Price', stepReview: 'Review',
    stepLabel: 'Step', recordNameTitle: 'Name your record', recordNameDescription: 'Use a name that will be easy to find later.',
    recordNameLabel: 'Record name', recordNamePlaceholder: 'Example: Fall semester tuition', next: 'Next',
    chooseStudentsTitle: 'Choose students', chooseStudentsDescription: 'Select the students included in this record.',
    all: 'All', chooseOwn: 'Choose manually', selected: 'selected', selectAll: 'Select all', deselectAll: 'Deselect all',
    noSelection: 'Select at least one student to continue.', setPriceTitle: 'Set prices',
    setPriceDescription: 'Use one price for everyone, or set prices individually.', onePrice: 'One price', differentPrices: 'Different prices',
    pricePerStudent: 'Price per student', inspectTitle: 'Review record', inspectDescription: 'Make sure all details are correct.',
    recordDetails: 'Student details', saveChanges: 'Save changes', saveRecord: 'Save record',
    studentManager: 'Student Manager', studentManagerDesc: 'Manage student groups and rosters with WhatsApp phone and Gmail contact info.',
    addGroup: 'Add group', createGroup: 'Create new group', newGroup: 'New group', groupName: 'Group name',
    groupNamePlaceholder: 'Example: Tsaniy, Awwal, or Class A', addStudent: 'Add student', studentName: 'Student name',
    studentNamePlaceholder: 'Full student name', phoneNumber: 'Phone number', phoneNumberPlaceholder: 'Example: 0812-3456-7890',
    gmail: 'Gmail', gmailOptional: 'Gmail (optional)', gmailPlaceholder: 'name@gmail.com', noGroups: 'No student groups yet',
    noGroupsDesc: 'Create a new group to start organizing and adding students.', createFirstGroup: 'Create first group',
    noStudentsInGroup: 'No students in this group yet.', deleteGroup: 'Delete group', deleteStudent: 'Delete student',
    confirmDeleteGroup: 'Delete this group?', groupStudentsCount: 'students', totalGroups: 'Total groups', totalStudents: 'Total students',
    namePhoneRequired: 'Student name and phone number are required.', searchManager: 'Search student name, phone number, or Gmail...',
    groupManager: 'Group Manager', allStudentsTab: 'All Students', groupsOverview: 'Groups Overview',
    backToGroups: 'Back to Groups', openGroup: 'Open Group', navStudentManager: 'Student Manager',
    filterByGroup: 'Filter Group', allGroups: 'All Students', allGroupOption: 'All Groups', selectGroup: 'Select Group',
    readyMessage: 'Ready Message', readyMessageDesc: 'Configure an automated message to send whenever a WhatsApp button is clicked.',
    enableReadyMessage: 'Enable Ready Message', readyMessageText: 'Ready Message Content',
    readyMessagePlaceholder: 'Write your message here. E.g.: Dear Mr./Mrs. {father_name}, regarding student {son_name}...',
    saveMessage: 'Save Message', readyMessageSaved: 'Ready message saved successfully.',
    sendAutoMessage: 'Send auto message', sendOther: 'Other (blank chat)', chooseSendMode: 'Choose WhatsApp Option',
    sendTo: 'Send to',
    insertVariables: 'Insert variables:',
    varSonName: '{son_name}', varSonNameLabel: 'Student / Son Name',
    varFatherName: '{father_name}', varFatherNameLabel: 'Guardian / Father Name',
    varPhone: '{phone}', varPhoneLabel: 'Phone Number',
    varGroup: '{group}', varGroupLabel: 'Group / Level',
    previewMessage: 'Message Preview:',
    fatherNameOptional: 'Guardian / Father name (optional)',
    fatherNamePlaceholder: 'E.g. Mr. Fauzi',
    guardian: 'Guardian',
    home: 'Home',
  },
};
const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void; t: (key: string) => string } | null>(null);
function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => localStorage.getItem(languageKey) === 'en' ? 'en' : 'id');
  const setLanguage = (next: Language) => { setLanguageState(next); localStorage.setItem(languageKey, next); };
  const t = (key: string) => translations[language][key] || translations.id[key] || key;
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}
function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}

type WhatsAppPromptTarget = {
  studentId: string;
  studentName: string;
  phone: string;
  level?: string;
  fatherName?: string;
};

type WhatsAppSettings = {
  enabled: boolean;
  message: string;
};

const waSettingsKey = 'student-pricing-wa-settings';
const readWhatsAppSettings = (): WhatsAppSettings => {
  try {
    const raw = localStorage.getItem(waSettingsKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        enabled: Boolean(parsed.enabled),
        message: typeof parsed.message === 'string' ? parsed.message : '',
      };
    }
  } catch {}
  return { enabled: false, message: '' };
};

const saveWhatsAppSettings = (settings: WhatsAppSettings) => {
  localStorage.setItem(waSettingsKey, JSON.stringify(settings));
};

// Interpolates dynamic variables like {son_name}, {father_name}, {phone}, {group}
const formatWhatsAppMessage = (template: string, target: WhatsAppPromptTarget): string => {
  const sonName = target.studentName || '';
  // Use explicit fatherName if provided, otherwise derive father/guardian name from student's name
  let fatherName = target.fatherName?.trim() || '';
  if (!fatherName) {
    const nameParts = sonName.trim().split(/\s+/);
    fatherName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : sonName;
  }
  const group = target.level || '';
  const phone = target.phone || '';

  return template
    .replace(/\{son_name\}|\{nama_anak\}|\{nama_siswa\}/gi, sonName)
    .replace(/\{father_name\}|\{nama_ayah\}|\{nama_wali\}|\{wali\}/gi, fatherName)
    .replace(/\{phone\}|\{telepon\}|\{nomor_telepon\}/gi, phone)
    .replace(/\{group\}|\{kelas\}|\{tingkat\}/gi, group);
};

type WhatsAppModalContextType = {
  openPrompt: (target: WhatsAppPromptTarget) => void;
};

const WhatsAppModalContext = createContext<WhatsAppModalContextType | null>(null);

function WhatsAppModalProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const [promptTarget, setPromptTarget] = useState<WhatsAppPromptTarget | null>(null);

  const openPrompt = (target: WhatsAppPromptTarget) => {
    const settings = readWhatsAppSettings();
    if (settings.enabled && settings.message.trim()) {
      setPromptTarget(target);
    } else {
      // Direct WA link
      window.open(`https://wa.me/${whatsappNumber(target.phone)}`, '_blank', 'noreferrer');
    }
  };

  const handleSendAuto = () => {
    if (!promptTarget) return;
    const settings = readWhatsAppSettings();
    const resolvedMessage = formatWhatsAppMessage(settings.message, promptTarget);
    const encoded = encodeURIComponent(resolvedMessage);
    window.open(`https://wa.me/${whatsappNumber(promptTarget.phone)}?text=${encoded}`, '_blank', 'noreferrer');
    setPromptTarget(null);
  };

  const handleSendOther = () => {
    if (!promptTarget) return;
    window.open(`https://wa.me/${whatsappNumber(promptTarget.phone)}`, '_blank', 'noreferrer');
    setPromptTarget(null);
  };

  const resolvedPreview = promptTarget ? formatWhatsAppMessage(readWhatsAppSettings().message, promptTarget) : '';

  return (
    <WhatsAppModalContext.Provider value={{ openPrompt }}>
      {children}
      {promptTarget && (
        <div
          data-testid="modal-whatsapp-choice"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setPromptTarget(null)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-[#25D366]/15 text-[#25D366]">
                  <MessageCircle size={20} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-foreground">{t('chooseSendMode')}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t('sendTo')} <span className="font-bold text-foreground">{promptTarget.studentName}</span> ({promptTarget.phone})
                  </p>
                </div>
              </div>
              <button
                data-testid="button-close-wa-modal"
                onClick={() => setPromptTarget(null)}
                className="focus-ring -mr-1 -mt-1 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-border/80 bg-muted/40 p-3 text-xs text-muted-foreground">
              <span className="mono mb-1 block text-[10px] font-bold uppercase tracking-[.12em] text-primary">
                {t('readyMessage')}
              </span>
              <p data-testid="text-resolved-wa-message" className="whitespace-pre-wrap line-clamp-4 italic text-foreground/90 font-medium">
                "{resolvedPreview}"
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                data-testid="button-wa-send-auto"
                onClick={handleSendAuto}
                className="focus-ring flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#20ba59]"
              >
                <Send size={15} />
                <span>{t('sendAutoMessage')}</span>
              </button>

              <button
                data-testid="button-wa-send-other"
                onClick={handleSendOther}
                className="focus-ring flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-xs font-bold text-foreground transition hover:bg-muted"
              >
                <MessageCircle size={15} />
                <span>{t('sendOther')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </WhatsAppModalContext.Provider>
  );
}

function useWhatsAppModal() {
  const ctx = useContext(WhatsAppModalContext);
  if (!ctx) throw new Error('useWhatsAppModal must be used within WhatsAppModalProvider');
  return ctx;
}

const normalizePaymentHistory = (history?: Array<PaymentEntry | number>): PaymentEntry[] => (history || []).map((entry) => typeof entry === 'number' ? { amount: entry, date: '' } : entry);
const whatsappNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
};
const formatPaymentDate = (date: string, language: Language) => {
  if (!date) return '—';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? '—' : new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(parsed);
};
const getPaymentRow = (student: PriceItem): PaymentRow => {
  const originalPrice = student.originalPrice ?? student.price;
  const paymentHistory = normalizePaymentHistory(student.paymentHistory);
  const totalPaid = student.totalPaid ?? paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = Math.max(0, originalPrice - totalPaid);
  return { ...student, originalPrice, totalPaid, paymentHistory, remainingAmount, isPaid: remainingAmount === 0 };
};

function WhatsAppLink({ studentId, studentName, phone, level, fatherName }: { studentId: string; studentName: string; phone: string; level?: string; fatherName?: string }) {
  const { t } = useLanguage();
  const { openPrompt } = useWhatsAppModal();
  return (
    <button
      type="button"
      data-testid={`link-whatsapp-${studentId}`}
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        openPrompt({ studentId, studentName, phone, level, fatherName });
      }}
      aria-label={`${t('whatsapp')} ${studentName}`}
      title={`${t('whatsapp')} ${studentName}`}
      className="focus-ring inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-[#25D366] transition hover:bg-[#25D366]/10"
    >
      <MessageCircle size={16} />
    </button>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  return <div className="app-shell">
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 md:px-8">
      <button data-testid="button-home" className="focus-ring flex items-center gap-3 text-left" onClick={() => setLocation('/')}>
        <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><WalletCards size={18} strokeWidth={2.4} /></span>
        <span><span className="block text-[15px] font-bold tracking-[-.02em]">{t('appName')}</span><span className="block text-[10px] font-semibold uppercase tracking-[.16em] text-muted-foreground">{t('schoolAdmin')}</span></span>
      </button>
      <div className="flex items-center gap-2">
        <button
          data-testid="button-nav-home"
          onClick={() => setLocation('/')}
          aria-label={t('home')}
          title={t('home')}
          className="focus-ring inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-primary/40 hover:text-primary"
        >
          <HomeIcon size={17} />
        </button>
        <button
          data-testid="button-settings"
          onClick={() => setLocation('/settings')}
          aria-label={t('settings')}
          title={t('settings')}
          className="focus-ring inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-primary/40 hover:text-primary"
        >
          <Settings size={17} />
        </button>
      </div>
    </header>
    <main>{children}</main>
  </div>;
}

function Progress({ step }: { step: Step }) {
  const { t } = useLanguage();
  const items: { key: Step; label: string }[] = [{ key: 'name', label: t('stepName') }, { key: 'students', label: t('stepStudents') }, { key: 'pricing', label: t('stepPrice') }, { key: 'review', label: t('stepReview') }];
  return <div className="mb-10 flex items-center gap-2 sm:gap-3" data-testid="progress-steps">{items.map((item, i) => {
    const active = items.findIndex((x) => x.key === step) >= i;
    return <div className="flex min-w-0 items-center gap-2 sm:gap-3" key={item.key}>
      <div className={`grid size-7 shrink-0 place-items-center rounded-full border text-xs font-bold transition-colors ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground'}`}>{items.findIndex((x) => x.key === step) > i ? <Check size={14} /> : i + 1}</div>
      <span className={`hidden text-xs font-semibold sm:block ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{item.label}</span>
      {i < items.length - 1 && <div className={`h-px w-5 sm:w-10 ${items.findIndex((x) => x.key === step) > i ? 'bg-primary' : 'bg-border'}`} />}
    </div>;
  })}</div>;
}

function Button({ children, onClick, variant = 'primary', disabled, testId, type = 'button' }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'quiet' | 'outline'; disabled?: boolean; testId: string; type?: 'button' | 'submit' }) {
  return <button type={type} data-testid={testId} disabled={disabled} onClick={onClick} className={`focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition-all active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45 ${variant === 'primary' ? 'bg-primary text-primary-foreground shadow-[0_5px_14px_hsl(var(--primary)/.16)] hover:-translate-y-px hover:shadow-[0_7px_18px_hsl(var(--primary)/.22)]' : variant === 'outline' ? 'border border-border bg-card text-foreground hover:bg-muted' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>{children}</button>;
}

function Home() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const [records, setRecords] = useState<RecordItem[]>([]);
  useEffect(() => setRecords(readRecords()), []);
  const remove = (id: string) => { const next = records.filter((r) => r.id !== id); setRecords(next); saveRecords(next); };
  return <Shell><section className="page-in mx-auto max-w-6xl px-5 pb-16 pt-6 md:px-8 md:pt-12">
    <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
      <div><p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-primary">{t('savedRecords')}</p><h1 className="text-3xl font-bold tracking-[-.05em] sm:text-5xl">{t('studentPrices')}</h1><p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{t('homeDescription')}</p></div>
      <div className="flex flex-col gap-2.5 sm:items-end">
        <Button testId="button-create-record" onClick={() => setLocation('/new/name')}><CirclePlus size={17} />{t('createRecord')}</Button>
        <Button testId="button-student-manager" variant="outline" onClick={() => setLocation('/students')}><Users size={16} />Student Manager</Button>
      </div>
    </div>
    {records.length === 0 ? <div className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 text-center">
      <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-secondary text-primary"><FileText size={24} /></div>
      <h2 className="text-base font-bold">{t('emptyRecords')}</h2><p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">{t('emptyRecordsDescription')}</p>
      <Button testId="button-create-empty" onClick={() => setLocation('/new/name')} variant="outline">{t('createFirstRecord')} <ArrowRight size={16} /></Button>
    </div> : <div className="space-y-3">
      <div className="grid grid-cols-[1fr_auto] gap-4 px-4 text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground sm:grid-cols-[1fr_120px_150px_92px]"><span>{t('record')}</span><span className="hidden sm:block">{t('students')}</span><span className="hidden sm:block">{t('total')}</span><span /></div>
       {records.map((record, index) => <div key={record.id} data-testid={`record-card-${record.id}`} role="button" tabIndex={0} onClick={() => setLocation(`/record/${record.id}`)} onKeyDown={(e) => e.key === 'Enter' && setLocation(`/record/${record.id}`)} className="row-in grid cursor-pointer grid-cols-[1fr_auto] items-center gap-4 rounded-2xl border border-border bg-card px-4 py-4 shadow-[0_2px_12px_hsl(var(--primary)/.03)] transition hover:border-primary/35 hover:shadow-[0_5px_20px_hsl(var(--primary)/.08)] sm:grid-cols-[1fr_120px_150px_92px]" style={{ animationDelay: `${index * 45}ms` }}>
          <div><p className="font-bold">{record.name}</p><p className="mono mt-1 text-[10px] text-muted-foreground">{new Date(record.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p></div>
        <span className="hidden text-sm text-muted-foreground sm:block">{record.students.length} siswa</span><span className="hidden font-bold sm:block">{currency(record.students.reduce((sum, s) => sum + s.price, 0))}</span>
          <div className="flex items-center justify-end gap-1"><button data-testid={`button-edit-${record.id}`} onClick={(e) => { e.stopPropagation(); setLocation(`/edit/${record.id}/name`); }} className="focus-ring inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-primary" aria-label={t('edit')}><Pencil size={15} /></button><button data-testid={`button-delete-${record.id}`} onClick={(e) => { e.stopPropagation(); remove(record.id); }} className="focus-ring inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={t('delete')}><X size={15} /></button></div>
      </div>)}
    </div>}
  </section></Shell>;
}

function StudentManagerPage() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const [groups, setGroups] = useState<StudentGroup[]>(readGroups);
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'groups' | 'all'>('groups');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [groupError, setGroupError] = useState('');

  const [addingStudentGroupId, setAddingStudentGroupId] = useState<string>();
  const [studentName, setStudentName] = useState('');
  const [studentFatherName, setStudentFatherName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentGmail, setStudentGmail] = useState('');
  const [studentError, setStudentError] = useState('');

  const [confirmDeleteGroupId, setConfirmDeleteGroupId] = useState<string>();

  const updateGroups = (next: StudentGroup[]) => {
    setGroups(next);
    saveGroups(next);
  };

  const handleCreateGroup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newGroupName.trim();
    if (!trimmed) {
      setGroupError(t('namePhoneRequired'));
      return;
    }
    if (groups.some((g) => g.name.toLowerCase() === trimmed.toLowerCase())) {
      setGroupError('Grup dengan nama ini sudah ada.');
      return;
    }
    const newGroup: StudentGroup = {
      id: `grp-${Date.now()}`,
      name: trimmed,
      students: [],
    };
    const next = [...groups, newGroup];
    updateGroups(next);
    setNewGroupName('');
    setGroupError('');
    setIsAddingGroup(false);
    setSelectedGroupId(newGroup.id);
    setAddingStudentGroupId(newGroup.id);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (confirmDeleteGroupId !== groupId) {
      setConfirmDeleteGroupId(groupId);
      return;
    }
    const next = groups.filter((g) => g.id !== groupId);
    updateGroups(next);
    setConfirmDeleteGroupId(undefined);
    if (selectedGroupId === groupId) {
      setSelectedGroupId(null);
    }
    if (addingStudentGroupId === groupId) {
      setAddingStudentGroupId(undefined);
    }
  };

  const handleAddStudent = (groupId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const nameTrimmed = studentName.trim();
    const fatherNameTrimmed = studentFatherName.trim();
    const phoneTrimmed = studentPhone.trim();
    const gmailTrimmed = studentGmail.trim();

    if (!nameTrimmed || !phoneTrimmed) {
      setStudentError(t('namePhoneRequired'));
      return;
    }

    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    const newId = generateStudentId(groups);
    const newStudent: Student = {
      id: newId,
      name: nameTrimmed,
      phone: phoneTrimmed,
      level: group.name,
      ...(fatherNameTrimmed ? { fatherName: fatherNameTrimmed } : {}),
      ...(gmailTrimmed ? { gmail: gmailTrimmed } : {}),
    };

    const next = groups.map((g) =>
      g.id === groupId ? { ...g, students: [...g.students, newStudent] } : g
    );
    updateGroups(next);

    setStudentName('');
    setStudentFatherName('');
    setStudentPhone('');
    setStudentGmail('');
    setStudentError('');
    setAddingStudentGroupId(undefined);
  };

  const handleDeleteStudent = (groupId: string, studentId: string) => {
    const next = groups.map((g) =>
      g.id === groupId ? { ...g, students: g.students.filter((s) => s.id !== studentId) } : g
    );
    updateGroups(next);
  };

  const totalStudents = groups.reduce((acc, g) => acc + g.students.length, 0);

  return (
    <Shell>
      <section className="page-in mx-auto max-w-5xl px-5 pb-20 pt-6 md:px-8 md:pt-10">
        <button
          data-testid={selectedGroupId ? 'button-back-to-groups' : 'button-manager-back'}
          onClick={() => {
            if (selectedGroupId) {
              setSelectedGroupId(null);
            } else {
              setLocation('/');
            }
          }}
          className="focus-ring mb-8 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft size={15} />
          {selectedGroupId ? t('backToGroups') : t('backToRecords')}
        </button>

        <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-primary">
              {selectedGroupId ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="cursor-pointer hover:underline" onClick={() => setSelectedGroupId(null)}>
                    {t('groupManager')}
                  </span>
                  <ChevronRight size={12} />
                  <span>{groups.find((g) => g.id === selectedGroupId)?.name}</span>
                </span>
              ) : (
                t('studentManager')
              )}
            </p>
            <h1 className="text-3xl font-bold tracking-[-.05em] sm:text-4xl">{t('studentManager')}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              {t('studentManagerDesc')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              testId="button-create-group"
              onClick={() => {
                setIsAddingGroup(true);
                setNewGroupName('');
                setGroupError('');
              }}
            >
              <CirclePlus size={17} />
              {t('newGroup')}
            </Button>
          </div>
        </div>

        {/* Main Tab Controls: "Group Manager" & "All Students" */}
        {!selectedGroupId && (
          <div className="mb-6 flex gap-2 border-b border-border pb-3">
            <button
              data-testid="button-tab-group-manager"
              onClick={() => setViewMode('groups')}
              className={`focus-ring inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition sm:text-sm ${
                viewMode === 'groups'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <FolderOpen size={16} />
              {t('groupManager')}
              <span className={`mono ml-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${viewMode === 'groups' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-background text-muted-foreground'}`}>
                {groups.length}
              </span>
            </button>
            <button
              data-testid="button-tab-all-students"
              onClick={() => setViewMode('all')}
              className={`focus-ring inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition sm:text-sm ${
                viewMode === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Users size={16} />
              {t('allStudentsTab')}
              <span className={`mono ml-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${viewMode === 'all' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-background text-muted-foreground'}`}>
                {totalStudents}
              </span>
            </button>
          </div>
        )}

        {/* Quick Search & Summary Stats */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 text-muted-foreground" size={16} />
            <input
              data-testid="input-manager-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchManager')}
              className="focus-ring h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="mono rounded-lg border border-border bg-card px-3 py-2 font-bold text-muted-foreground">
              {groups.length} {t('totalGroups').toLowerCase()}
            </span>
            <span className="mono rounded-lg border border-border bg-card px-3 py-2 font-bold text-primary">
              {totalStudents} {t('totalStudents').toLowerCase()}
            </span>
          </div>
        </div>

        {/* Create Group Form Card */}
        {isAddingGroup && (
          <div data-testid="card-create-group" className="mb-6 rounded-2xl border border-primary/40 bg-card p-5 shadow-md sm:p-6 animate-in fade-in duration-200">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-secondary text-primary">
                  <FolderPlus size={18} />
                </span>
                <div>
                  <h2 className="text-base font-bold">{t('createGroup')}</h2>
                  <p className="text-xs text-muted-foreground">{t('groupNamePlaceholder')}</p>
                </div>
              </div>
              <button
                data-testid="button-close-group-form"
                onClick={() => setIsAddingGroup(false)}
                className="focus-ring rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateGroup}>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  autoFocus
                  data-testid="input-new-group-name"
                  value={newGroupName}
                  onChange={(e) => {
                    setNewGroupName(e.target.value);
                    setGroupError('');
                  }}
                  placeholder={t('groupNamePlaceholder')}
                  className="focus-ring h-11 flex-1 rounded-xl border border-border bg-background px-4 text-sm font-semibold outline-none focus:border-primary"
                />
                <div className="flex gap-2">
                  <Button
                    testId="button-cancel-create-group"
                    variant="quiet"
                    onClick={() => setIsAddingGroup(false)}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    testId="button-save-new-group"
                    type="submit"
                    disabled={!newGroupName.trim()}
                  >
                    <Check size={16} />
                    {t('createGroup')}
                  </Button>
                </div>
              </div>
              {groupError && (
                <p data-testid="error-group-name" className="mt-2 text-xs font-semibold text-destructive">
                  {groupError}
                </p>
              )}
            </form>
          </div>
        )}

        {/* When in "Group Manager" view without an open group: Show Grid of All Groups */}
        {!selectedGroupId && viewMode === 'groups' && (
          <div>
            {groups.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 text-center">
                <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
                  <FolderPlus size={24} />
                </div>
                <h2 className="text-base font-bold">{t('noGroups')}</h2>
                <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">{t('noGroupsDesc')}</p>
                <Button
                  testId="button-create-first-group-gm"
                  onClick={() => {
                    setIsAddingGroup(true);
                    setNewGroupName('');
                  }}
                  variant="outline"
                >
                  <CirclePlus size={16} /> {t('createFirstGroup')}
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groups.map((group) => {
                  const matchesFilter = !query || group.name.toLowerCase().includes(query.toLowerCase()) || group.students.some((s) => `${s.name} ${s.phone} ${s.gmail || ''}`.toLowerCase().includes(query.toLowerCase()));
                  if (!matchesFilter) return null;

                  return (
                    <div
                      key={group.id}
                      data-testid={`card-group-tile-${group.id}`}
                      onClick={() => setSelectedGroupId(group.id)}
                      className="group cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-[0_2px_10px_hsl(var(--primary)/.03)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                          <Folder size={20} />
                        </span>
                        <button
                          data-testid={`button-delete-group-tile-${group.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGroup(group.id);
                          }}
                          className={`focus-ring inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-bold transition ${
                            confirmDeleteGroupId === group.id
                              ? 'bg-destructive text-destructive-foreground'
                              : 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                          }`}
                          title={`${t('deleteGroup')} ${group.name}`}
                        >
                          <Trash2 size={14} />
                          {confirmDeleteGroupId === group.id && (
                            <span className="text-[10px]">{t('confirm')}?</span>
                          )}
                        </button>
                      </div>

                      <div className="mt-4">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary">{group.name}</h3>
                        <p className="mono mt-1 text-xs text-muted-foreground">
                          {group.students.length} {t('groupStudentsCount')}
                        </p>
                      </div>

                      {/* Preview of students */}
                      <div className="mt-4 border-t border-border/60 pt-3">
                        {group.students.length === 0 ? (
                          <span className="text-xs italic text-muted-foreground">{t('noStudentsInGroup')}</span>
                        ) : (
                          <div className="space-y-1">
                            {group.students.slice(0, 3).map((s) => (
                              <div key={s.id} className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="truncate font-medium text-foreground/80">{s.name}</span>
                                <span className="mono text-[10px]">{s.id}</span>
                              </div>
                            ))}
                            {group.students.length > 3 && (
                              <p className="text-[11px] font-semibold text-primary">
                                +{group.students.length - 3} more...
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between pt-1 text-xs font-bold text-primary">
                        <span>{t('openGroup')}</span>
                        <ChevronRight size={16} className="transition group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* When a specific group gets opened: Show that specific group and its students */}
        {selectedGroupId && (
          (() => {
            const group = groups.find((g) => g.id === selectedGroupId);
            if (!group) return null;
            const filteredStudents = group.students.filter((s) => {
              if (!query) return true;
              const match = `${s.id} ${s.name} ${s.phone} ${s.gmail || ''}`.toLowerCase();
              return match.includes(query.toLowerCase());
            });

            return (
              <div data-testid={`opened-group-${group.id}`} className="space-y-6">
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_2px_12px_hsl(var(--primary)/.03)]">
                  {/* Group Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                        <FolderOpen size={20} />
                      </span>
                      <div>
                        <h2 className="text-lg font-bold">{group.name}</h2>
                        <span className="mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">
                          {group.students.length} {t('groupStudentsCount')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        testId={`button-add-student-open-${group.id}`}
                        onClick={() => {
                          setAddingStudentGroupId(group.id);
                          setStudentName('');
                          setStudentFatherName('');
                          setStudentPhone('');
                          setStudentGmail('');
                          setStudentError('');
                        }}
                      >
                        <CirclePlus size={16} />
                        {t('addStudent')}
                      </Button>
                      <button
                        data-testid={`button-delete-opened-group-${group.id}`}
                        onClick={() => handleDeleteGroup(group.id)}
                        className={`focus-ring inline-flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold transition ${
                          confirmDeleteGroupId === group.id
                            ? 'bg-destructive text-destructive-foreground'
                            : 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                        }`}
                        aria-label={`${t('deleteGroup')} ${group.name}`}
                        title={`${t('deleteGroup')} ${group.name}`}
                      >
                        <Trash2 size={15} />
                        {confirmDeleteGroupId === group.id && (
                          <span className="text-[11px]">{t('confirm')}?</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Add Student Form */}
                  {addingStudentGroupId === group.id && (
                    <div
                      data-testid={`card-add-student-${group.id}`}
                      className="border-b border-border bg-muted/25 p-5 animate-in fade-in duration-150"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-[.12em] text-primary">
                          {t('addStudent')} → {group.name}
                        </span>
                        <button
                          data-testid={`button-close-student-form-${group.id}`}
                          onClick={() => setAddingStudentGroupId(undefined)}
                          className="focus-ring rounded p-1 text-muted-foreground hover:bg-muted"
                        >
                          <X size={15} />
                        </button>
                      </div>
                      <form onSubmit={(e) => handleAddStudent(group.id, e)} className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground">
                              {t('studentName')} *
                            </label>
                            <input
                              autoFocus
                              data-testid={`input-student-name-${group.id}`}
                              value={studentName}
                              onChange={(e) => {
                                setStudentName(e.target.value);
                                setStudentError('');
                              }}
                              placeholder={t('studentNamePlaceholder')}
                              className="focus-ring h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground">
                              {t('fatherNameOptional')}
                            </label>
                            <input
                              data-testid={`input-student-father-${group.id}`}
                              value={studentFatherName}
                              onChange={(e) => setStudentFatherName(e.target.value)}
                              placeholder={t('fatherNamePlaceholder')}
                              className="focus-ring h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground">
                              {t('phoneNumber')} *
                            </label>
                            <input
                              data-testid={`input-student-phone-${group.id}`}
                              value={studentPhone}
                              onChange={(e) => {
                                setStudentPhone(e.target.value);
                                setStudentError('');
                              }}
                              placeholder={t('phoneNumberPlaceholder')}
                              className="focus-ring h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground">
                              {t('gmailOptional')}
                            </label>
                            <input
                              data-testid={`input-student-gmail-${group.id}`}
                              type="email"
                              value={studentGmail}
                              onChange={(e) => setStudentGmail(e.target.value)}
                              placeholder={t('gmailPlaceholder')}
                              className="focus-ring h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                        {studentError && (
                          <p data-testid={`error-student-${group.id}`} className="text-xs font-semibold text-destructive">
                            {studentError}
                          </p>
                        )}
                        <div className="flex justify-end gap-2 pt-1">
                          <Button
                            testId={`button-cancel-student-${group.id}`}
                            variant="quiet"
                            onClick={() => setAddingStudentGroupId(undefined)}
                          >
                            {t('cancel')}
                          </Button>
                          <Button
                            testId={`button-save-student-${group.id}`}
                            type="submit"
                          >
                            <Check size={16} />
                            {t('addStudent')}
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Student Rows in this Group */}
                  <div className="divide-y divide-border/70">
                    {filteredStudents.length === 0 ? (
                      <div className="py-12 text-center text-xs text-muted-foreground">
                        {query ? t('noStudents') : t('noStudentsInGroup')}
                      </div>
                    ) : (
                      filteredStudents.map((student) => (
                        <div
                          key={student.id}
                          data-testid={`student-row-${student.id}`}
                          className="flex flex-col gap-2 px-5 py-3.5 transition hover:bg-secondary/25 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-bold text-foreground">{student.name}</span>
                              <span className="mono rounded bg-secondary px-1.5 py-0.5 text-[9px] font-bold text-primary">
                                {student.id}
                              </span>
                              {student.fatherName && (
                                <span className="truncate text-xs font-medium text-muted-foreground">
                                  · {t('guardian')}: {student.fatherName}
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="mono text-[10px] text-muted-foreground">{student.phone}</span>
                              {student.gmail && (
                                <a
                                  href={`mailto:${student.gmail}`}
                                  data-testid={`link-gmail-${student.id}`}
                                  className="inline-flex items-center gap-1 text-[11px] text-primary/85 underline underline-offset-2 transition hover:text-primary"
                                  title={student.gmail}
                                >
                                  <Mail size={12} />
                                  <span>{student.gmail}</span>
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 self-end sm:self-center">
                            <WhatsAppLink studentId={student.id} studentName={student.name} phone={student.phone} level={group.name} fatherName={student.fatherName} />
                            {student.gmail && (
                              <a
                                href={`mailto:${student.gmail}`}
                                data-testid={`button-mail-${student.id}`}
                                title={student.gmail}
                                className="focus-ring inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-primary transition hover:bg-primary/10"
                              >
                                <Mail size={15} />
                              </a>
                            )}
                            <button
                              data-testid={`button-delete-student-${student.id}`}
                              onClick={() => handleDeleteStudent(group.id, student.id)}
                              className="focus-ring inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                              aria-label={`${t('deleteStudent')} ${student.name}`}
                              title={`${t('deleteStudent')} ${student.name}`}
                            >
                              <X size={15} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })()
        )}

        {/* When in "All Students" view (without an open group) */}
        {!selectedGroupId && viewMode === 'all' && (
          groups.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 text-center">
              <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
                <Users size={24} />
              </div>
              <h2 className="text-base font-bold">{t('noGroups')}</h2>
              <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">{t('noGroupsDesc')}</p>
              <Button
                testId="button-create-first-group-all"
                onClick={() => {
                  setIsAddingGroup(true);
                  setNewGroupName('');
                }}
                variant="outline"
              >
                <CirclePlus size={16} /> {t('createFirstGroup')}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => {
                const filteredStudents = group.students.filter((s) => {
                  if (!query) return true;
                  const match = `${s.id} ${s.name} ${s.phone} ${s.gmail || ''}`.toLowerCase();
                  return match.includes(query.toLowerCase());
                });

                return (
                  <div
                    key={group.id}
                    data-testid={`group-card-${group.id}`}
                    className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_2px_12px_hsl(var(--primary)/.03)]"
                  >
                    {/* Group Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-xl bg-secondary text-primary">
                          <Users size={17} />
                        </span>
                        <div>
                          <h2 className="text-base font-bold">{group.name}</h2>
                          <span className="mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">
                            {group.students.length} {t('groupStudentsCount')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          testId={`button-add-student-${group.id}`}
                          variant="outline"
                          onClick={() => {
                            setAddingStudentGroupId(group.id);
                            setStudentName('');
                            setStudentFatherName('');
                            setStudentPhone('');
                            setStudentGmail('');
                            setStudentError('');
                          }}
                        >
                          <CirclePlus size={16} />
                          {t('addStudent')}
                        </Button>
                        <button
                          data-testid={`button-delete-group-${group.id}`}
                          onClick={() => handleDeleteGroup(group.id)}
                          className={`focus-ring inline-flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold transition ${
                            confirmDeleteGroupId === group.id
                              ? 'bg-destructive text-destructive-foreground'
                              : 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                          }`}
                          aria-label={`${t('deleteGroup')} ${group.name}`}
                          title={`${t('deleteGroup')} ${group.name}`}
                        >
                          <Trash2 size={15} />
                          {confirmDeleteGroupId === group.id && (
                            <span className="text-[11px]">{t('confirm')}?</span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Add Student Form */}
                    {addingStudentGroupId === group.id && (
                      <div
                        data-testid={`card-add-student-${group.id}`}
                        className="border-b border-border bg-muted/25 p-5 animate-in fade-in duration-150"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-[.12em] text-primary">
                            {t('addStudent')} → {group.name}
                          </span>
                          <button
                            data-testid={`button-close-student-form-${group.id}`}
                            onClick={() => setAddingStudentGroupId(undefined)}
                            className="focus-ring rounded p-1 text-muted-foreground hover:bg-muted"
                          >
                            <X size={15} />
                          </button>
                        </div>
                        <form onSubmit={(e) => handleAddStudent(group.id, e)} className="space-y-3">
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground">
                                {t('studentName')} *
                              </label>
                              <input
                                autoFocus
                                data-testid={`input-student-name-${group.id}`}
                                value={studentName}
                                onChange={(e) => {
                                  setStudentName(e.target.value);
                                  setStudentError('');
                                }}
                                placeholder={t('studentNamePlaceholder')}
                                className="focus-ring h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none focus:border-primary"
                              />
                            </div>
                            <div>
                              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground">
                                {t('fatherNameOptional')}
                              </label>
                              <input
                                data-testid={`input-student-father-${group.id}`}
                                value={studentFatherName}
                                onChange={(e) => setStudentFatherName(e.target.value)}
                                placeholder={t('fatherNamePlaceholder')}
                                className="focus-ring h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none focus:border-primary"
                              />
                            </div>
                            <div>
                              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground">
                                {t('phoneNumber')} *
                              </label>
                              <input
                                data-testid={`input-student-phone-${group.id}`}
                                value={studentPhone}
                                onChange={(e) => {
                                  setStudentPhone(e.target.value);
                                  setStudentError('');
                                }}
                                placeholder={t('phoneNumberPlaceholder')}
                                className="focus-ring h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none focus:border-primary"
                              />
                            </div>
                            <div>
                              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground">
                                {t('gmailOptional')}
                              </label>
                              <input
                                data-testid={`input-student-gmail-${group.id}`}
                                type="email"
                                value={studentGmail}
                                onChange={(e) => setStudentGmail(e.target.value)}
                                placeholder={t('gmailPlaceholder')}
                                className="focus-ring h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none focus:border-primary"
                              />
                            </div>
                          </div>
                          {studentError && (
                            <p data-testid={`error-student-${group.id}`} className="text-xs font-semibold text-destructive">
                              {studentError}
                            </p>
                          )}
                          <div className="flex justify-end gap-2 pt-1">
                            <Button
                              testId={`button-cancel-student-${group.id}`}
                              variant="quiet"
                              onClick={() => setAddingStudentGroupId(undefined)}
                            >
                              {t('cancel')}
                            </Button>
                            <Button
                              testId={`button-save-student-${group.id}`}
                              type="submit"
                            >
                              <Check size={16} />
                              {t('addStudent')}
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Student Rows in this Group */}
                    <div className="divide-y divide-border/70">
                      {filteredStudents.length === 0 ? (
                        <div className="py-8 text-center text-xs text-muted-foreground">
                          {query ? t('noStudents') : t('noStudentsInGroup')}
                        </div>
                      ) : (
                        filteredStudents.map((student) => (
                          <div
                            key={student.id}
                            data-testid={`student-row-${student.id}`}
                            className="flex flex-col gap-2 px-5 py-3.5 transition hover:bg-secondary/25 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-sm font-bold text-foreground">{student.name}</span>
                                <span className="mono rounded bg-secondary px-1.5 py-0.5 text-[9px] font-bold text-primary">
                                  {student.id}
                                </span>
                                {student.fatherName && (
                                  <span className="truncate text-xs font-medium text-muted-foreground">
                                    · {t('guardian')}: {student.fatherName}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span className="mono text-[10px] text-muted-foreground">{student.phone}</span>
                                {student.gmail && (
                                  <a
                                    href={`mailto:${student.gmail}`}
                                    data-testid={`link-gmail-${student.id}`}
                                    className="inline-flex items-center gap-1 text-[11px] text-primary/85 underline underline-offset-2 transition hover:text-primary"
                                    title={student.gmail}
                                  >
                                    <Mail size={12} />
                                    <span>{student.gmail}</span>
                                  </a>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 self-end sm:self-center">
                              <WhatsAppLink studentId={student.id} studentName={student.name} phone={student.phone} level={group.name} fatherName={student.fatherName} />
                              {student.gmail && (
                                <a
                                  href={`mailto:${student.gmail}`}
                                  data-testid={`button-mail-${student.id}`}
                                  title={student.gmail}
                                  className="focus-ring inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-primary transition hover:bg-primary/10"
                                >
                                  <Mail size={15} />
                                </a>
                              )}
                              <button
                                data-testid={`button-delete-student-${student.id}`}
                                onClick={() => handleDeleteStudent(group.id, student.id)}
                                className="focus-ring inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                                aria-label={`${t('deleteStudent')} ${student.name}`}
                                title={`${t('deleteStudent')} ${student.name}`}
                              >
                                <X size={15} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </section>
    </Shell>
  );
}

function StepLayout({ step, children, footer }: { step: Step; children: ReactNode; footer: ReactNode }) {
  return <Shell><section className="page-in mx-auto max-w-3xl px-5 pb-36 pt-6 md:px-8 md:pt-10"><Progress step={step} />{children}</section><div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-[hsl(var(--background)/.92)] px-5 py-3 backdrop-blur-md md:px-8"><div className="mx-auto flex max-w-3xl items-center justify-between gap-3">{footer}</div></div></Shell>;
}

function PaymentDashboard({ recordId }: { recordId: string }) {
  const [, setLocation] = useLocation();
  const { language, t } = useLanguage();
  const [record, setRecord] = useState<RecordItem | undefined>(() => readRecords().find((item) => item.id === recordId));
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'low' | 'high' | 'paid' | 'unpaid'>('low');
  const [paymentId, setPaymentId] = useState<string>();
  const [confirmAllId, setConfirmAllId] = useState<string>();
  const [paymentValue, setPaymentValue] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [expandedId, setExpandedId] = useState<string>();
  const rows = useMemo(() => {
    const source = record?.students.map(getPaymentRow) || [];
    const searched = source.filter((student) => `${student.id} ${student.name} ${student.phone}`.toLowerCase().includes(query.toLowerCase()));
    const filtered = filter === 'paid' ? searched.filter((student) => student.isPaid) : filter === 'unpaid' ? searched.filter((student) => !student.isPaid) : searched;
    return [...filtered].sort((a, b) => filter === 'high' ? b.remainingAmount - a.remainingAmount : a.remainingAmount - b.remainingAmount);
  }, [filter, query, record]);

  if (!record) return <NotFound />;

  const updateRecord = (students: PriceItem[]) => {
    const nextRecord = { ...record, students };
    const nextRecords = readRecords().map((item) => item.id === recordId ? nextRecord : item);
    saveRecords(nextRecords);
    setRecord(nextRecord);
  };
  const addPayment = (studentId: string) => {
    const amount = Number(paymentValue.replace(/\D/g, ''));
    const student = record.students.find((item) => item.id === studentId);
    if (!student) return;
    const current = getPaymentRow(student);
    if (!amount) { setPaymentError('Masukkan jumlah pembayaran.'); return; }
    if (amount > current.remainingAmount) { setPaymentError(`Maksimal ${currency(current.remainingAmount)}.`); return; }
    updateRecord(record.students.map((item) => item.id === studentId ? { ...item, originalPrice: current.originalPrice, totalPaid: current.totalPaid + amount, paymentHistory: [...current.paymentHistory, { amount, date: new Date().toISOString() }] } : item));
    setPaymentId(undefined);
    setPaymentValue('');
    setPaymentError('');
  };
  const payAll = (studentId: string) => {
    const student = record.students.find((item) => item.id === studentId);
    if (!student) return;
    const current = getPaymentRow(student);
    if (!current.remainingAmount) return;
    updateRecord(record.students.map((item) => item.id === studentId ? { ...item, originalPrice: current.originalPrice, totalPaid: current.totalPaid + current.remainingAmount, paymentHistory: [...current.paymentHistory, { amount: current.remainingAmount, date: new Date().toISOString() }] } : item));
    setConfirmAllId(undefined);
  };

  return <Shell><section className="page-in mx-auto max-w-5xl px-5 pb-16 pt-6 md:px-8 md:pt-10">
    <button data-testid="button-dashboard-back" onClick={() => setLocation('/')} className="focus-ring mb-8 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground transition hover:text-primary"><ArrowLeft size={15} />{t('backToRecords')}</button>
    <div className="mb-8"><p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-primary">{t('paymentDashboard')}</p><h1 className="text-3xl font-bold tracking-[-.05em] sm:text-4xl">{record.name}</h1></div>
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row"><div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-3.5 text-muted-foreground" size={16} /><input data-testid="input-payment-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('searchStudent')} className="focus-ring h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-primary" /></div><label className="relative flex shrink-0 items-center"><span className="sr-only">{t('filter')}</span><select data-testid="select-payment-filter" aria-label={t('filter')} value={filter} onChange={(e) => setFilter(e.target.value as 'low' | 'high' | 'paid' | 'unpaid')} className="focus-ring h-11 w-full appearance-none rounded-xl border border-border bg-card px-4 pr-10 text-sm font-bold text-foreground outline-none focus:border-primary sm:w-[190px]"><option value="low">{t('lowToHigh')}</option><option value="high">{t('highToLow')}</option><option value="paid">{t('paid')}</option><option value="unpaid">{t('unpaid')}</option></select><ChevronDown className="pointer-events-none absolute right-3 text-muted-foreground" size={16} /></label></div>
    </div>
    <div className="mt-7 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3"><span className="text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">{t('students')}</span><span data-testid="text-dashboard-count" className="mono text-[10px] font-bold text-primary">{rows.length} / {record.students.length}</span></div>
      {rows.length ? rows.map((student) => <div key={student.id} data-testid={`payment-row-${student.id}`} className={`border-b border-border/70 px-4 py-4 last:border-0 transition ${student.isPaid ? 'bg-muted/35' : 'hover:bg-secondary/20'}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
           <div className="flex min-w-0 items-center gap-1"><div className="min-w-0"><p className={`truncate text-sm font-bold ${student.isPaid ? 'text-muted-foreground line-through' : ''}`}>{student.name}</p><p className="mono mt-1 text-[10px] text-muted-foreground">{student.id} · {student.level}</p></div><WhatsAppLink studentId={student.id} studentName={student.name} phone={student.phone} level={student.level} fatherName={student.fatherName} /></div>
           <div className="flex flex-wrap items-center gap-2 sm:justify-end"><div className="text-left sm:text-right"><span className="block text-[10px] uppercase tracking-[.12em] text-muted-foreground">{t('remaining')}</span><span data-testid={`text-remaining-${student.id}`} className={`text-sm font-bold ${student.isPaid ? 'text-muted-foreground' : 'text-primary'}`}>{currency(student.remainingAmount)}</span></div>{student.isPaid ? <span className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-2 text-xs font-bold text-muted-foreground"><CircleCheck size={15} />{t('paidStatus')}</span> : <><button data-testid={`button-payment-${student.id}`} onClick={() => { setPaymentId(student.id); setConfirmAllId(undefined); setPaymentValue(''); setPaymentError(''); }} className="focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground transition hover:-translate-y-px"><CirclePlus size={15} />{t('payment')}</button><button data-testid={`button-pay-all-${student.id}`} aria-label={confirmAllId === student.id ? t('confirm') : t('payAll')} onClick={() => confirmAllId === student.id ? payAll(student.id) : setConfirmAllId(student.id)} className={`focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition hover:-translate-y-px ${confirmAllId === student.id ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-primary'}`}>{confirmAllId === student.id ? <><Check size={15} />{t('confirm')}</> : <><Check size={15} />{t('payAll')}</>}</button></>}{student.paymentHistory.length > 0 && <button data-testid={`button-history-${student.id}`} onClick={() => setExpandedId(expandedId === student.id ? undefined : student.id)} className="focus-ring inline-flex min-h-10 items-center gap-1 rounded-lg border border-border px-3 text-xs font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground">{expandedId === student.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}{t('history')}</button>}</div>
        </div>
         {confirmAllId === student.id && !student.isPaid && <p data-testid={`text-confirm-pay-all-${student.id}`} className="mt-3 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-muted-foreground">{t('confirmPayRemaining')} · {currency(student.remainingAmount)}</p>}
         {paymentId === student.id && <div className="mt-4 rounded-xl bg-muted p-3"><div className="flex flex-col gap-2 sm:flex-row sm:items-center"><label className="relative flex-1"><span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">Rp</span><input autoFocus data-testid={`input-payment-${student.id}`} inputMode="numeric" value={paymentValue ? new Intl.NumberFormat('id-ID').format(Number(paymentValue)) : ''} onChange={(e) => { setPaymentValue(e.target.value.replace(/\D/g, '')); setPaymentError(''); }} placeholder={t('payment')} className="focus-ring h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-right text-sm font-bold outline-none focus:border-primary" /></label><div className="flex gap-2"><button data-testid={`button-cancel-payment-${student.id}`} onClick={() => { setPaymentId(undefined); setPaymentError(''); }} className="focus-ring min-h-10 rounded-lg px-3 text-xs font-bold text-muted-foreground hover:bg-card">{t('cancel')}</button><button data-testid={`button-save-payment-${student.id}`} onClick={() => addPayment(student.id)} className="focus-ring min-h-10 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground">{t('save')}</button></div></div>{paymentError && <p data-testid={`text-payment-error-${student.id}`} className="mt-2 text-xs font-semibold text-destructive">{paymentError}</p>}</div>}
          {expandedId === student.id && <div data-testid={`payment-history-${student.id}`} className="mt-4 rounded-xl border border-border bg-background px-4 py-3"><div className="flex items-center justify-between text-xs"><span className="font-bold text-muted-foreground">{t('paymentTotal')}</span><span className="font-bold">{currency(student.totalPaid)}</span></div><div className="mt-2 space-y-2">{normalizePaymentHistory(student.paymentHistory).map((payment, index) => <div key={`${student.id}-${index}`} className="flex items-center justify-between gap-3 text-xs text-muted-foreground"><span>{t('paymentNumber')} {index + 1}<span className="ml-2 text-[10px]">{t('date')}: {formatPaymentDate(payment.date, language)}</span></span><span className="shrink-0">{currency(payment.amount)}</span></div>)}</div><div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-xs"><span className="font-bold text-muted-foreground">{t('remaining')}</span><span className="font-bold text-primary">{currency(student.remainingAmount)}</span></div></div>}
       </div>) : <div className="px-5 py-14 text-center text-sm text-muted-foreground">{t('noStudents')}</div>}
    </div>
  </section></Shell>;
}

function NameStep({ initial, onNext }: { initial?: string; onNext: (name: string) => void }) {
  const [name, setName] = useState(initial || ''); const [, setLocation] = useLocation(); const { t } = useLanguage();
  return <StepLayout step="name" footer={<><Button testId="button-cancel-name" variant="quiet" onClick={() => setLocation('/')}>{t('cancel')}</Button><Button testId="button-next-name" disabled={!name.trim()} onClick={() => onNext(name.trim())}>{t('next')} <ArrowRight size={16} /></Button></>}>
    <div className="max-w-xl"><p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-primary">{t('stepLabel')} 01 / 04</p><h1 className="text-3xl font-bold tracking-[-.05em] sm:text-4xl">{t('recordNameTitle')}</h1><p className="mt-3 text-sm text-muted-foreground">{t('recordNameDescription')}</p>
      <label className="mt-12 block"><span className="mb-2 block text-xs font-bold uppercase tracking-[.14em] text-muted-foreground">{t('recordNameLabel')}</span><input autoFocus data-testid="input-record-name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && name.trim() && onNext(name.trim())} placeholder={t('recordNamePlaceholder')} className="focus-ring h-14 w-full rounded-xl border border-border bg-card px-4 text-base font-semibold outline-none transition focus:border-primary" /></label>
    </div>
  </StepLayout>;
}

function StudentsStep({ selected, onBack, onNext }: { selected?: string[]; onBack: () => void; onNext: (ids: string[]) => void }) {
  const { t } = useLanguage();
  const allStudents = useMemo(() => readAllStudents(), []);
  const groups = useMemo(() => readGroups(), []);
  const [query, setQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [ids, setIds] = useState<string[]>(selected || []);

  const filtered = useMemo(() => {
    return allStudents.filter((s) => {
      const match = `${s.id} ${s.name} ${s.phone} ${s.gmail || ''}`.toLowerCase().includes(query.toLowerCase());
      if (!match) return false;
      if (selectedGroup === 'all') return true;
      return s.level.toLowerCase() === selectedGroup.toLowerCase();
    });
  }, [allStudents, query, selectedGroup]);

  const allShownSelected = filtered.length > 0 && filtered.every((s) => ids.includes(s.id));
  const toggleAll = () => setIds(allShownSelected ? ids.filter((id) => !filtered.some((s) => s.id === id)) : [...new Set([...ids, ...filtered.map((s) => s.id)])]);

  const handleGroupChange = (groupValue: string) => {
    setSelectedGroup(groupValue);
    if (groupValue === 'all') {
      setIds(allStudents.map((s) => s.id));
    } else {
      const matchedIds = allStudents.filter((s) => s.level.toLowerCase() === groupValue.toLowerCase()).map((s) => s.id);
      setIds(matchedIds);
    }
  };

  return <StepLayout step="students" footer={<><Button testId="button-back-students" variant="quiet" onClick={onBack}><ArrowLeft size={16} />{t('cancel')}</Button><Button testId="button-next-students" disabled={!ids.length} onClick={() => onNext(ids)}>{t('next')} <ArrowRight size={16} /></Button></>}>
    <div><p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-primary">{t('stepLabel')} 02 / 04</p><h1 className="text-3xl font-bold tracking-[-.05em] sm:text-4xl">{t('chooseStudentsTitle')}</h1><p className="mt-3 text-sm text-muted-foreground">{t('chooseStudentsDescription')}</p>
      
      {/* Dropdown for groups */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex min-w-[240px] items-center">
          <span className="sr-only">{t('selectGroup')}</span>
          <select
            data-testid="select-student-group"
            aria-label={t('selectGroup')}
            value={selectedGroup}
            onChange={(e) => handleGroupChange(e.target.value)}
            className="focus-ring h-12 w-full appearance-none rounded-xl border border-border bg-card px-4 pr-10 text-sm font-bold text-foreground outline-none focus:border-primary shadow-sm"
          >
            <option value="all">{t('all')} ({allStudents.length})</option>
            {groups.map((g) => (
              <option key={g.id} value={g.name.toLowerCase()}>
                {g.name} ({g.students.length} {t('groupStudentsCount')})
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 text-muted-foreground" size={18} />
        </label>

        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-3.5 text-muted-foreground" size={16} />
          <input
            data-testid="input-student-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchStudent')}
            className="focus-ring h-12 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {selectedGroup === 'all' ? t('allGroups') : groups.find((g) => g.name.toLowerCase() === selectedGroup.toLowerCase())?.name || selectedGroup}
        </span>
        <span data-testid="text-selected-count" className="mono text-xs font-bold text-primary">
          {ids.length} / {allStudents.length} {t('selected')}
        </span>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card"><div className="flex items-center gap-3 border-b border-border bg-muted/50 px-4 py-3"><input type="checkbox" data-testid="checkbox-select-all" checked={allShownSelected} onChange={toggleAll} className="size-4 accent-[hsl(var(--primary))]" /><span className="text-xs font-bold text-muted-foreground">{allShownSelected ? t('deselectAll') : t('selectAll')}{query && ` · ${filtered.length}`}</span></div><div className="scroll-thin max-h-[390px] overflow-y-auto">{filtered.length ? filtered.map((s, i) => <label key={s.id} data-testid={`row-student-${s.id}`} className="row-in flex cursor-pointer items-center gap-3 border-b border-border/70 px-4 py-3.5 last:border-0 hover:bg-secondary/45" style={{ animationDelay: `${i * 18}ms` }}><input type="checkbox" data-testid={`checkbox-student-${s.id}`} checked={ids.includes(s.id)} onChange={() => setIds(ids.includes(s.id) ? ids.filter((id) => id !== s.id) : [...ids, s.id])} className="size-4 accent-[hsl(var(--primary))]" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{s.name}</span><span className="mono mt-0.5 block text-[10px] text-muted-foreground">{s.id} · {s.phone}{s.gmail ? ` · ${s.gmail}` : ''}</span></span><WhatsAppLink studentId={s.id} studentName={s.name} phone={s.phone} level={s.level} /><span className="rounded-md bg-secondary px-2 py-1 text-[10px] font-bold text-primary">{s.level}</span></label>) : <div className="px-5 py-12 text-center text-sm text-muted-foreground">{t('noStudents')}</div>}</div></div>
      {!ids.length && <p className="mt-3 text-xs font-semibold text-destructive" data-testid="status-no-selection">{t('noSelection')}</p>}
    </div>
  </StepLayout>;
}

function PricingStep({ chosen, initial, onBack, onNext }: { chosen: Student[]; initial?: PriceItem[]; onBack: () => void; onNext: (items: PriceItem[]) => void }) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'all' | 'custom'>('all');
  const [allPrice, setAllPrice] = useState(initial?.[0]?.price?.toString() || '');
  const [prices, setPrices] = useState<Record<string, string>>(() => Object.fromEntries((initial || []).map((s) => [s.id, String(s.price || '')])));
  
  const valid = chosen.every((s) => Number(mode === 'all' ? allPrice : prices[s.id]) > 0);
  const displayPrice = (v: string) => v ? new Intl.NumberFormat('id-ID').format(Number(v.replace(/\D/g, ''))) : '';
  const setForAll = (v: string) => { const clean = v.replace(/\D/g, ''); setAllPrice(clean); setPrices(Object.fromEntries(chosen.map((s) => [s.id, clean]))); };
  const update = (id: string, v: string) => setPrices((p) => ({ ...p, [id]: v.replace(/\D/g, '') }));

  return <StepLayout step="pricing" footer={<><Button testId="button-back-pricing" variant="quiet" onClick={onBack}><ArrowLeft size={16} />{t('cancel')}</Button><Button testId="button-next-pricing" disabled={!valid} onClick={() => onNext(chosen.map((s) => ({ ...s, price: Number(mode === 'all' ? allPrice : prices[s.id]) })))}>{t('next')} <ArrowRight size={16} /></Button></>}>
    <div><p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-primary">{t('stepLabel')} 03 / 04</p><h1 className="text-3xl font-bold tracking-[-.05em] sm:text-4xl">{t('setPriceTitle')}</h1><p className="mt-3 text-sm text-muted-foreground">{t('setPriceDescription')}</p>
      
      <div className="mt-9 grid grid-cols-2 rounded-xl border border-border bg-muted p-1"><button data-testid="button-price-all" onClick={() => setMode('all')} className={`rounded-lg px-2 py-2.5 text-xs font-bold transition sm:text-sm ${mode === 'all' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>{t('onePrice')}</button><button data-testid="button-price-custom" onClick={() => { setMode('custom'); setPrices((p) => Object.fromEntries(chosen.map((s) => [s.id, p[s.id] || allPrice]))) }} className={`rounded-lg px-2 py-2.5 text-xs font-bold transition sm:text-sm ${mode === 'custom' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>{t('differentPrices')}</button></div>
      {mode === 'all' && <label className="mt-5 block max-w-sm"><span className="mb-2 block text-xs font-bold uppercase tracking-[.14em] text-muted-foreground">{t('pricePerStudent')}</span><div className="relative"><span className="absolute left-4 top-3 text-sm font-bold text-muted-foreground">Rp</span><input autoFocus data-testid="input-price-all" inputMode="numeric" value={displayPrice(allPrice)} onChange={(e) => setForAll(e.target.value)} placeholder="0" className="focus-ring h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-right font-bold outline-none focus:border-primary" /></div></label>}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card"><div className="grid grid-cols-[1fr_74px_125px] gap-2 border-b border-border bg-muted/50 px-4 py-3 text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground"><span>Siswa</span><span>Level</span><span className="text-right">Harga</span></div><div className="scroll-thin max-h-[380px] overflow-y-auto">{chosen.map((s) => <div key={s.id} data-testid={`row-price-${s.id}`} className="grid grid-cols-[1fr_74px_125px] items-center gap-2 border-b border-border/70 px-4 py-3 last:border-0"><span className="flex min-w-0 items-center gap-1"><span className="min-w-0"><span className="block truncate text-sm font-bold">{s.name}</span><span className="mono block text-[9px] text-muted-foreground">{s.id}</span></span><WhatsAppLink studentId={s.id} studentName={s.name} phone={s.phone} level={s.level} /></span><span className="text-xs font-bold text-muted-foreground">{s.level}</span><div className="relative"><span className="absolute left-2.5 top-2.5 text-[11px] font-bold text-muted-foreground">Rp</span><input data-testid={`input-price-${s.id}`} disabled={mode === 'all'} inputMode="numeric" value={displayPrice(mode === 'all' ? allPrice : prices[s.id] || '')} onChange={(e) => update(s.id, e.target.value)} placeholder="0" className="focus-ring h-9 w-full rounded-lg border border-border bg-background pl-8 pr-2 text-right text-xs font-bold outline-none focus:border-primary disabled:opacity-60" /></div></div>)}</div></div>
    </div>
  </StepLayout>;
}

function ReviewStep({ name, items, editingId, onBack, onSave }: { name: string; items: PriceItem[]; editingId?: string; onBack: () => void; onSave: () => void }) {
  const { t } = useLanguage();
  const total = items.reduce((sum, s) => sum + s.price, 0);

  return <StepLayout step="review" footer={<><Button testId="button-back-review" variant="quiet" onClick={onBack}><ArrowLeft size={16} />{t('cancel')}</Button><Button testId="button-save-record" onClick={onSave}><Check size={16} />{editingId ? t('saveChanges') : t('saveRecord')}</Button></>}>
    <div><p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-primary">{t('stepLabel')} 04 / 04</p><h1 className="text-3xl font-bold tracking-[-.05em] sm:text-4xl">{t('inspectTitle')}</h1><p className="mt-3 text-sm text-muted-foreground">{t('inspectDescription')}</p>
      <div className="mt-9 grid gap-3 sm:grid-cols-[1fr_170px]"><div className="rounded-2xl border border-border bg-card p-5"><span className="mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">{t('recordNameLabel')}</span><p data-testid="text-review-name" className="mt-2 text-lg font-bold">{name}</p></div><div className="rounded-2xl bg-primary p-5 text-primary-foreground"><span className="mono text-[10px] uppercase tracking-[.16em] opacity-70">{t('total')}</span><p data-testid="text-review-total" className="mt-2 text-xl font-bold tracking-[-.04em]">{currency(total)}</p><p className="mt-1 text-xs opacity-70">{items.length} {t('students').toLowerCase()}</p></div></div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card"><div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3"><span className="text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">{t('recordDetails')}</span><span data-testid="text-review-count" className="mono text-[10px] font-bold text-primary">{items.length} {t('students').toLowerCase()}</span></div>{items.map((s) => <div key={s.id} data-testid={`review-row-${s.id}`} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border/70 px-4 py-3.5 last:border-0"><span className="flex min-w-0 items-center gap-1"><span className="min-w-0"><span className="block truncate text-sm font-bold">{s.name}</span><span className="mono mt-0.5 block text-[10px] text-muted-foreground">{s.id} · {s.phone} · {s.level}</span></span><WhatsAppLink studentId={s.id} studentName={s.name} phone={s.phone} level={s.level} /></span><span className="text-sm font-bold">{currency(s.price)}</span></div>)}</div>
    </div>
  </StepLayout>;
}

function Flow({ editingId, startAt }: { editingId?: string; startAt?: Step }) {
  const [, setLocation] = useLocation(); const [records, setRecords] = useState<RecordItem[]>(readRecords); const existing = editingId ? records.find((r) => r.id === editingId) : undefined;
  const allStudents = useMemo(() => readAllStudents(), []);
  const [step, setStep] = useState<Step>(startAt || (editingId ? 'students' : 'name')); const [name, setName] = useState(existing?.name || ''); const [selected, setSelected] = useState<string[]>(existing?.students.map((s) => s.id) || []); const [items, setItems] = useState<PriceItem[]>(existing?.students || []);
  const chosen = allStudents.filter((s) => selected.includes(s.id));
  const save = () => { const next: RecordItem = { id: editingId || `record-${Date.now()}`, name, createdAt: existing?.createdAt || new Date().toISOString(), students: items.map((student) => ({ ...student, originalPrice: student.price, totalPaid: student.totalPaid ?? 0, paymentHistory: normalizePaymentHistory(student.paymentHistory) })) }; const all = editingId ? records.map((r) => r.id === editingId ? next : r) : [next, ...records]; saveRecords(all); setRecords(all); setLocation('/'); };
  if (step === 'name') return <NameStep initial={name} onNext={(value) => { setName(value); setStep('students'); }} />;
  if (step === 'students') return <StudentsStep selected={selected} onBack={() => setStep('name')} onNext={(ids) => { setSelected(ids); setItems(ids.map((id) => items.find((i) => i.id === id) || allStudents.find((s) => s.id === id)! as PriceItem)); setStep('pricing'); }} />;
  if (step === 'pricing') return <PricingStep chosen={chosen} initial={items} onBack={() => setStep('students')} onNext={(next) => { setItems(next); setStep('review'); }} />;
  return <ReviewStep name={name} items={items} editingId={editingId} onBack={() => setStep('pricing')} onSave={save} />;
}

function SettingsPage() {
  const [, setLocation] = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [waSettings, setWaSettings] = useState<WhatsAppSettings>(() => readWhatsAppSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleWa = (enabled: boolean) => {
    const updated = { ...waSettings, enabled };
    setWaSettings(updated);
    saveWhatsAppSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveWaMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveWhatsAppSettings(waSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const insertVariable = (variableTag: string) => {
    const current = waSettings.message;
    const updated = current ? `${current} ${variableTag}` : variableTag;
    setWaSettings({ ...waSettings, message: updated });
    setSavedSuccess(false);
  };

  const samplePreviewTarget: WhatsAppPromptTarget = {
    studentId: 'STD-26001',
    studentName: 'Abdul Karim Lamongan',
    phone: '0857-0614-8175',
    level: 'Tsaniy',
  };

  const previewText = formatWhatsAppMessage(waSettings.message, samplePreviewTarget);

  return <Shell><section className="page-in mx-auto max-w-3xl px-5 pb-16 pt-6 md:px-8 md:pt-10">
    <button data-testid="button-settings-back" onClick={() => setLocation('/')} className="focus-ring mb-8 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground transition hover:text-primary"><ArrowLeft size={15} />{t('back')}</button>
    <div className="mb-8"><p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-primary">{t('settings')}</p><h1 className="text-3xl font-bold tracking-[-.05em] sm:text-4xl">{t('settings')}</h1><p className="mt-3 text-sm text-muted-foreground">{t('settingsDescription')}</p></div>
    
    <div className="space-y-6">
      {/* WhatsApp Ready Message Configuration */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#25D366]/15 text-[#25D366]">
              <MessageSquare size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold">{t('readyMessage')}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t('readyMessageDesc')}</p>
            </div>
          </div>

          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              data-testid="toggle-ready-message"
              checked={waSettings.enabled}
              onChange={(e) => handleToggleWa(e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#25D366] peer-checked:after:translate-x-full peer-focus:outline-none"></div>
          </label>
        </div>

        {waSettings.enabled && (
          <form onSubmit={handleSaveWaMessage} className="mt-6 border-t border-border pt-5 animate-in fade-in duration-200">
            {/* Variable insertion buttons */}
            <div className="mb-3">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[.12em] text-muted-foreground">
                {t('insertVariables')}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  data-testid="button-insert-var-son"
                  onClick={() => insertVariable('{son_name}')}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-secondary px-2.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
                >
                  <span className="mono font-bold">{'{son_name}'}</span>
                  <span className="text-[11px] text-muted-foreground">({t('varSonNameLabel')})</span>
                </button>

                <button
                  type="button"
                  data-testid="button-insert-var-father"
                  onClick={() => insertVariable('{father_name}')}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-secondary px-2.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
                >
                  <span className="mono font-bold">{'{father_name}'}</span>
                  <span className="text-[11px] text-muted-foreground">({t('varFatherNameLabel')})</span>
                </button>

                <button
                  type="button"
                  data-testid="button-insert-var-phone"
                  onClick={() => insertVariable('{phone}')}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-secondary px-2.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
                >
                  <span className="mono font-bold">{'{phone}'}</span>
                  <span className="text-[11px] text-muted-foreground">({t('varPhoneLabel')})</span>
                </button>

                <button
                  type="button"
                  data-testid="button-insert-var-group"
                  onClick={() => insertVariable('{group}')}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-secondary px-2.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
                >
                  <span className="mono font-bold">{'{group}'}</span>
                  <span className="text-[11px] text-muted-foreground">({t('varGroupLabel')})</span>
                </button>
              </div>
            </div>

            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[.14em] text-muted-foreground">
              {t('readyMessageText')}
            </label>
            <textarea
              data-testid="textarea-ready-message"
              rows={4}
              value={waSettings.message}
              onChange={(e) => {
                setWaSettings({ ...waSettings, message: e.target.value });
                setSavedSuccess(false);
              }}
              placeholder={t('readyMessagePlaceholder')}
              className="focus-ring w-full resize-y rounded-xl border border-border bg-background p-3.5 text-sm outline-none focus:border-primary"
            />

            {/* Live Message Preview */}
            {waSettings.message.trim() && (
              <div className="mt-3 rounded-xl border border-border/70 bg-muted/30 p-3.5 text-xs">
                <span className="mono mb-1.5 block text-[10px] font-bold uppercase tracking-[.14em] text-primary">
                  {t('previewMessage')} (Contoh Siswa: Abdul Karim Lamongan)
                </span>
                <p className="whitespace-pre-wrap font-medium text-foreground">
                  {previewText}
                </p>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {savedSuccess && <span className="font-bold text-[#25D366]">{t('readyMessageSaved')}</span>}
              </span>
              <button
                type="submit"
                data-testid="button-save-ready-message"
                className="focus-ring inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                <Check size={15} />
                <span>{t('saveMessage')}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Language Configuration */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><Languages size={18} /></span><div><h2 className="text-base font-bold">{t('language')}</h2><p className="mt-1 text-sm text-muted-foreground">{t('chooseLanguage')}</p></div></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {(['id', 'en'] as Language[]).map((option) => <label key={option} data-testid={`language-option-${option}`} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${language === option ? 'border-primary bg-secondary/60' : 'border-border hover:border-primary/40'}`}><input type="radio" name="language" value={option} checked={language === option} onChange={() => setLanguage(option)} className="size-4 accent-[hsl(var(--primary))]" /><span className="text-sm font-bold">{option === 'id' ? t('indonesian') : t('english')}</span></label>)}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{t('languageSaved')}</p>
      </div>
    </div>
  </section></Shell>;
}

function Router() { return <Switch><Route path="/" component={Home} /><Route path="/settings" component={SettingsPage} /><Route path="/students" component={StudentManagerPage} /><Route path="/record/:id"><PaymentDashboardRoute /></Route><Route path="/new/name"><Flow /></Route><Route path="/edit/:id/name"><EditFlow /></Route><Route path="/edit/:id/students"><EditFlow /></Route><Route component={NotFound} /></Switch>; }
function PaymentDashboardRoute() { const [location] = useLocation(); return <PaymentDashboard recordId={location.split('/')[2]} />; }
function EditFlow() { const [location] = useLocation(); const id = location.split('/')[2]; return <Flow editingId={id} startAt={location.endsWith('/name') ? 'name' : 'students'} />; }
function RoutedErrorBoundary({ children }: { children: ReactNode }) { const [location] = useLocation(); return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>; }
const queryClient = new QueryClient();
function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><LanguageProvider><WhatsAppModalProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedErrorBoundary><Router /></RoutedErrorBoundary></WouterRouter><Toaster /></WhatsAppModalProvider></LanguageProvider><Toaster /></TooltipProvider></QueryClientProvider>; }
export default App;
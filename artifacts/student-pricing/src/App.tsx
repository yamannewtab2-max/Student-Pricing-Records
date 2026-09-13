import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, CircleCheck, CirclePlus, FileText, Languages, Pencil, Search, Settings, WalletCards, X } from 'lucide-react';

type Student = { id: string; name: string; level: string };
type PriceItem = Student & { price: number; originalPrice?: number; totalPaid?: number; paymentHistory?: number[] };
type RecordItem = { id: string; name: string; createdAt: string; students: PriceItem[] };
type Step = 'name' | 'students' | 'pricing' | 'review';
type PaymentRow = PriceItem & { originalPrice: number; totalPaid: number; paymentHistory: number[]; remainingAmount: number; isPaid: boolean };

const students: Student[] = [
  { id: 'STD-24001', name: 'Alya Putri Ramadhani', level: 'Tsaniy' },
  { id: 'STD-24002', name: 'Bima Aditya Pratama', level: 'Tsaniy' },
  { id: 'STD-24003', name: 'Citra Maharani', level: 'Tsaniy' },
  { id: 'STD-24004', name: 'Daffa Rizky Saputra', level: 'Tsaniy' },
  { id: 'STD-24005', name: 'Elena Salsabila', level: 'Tsaniy' },
  { id: 'STD-24006', name: 'Farhan Maulana', level: 'Tsaniy' },
  { id: 'STD-24007', name: 'Gita Nur Aini', level: 'Tsaniy' },
  { id: 'STD-24008', name: 'Hafiz Ramadhan', level: 'Tsaniy' },
  { id: 'STD-24009', name: 'Intan Permata Sari', level: 'Tsaniy' },
  { id: 'STD-24010', name: 'Jovan Kurniawan', level: 'Awwal' },
  { id: 'STD-24011', name: 'Kania Rahmawati', level: 'Awwal' },
  { id: 'STD-24012', name: 'Luthfi Haryanto', level: 'Awwal' },
  { id: 'STD-24013', name: 'Maya Sekar Arum', level: 'Awwal' },
  { id: 'STD-24014', name: 'Naufal Fadillah', level: 'Awwal' },
  { id: 'STD-24015', name: 'Olivia Cahyani', level: 'Awwal' },
  { id: 'STD-24016', name: 'Pandu Wiratama', level: 'Awwal' },
  { id: 'STD-24017', name: 'Qonita Azzahra', level: 'Awwal' },
  { id: 'STD-24018', name: 'Raka Bagaskara', level: 'Awwal' },
  { id: 'STD-24019', name: 'Salma Nabila', level: 'Awwal' },
  { id: 'STD-24020', name: 'Tegar Prakoso', level: 'Awwal' },
  { id: 'STD-24021', name: 'Ulya Khairunnisa', level: 'Awwal' },
  { id: 'STD-24022', name: 'Vino Alfarizi', level: 'Awwal' },
  { id: 'STD-24023', name: 'Wahyu Firmansyah', level: 'Awwal' },
  { id: 'STD-24024', name: 'Xaviera Anindita', level: 'Awwal' },
  { id: 'STD-24025', name: 'Yusuf Alamsyah', level: 'Awwal' },
  { id: 'STD-24026', name: 'Zahra Fatin', level: 'Awwal' },
  { id: 'STD-24027', name: 'Arga Pranata', level: 'Awwal' },
  { id: 'STD-24028', name: 'Bella Oktaviani', level: 'Awwal' },
  { id: 'STD-24029', name: 'Dimas Setiawan', level: 'Awwal' },
  { id: 'STD-24030', name: 'Nadine Larasati', level: 'Awwal' },
];

const currency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
const readRecords = (): RecordItem[] => { try { return JSON.parse(localStorage.getItem('student-pricing-records') || '[]'); } catch { return []; } };
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
    lowToHigh: 'Rendah → tinggi', highToLow: 'Tinggi → rendah', paid: 'Sudah bayar', unpaid: 'Belum bayar', remaining: 'Sisa',
    payment: 'Pembayaran', payAll: 'Bayar semua', confirm: 'Konfirmasi', confirmPayRemaining: 'Bayar seluruh sisa pembayaran?',
    paidStatus: 'Sudah bayar', history: 'Riwayat', paymentTotal: 'Pembayaran', paymentNumber: 'Pembayaran', noStudents: 'Siswa tidak ditemukan.',
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
  },
  en: {
    appName: 'Cost archive', schoolAdmin: 'School administration', workspace: 'Workspace · 2024/25', settings: 'Settings',
    savedRecords: 'Saved records', studentPrices: 'Student prices', homeDescription: 'Create and save student price lists in a few steps.',
    createRecord: 'Create record', emptyRecords: 'No records yet', emptyRecordsDescription: 'Your saved price records will appear here.',
    createFirstRecord: 'Create your first record', record: 'Record', students: 'Students', total: 'Total', edit: 'Edit', delete: 'Delete',
    back: 'Back', backToRecords: 'Back to records', paymentDashboard: 'Payment dashboard', searchStudent: 'Search student number or name',
    lowToHigh: 'Low → high', highToLow: 'High → low', paid: 'Paid', unpaid: 'Not paid', remaining: 'Remaining',
    payment: 'Payment', payAll: 'Pay all', confirm: 'Confirm', confirmPayRemaining: 'Pay the full remaining balance?',
    paidStatus: 'Paid', history: 'History', paymentTotal: 'Payments', paymentNumber: 'Payment', noStudents: 'No students found.',
    amountRequired: 'Enter a payment amount.', maxAmount: 'Maximum', cancel: 'Cancel', save: 'Save',
    settingsDescription: 'Choose the language used in the app.', language: 'Language', chooseLanguage: 'Choose display language',
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
const getPaymentRow = (student: PriceItem): PaymentRow => {
  const originalPrice = student.originalPrice ?? student.price;
  const paymentHistory = student.paymentHistory ?? [];
  const totalPaid = student.totalPaid ?? paymentHistory.reduce((sum, amount) => sum + amount, 0);
  const remainingAmount = Math.max(0, originalPrice - totalPaid);
  return { ...student, originalPrice, totalPaid, paymentHistory, remainingAmount, isPaid: remainingAmount === 0 };
};

function Shell({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  return <div className="app-shell">
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 md:px-8">
      <button data-testid="button-home" className="focus-ring flex items-center gap-3 text-left" onClick={() => setLocation('/')}>
        <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><WalletCards size={18} strokeWidth={2.4} /></span>
        <span><span className="block text-[15px] font-bold tracking-[-.02em]">{t('appName')}</span><span className="block text-[10px] font-semibold uppercase tracking-[.16em] text-muted-foreground">{t('schoolAdmin')}</span></span>
      </button>
      <div className="flex items-center gap-3"><span className="mono hidden text-[10px] uppercase tracking-[.18em] text-muted-foreground sm:block">{t('workspace')}</span><button data-testid="button-settings" onClick={() => setLocation('/settings')} className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-bold text-muted-foreground transition hover:border-primary/40 hover:text-primary"><Settings size={15} />{t('settings')}</button></div>
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
      <Button testId="button-create-record" onClick={() => setLocation('/new/name')}><CirclePlus size={17} />{t('createRecord')}</Button>
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

function StepLayout({ step, children, footer }: { step: Step; children: ReactNode; footer: ReactNode }) {
  return <Shell><section className="page-in mx-auto max-w-3xl px-5 pb-36 pt-6 md:px-8 md:pt-10"><Progress step={step} />{children}</section><div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-[hsl(var(--background)/.92)] px-5 py-3 backdrop-blur-md md:px-8"><div className="mx-auto flex max-w-3xl items-center justify-between gap-3">{footer}</div></div></Shell>;
}

function PaymentDashboard({ recordId }: { recordId: string }) {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
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
    const searched = source.filter((student) => `${student.id} ${student.name}`.toLowerCase().includes(query.toLowerCase()));
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
    updateRecord(record.students.map((item) => item.id === studentId ? { ...item, originalPrice: current.originalPrice, totalPaid: current.totalPaid + amount, paymentHistory: [...current.paymentHistory, amount] } : item));
    setPaymentId(undefined);
    setPaymentValue('');
    setPaymentError('');
  };
  const payAll = (studentId: string) => {
    const student = record.students.find((item) => item.id === studentId);
    if (!student) return;
    const current = getPaymentRow(student);
    if (!current.remainingAmount) return;
    updateRecord(record.students.map((item) => item.id === studentId ? { ...item, originalPrice: current.originalPrice, totalPaid: current.totalPaid + current.remainingAmount, paymentHistory: [...current.paymentHistory, current.remainingAmount] } : item));
    setConfirmAllId(undefined);
  };

  return <Shell><section className="page-in mx-auto max-w-5xl px-5 pb-16 pt-6 md:px-8 md:pt-10">
    <button data-testid="button-dashboard-back" onClick={() => setLocation('/')} className="focus-ring mb-8 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground transition hover:text-primary"><ArrowLeft size={15} />{t('backToRecords')}</button>
    <div className="mb-8"><p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-primary">{t('paymentDashboard')}</p><h1 className="text-3xl font-bold tracking-[-.05em] sm:text-4xl">{record.name}</h1></div>
    <div className="space-y-3">
      <div className="relative"><Search className="absolute left-3 top-3.5 text-muted-foreground" size={16} /><input data-testid="input-payment-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('searchStudent')} className="focus-ring h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-primary" /></div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><button data-testid="button-filter-low" onClick={() => setFilter('low')} className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${filter === 'low' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground'}`}>{t('lowToHigh')}</button><button data-testid="button-filter-high" onClick={() => setFilter('high')} className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${filter === 'high' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground'}`}>{t('highToLow')}</button><button data-testid="button-filter-paid" onClick={() => setFilter('paid')} className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${filter === 'paid' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground'}`}>{t('paid')}</button><button data-testid="button-filter-unpaid" onClick={() => setFilter('unpaid')} className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${filter === 'unpaid' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground'}`}>{t('unpaid')}</button></div>
    </div>
    <div className="mt-7 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3"><span className="text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">{t('students')}</span><span data-testid="text-dashboard-count" className="mono text-[10px] font-bold text-primary">{rows.length} / {record.students.length}</span></div>
      {rows.length ? rows.map((student) => <div key={student.id} data-testid={`payment-row-${student.id}`} className={`border-b border-border/70 px-4 py-4 last:border-0 transition ${student.isPaid ? 'bg-muted/35' : 'hover:bg-secondary/20'}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0"><p className={`truncate text-sm font-bold ${student.isPaid ? 'text-muted-foreground line-through' : ''}`}>{student.name}</p><p className="mono mt-1 text-[10px] text-muted-foreground">{student.id} · {student.level}</p></div>
           <div className="flex flex-wrap items-center gap-2 sm:justify-end"><div className="text-left sm:text-right"><span className="block text-[10px] uppercase tracking-[.12em] text-muted-foreground">{t('remaining')}</span><span data-testid={`text-remaining-${student.id}`} className={`text-sm font-bold ${student.isPaid ? 'text-muted-foreground' : 'text-primary'}`}>{currency(student.remainingAmount)}</span></div>{student.isPaid ? <span className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-2 text-xs font-bold text-muted-foreground"><CircleCheck size={15} />{t('paidStatus')}</span> : <><button data-testid={`button-payment-${student.id}`} onClick={() => { setPaymentId(student.id); setConfirmAllId(undefined); setPaymentValue(''); setPaymentError(''); }} className="focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground transition hover:-translate-y-px"><CirclePlus size={15} />{t('payment')}</button><button data-testid={`button-pay-all-${student.id}`} aria-label={confirmAllId === student.id ? t('confirm') : t('payAll')} onClick={() => confirmAllId === student.id ? payAll(student.id) : setConfirmAllId(student.id)} className={`focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition hover:-translate-y-px ${confirmAllId === student.id ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-primary'}`}>{confirmAllId === student.id ? <><Check size={15} />{t('confirm')}</> : <><Check size={15} />{t('payAll')}</>}</button></>}{student.paymentHistory.length > 0 && <button data-testid={`button-history-${student.id}`} onClick={() => setExpandedId(expandedId === student.id ? undefined : student.id)} className="focus-ring inline-flex min-h-10 items-center gap-1 rounded-lg border border-border px-3 text-xs font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground">{expandedId === student.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}{t('history')}</button>}</div>
        </div>
         {confirmAllId === student.id && !student.isPaid && <p data-testid={`text-confirm-pay-all-${student.id}`} className="mt-3 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-muted-foreground">{t('confirmPayRemaining')} · {currency(student.remainingAmount)}</p>}
         {paymentId === student.id && <div className="mt-4 rounded-xl bg-muted p-3"><div className="flex flex-col gap-2 sm:flex-row sm:items-center"><label className="relative flex-1"><span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">Rp</span><input autoFocus data-testid={`input-payment-${student.id}`} inputMode="numeric" value={paymentValue ? new Intl.NumberFormat('id-ID').format(Number(paymentValue)) : ''} onChange={(e) => { setPaymentValue(e.target.value.replace(/\D/g, '')); setPaymentError(''); }} placeholder={t('payment')} className="focus-ring h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-right text-sm font-bold outline-none focus:border-primary" /></label><div className="flex gap-2"><button data-testid={`button-cancel-payment-${student.id}`} onClick={() => { setPaymentId(undefined); setPaymentError(''); }} className="focus-ring min-h-10 rounded-lg px-3 text-xs font-bold text-muted-foreground hover:bg-card">{t('cancel')}</button><button data-testid={`button-save-payment-${student.id}`} onClick={() => addPayment(student.id)} className="focus-ring min-h-10 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground">{t('save')}</button></div></div>{paymentError && <p data-testid={`text-payment-error-${student.id}`} className="mt-2 text-xs font-semibold text-destructive">{paymentError}</p>}</div>}
         {expandedId === student.id && <div data-testid={`payment-history-${student.id}`} className="mt-4 rounded-xl border border-border bg-background px-4 py-3"><div className="flex items-center justify-between text-xs"><span className="font-bold text-muted-foreground">{t('paymentTotal')}</span><span className="font-bold">{currency(student.totalPaid)}</span></div><div className="mt-2 space-y-1">{student.paymentHistory.map((amount, index) => <div key={`${student.id}-${index}`} className="flex justify-between text-xs text-muted-foreground"><span>{t('paymentNumber')} {index + 1}</span><span>{currency(amount)}</span></div>)}</div><div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-xs"><span className="font-bold text-muted-foreground">{t('remaining')}</span><span className="font-bold text-primary">{currency(student.remainingAmount)}</span></div></div>}
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
  const [query, setQuery] = useState(''); const [mode, setMode] = useState<'all' | 'custom' | 'tsaniy' | 'awwal'>(selected?.length === students.length ? 'all' : 'custom'); const [ids, setIds] = useState<string[]>(selected || []);
  const filtered = useMemo(() => students.filter((s) => `${s.id} ${s.name}`.toLowerCase().includes(query.toLowerCase()) && (mode === 'all' || mode === 'custom' || s.level.toLowerCase() === mode)), [mode, query]);
  const allShownSelected = filtered.length > 0 && filtered.every((s) => ids.includes(s.id));
  const toggleAll = () => setIds(allShownSelected ? ids.filter((id) => !filtered.some((s) => s.id === id)) : [...new Set([...ids, ...filtered.map((s) => s.id)])]);
  const toggleMode = (next: 'all' | 'custom' | 'tsaniy' | 'awwal') => { setMode(next); if (next === 'all') setIds(students.map((s) => s.id)); else if (next === 'tsaniy' || next === 'awwal') setIds(students.filter((s) => s.level.toLowerCase() === next).map((s) => s.id)); };
  return <StepLayout step="students" footer={<><Button testId="button-back-students" variant="quiet" onClick={onBack}><ArrowLeft size={16} />{t('cancel')}</Button><Button testId="button-next-students" disabled={!ids.length} onClick={() => onNext(ids)}>{t('next')} <ArrowRight size={16} /></Button></>}>
    <div><p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-primary">{t('stepLabel')} 02 / 04</p><h1 className="text-3xl font-bold tracking-[-.05em] sm:text-4xl">{t('chooseStudentsTitle')}</h1><p className="mt-3 text-sm text-muted-foreground">{t('chooseStudentsDescription')}</p>
      <div className="mt-9 grid grid-cols-4 rounded-xl border border-border bg-muted p-1"><button data-testid="button-mode-all" onClick={() => toggleMode('all')} className={`rounded-lg px-1 py-2.5 text-xs font-bold transition sm:text-sm ${mode === 'all' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>{t('all')} <span className="mono ml-1 text-[10px]">30</span></button><button data-testid="button-mode-custom" onClick={() => toggleMode('custom')} className={`rounded-lg px-1 py-2.5 text-xs font-bold transition sm:text-sm ${mode === 'custom' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>{t('chooseOwn')}</button><button data-testid="button-mode-tsaniy" onClick={() => toggleMode('tsaniy')} className={`rounded-lg px-1 py-2.5 text-xs font-bold transition sm:text-sm ${mode === 'tsaniy' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>Tsaniy</button><button data-testid="button-mode-awwal" onClick={() => toggleMode('awwal')} className={`rounded-lg px-1 py-2.5 text-xs font-bold transition sm:text-sm ${mode === 'awwal' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>Awwal</button></div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="relative flex-1"><Search className="absolute left-3 top-3.5 text-muted-foreground" size={16} /><input data-testid="input-student-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('searchStudent')} className="focus-ring h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-primary" /></div><span data-testid="text-selected-count" className="mono text-xs font-bold text-primary">{ids.length} / 30 {t('selected')}</span></div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card"><div className="flex items-center gap-3 border-b border-border bg-muted/50 px-4 py-3"><input type="checkbox" data-testid="checkbox-select-all" checked={allShownSelected} onChange={toggleAll} className="size-4 accent-[hsl(var(--primary))]" /><span className="text-xs font-bold text-muted-foreground">{allShownSelected ? t('deselectAll') : t('selectAll')}{query && ` · ${filtered.length}`}</span></div><div className="scroll-thin max-h-[390px] overflow-y-auto">{filtered.length ? filtered.map((s, i) => <label key={s.id} data-testid={`row-student-${s.id}`} className="row-in flex cursor-pointer items-center gap-3 border-b border-border/70 px-4 py-3.5 last:border-0 hover:bg-secondary/45" style={{ animationDelay: `${i * 18}ms` }}><input type="checkbox" data-testid={`checkbox-student-${s.id}`} checked={ids.includes(s.id)} onChange={() => setIds(ids.includes(s.id) ? ids.filter((id) => id !== s.id) : [...ids, s.id])} className="size-4 accent-[hsl(var(--primary))]" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{s.name}</span><span className="mono mt-0.5 block text-[10px] text-muted-foreground">{s.id}</span></span><span className="rounded-md bg-secondary px-2 py-1 text-[10px] font-bold text-primary">{s.level}</span></label>) : <div className="px-5 py-12 text-center text-sm text-muted-foreground">{t('noStudents')}</div>}</div></div>
      {!ids.length && <p className="mt-3 text-xs font-semibold text-destructive" data-testid="status-no-selection">{t('noSelection')}</p>}
    </div>
  </StepLayout>;
}

function PricingStep({ chosen, initial, onBack, onNext }: { chosen: Student[]; initial?: PriceItem[]; onBack: () => void; onNext: (items: PriceItem[]) => void }) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'all' | 'custom'>('all'); const [allPrice, setAllPrice] = useState(initial?.[0]?.price?.toString() || ''); const [prices, setPrices] = useState<Record<string, string>>(() => Object.fromEntries((initial || []).map((s) => [s.id, String(s.price || '')])));
  const valid = chosen.every((s) => Number(mode === 'all' ? allPrice : prices[s.id]) > 0);
  const displayPrice = (v: string) => v ? new Intl.NumberFormat('id-ID').format(Number(v.replace(/\D/g, ''))) : '';
  const setForAll = (v: string) => { const clean = v.replace(/\D/g, ''); setAllPrice(clean); setPrices(Object.fromEntries(chosen.map((s) => [s.id, clean]))); };
  const update = (id: string, v: string) => setPrices((p) => ({ ...p, [id]: v.replace(/\D/g, '') }));
  return <StepLayout step="pricing" footer={<><Button testId="button-back-pricing" variant="quiet" onClick={onBack}><ArrowLeft size={16} />{t('cancel')}</Button><Button testId="button-next-pricing" disabled={!valid} onClick={() => onNext(chosen.map((s) => ({ ...s, price: Number(mode === 'all' ? allPrice : prices[s.id]) })))}>{t('next')} <ArrowRight size={16} /></Button></>}>
    <div><p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-primary">{t('stepLabel')} 03 / 04</p><h1 className="text-3xl font-bold tracking-[-.05em] sm:text-4xl">{t('setPriceTitle')}</h1><p className="mt-3 text-sm text-muted-foreground">{t('setPriceDescription')}</p>
      <div className="mt-9 grid grid-cols-2 rounded-xl border border-border bg-muted p-1"><button data-testid="button-price-all" onClick={() => setMode('all')} className={`rounded-lg px-2 py-2.5 text-xs font-bold transition sm:text-sm ${mode === 'all' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>{t('onePrice')}</button><button data-testid="button-price-custom" onClick={() => { setMode('custom'); setPrices((p) => Object.fromEntries(chosen.map((s) => [s.id, p[s.id] || allPrice]))) }} className={`rounded-lg px-2 py-2.5 text-xs font-bold transition sm:text-sm ${mode === 'custom' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>{t('differentPrices')}</button></div>
      {mode === 'all' && <label className="mt-5 block max-w-sm"><span className="mb-2 block text-xs font-bold uppercase tracking-[.14em] text-muted-foreground">{t('pricePerStudent')}</span><div className="relative"><span className="absolute left-4 top-3 text-sm font-bold text-muted-foreground">Rp</span><input autoFocus data-testid="input-price-all" inputMode="numeric" value={displayPrice(allPrice)} onChange={(e) => setForAll(e.target.value)} placeholder="0" className="focus-ring h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-right font-bold outline-none focus:border-primary" /></div></label>}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card"><div className="grid grid-cols-[1fr_74px_125px] gap-2 border-b border-border bg-muted/50 px-4 py-3 text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground"><span>Siswa</span><span>Level</span><span className="text-right">Harga</span></div><div className="scroll-thin max-h-[380px] overflow-y-auto">{chosen.map((s) => <div key={s.id} data-testid={`row-price-${s.id}`} className="grid grid-cols-[1fr_74px_125px] items-center gap-2 border-b border-border/70 px-4 py-3 last:border-0"><span className="min-w-0"><span className="block truncate text-sm font-bold">{s.name}</span><span className="mono block text-[9px] text-muted-foreground">{s.id}</span></span><span className="text-xs font-bold text-muted-foreground">{s.level}</span><div className="relative"><span className="absolute left-2.5 top-2.5 text-[11px] font-bold text-muted-foreground">Rp</span><input data-testid={`input-price-${s.id}`} disabled={mode === 'all'} inputMode="numeric" value={displayPrice(mode === 'all' ? allPrice : prices[s.id] || '')} onChange={(e) => update(s.id, e.target.value)} placeholder="0" className="focus-ring h-9 w-full rounded-lg border border-border bg-background pl-8 pr-2 text-right text-xs font-bold outline-none focus:border-primary disabled:opacity-60" /></div></div>)}</div></div>
    </div>
  </StepLayout>;
}

function ReviewStep({ name, items, editingId, onBack, onSave }: { name: string; items: PriceItem[]; editingId?: string; onBack: () => void; onSave: () => void }) {
  const { t } = useLanguage();
  const total = items.reduce((sum, s) => sum + s.price, 0);
  return <StepLayout step="review" footer={<><Button testId="button-back-review" variant="quiet" onClick={onBack}><ArrowLeft size={16} />{t('cancel')}</Button><Button testId="button-save-record" onClick={onSave}><Check size={16} />{editingId ? t('saveChanges') : t('saveRecord')}</Button></>}>
    <div><p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-primary">{t('stepLabel')} 04 / 04</p><h1 className="text-3xl font-bold tracking-[-.05em] sm:text-4xl">{t('inspectTitle')}</h1><p className="mt-3 text-sm text-muted-foreground">{t('inspectDescription')}</p>
      <div className="mt-9 grid gap-3 sm:grid-cols-[1fr_170px]"><div className="rounded-2xl border border-border bg-card p-5"><span className="mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">{t('recordNameLabel')}</span><p data-testid="text-review-name" className="mt-2 text-lg font-bold">{name}</p></div><div className="rounded-2xl bg-primary p-5 text-primary-foreground"><span className="mono text-[10px] uppercase tracking-[.16em] opacity-70">{t('total')}</span><p data-testid="text-review-total" className="mt-2 text-xl font-bold tracking-[-.04em]">{currency(total)}</p><p className="mt-1 text-xs opacity-70">{items.length} {t('students').toLowerCase()}</p></div></div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card"><div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3"><span className="text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">{t('recordDetails')}</span><span data-testid="text-review-count" className="mono text-[10px] font-bold text-primary">{items.length} {t('students').toLowerCase()}</span></div>{items.map((s) => <div key={s.id} data-testid={`review-row-${s.id}`} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border/70 px-4 py-3.5 last:border-0"><span className="min-w-0"><span className="block truncate text-sm font-bold">{s.name}</span><span className="mono mt-0.5 block text-[10px] text-muted-foreground">{s.id} · {s.level}</span></span><span className="text-sm font-bold">{currency(s.price)}</span></div>)}</div>
    </div>
  </StepLayout>;
}

function Flow({ editingId, startAt }: { editingId?: string; startAt?: Step }) {
  const [, setLocation] = useLocation(); const [records, setRecords] = useState<RecordItem[]>(readRecords); const existing = editingId ? records.find((r) => r.id === editingId) : undefined;
  const [step, setStep] = useState<Step>(startAt || (editingId ? 'students' : 'name')); const [name, setName] = useState(existing?.name || ''); const [selected, setSelected] = useState<string[]>(existing?.students.map((s) => s.id) || []); const [items, setItems] = useState<PriceItem[]>(existing?.students || []);
  const chosen = students.filter((s) => selected.includes(s.id));
  const save = () => { const next: RecordItem = { id: editingId || `record-${Date.now()}`, name, createdAt: existing?.createdAt || new Date().toISOString(), students: items.map((student) => ({ ...student, originalPrice: student.price, totalPaid: student.totalPaid ?? 0, paymentHistory: student.paymentHistory ?? [] })) }; const all = editingId ? records.map((r) => r.id === editingId ? next : r) : [next, ...records]; saveRecords(all); setRecords(all); setLocation('/'); };
  if (step === 'name') return <NameStep initial={name} onNext={(value) => { setName(value); setStep('students'); }} />;
  if (step === 'students') return <StudentsStep selected={selected} onBack={() => setStep('name')} onNext={(ids) => { setSelected(ids); setItems(ids.map((id) => items.find((i) => i.id === id) || students.find((s) => s.id === id)! as PriceItem)); setStep('pricing'); }} />;
  if (step === 'pricing') return <PricingStep chosen={chosen} initial={items} onBack={() => setStep('students')} onNext={(next) => { setItems(next); setStep('review'); }} />;
  return <ReviewStep name={name} items={items} editingId={editingId} onBack={() => setStep('pricing')} onSave={save} />;
}

function SettingsPage() {
  const [, setLocation] = useLocation();
  const { language, setLanguage, t } = useLanguage();
  return <Shell><section className="page-in mx-auto max-w-3xl px-5 pb-16 pt-6 md:px-8 md:pt-10">
    <button data-testid="button-settings-back" onClick={() => setLocation('/')} className="focus-ring mb-8 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground transition hover:text-primary"><ArrowLeft size={15} />{t('back')}</button>
    <div className="mb-8"><p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-primary">{t('settings')}</p><h1 className="text-3xl font-bold tracking-[-.05em] sm:text-4xl">{t('settings')}</h1><p className="mt-3 text-sm text-muted-foreground">{t('settingsDescription')}</p></div>
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><Languages size={18} /></span><div><h2 className="text-base font-bold">{t('language')}</h2><p className="mt-1 text-sm text-muted-foreground">{t('chooseLanguage')}</p></div></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {(['id', 'en'] as Language[]).map((option) => <label key={option} data-testid={`language-option-${option}`} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${language === option ? 'border-primary bg-secondary/60' : 'border-border hover:border-primary/40'}`}><input type="radio" name="language" value={option} checked={language === option} onChange={() => setLanguage(option)} className="size-4 accent-[hsl(var(--primary))]" /><span className="text-sm font-bold">{option === 'id' ? t('indonesian') : t('english')}</span></label>)}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{t('languageSaved')}</p>
    </div>
  </section></Shell>;
}

function Router() { return <Switch><Route path="/" component={Home} /><Route path="/settings" component={SettingsPage} /><Route path="/record/:id"><PaymentDashboardRoute /></Route><Route path="/new/name"><Flow /></Route><Route path="/edit/:id/name"><EditFlow /></Route><Route path="/edit/:id/students"><EditFlow /></Route><Route component={NotFound} /></Switch>; }
function PaymentDashboardRoute() { const [location] = useLocation(); return <PaymentDashboard recordId={location.split('/')[2]} />; }
function EditFlow() { const [location] = useLocation(); const id = location.split('/')[2]; return <Flow editingId={id} startAt={location.endsWith('/name') ? 'name' : 'students'} />; }
function RoutedErrorBoundary({ children }: { children: ReactNode }) { const [location] = useLocation(); return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>; }
const queryClient = new QueryClient();
function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><LanguageProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedErrorBoundary><Router /></RoutedErrorBoundary></WouterRouter><Toaster /></LanguageProvider><Toaster /></TooltipProvider></QueryClientProvider>; }
export default App;
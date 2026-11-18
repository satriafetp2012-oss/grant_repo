import { GuidelineItem } from "../types/grants";

export const GUIDELINES_LIBRARY: GuidelineItem[] = [
  {
    id: "guide-bima-dppm",
    funder: "Kemdiktisaintek / DPPM (BIMA)",
    schemeName: "Panduan Penelitian & Pengabdian kepada Masyarakat (PF, Terapan, PKPT, RIKUB, PDD, PTM, PDP)",
    origin: "IDN",
    domains: ["Health", "Social Science", "Road Safety"],
    tktRange: "TKT 1–3 (Fundamental, PDD, PTM, PDP) · TKT 4–6 (Terapan, RIKUB)",
    budgetCap: "Rp 50 juta – Rp 700 juta / tahun (tergantung skema & luaran)",
    overheadCap: "Mengikuti SBM Kemenkeu & Panduan BIMA (tanpa honorarium peneliti inti)",
    cycleWindow: "November – Desember (untuk pendanaan Tahun Anggaran berikutnya)",
    eligibilitySummaryId:
      "Ketua pengusul wajib Dosen Aktif di perguruan tinggi di bawah Kemdiktisaintek dengan NIDN/NIDK/NUPTK, memiliki SINTA ID yang terverifikasi, status aktif di PDDIKTI, dan tidak sedang tugas belajar atau memiliki tunggakan luaran periode sebelumnya.",
    eligibilitySummaryEn:
      "Lead PI must be an active university lecturer under Kemdiktisaintek holding a valid NIDN/NIDK/NUPTK, verified SINTA ID, active PDDIKTI status, not on study leave, and free of overdue outputs from prior cycles.",
    requirementsId: [
      "Penelitian Fundamental (PF): TKT 1–3, Ketua minimal S3 atau Lektor (SINTA Score Overall minimal sesuai klaster PT), dana maks Rp 150 juta/tahun.",
      "Penelitian Terapan (PT): TKT 4–6, wajib memiliki Mitra Pengguna (industri/pemerintah/RS/LSM) dengan surat pernyataan dukungan, dana Rp 200–400 juta/tahun.",
      "RIKUB (Riset Konsorsium Unggulan Berdampak): Konsorsium 2–5 tim dari PT berbeda + mitra DUDI/pemerintah, dana hingga Rp 700 juta (luaran KI) atau Rp 500 juta (prototipe).",
      "PKPT (Kerja Sama Antar Perguruan Tinggi): Tim Pengusul dari PT klaster bawah/binaan bermitra dengan Tim Mitra dari PT klaster Mandiri/Utama (seperti UGM/UI), dana hingga Rp 200 juta.",
      "Kuota Pengajuan: Setiap dosen maksimal terlibat dalam 2 judul proposal berjalan (1 sebagai Ketua + 1 sebagai Anggota, atau 2 sebagai Anggota)."
    ],
    requirementsEn: [
      "Fundamental Research (PF): TRL 1–3, Lead must hold a PhD or Lektor rank (minimum SINTA score per university cluster), max IDR 150M/year.",
      "Applied Research (PT): TRL 4–6, requires a committed User Partner (industry/government/hospital/NGO) with a signed letter, IDR 200M–400M/year.",
      "RIKUB (High-Impact Consortium Research): 2–5 institutional teams + industry/government partner, up to IDR 700M (IP output) or IDR 500M (prototype).",
      "PKPT (Inter-University Collaboration): Pairs emerging university PIs with host mentor teams at top-cluster universities (e.g., UGM/UI), up to IDR 200M.",
      "Submission Quota: Maximum 2 active proposals per lecturer (1 as Lead PI + 1 as Co-I, or 2 as Co-I)."
    ],
    documentsId: [
      "Proposal substansi sesuai templat BIMA (maks 20 halaman)",
      "Rencana Anggaran Biaya (RAB) sesuai Standar Biaya Masukan (SBM)",
      "Surat Pernyataan Kesanggupan Mitra & Kontribusi In-Kind/Tunai (wajib untuk Terapan & RIKUB)",
      "Persetujuan Ketua LPPM melalui sistem BIMA sebelum batas waktu",
      "Rekam jejak SINTA & PDDIKTI yang sudah disinkronisasi"
    ],
    documentsEn: [
      "Substantive proposal following official BIMA template (max 20 pages)",
      "Line-item budget (RAB) compliant with Ministry of Finance SBM rates",
      "Partner Commitment Letter & In-Kind/Cash contribution statement (mandatory for Applied & RIKUB)",
      "Institutional LPPM approval inside BIMA portal prior to deadline",
      "Synchronized SINTA & PDDIKTI researcher profile"
    ],
    officialUrl: "https://bima.kemdiktisaintek.go.id/",
    portalName: "Portal BIMA Kemdiktisaintek"
  },
  {
    id: "guide-hiliriset-sinergi",
    funder: "Kemdiktisaintek — Direktorat Hilirisasi dan Kemitraan (Hiliriset)",
    schemeName: "Panduan Hilirisasi Riset Prioritas (SINERGI, Ajakan Industri & Riset Kemitraan Internasional)",
    origin: "IDN",
    domains: ["Health", "Social Science", "Road Safety"],
    tktRange: "TKT 5–9 (SINERGI & Ajakan Industri) · TKT 2–6 (Kemitraan Internasional)",
    budgetCap: "Rp 150 juta – Rp 2 miliar / tahun",
    overheadCap: "Sesuai panduan Hiliriset & kontribusi mitra industri",
    cycleWindow: "Nov – Jan (SINERGI / Ajakan Industri) · Juni – Juli (Kemitraan Internasional)",
    eligibilitySummaryId:
      "Diperuntukkan bagi dosen tetap ber-NIDN/NIDK yang memiliki hasil riset siap hilirisasi bersama offtaker industri/BUMN/RS (SINERGI) atau kolaborasi riset aktif dengan universitas luar negeri yang dibuktikan dengan MoU/LoI (Kemitraan Internasional).",
    eligibilitySummaryEn:
      "Designed for tenured lecturers (NIDN/NIDK) commercializing research with an industry/hospital/SOE offtaker (SINERGI) or executing joint international research backed by an active MoU/LoI (International Partnership).",
    requirementsId: [
      "SINERGI & Ajakan Industri: Wajib memiliki mitra industri/offtaker yang berkomitmen mengadopsi atau memproduksi hasil inovasi (alat kesehatan, diagnostik, sistem keselamatan jalan).",
      "Skema Luaran SINERGI: Kategori KI (hingga Rp 700 juta), Prototipe Laik Industri (hingga Rp 500 juta), Model Kebijakan/Sosial (hingga Rp 250 juta), dan Strategis Nasional (hingga Rp 2 miliar).",
      "Program Riset Kemitraan Internasional: Kategori A (luaran publikasi Q1 bersama mitra asing, Rp 150 juta) dan Kategori B (luaran prototipe/inovasi terapan bersama mitra asing, Rp 200 juta).",
      "Ketua pengusul minimal bergelar S2/S3 dengan jabatan fungsional minimal Lektor."
    ],
    requirementsEn: [
      "SINERGI & Industry Call: Mandatory industry/offtaker partner committed to adopting or manufacturing the innovation (medical devices, diagnostics, road safety systems).",
      "SINERGI Funding Tiers: IP track (up to IDR 700M), Industrial Prototype (up to IDR 500M), Policy/Social Model (up to IDR 250M), Strategic National track (up to IDR 2B).",
      "International Research Partnership: Category A (joint Q1 publication with foreign partner, IDR 150M) and Category B (joint applied prototype/innovation, IDR 200M).",
      "Lead PI must hold S2/S3 degree with at least Lektor academic rank."
    ],
    documentsId: [
      "Dokumen MoU / Perjanjian Kerja Sama (PKS) dengan Mitra Industri atau Universitas Luar Negeri",
      "Bukti kepemilikan Kekayaan Intelektual (Paten/Hak Cipta) atau hasil riset pendahulu",
      "Proposal Hiliriset & Peta Jalan Komersialisasi/Implementasi",
      "Surat Pengantar LPPM Perguruan Tinggi"
    ],
    documentsEn: [
      "Signed MoU / Cooperation Agreement (PKS) with Industry Offtaker or Foreign University",
      "Proof of foreground/background Intellectual Property or prior research readiness",
      "Hiliriset Proposal & Commercialization/Implementation Roadmap",
      "University LPPM Endorsement Letter"
    ],
    officialUrl: "https://hiliriset.kemdiktisaintek.go.id/",
    portalName: "Portal Hiliriset Kemdiktisaintek"
  },
  {
    id: "guide-brin-riim",
    funder: "BRIN & LPDP",
    schemeName: "Panduan RIIM (Kompetisi & Ekspedisi) serta Rumah Program OR Kesehatan & OR IPSH",
    origin: "IDN",
    domains: ["Health", "Social Science", "Road Safety"],
    tktRange: "TKT 1–6 (Riset Dasar hingga Terapan Pra-Komersial)",
    budgetCap: "Rp 250.000.000 / tahun / tim (1–3 tahun); e-ASIA BRIN hingga Rp 1 miliar / tahun",
    overheadCap: "Tidak mengizinkan pembelian modal alat berat atau gaji pokok",
    cycleWindow: "Gelombang 1: Feb–Apr · Gelombang 2: Juli (RIIM) · Okt–Des (Rumah Program CFP-OR)",
    eligibilitySummaryId:
      "Terbuka untuk seluruh peneliti WNI (dosen PTN/PTS, periset BRIN, lembaga riset/NGO) tanpa syarat wajib NIDN. Ketua periset minimal S2 (atau sedang menempuh S3) dengan minimal 2 anggota tim.",
    eligibilitySummaryEn:
      "Open to all Indonesian citizen researchers (public/private university faculty, BRIN researchers, NGOs/institutes) without requiring an NIDN. Lead PI must hold at least a Master's degree with a minimum of 2 team members.",
    requirementsId: [
      "Pengecualian Kritis RIIM Kompetisi: Uji klinis/praklinis, riset yang HANYA berupa survei deskriptif semata, dan studi validasi mutu DIKECUALIKAN di RIIM Kompetisi (gunakan skema PPIK BRIN untuk uji klinis).",
      "Batas Keterlibatan: Setiap periset maksimal terlibat dalam 3 proposal RIIM (1 sebagai Ketua dan 2 sebagai Anggota).",
      "Rumah Program OR Kesehatan & OR IPSH (Ilmu Pengetahuan Sosial & Humaniora): Panggilan tahunan (Okt–Des) yang mewajibkan kolaborasi dengan periset pusat riset BRIN terkait.",
      "RIIM Ekspedisi: Fokus pada pengambilan data lapangan primer di wilayah Indonesia (epidemiologi lapangan, keragaman sosial-budaya, ekologi kesehatan)."
    ],
    requirementsEn: [
      "Critical RIIM Kompetisi Exclusion: Preclinical/clinical trials, purely descriptive survey-only studies, and quality validation studies are EXCLUDED (use BRIN PPIK for clinical trials).",
      "Participation Cap: Maximum 3 RIIM proposals per researcher (1 as Lead PI and 2 as Member).",
      "OR Kesehatan & OR IPSH (Social Sciences) Rumah Program: Annual call (Oct–Dec) requiring co-PI collaboration with internal BRIN research center staff.",
      "RIIM Ekspedisi: Focused on primary field data collection across Indonesian regions (field epidemiology, socio-cultural health ethnography)."
    ],
    documentsId: [
      "Proposal substansi melalui portal pendanaan-risnov.brin.go.id",
      "Surat dukungan dan persetujuan pimpinan institusi asal Ketua Pengusul",
      "Rencana Anggaran Biaya (RAB) tahunan dan multi-tahun",
      "Persetujuan Etik (Ethical Clearance) wajib sebelum pencairan dana lapangan/subjek manusia"
    ],
    documentsEn: [
      "Substantive proposal submitted via pendanaan-risnov.brin.go.id",
      "Institutional endorsement letter from the Lead PI's home organization",
      "Annual and multi-year budget breakdown (RAB)",
      "Ethical Clearance required prior to human-subject fieldwork disbursement"
    ],
    officialUrl: "https://pendanaan-risnov.brin.go.id/",
    portalName: "Pendanaan Risnov BRIN"
  },
  {
    id: "guide-ugm-internal",
    funder: "Universitas Gadjah Mada (Direktorat Penelitian / LPPM & FK-KMK UGM)",
    schemeName: "Panduan Hibah Internal UGM: RTA, Kolaborasi Internasional WCU, Dana Masyarakat FK-KMK & Teuku Jacob Fellowship",
    origin: "IDN",
    domains: ["Health", "Social Science", "Road Safety"],
    tktRange: "TKT 1–6 (Riset Dasar, Klinis, Komunitas, Sosial-Humaniora & Transportasi)",
    budgetCap: "Rp 12 juta – Rp 250 juta (tergantung skema Fakultas / Direktorat Penelitian)",
    overheadCap: "Dana internal RKAT / Dana Masyarakat UGM via SIMASTER",
    cycleWindow: "Januari – Maret setiap tahun anggaran (via SIMASTER UGM)",
    eligibilitySummaryId:
      "Khusus untuk dosen aktif UGM (NIDN/NIDK) dan peneliti pusat studi di lingkungan UGM (termasuk FK-KMK, FISIPOL, Fakultas Psikologi, PUSTRAL, PSPP).",
    eligibilitySummaryEn:
      "Exclusively for active UGM faculty (NIDN/NIDK) and research center staff across UGM faculties (including FK-KMK, FISIPOL, Psychology, PUSTRAL Center for Transportation & Logistics).",
    requirementsId: [
      "Rekognisi Tugas Akhir (RTA) Direktorat Penelitian UGM: Dosen pembimbing akhir S1/S2/S3 dengan luaran manuskrip jurnal internasional bereputasi (Rp 12–20 juta).",
      "Hibah Dana Masyarakat FK-KMK UGM (8 Skema): Mencakup riset terintegrasi mahasiswa S1, S2, PPDS, S3; hibah postdoktoral; hibah dosen muda; hibah pengembangan proposal multidisiplin; dan pengabdian masyarakat.",
      "Teuku Jacob Fellowship FK-KMK UGM: Hibah re-entry hingga Rp 100 juta bagi dosen yang baru lulus S3 (maks 2 tahun) untuk membangun grup riset baru.",
      "Hibah Riset Kolaborasi Internasional UGM (WCU): Wajib melibatkan mitra aktif dari universitas kelas dunia (QS Top 200) dengan target publikasi bersama Q1."
    ],
    requirementsEn: [
      "UGM Final Project Recognition (RTA): Thesis/dissertation supervisors producing reputable international journal manuscripts with S1/S2/S3 students (IDR 12M–20M).",
      "FK-KMK UGM Community Fund (8 Schemes): Student-integrated grants (BSc, MSc, Residency/PPDS, PhD), postdoctoral grant, young lecturer grant, multidisciplinary proposal seed grant, and community engagement.",
      "Teuku Jacob Fellowship (FK-KMK UGM): Re-entry research grant up to IDR 100M for faculty within 2 years post-PhD.",
      "UGM International Collaboration Grant (WCU): Requires active co-investigator at a QS Top 200 university targeting joint Q1 publication."
    ],
    documentsId: [
      "Pengajuan daring melalui akun SIMASTER UGM (simaster.ugm.ac.id)",
      "Identitas mahasiswa bimbingan yang terlibat (NIM & surat kesediaan untuk skema RTA/Terintegrasi)",
      "Bukti korespondensi / LoI mitra luar negeri (khusus skema WCU Kolaborasi Internasional)",
      "Ethical Clearance dari Komisi Etik FK-KMK atau LPPM UGM sebelum pencairan tahap lapangan"
    ],
    documentsEn: [
      "Online submission via UGM SIMASTER portal (simaster.ugm.ac.id)",
      "Student co-researcher registration details (for RTA and Student-Integrated tracks)",
      "Foreign collaborator LoI/correspondence (for WCU International Collaboration track)",
      "Ethical Clearance from FK-KMK or UGM Ethics Committee prior to fieldwork"
    ],
    officialUrl: "https://research.fkkmk.ugm.ac.id/informasi-hibah/",
    portalName: "SIMASTER & Portal Riset UGM"
  },
  {
    id: "guide-lpdp-rispro",
    funder: "LPDP — Kementerian Keuangan RI",
    schemeName: "Panduan RISPRO (Komersial, Invitasi, DAPT) & Beasiswa Fellowship/Targeted Kesehatan",
    origin: "IDN",
    domains: ["Health", "Social Science", "Road Safety"],
    tktRange: "TKT 5–9 (RISPRO Komersial) · TKT 1–7 (RISPRO Invitasi & DAPT PTNBH)",
    budgetCap: "Hingga Rp 2 miliar / tahun selama 3 tahun (RISPRO) · Beasiswa penuh (LPDP)",
    overheadCap: "Biaya pengelolaan institusi maks sesuai ketentuan eRISPRO; wajib dana pendamping mitra ≥10% pada jalur Komersial",
    cycleWindow: "Beasiswa: Jan–Feb & Jun–Jul · Fellowship Dokter: Jan, Mar, Mei · RISPRO: Sesuai panggilan batch",
    eligibilitySummaryId:
      "RISPRO Komersial mensyaratkan ketua peneliti bergelar S3 dengan mitra industri/manufaktur yang menanggung minimal 10% biaya proyek. Beasiswa Targeted mencakup PNS, TNI/Polri, tenaga kesehatan, dan talenta riset nasional.",
    eligibilitySummaryEn:
      "RISPRO Commercial requires a PhD Lead PI and a manufacturing/industry partner providing at least 10% matching funds. Targeted Scholarships support civil servants, healthcare workers, and national research talent.",
    requirementsId: [
      "RISPRO Komersial: Riset sudah mencapai minimal TKT 5, memiliki Kekayaan Intelektual dasar, studi kelayakan bisnis, dan mitra industri yang siap memproduksi/mengkomersialkan.",
      "Dana Abadi Perguruan Tinggi (DAPT): Dikelola di tingkat PTNBH (termasuk UGM, UI, ITB, Unair) untuk riset berdampak tinggi dan kolaborasi internasional.",
      "Beasiswa LPDP 2026/2027: Sekitar 80% kuota diarahkan ke STEM dan sektor strategis termasuk Kesehatan, Epidemiologi, dan Kebijakan Publik Strategis.",
      "Beasiswa Fellowship Dokter Spesialis: 3 gelombang per tahun (Jan, Mar, Mei) untuk kardiologi, stroke, nefrologi/urologi, dan onkologi dengan ikatan dinas."
    ],
    requirementsEn: [
      "RISPRO Commercial: Minimum TRL 5 at entry, existing background IP, commercialization feasibility study, and committed manufacturing partner.",
      "Higher Education Endowment Fund (DAPT): Administered via PTNBH universities (including UGM, UI, ITB, Unair) for flagship research.",
      "LPDP Scholarships 2026/2027: ~80% of seats prioritized for STEM and strategic sectors including Health, Epidemiology, and Strategic Public Policy.",
      "Specialist Doctor Fellowship: 3 batches annually (Jan, Mar, May) covering cardiology, stroke, nephrology/urology, and oncology."
    ],
    documentsId: [
      "Proposal Rencana Riset & Studi Kelayakan Komersialisasi melalui eRISPRO",
      "Perjanjian Kemitraan & Komitmen Pendanaan Pendamping (minimal 10% in-cash/in-kind untuk Komersial)",
      "Dokumen STR & SIP aktif serta rekomendasi RS (khusus Fellowship Dokter Spesialis)"
    ],
    documentsEn: [
      "Research Plan & Commercialization Feasibility Study via eRISPRO",
      "Partnership Agreement & ≥10% Matching Fund commitment (for RISPRO Commercial)",
      "Active STR & SIP medical licenses plus hospital endorsement (for Specialist Fellowship)"
    ],
    officialUrl: "https://risprolpdp.kemenkeu.go.id/",
    portalName: "Portal eRISPRO & Beasiswa LPDP"
  },
  {
    id: "guide-ukri-dac",
    funder: "UKRI (MRC, ESRC Social Sciences & AHRC)",
    schemeName: "UKRI International Co-Lead Guidelines (OECD DAC 100% Funding Rule for Indonesia)",
    origin: "INT",
    domains: ["Health", "Social Science", "Road Safety"],
    tktRange: "Discovery, Applied Global Health, Experimental Medicine & Social Science Policy",
    budgetCap: "No fixed upper limit on MRC/ESRC applicant-led grants (typically £350k – £5m+ FEC)",
    overheadCap: "Indonesian Co-Lead institutions receive 100% of direct costs and are EXEMPT from the 30% budget cap",
    cycleWindow: "Permanently Open (MRC Partnership, MRC Research, New Investigator, ESRC Research Grants) + fixed thematic calls",
    eligibilitySummaryId:
      "Institusi Indonesia TIDAK BISA menjadi organisasi pemohon utama (Lead) di UKRI. NAMUN, peneliti Indonesia bisa menjadi Project Co-Lead (International) pada proposal yang dipimpin institusi Inggris — dan karena Indonesia ada di daftar OECD DAC, biaya pihak Indonesia didanai 100% tanpa batas plafon 30%.",
    eligibilitySummaryEn:
      "Indonesian institutions CANNOT apply as the sole Lead organisation on UKRI schemes. HOWEVER, Indonesian researchers can serve as Project Co-Lead (International) on a UK-led bid — and because Indonesia is on the OECD DAC list, Indonesian costs are funded at 100% and exempt from the 30% international budget cap.",
    requirementsId: [
      "Pengecualian Plafon 30% DAC: Aturan UKRI membatasi biaya mitra internasional maksimal 30% untuk negara maju, India, dan Tiongkok. Sebagai negara daftar OECD DAC (Upper-Middle-Income), Indonesia BEBAS dari plafon 30% ini pada hibah MRC.",
      "MRC Partnership Grant, Research Grant & ESRC Open Call: Terbuka permanen sepanjang tahun tanpa tenggat waktu tetap.",
      "Perhatian tentang MRC Applied Global Health Board: Papan khusus Applied Global Health sudah ditutup sejak Desember 2024; gunakan jalur reguler MRC Research/Partnership Grant atau ESRC Research Grant.",
      "NIHR Global Health Research: Hati-hati, banyak panggilan bertema NIHR 2026 membatasi lokasi di Afrika Sub-Sahara dan Asia Selatan — selalu cek apakah Asia Tenggara diizinkan."
    ],
    requirementsEn: [
      "DAC Exemption from 30% Cap: UKRI caps international costs at 30% for high-income countries, India, and China. As an OECD DAC-listed country, Indonesia is EXEMPT from the 30% cap on MRC grants and receives 100% direct cost funding.",
      "MRC Partnership, Research & ESRC Open Calls: Permanently open year-round with no fixed closing deadline.",
      "Note on MRC Applied Global Health Board: Closed in December 2024; route collaborations through standard MRC Research/Partnership Grants or ESRC Research Grants instead.",
      "NIHR Geographic Check: Many 2026 NIHR thematic calls restrict work to Sub-Saharan Africa and South Asia — verify Southeast Asia eligibility on each call."
    ],
    documentsId: [
      "Pengajuan melalui UKRI Funding Service oleh institusi utama di Inggris (UK RoO)",
      "Surat pernyataan keterlibatan dan rincian anggaran 100% biaya langsung untuk Co-Lead Indonesia",
      "Rencana Manajemen Data dan Kemitraan Berkeadilan (Equitable Partnership Statement)"
    ],
    documentsEn: [
      "Submission via the UKRI Funding Service by the UK Research Organisation (RoO)",
      "Indonesian International Co-Lead cost breakdown (claimed at 100% eligible direct costs)",
      "Data Management Plan and Equitable Partnership Statement"
    ],
    officialUrl: "https://www.ukri.org/opportunity/",
    portalName: "UKRI Funding Finder"
  },
  {
    id: "guide-nih-cdc-usa",
    funder: "USA — NIH & CDC (Grants.gov)",
    schemeName: "NIH Foreign Prime (R01/R21), New PF5/RF2 Linked International Awards & CDC Indonesia NOFOs",
    origin: "INT",
    domains: ["Health", "Social Science", "Road Safety"],
    tktRange: "Basic, Clinical Trials, Implementation & Public Health Surveillance",
    budgetCap: "R21: US$275k (2 yrs) · R01/U01: Uncapped · CDC Indonesia: US$25m (5 yrs)",
    overheadCap: "Foreign organizations capped at 8% Facilities & Administrative (F&A / indirect) costs on NIH awards",
    cycleWindow: "NIH Standard Cycles: Feb 5, Jun 5, Oct 5 · PF5/RF2: Jan 25, May 25, Sep 25 · CDC: Aug–Oct",
    eligibilitySummaryId:
      "PERUBAHAN BESAR NIH (Mulai 25 Jan 2026): NIH menghapus mekanisme subaward asing tradisional. Institusi Indonesia kini memiliki 2 jalur resmi: (1) Melamar langsung sebagai Pemohon Utama (Prime) pada NOFO yang mengizinkan Foreign Organizations (seperti Parent R01, R21, U01), atau (2) Menggunakan struktur baru PF5/RF2 Linked International Research Project bersama mitra AS.",
    eligibilitySummaryEn:
      "MAJOR NIH POLICY CHANGE (Effective Jan 25, 2026): NIH eliminated traditional foreign subawards. Indonesian institutions now have 2 official pathways: (1) Apply directly as Foreign Prime Applicant on eligible NOFOs (Parent R01, R21, U01), or (2) Use the new PF5/RF2 Linked International Research Project mechanism with a US prime partner.",
    requirementsId: [
      "Larangan Subaward Asing NIH: Institusi Indonesia tidak lagi bisa menjadi sub-penerima biasa di bawah R01 domestik AS. Untuk kolaborasi AS–Indonesia, gunakan PA-26-002 (Parent PF5), di mana NIH menerbitkan penghargaan RF2 terpisah langsung ke institusi Indonesia.",
      "Pengecualian Fogarty G20 (K43/D43): Karena Indonesia adalah anggota G20 berpendapatan menengah-atas (UMIC), ilmuwan Indonesia TIDAK memenuhi syarat melamar Fogarty K43 atau D43.",
      "CDC Global Health Security Indonesia (CDC-RFA-JG-26-0053): Berbeda dari NIH, NOFO CDC khusus Indonesia mengizinkan organisasi lokal Indonesia menjadi pemohon utama langsung.",
      "Prasyarat Administrasi Wajib AS: Institusi Indonesia WAJIB memiliki Unique Entity Identifier (UEI) aktif di SAM.gov, pendaftaran NCAGE, dan akun eRA Commons (membutuhkan 4–8 minggu pengurusan)."
    ],
    requirementsEn: [
      "NIH Foreign Subaward Elimination: Foreign subawards on standard US domestic grants are replaced by PA-26-002 (Parent PF5), which issues a separate linked RF2 award directly from NIH to the Indonesian institution.",
      "Fogarty G20 UMIC Bar (K43/D43): Because Indonesia is an Upper-Middle-Income G20 member, Fogarty explicitly excludes Indonesia from K43 and D43 training grants.",
      "CDC Indonesia NOFOs: Operate outside NIH's subaward rules and openly welcome Indonesian institutions as direct prime applicants.",
      "Mandatory US Registrations: Indonesian institution MUST maintain an active SAM.gov Unique Entity Identifier (UEI), NCAGE code, and eRA Commons institutional & PI accounts (allow 4–8 weeks)."
    ],
    documentsId: [
      "Registrasi aktif SAM.gov (UEI), Grants.gov Workspace, dan eRA Commons",
      "NIH Biosketch format terbaru (SciENcv) & Other Support untuk seluruh peneliti kunci",
      "Foreign Justification (wajib bila institusi Indonesia melamar sebagai Prime R01/R21)",
      "Batas Indirect Cost (F&A) organisasi asing maksimal 8%"
    ],
    documentsEn: [
      "Active SAM.gov (UEI), Grants.gov Workspace, and eRA Commons registrations",
      "Updated NIH Biographical Sketch (SciENcv) & Other Support documents",
      "Foreign Organization Justification statement (when applying as Foreign Prime on R01/R21)",
      "Foreign Indirect Cost (F&A) rate capped at 8%"
    ],
    officialUrl: "https://www.grants.gov/",
    portalName: "Grants.gov & NIH eRA Commons"
  },
  {
    id: "guide-who-hsp-wellcome-asean",
    funder: "WHO/TDR, HSP, Wellcome Trust & ASEAN NCAP",
    schemeName: "Panduan WHO SEARO/TDR, Health Security Partners (HSP), Wellcome LMIC Leads & ASEAN Road Safety",
    origin: "INT",
    domains: ["Health", "Social Science", "Road Safety"],
    tktRange: "Implementation Research, Biosecurity, Discovery & Road Safety Engineering/Policy",
    budgetCap: "TDR/HSP: US$10k–45k · ASEAN NCAP: Project-based · Wellcome: £400k – £3.5m+",
    overheadCap: "Wellcome: 15%–20% LMIC overheads · WHO/TDR: Direct implementation costs",
    cycleWindow: "Wellcome: Feb/Apr/Sep/Nov · TDR: Oct & Jan · HSP: Rolling · ASEAN NCAP: Q2 (Mar–May)",
    eligibilitySummaryId:
      "Keempat pemberi dana ini secara eksplisit mengizinkan peneliti dan universitas Indonesia menjadi Ketua Pengusul (Lead PI) tanpa harus berada di bawah institusi Barat.",
    eligibilitySummaryEn:
      "All four funders explicitly allow Indonesian researchers and universities to apply as Lead Principal Investigator without requiring a Western prime institution.",
    requirementsId: [
      "Wellcome Trust (Early-Career, Career Development, Discovery): Institusi Indonesia BISA menjadi host & Lead PI langsung (pengecualian LMIC Wellcome hanya mengecualikan India dan daratan Tiongkok).",
      "WHO SEARO/TDR Impact Grants & UGM Fellowship: Wajib menyertakan surat dukungan/koordinasi dari program nasional Kementerian Kesehatan RI; UGM Yogyakarta adalah salah satu universitas tuan rumah resmi TDR.",
      "Health Security Partners (HSP): Fokus pada biosekuriti laboratorium, surveilans genomik patogen, dan One Health di Indonesia — peneliti universitas dan laboratorium Indonesia melamar langsung.",
      "ASEAN NCAP ANCHOR Research Grant: Skema riset keselamatan jalan paling strategis yang bisa dipimpin langsung oleh universitas Indonesia (durasi 18 bulan)."
    ],
    requirementsEn: [
      "Wellcome Trust (Early-Career, Career Development, Discovery): Indonesian institutions CAN host and lead directly (Wellcome's LMIC exclusion only bars India and mainland China).",
      "WHO SEARO/TDR Impact Grants & UGM Fellowship: Requires an endorsement letter from the relevant Indonesian Ministry of Health national programme; UGM Yogyakarta is an official TDR host institution.",
      "Health Security Partners (HSP): Focuses on laboratory biosecurity, pathogen surveillance, and One Health in Indonesia — Indonesian labs and faculty apply directly.",
      "ASEAN NCAP ANCHOR Research Grant: The premier road-safety research scheme where an Indonesian university can serve as Lead PI (18-month duration)."
    ],
    documentsId: [
      "Akun portal pengajuan resmi (Wellcome Funding Platform / WHO eTDR / HSP Portal)",
      "Surat Endorsement Program Nasional Kemenkes (wajib untuk WHO SEARO/TDR Impact Grants)",
      "Surat Dukungan Institusi Tuan Rumah (LPPM Universitas / Dekan)"
    ],
    documentsEn: [
      "Official portal account (Wellcome Funding Platform / WHO eTDR / HSP Portal)",
      "National MoH Programme Acknowledgment Letter (mandatory for WHO SEARO/TDR Impact Grants)",
      "Host Institution Support Letter (University LPPM / Dean)"
    ],
    officialUrl: "https://wellcome.org/grant-funding/guidance/prepare-to-apply/scheme-application-deadlines",
    portalName: "Wellcome, WHO eTDR, HSP & ASEAN NCAP"
  }
];

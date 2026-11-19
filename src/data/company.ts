export const COMPANY = {
  name: 'Al Azhar Tex',
  nameAr: 'الأزهر تكس',
  founder: 'Shady Anwar',
  founderAr: 'شادي أنور',
  addressEn: 'Al Azhar Tex Gallery, Ziraa, Zagazig, Sharkia, Egypt — opposite Abu Hammad car station.',
  addressAr: 'مصر، الشرقية، الزقازيق، الزراعة، بعد موقف أبو حماد — أمام موقف أبو حماد.',
  landmarkEn: 'in front of the Abu Hammad car station',
  landmarkAr: 'أمام موقف أبو حماد',
  phone1Display: '+20 100 360 0949',
  phone1Href: 'tel:+201003600949',
  phone2Display: '+20 120 175 4177',
  phone2Href: 'tel:+201201754177',
  whatsapp1: '+201003600949',
  whatsapp2: '+201201754177',
  retailCutNoticeEn: 'We cut by the metre from the first metre. Pick the fabric, see it under real light, and we\'ll cut it.',
  retailCutNoticeAr: 'بنقطع بالمتر من أول متر. اختار القماش، شوفه على الطبيعة، وهنقطعه لك.',
  galleryHours: 'TBD' as const,
  pricePerMetreRetailDefault: 'TBD' as const,
} as const

export const PHONES = {
  retail: { display: COMPANY.phone1Display, href: COMPANY.phone1Href, wa: COMPANY.whatsapp1 },
  wholesale: { display: COMPANY.phone2Display, href: COMPANY.phone2Href, wa: COMPANY.whatsapp2 },
} as const

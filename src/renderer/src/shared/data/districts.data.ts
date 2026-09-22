// The Council's 33 districts (one per Ilocos Sur municipality/city), in the same order the
// Council's own Membership Status Report lists them — used to group every membership module
// (Troops, District/Barangay Committee, Trefoil Guild, OAVF/Career Woman, Honorary Member,
// Associate Member) into that report's district rows. Kept as a flat list rather than derived
// from any one module's data so the report's row order/completeness never depends on which
// districts happen to have registrations filed yet.
export const ILOCOS_SUR_DISTRICTS = [
  'Sinait',
  'Cabugao',
  'San Juan',
  'Magsingal',
  'Sto. Domingo-San Ildefonso',
  'Bantay',
  'San Vicente',
  'Sta. Catalina',
  'Cadayan',
  'Vigan I',
  'Vigan II',
  'Vigan III',
  'Santa',
  'Narvacan North',
  'Narvacan South',
  'Nagbukel',
  'Burgos',
  'San Esteban',
  'Santiago',
  'Banayoyo-Lidlidda',
  'San Emilio',
  'Candon I',
  'Candon II',
  'Sta. Lucia',
  'Sta. Cruz',
  'Suyo',
  'Tagudin',
  'Galimuyod-Del Pilar-Sigay',
  'Salcedo',
  'Alilem',
  'Sugpon',
  'Quirino',
  'Cervantes'
] as const

export type IlocosSurDistrict = (typeof ILOCOS_SUR_DISTRICTS)[number]

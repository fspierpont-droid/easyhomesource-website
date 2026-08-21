export interface CountyPermitResource {
  county: string;
  portalUrl?: string;
  portalLabel?: string;
  departmentUrl?: string;
  notes?: string;
}

export interface PermitResourceLink {
  label: string;
  url: string;
  group: 'Parcel & Property' | 'State & Licensing' | 'Flood & Environmental' | 'Utilities & Field';
  description: string;
}

export const FLORIDA_BUILDING_JURISDICTION_SEARCH = 'https://floridabuilding.org/sc/sc_org_srch.aspx';

const DIRECT: Record<string, Partial<CountyPermitResource>> = {
  Hernando: {
    portalUrl: 'https://hernandocountyfl-energovweb.tylerhost.net/apps/selfservice#/home',
    portalLabel: 'Hernando Civic Access',
    departmentUrl: 'https://www.hernandocounty.us/building-development/building/',
    notes: 'New permits use Tyler Civic Access. Legacy portal is for older permits only.'
  },
  Citrus: {
    portalUrl: 'https://portal.citrusbocc.com/',
    portalLabel: 'Citrus CIVICS',
    departmentUrl: 'https://www.citrusbocc.com/departments/growth_management/building_division/index.php'
  },
  Polk: {
    portalUrl: 'https://aca-prod.accela.com/POLKCO/Default.aspx',
    portalLabel: 'Polk County Access Portal',
    departmentUrl: 'https://www.polkfl.gov/services/building/'
  },
  Hillsborough: {
    portalUrl: 'https://hcfl.gov/businesses/hillsgovhub',
    portalLabel: 'HillsGovHub',
    departmentUrl: 'https://hcfl.gov/departments/development'
  },
  Pasco: {
    portalUrl: 'https://aca-prod.accela.com/pasco/Default.aspx',
    portalLabel: 'PasCoGateway',
    departmentUrl: 'https://www.pascocountyfl.net/services/building_construction/index.php'
  },
  Marion: {
    portalUrl: 'https://www.marionfl.org/doing-business/civic-access',
    portalLabel: 'Marion Civic Access',
    departmentUrl: 'https://www.marionfl.org/agencies-departments/departments-facilities-offices/building-safety'
  },
  Sumter: {
    portalUrl: 'https://www6.citizenserve.com/Portal/PortalController?Action=showHomePage&ctzPagePrefix=Portal_&installationID=445',
    portalLabel: 'Sumter Citizenserve',
    departmentUrl: 'https://www.sumtercountyfl.gov/139/Online-Permitting'
  },
  Lake: {
    portalUrl: 'https://lakecountyfl.portal.opengov.com/',
    portalLabel: 'Lake County OpenGov',
    departmentUrl: 'https://c.lakecountyfl.gov/offices/building_services/'
  },
  Orange: {
    portalUrl: 'https://fasttrack.ocfl.net/OnlineServices/login.aspx',
    portalLabel: 'Orange County Fast Track',
    departmentUrl: 'https://www.ocfl.net/PermitsLicenses.aspx'
  },
  Volusia: {
    portalUrl: 'https://connectlivepermits.org/PublicPortal/Volusia/common/index.jsp',
    portalLabel: 'Volusia Connect Live',
    departmentUrl: 'https://www.volusia.org/services/growth-and-resource-management/building-and-zoning/'
  },
  Pinellas: {
    departmentUrl: 'https://pinellas.gov/department/building-services/'
  },
  Manatee: {
    departmentUrl: 'https://www.mymanatee.org/departments/development_services/building___development_services'
  },
  Sarasota: {
    departmentUrl: 'https://www.scgov.net/government/planning-and-development-services/building'
  }
};

export const FLORIDA_COUNTIES = [
  'Alachua','Baker','Bay','Bradford','Brevard','Broward','Calhoun','Charlotte','Citrus','Clay','Collier','Columbia','DeSoto','Dixie','Duval','Escambia','Flagler','Franklin','Gadsden','Gilchrist','Glades','Gulf','Hamilton','Hardee','Hendry','Hernando','Highlands','Hillsborough','Holmes','Indian River','Jackson','Jefferson','Lafayette','Lake','Lee','Leon','Levy','Liberty','Madison','Manatee','Marion','Martin','Miami-Dade','Monroe','Nassau','Okaloosa','Okeechobee','Orange','Osceola','Palm Beach','Pasco','Pinellas','Polk','Putnam','Santa Rosa','Sarasota','Seminole','St. Johns','St. Lucie','Sumter','Suwannee','Taylor','Union','Volusia','Wakulla','Walton','Washington'
] as const;

export const COUNTY_PERMIT_RESOURCES: CountyPermitResource[] = FLORIDA_COUNTIES.map((county) => ({
  county,
  portalUrl: DIRECT[county]?.portalUrl,
  portalLabel: DIRECT[county]?.portalLabel,
  departmentUrl: DIRECT[county]?.departmentUrl,
  notes: DIRECT[county]?.notes,
}));

export const PERMIT_RESOURCE_LINKS: PermitResourceLink[] = [
  {
    label: 'LandGlide',
    url: 'https://app.landglide.com/',
    group: 'Parcel & Property',
    description: 'Parcel boundaries, owner data, acreage, notes and field parcel research.'
  },
  {
    label: 'Florida Property Appraisers Directory',
    url: 'https://floridarevenue.com/property/Pages/LocalOfficials.aspx',
    group: 'Parcel & Property',
    description: 'Official Florida Department of Revenue directory for every county property appraiser.'
  },
  {
    label: 'Florida Building Commission / BCIS',
    url: 'https://www.floridabuilding.org/',
    group: 'State & Licensing',
    description: 'Florida Building Code, product approvals, code resources and state building information.'
  },
  {
    label: 'Building Jurisdiction Search',
    url: FLORIDA_BUILDING_JURISDICTION_SEARCH,
    group: 'State & Licensing',
    description: 'State jurisdiction lookup when a county or municipality uses a separate building department.'
  },
  {
    label: 'DBPR License Search',
    url: 'https://www.myfloridalicense.com/wl11.asp?mode=1&search=LicTyp&typ=',
    group: 'State & Licensing',
    description: 'Verify contractor, installer and regulated professional licensing.'
  },
  {
    label: 'DBPR Mobile Homes',
    url: 'https://www.myfloridalicense.com/intentions2.asp?bhcp=1',
    group: 'State & Licensing',
    description: 'Florida DBPR online services, including Mobile Homes licensing and applications.'
  },
  {
    label: 'FEMA Map Service Center',
    url: 'https://msc.fema.gov/portal/home',
    group: 'Flood & Environmental',
    description: 'Official flood maps, FIRM panels and flood-zone research.'
  },
  {
    label: 'FDEP ERP / Water Permitting',
    url: 'https://floridadep.gov/water/submerged-lands-environmental-resources-coordination/content/finding-erp-permit-dep-internet',
    group: 'Flood & Environmental',
    description: 'Environmental Resource Permit research, Map Direct and water permitting resources.'
  },
  {
    label: 'Florida Septic / OSTDS',
    url: 'https://www.floridahealth.gov/licensing-regulations/regulated-facilities/onsite-sewage-septic/',
    group: 'Flood & Environmental',
    description: 'State septic permitting guidance and county health/DEP routing.'
  },
  {
    label: 'Sunshine 811',
    url: 'https://www.sunshine811.com/',
    group: 'Utilities & Field',
    description: 'Florida utility locate / call-before-you-dig resource.'
  }
];

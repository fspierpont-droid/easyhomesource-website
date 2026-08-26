Property Packages controlled import — 2026-08-26

Source: user-provided EHS WhatsApp screenshots + Apple Maps “EHS Land/home Deals” guide.

17 unique records:
1. 6645 W Erlen Ln, Homosassa, FL 34446 — HOME — AVAILABLE
2. 3219 Welsh St, Spring Hill, FL 34606 — HOME — AVAILABLE
3. 18810 Saint Paul Dr, Spring Hill, FL 34610 — HOME — AVAILABLE
4. 18034 Ferry Ave, Brooksville, FL 34604 — HOME — UNDER_CONTRACT
5. 26007 Shangri Dr, Brooksville, FL 34601 — HOME — COMING_SOON
6. 7112 Fitzpatrick Ave, Brooksville, FL 34613 — LAND — AVAILABLE
7. 9248 Denmarsh Dr, Brooksville, FL 34613 — LAND — AVAILABLE
8. 9254 Denmarsh Dr, Brooksville, FL 34613 — LAND — AVAILABLE
9. 9868 Lake Dr, Weeki Wachee, FL 34613 — LAND — AVAILABLE
10. 9862 Lake Dr, Weeki Wachee, FL 34613 — LAND — AVAILABLE
11. 26314 Glenwood Dr, Wesley Chapel, FL 33544 — HOME — COMING_SOON
12. 5043 Southtowne Loop, New Port Richey, FL 34652 — LAND — AVAILABLE — units=15
13. 1295 S Rock Crusher Rd, Homosassa, FL 34448 — LAND — AVAILABLE — units=23
14. 5746 W Lucky Ranch Trail, Homosassa, FL 34448 — LAND — STATUS_TO_CONFIRM
15. 716 Hazel Ave, Brooksville, FL 34601 — HOME — STATUS_TO_CONFIRM
16. 718 Hazel Ave, Brooksville, FL 34601 — HOME — STATUS_TO_CONFIRM
17. 210 C St, Brooksville, FL 34601 — HOME — STATUS_TO_CONFIRM

Safety:
- all records import as public_visible=false;
- existing address matches are skipped;
- no existing records are updated/deleted/archived;
- script is dry-run unless PROPERTY_IMPORT_APPLY=YES;
- PROPERTY_IMPORT_CONFIRM must exactly match DB_NAME;
- Google geocoding is attempted when GOOGLE_MAPS_API_KEY is configured.

Normalized screenshot inconsistencies:
- 9862 Lake Dr: Weeki Wachee, FL 34613 (not Spring Hill / 34446)
- 9868 Lake Dr: Weeki Wachee, FL 34613
- 26314 Glenwood Dr: Wesley Chapel, FL 33544 (screenshot called it Zephyrhills)

Multi-lot caution:
- 5043 Southtowne Loop stores the team-reported 15-lot count.
- 1295 S Rock Crusher Rd stores the team-reported 23-lot count.
- 5746 W Lucky Ranch Trail is kept units=1 / STATUS_TO_CONFIRM because county planning material also references a 23-lot Lucky Ranch Trail plan; the relationship to the Rock Crusher entry should be confirmed before assigning another 23-unit inventory count.

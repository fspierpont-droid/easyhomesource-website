# Property Packages import review

This branch adds a guarded one-time importer for the 17 properties supplied in the 2026-08-26 EHS WhatsApp and Apple Maps screenshots.

It has no startup/runtime effect and performs no writes unless explicitly run with both the production DB confirmation and `PROPERTY_IMPORT_APPLY=YES`.

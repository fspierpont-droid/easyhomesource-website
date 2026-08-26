from pathlib import Path


def test_property_package_import_readme_documents_17_records():
    text = Path("scripts/README_property_package_leads_20260826.txt").read_text()
    assert "17 unique records" in text
    assert "public_visible=false" in text

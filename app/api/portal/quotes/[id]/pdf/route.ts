import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const quoteId = params.id;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Easy HomeSource - Official Proposal ${quoteId}</title>
  <style>
    @page { 
      margin: 12mm 15mm; 
      size: letter portrait; 
    }
    *, *::before, *::after { box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
      color: #0f172a; 
      background: #ffffff; 
      margin: 0; 
      padding: 24px; 
      font-size: 11px; 
      line-height: 1.4;
    }
    .header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start; 
      border-bottom: 2.5px solid #0F2A47; 
      padding-bottom: 16px; 
      margin-bottom: 20px; 
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo-img {
      height: 52px;
      width: auto;
      object-fit: contain;
    }
    .company-title {
      font-size: 20px;
      font-weight: 900;
      color: #0B1E38;
      margin: 0;
      letter-spacing: -0.02em;
    }
    .company-subtitle {
      font-size: 10px;
      color: #64748B;
      font-weight: 700;
      margin-top: 2px;
    }
    .company-contact {
      font-size: 9.5px;
      color: #475569;
      margin-top: 3px;
    }
    .quote-meta { 
      text-align: right; 
      background: #f8fafc;
      padding: 10px 14px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      min-width: 200px;
    }
    .quote-badge { 
      display: inline-block; 
      background: #ecfdf5; 
      color: #047857; 
      border: 1px solid #a7f3d0; 
      padding: 2px 8px; 
      border-radius: 9999px; 
      font-weight: 800; 
      font-size: 9px; 
      letter-spacing: 0.05em;
    }
    .quote-num { 
      font-family: monospace; 
      font-size: 13px; 
      font-weight: 900; 
      color: #0F2A47; 
      margin-top: 3px; 
    }
    .grid-2 { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 14px; 
      margin-bottom: 18px; 
    }
    .card { 
      background: #f8fafc; 
      border: 1px solid #e2e8f0; 
      border-radius: 12px; 
      padding: 12px 14px; 
    }
    .card-title { 
      font-size: 9px; 
      text-transform: uppercase; 
      letter-spacing: 0.08em; 
      font-weight: 900; 
      color: #1E6FA8; 
      margin-bottom: 4px; 
    }
    .card-val { 
      font-weight: 900; 
      font-size: 12px; 
      color: #0B1E38; 
    }
    .section-heading {
      font-size: 10.5px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #1E6FA8;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-bottom: 18px; 
      font-size: 10.5px; 
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
    }
    th { 
      background: #f1f5f9; 
      border-bottom: 1px solid #cbd5e1; 
      padding: 7px 12px; 
      text-align: left; 
      font-size: 9.5px; 
      text-transform: uppercase; 
      font-weight: 900; 
      color: #475569; 
    }
    td { 
      padding: 7px 12px; 
      border-bottom: 1px solid #f1f5f9; 
    }
    .amount { 
      text-align: right; 
      font-weight: 900; 
      font-family: monospace; 
      color: #0f172a;
    }
    .summary-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 14px 18px;
      margin-bottom: 18px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
      font-size: 10.5px;
      color: #334155;
    }
    .summary-divider {
      height: 1px;
      background: #e2e8f0;
      margin: 6px 0;
    }
    .total-banner { 
      background: #0F2A47; 
      color: white; 
      padding: 12px 16px; 
      border-radius: 10px; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-top: 10px; 
      box-shadow: 0 4px 12px rgba(15, 42, 71, 0.15);
    }
    .total-label { 
      font-size: 11px; 
      font-weight: 900; 
      text-transform: uppercase; 
      letter-spacing: 0.05em; 
    }
    .total-amount { 
      font-size: 20px; 
      font-weight: 900; 
      font-family: monospace;
    }
    .notes-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 14px;
      margin-bottom: 18px;
      font-size: 10px;
      color: #475569;
    }
    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      margin-top: 18px;
      font-size: 10px;
    }
    .disclaimer {
      font-size: 8.5px;
      color: #94a3b8;
      line-height: 1.5;
      border-top: 1px solid #f1f5f9;
      padding-top: 10px;
      margin-top: 14px;
    }
    @media print {
      body { padding: 0; }
      .no-print, button { display: none !important; }
    }
  </style>
</head>
<body onload="window.print()">
  <div class="header">
    <div class="logo-container">
      <img class="logo-img" src="/images/ehs-master-logo.png" alt="Easy HomeSource" onerror="this.style.display='none'" />
      <div>
        <h1 class="company-title">Easy HomeSource</h1>
        <div class="company-subtitle">Central Florida Turnkey Manufactured Housing Operations</div>
        <div class="company-contact">
          9011 McIntyre Rd, Brooksville, FL 34601 • (352) 558-8888 • info@easyhomesource.com
        </div>
      </div>
    </div>
    <div class="quote-meta">
      <span class="quote-badge">APPROVED PROPOSAL</span>
      <div class="quote-num">${quoteId}</div>
      <div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">Date: August 7, 2026</div>
      <div style="font-size: 9.5px; color: #0F2A47; font-weight: bold; margin-top: 2px;">Consultant: Scott Pierpont</div>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-title">Prepared For</div>
      <div class="card-val">Sarah Jenkins</div>
      <div style="color: #64748b; font-size: 10px; margin-top: 2px;">📞 (352) 555-0192 • ✉️ sarah.j@example.com</div>
    </div>
    <div class="card">
      <div class="card-title">Installation Homesite</div>
      <div class="card-val">6645 W Erlen Ln, Homosassa, FL 34446</div>
      <div style="color: #64748b; font-size: 10px; margin-top: 2px;">Citrus County • Florida Wind Zone II • 32 Miles from Dealership</div>
    </div>
  </div>

  <div style="margin-bottom: 14px;">
    <div class="section-heading">
      <span>1. Selected Manufactured Home Specifications</span>
      <span>Base Price: $129,475.03</span>
    </div>
    <div class="card" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px;">
      <div>
        <div style="font-size: 9px; text-transform: uppercase; color: #94a3b8; font-weight: bold;">Manufacturer</div>
        <div style="font-weight: 800; color: #0f172a;">CLAYTON Addison</div>
      </div>
      <div>
        <div style="font-size: 9px; text-transform: uppercase; color: #94a3b8; font-weight: bold;">Model / Series</div>
        <div style="font-weight: 800; color: #0f172a;">Boujee 2</div>
      </div>
      <div>
        <div style="font-size: 9px; text-transform: uppercase; color: #94a3b8; font-weight: bold;">Bed / Bath</div>
        <div style="font-weight: 800; color: #0f172a;">3 Beds / 2 Baths</div>
      </div>
      <div>
        <div style="font-size: 9px; text-transform: uppercase; color: #94a3b8; font-weight: bold;">Dimensions</div>
        <div style="font-weight: 800; color: #0f172a;">28' x 60' (1,580 sq ft)</div>
      </div>
    </div>
  </div>

  <div>
    <div class="section-heading">
      <span>2. Itemized Delivery &amp; Setup Scope of Work</span>
      <span>Site Total: $28,510.00</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>Service / Installation Item</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Factory Freight &amp; Transport Carrier Delivery</strong><br><span style="color: #64748b;">Multi-section transport carrier delivery, highway permits, and escort vehicles.</span></td>
          <td class="amount">$2,860.00</td>
        </tr>
        <tr>
          <td><strong>Block &amp; Hurricane Tie-Down Installation</strong><br><span style="color: #64748b;">Concrete pier pads, cinder blocks, leveling, and Florida ground anchors (60ft double table).</span></td>
          <td class="amount">$12,195.00</td>
        </tr>
        <tr>
          <td><strong>3.0-Ton Central A/C Heat Pump System (14.3 SEER2)</strong><br><span style="color: #64748b;">High-efficiency split heat pump, digital programmable thermostat, pad, whip, plenum tie-in.</span></td>
          <td class="amount">$5,555.00</td>
        </tr>
        <tr>
          <td><strong>Dirt Pad &amp; Laser Site Grading (2 Loads)</strong><br><span style="color: #64748b;">Clearing, clean fill dirt import, compacting, and laser leveling for solid foundation.</span></td>
          <td class="amount">$2,700.00</td>
        </tr>
        <tr>
          <td><strong>Vented Vinyl Perimeter Skirting &amp; Steps (2 Sets)</strong><br><span style="color: #64748b;">Full perimeter vinyl skirting (176 linear ft) and 2 sets of code-compliant entrance stairs.</span></td>
          <td class="amount">$3,200.00</td>
        </tr>
        <tr>
          <td><strong>County Building, Zoning &amp; Health Dept Permits</strong><br><span style="color: #64748b;">County building permit processing, plan review, zoning, and health inspections ($2,000 standard).</span></td>
          <td class="amount">$2,000.00</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="summary-box">
    <div style="font-size: 10px; font-weight: 900; text-transform: uppercase; color: #1E6FA8; margin-bottom: 8px;">
      3. Turnkey Investment &amp; Florida Sales Tax Calculation
    </div>
    <div class="summary-row">
      <span>1. Base Manufactured Home:</span>
      <span class="amount">$129,475.03</span>
    </div>
    <div class="summary-row">
      <span>2. Land / Homesite Parcel:</span>
      <span class="amount">$189,900.00</span>
    </div>
    <div class="summary-row">
      <span>3. Freight Transport &amp; Delivery:</span>
      <span class="amount">$2,860.00</span>
    </div>
    <div class="summary-row">
      <span>4. Site Work, Prep &amp; Utilities:</span>
      <span class="amount">$25,650.00</span>
    </div>
    <div class="summary-divider"></div>
    <div class="summary-row" style="font-weight: 900; color: #0f172a; font-size: 11px;">
      <span>Subtotal (Exact Sum):</span>
      <span class="amount">$347,885.03</span>
    </div>
    <div class="summary-row" style="color: #64748b; font-size: 10px;">
      <span>Financed subtotal:</span>
      <span class="amount" style="color: #64748b;">$347,885.03</span>
    </div>
    <div class="summary-row" style="color: #64748b; font-size: 10px;">
      <span>Tax basis:</span>
      <span class="amount" style="color: #64748b;">$347,885.03</span>
    </div>
    <div class="summary-row" style="font-weight: 800; color: #1E6FA8;">
      <span>3% Florida Sales Tax (3.00%):</span>
      <span class="amount" style="color: #1E6FA8;">$10,436.55</span>
    </div>

    <div class="total-banner">
      <div class="total-label">ESTIMATED TOTAL</div>
      <div class="total-amount">$358,321.58</div>
    </div>
  </div>

  <div class="notes-box">
    <strong style="color: #0f172a; display: block; margin-bottom: 2px;">Next Steps:</strong>
    1. Review this proposal and contact your consultant with any questions.<br>
    2. Sign the deposit agreement to reserve your home and lock factory production timing.<br>
    3. Schedule your site visit and begin the financing and permitting process.
  </div>

  <div class="signature-grid">
    <div>
      <span style="font-size: 9px; font-weight: 900; text-transform: uppercase; color: #94a3b8; display: block;">Authorized Housing Consultant</span>
      <strong style="font-size: 12px; color: #0B1E38; display: block; margin-top: 2px;">Scott Pierpont</strong>
      <span style="color: #64748b;">Principal &amp; Operations Admin</span><br>
      <span style="color: #64748b;">📞 (352) 558-8888 • ✉️ scott@easyhomesource.com</span>
    </div>
    <div style="text-align: right;">
      <span style="font-size: 9px; font-weight: 900; text-transform: uppercase; color: #94a3b8; display: block;">Easy HomeSource Dealership</span>
      <strong style="color: #0B1E38; display: block; margin-top: 2px;">Licensed &amp; Insured Manufactured Retailer</strong>
      <span style="color: #64748b;">9011 McIntyre Rd, Brooksville, FL 34601</span><br>
      <span style="color: #94a3b8; font-size: 9px;">Florida DBPR / HUD Licensed Dealership</span>
    </div>
  </div>

  <div class="disclaimer">
    * Site development pricing is an estimate based on visible conditions. Final pricing is subject to change based on actual site-specific requirements during installation. Prices are valid for 30 days from the quote date. Florida sales tax calculated at statutory 3.00% manufactured housing basis.
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}

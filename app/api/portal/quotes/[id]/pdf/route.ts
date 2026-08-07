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
    @page { margin: 15mm; size: letter portrait; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 24px; font-size: 12px; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0F2A47; padding-bottom: 16px; margin-bottom: 20px; }
    .logo-box { background: #0F2A47; color: white; font-weight: 900; font-size: 16px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border-radius: 8px; float: left; margin-right: 12px; }
    .title { font-size: 20px; font-weight: 900; color: #0B1E38; margin: 0; }
    .subtitle { font-size: 10px; color: #64748b; font-weight: 700; margin-top: 2px; }
    .quote-meta { text-align: right; }
    .quote-badge { display: inline-block; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 10px; }
    .quote-num { font-family: monospace; font-size: 14px; font-weight: 900; color: #0F2A47; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; }
    .card-title { font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 900; color: #1E6FA8; margin-bottom: 6px; }
    .card-val { font-weight: 900; font-size: 13px; color: #0B1E38; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
    th { background: #f1f5f9; border-bottom: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-size: 10px; text-transform: uppercase; font-weight: 900; color: #475569; }
    td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
    .amount { text-align: right; font-weight: 900; font-family: monospace; }
    .total-banner { background: #0F2A47; color: white; padding: 14px 18px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; margin-top: 14px; }
    .total-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
    .total-amount { font-size: 22px; font-weight: 900; }
    .footer { border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; display: flex; justify-content: space-between; font-size: 10px; color: #64748b; }
  </style>
</head>
<body onload="window.print()">
  <div class="header">
    <div>
      <div class="logo-box">EHS</div>
      <div>
        <h1 class="title">Easy HomeSource</h1>
        <div class="subtitle">Central Florida Turnkey Manufactured Housing Operations</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
          9011 McIntyre Rd, Brooksville, FL 34601 • (352) 558-8888 • info@easyhomesource.com
        </div>
      </div>
    </div>
    <div class="quote-meta">
      <span class="quote-badge">OFFICIAL PROPOSAL</span>
      <div class="quote-num">${quoteId}</div>
      <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Date: August 7, 2026</div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Prepared For</div>
      <div class="card-val">Client / Property Owner</div>
      <div style="color: #64748b; font-size: 11px; margin-top: 2px;">Central Florida Resident • Verified Inquiry</div>
    </div>
    <div class="card">
      <div class="card-title">Installation Homesite</div>
      <div class="card-val">Florida Homesite Parcel</div>
      <div style="color: #64748b; font-size: 11px; margin-top: 2px;">Citrus / Hernando / Pasco County • Florida Wind Zone II</div>
    </div>
  </div>

  <div style="margin-bottom: 20px;">
    <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #1E6FA8; margin-bottom: 8px;">
      Itemized Scope of Services &amp; Mandatory Site Work
    </div>
    <table>
      <thead>
        <tr>
          <th>Item / Service Description</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Base Manufactured Home Model</strong><br><span style="color: #64748b;">Factory construction, Florida Wind Zone II, HUD code compliance.</span></td>
          <td class="amount">$94,900.00</td>
        </tr>
        <tr>
          <td><strong>Factory Freight &amp; Transport Carrier Delivery</strong><br><span style="color: #64748b;">Multi-section carrier transport, DOT highway permits, escort vehicles.</span></td>
          <td class="amount">$3,850.00</td>
        </tr>
        <tr>
          <td><strong>Block &amp; Hurricane Tie-Down Installation</strong><br><span style="color: #64748b;">Concrete pier pads, cinder blocks, leveling, and ground hurricane anchors.</span></td>
          <td class="amount">$5,835.00</td>
        </tr>
        <tr>
          <td><strong>3.0-Ton Central A/C Heat Pump System (14.3 SEER2)</strong><br><span style="color: #64748b;">High-efficiency split heat pump, digital thermostat, pad, whip, plenum.</span></td>
          <td class="amount">$5,555.00</td>
        </tr>
        <tr>
          <td><strong>Dirt Pad &amp; Laser Site Grading</strong><br><span style="color: #64748b;">Clearing, fill dirt import, compacting, and laser leveling for solid pad.</span></td>
          <td class="amount">$2,700.00</td>
        </tr>
        <tr>
          <td><strong>4-Inch Potable Water Well System</strong><br><span style="color: #64748b;">Drilling, submersible pump, pressure tank, control box, plumbing tie-in.</span></td>
          <td class="amount">$7,500.00</td>
        </tr>
        <tr>
          <td><strong>1,050-Gallon Septic Tank &amp; Drainfield</strong><br><span style="color: #64748b;">Concrete septic tank, header line, distribution box, gravity drainfield.</span></td>
          <td class="amount">$6,800.00</td>
        </tr>
        <tr>
          <td><strong>200-Amp Electric Pole &amp; Meter Panel</strong><br><span style="color: #64748b;">200A service disconnect, utility pole/riser, ground rod, electrical conduit.</span></td>
          <td class="amount">$2,450.00</td>
        </tr>
        <tr>
          <td><strong>County Building, Zoning &amp; Health Dept Permits</strong><br><span style="color: #64748b;">County building permit processing, plan review, and mandatory inspection fees.</span></td>
          <td class="amount">$2,650.00</td>
        </tr>
        <tr>
          <td><strong>Vented Vinyl Perimeter Skirting &amp; Steps (2 Sets)</strong><br><span style="color: #64748b;">Full perimeter vinyl skirting with top rail, ground track, access door, stairs.</span></td>
          <td class="amount">$3,200.00</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="card" style="background: #f8fafc; margin-bottom: 20px;">
    <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #1E6FA8; margin-bottom: 8px;">
      Investment &amp; Tax Calculation Breakdown
    </div>
    <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px;">
      <span>Subtotal (Home + Delivery + Site Prep &amp; Utilities):</span>
      <span style="font-weight: 800; font-family: monospace;">$135,440.00</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px; color: #64748b;">
      <span>Financed subtotal:</span>
      <span style="font-family: monospace;">$135,440.00</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px; color: #64748b;">
      <span>Tax basis:</span>
      <span style="font-family: monospace;">$135,440.00</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px; font-weight: 800; color: #1E6FA8;">
      <span>3% Florida Sales Tax (3.00%):</span>
      <span style="font-family: monospace;">$4,063.20</span>
    </div>

    <div class="total-banner">
      <div class="total-label">ESTIMATED TOTAL</div>
      <div class="total-amount">$139,503.20</div>
    </div>
  </div>

  <div class="footer">
    <div>
      <strong>Easy HomeSource</strong> • Licensed &amp; Insured Manufactured Housing Retailer<br>
      9011 McIntyre Rd, Brooksville, FL 34601 • (352) 558-8888
    </div>
    <div style="text-align: right;">
      Valid for 30 days from issuance.<br>
      Florida Sales Tax calculated at 3.00% statutory basis.
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}

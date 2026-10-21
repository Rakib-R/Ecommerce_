
import React, { useState } from 'react';

export default function SellerTermsBlock() {
  const [isAgreed, setIsAgreed] = useState(false);

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>📜</span> Merchant Agreement
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Please review our operational policies carefully before onboarding as a marketplace vendor.
        </p>
      </div>

      {/* Scrollable Terms Box */}
      <div className="h-48 overflow-y-auto p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 space-y-4 shadow-inner scrollbar-thin scrollbar-thumb-slate-300">
        <div>
          <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-1">1. Account Verification</h4>
          <p className="text-xs leading-relaxed">
            You must provide accurate, current, and verifiable contact details, business entity information, phone numbers, and regional presence during registration. Falsification of identification records triggers instant, permanent onboarding rejection.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-1">2. Inventory Compliance</h4>
          <p className="text-xs leading-relaxed">
            All listed store items must match physical specifications and descriptions precisely. Listing counterfeit, unauthorized, stolen, drop-shipped violations, or hazardous materials will result in immediate storefront asset freezes.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-1">3. SLA & Delivery Execution</h4>
          <p className="text-xs leading-relaxed">
            Merchants assume full operational liability for inventory preservation, prompt packaging, and logging valid courier tracking metrics within our standard 48-hour processing lifecycle window.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-1">4. Marketplace Commissions</h4>
          <p className="text-xs leading-relaxed">
            By executing this verification sequence, you recognize and accept that the marketplace processing system auto-deducts platform operational service fees directly from finalized order totals prior to routing vendor disbursement balances.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-1">5. Merchant Conduct</h4>
          <p className="text-xs leading-relaxed">
            Interacting with marketplace users through unauthorized off-platform payment gateways, spam distribution, or manipulating system review architectures via artificial score injection remains strictly banned.
          </p>
        </div>
      </div>

      {/* Interactive Checkbox Section */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="flex items-center h-5 mt-0.5">
            <input
              id="terms-checkbox"
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 focus:ring-2 transition cursor-pointer"
            />
          </div>
          <div className="text-xs text-slate-600 select-none">
            <span className="font-medium text-slate-800 group-hover:text-indigo-600 transition">
              I accept the Merchant Agreement
            </span>
            <p className="text-slate-400 mt-0.5">
              I agree to comply with platform listing policies, operational shipping timelines, and commission schedules.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}

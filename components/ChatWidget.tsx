'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { siteInfo } from '@/data/site';

export interface RecommendedHome {
  slug: string;
  name: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  squareFeet?: number | null;
  size?: string | null;
  displayPrice: string;
  image?: string | null;
  tagline?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  homes?: RecommendedHome[];
  actionType?: 'text' | 'homes' | 'lead_form' | 'tour_booking' | 'financing_info';
  timestamp: Date;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCallout, setShowCallout] = useState(true);

  // Form states
  const [formType, setFormType] = useState<'quote' | 'tour' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    landStatus: 'Own land already',
    interestedHome: '',
    tourDate: '',
    tourTime: '10:00 AM',
    notes: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'greeting',
      sender: 'bot',
      text: `👋 Hi there! Welcome to Easy HomeSource in Brooksville. Ask me about homes starting at $39,888, scheduling a lot tour, or our turnkey land & setup packages!`,
      timestamp: new Date()
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, formType, formSuccessMessage]);

  const handleSendMessage = async (textToSend: string) => {
    const cleanText = textToSend.trim();
    if (!cleanText) return;

    setShowCallout(false);

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: cleanText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanText,
          conversationHistory: messages.slice(-6).map((m) => ({ role: m.sender, content: m.text }))
        })
      });

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        text: data.reply || `For immediate assistance, call or text our Brooksville team directly at ${siteInfo.phoneDisplay}.`,
        homes: data.homes,
        actionType: data.actionType,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMsg]);

      if (data.actionType === 'lead_form') {
        setFormType('quote');
      } else if (data.actionType === 'tour_booking') {
        setFormType('tour');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot_err_' + Date.now(),
          sender: 'bot',
          text: `Our Brooksville, FL team is ready to help! You can call or text us anytime at ${siteInfo.phoneDisplay}.`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    const names = formData.name.trim().split(' ');
    const firstName = names[0] || 'Friend';
    const lastName = names.slice(1).join(' ') || 'Customer';

    const payload = {
      firstName,
      lastName,
      phone: formData.phone,
      email: formData.email,
      preferredContactMethod: formData.phone ? 'Phone / Text' : 'Email',
      interestedHome: formData.interestedHome || 'General inquiry via Chat',
      interestedHomeSlug: formData.interestedHome ? formData.interestedHome.toLowerCase().replace(/\s+/g, '-') : '',
      landStatus: formData.landStatus,
      city: 'Brooksville area',
      county: 'Hernando',
      financingInterest: 'Discussing options',
      deliverySetupHelp: 'Interested in turnkey package',
      message: formType === 'tour'
        ? `Tour appointment requested for ${formData.tourDate} at ${formData.tourTime}. Notes: ${formData.notes}`
        : `Quote request via AI Chat. Notes: ${formData.notes}`,
      smsContactConsent: true,
      smsMarketingConsent: true,
      sourcePage: 'AI Chat Widget',
      sourceUrl: typeof window !== 'undefined' ? window.location.href : 'https://easyhomesource.com'
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.ok) {
        setFormSuccessMessage(
          formType === 'tour'
            ? `🎉 Tour Requested! We've saved your slot for ${formData.tourDate} at ${formData.tourTime}. Our Brooksville team will confirm via text at ${formData.phone}.`
            : `✅ Quote Request Received! Thank you, ${firstName}. Our team will review your land status and follow up with pricing.`
        );
        setFormType(null);
      } else {
        alert(data.message || 'Submission error. Please call us at 352-558-8888.');
      }
    } catch {
      alert('Could not submit details. Please call or text us at 352-558-8888.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans print:hidden">
      {/* Proactive Floating Nudge Bubble */}
      {!isOpen && showCallout && (
        <div className="mb-3 bg-white text-slate-800 p-4 rounded-2xl shadow-2xl max-w-[280px] text-xs border border-ehsLightBlue animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
          <div className="flex justify-between items-center mb-1.5">
            <span className="bg-ehsSoftBlue text-ehsDeepBlue font-extrabold px-2 py-0.5 rounded-full text-[10px] tracking-wide uppercase">
              Brooksville Dealership
            </span>
            <button
              onClick={() => setShowCallout(false)}
              className="text-slate-400 hover:text-slate-700 font-bold p-0.5"
              aria-label="Dismiss message"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-700 font-medium leading-relaxed">
            Homes on display from <strong className="text-ehsDeepBlue font-bold">$39,888</strong>. Ask about turnkey pricing, lot tours, or land setup!
          </p>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowCallout(false);
        }}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-ehsDeepBlue to-ehsNavy text-white shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 ml-auto border-2 border-white/40 focus:outline-none focus:ring-4 focus:ring-ehsLightBlue/50"
        aria-label="Toggle Easy HomeSource Assistant"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[380px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[calc(100vh-7.5rem)] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-ehsNavy via-ehsDeepBlue to-ehsBlue text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-inner border border-white/20">
                🏡
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-tight text-white">Easy HomeSource AI</h3>
                <p className="text-[11px] text-ehsLightBlue font-medium">Brooksville, FL • 11 Display Homes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`tel:${siteInfo.phoneHref}`}
                className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full font-bold transition-colors"
                title="Call 352-558-8888"
              >
                📞 Call
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick Contact Ribbon */}
          <div className="bg-ehsSoftBlue px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Direct Dealership Line:</span>
            <div className="flex gap-2 items-center">
              <a href={`tel:${siteInfo.phoneHref}`} className="font-bold text-ehsDeepBlue hover:underline">
                {siteInfo.phoneDisplay}
              </a>
              <span className="text-slate-300">•</span>
              <a href="sms:+13525588888" className="font-bold text-ehsDeepBlue hover:underline">
                💬 Text Us
              </a>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/60 space-y-3.5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm max-w-[88%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-ehsDeepBlue text-white rounded-br-none shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>

                {/* Home Recommendations Carousel */}
                {m.homes && m.homes.length > 0 && (
                  <div className="flex gap-2.5 overflow-x-auto w-full py-2.5 mt-1 scrollbar-thin">
                    {m.homes.map((home) => (
                      <div
                        key={home.slug}
                        className="flex-shrink-0 w-56 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                      >
                        <div>
                          {home.image ? (
                            <Image
                              src={home.image}
                              alt={home.name}
                              width={224}
                              height={112}
                              unoptimized
                              className="w-full h-28 object-cover bg-slate-100"
                            />
                          ) : (
                            <div className="w-full h-24 bg-ehsSoftBlue flex items-center justify-center text-xs font-bold text-ehsDeepBlue">
                              🏡 {home.name}
                            </div>
                          )}
                          <div className="p-3">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-extrabold text-xs text-slate-900">{home.name}</h4>
                              <span className="bg-ehsSoftBlue text-ehsDeepBlue font-black text-[11px] px-2 py-0.5 rounded-md">
                                {home.displayPrice}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mb-2">
                              {home.bedrooms ? `${home.bedrooms} Bed` : ''} {home.bathrooms ? `• ${home.bathrooms} Bath` : ''} {home.squareFeet ? `• ${home.squareFeet} sq ft` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="p-3 pt-0 grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, interestedHome: home.name }));
                              setFormType('quote');
                            }}
                            className="w-full bg-ehsDeepBlue hover:bg-ehsNavy text-white text-[11px] font-bold py-1.5 rounded-lg transition-colors text-center"
                          >
                            Quote
                          </button>
                          <Link
                            href={`/homes/${home.slug}`}
                            className="w-full border border-ehsDeepBlue text-ehsDeepBlue hover:bg-ehsSoftBlue text-[11px] font-bold py-1.5 rounded-lg transition-colors text-center"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-slate-400 px-1 mt-1 font-medium">
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {/* In-Chat Form (Quote or Tour) */}
            {formType && (
              <div className="bg-white border border-ehsLightBlue rounded-2xl p-4 shadow-md animate-in fade-in duration-200">
                <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-slate-100">
                  <h4 className="font-extrabold text-xs text-ehsDeepBlue">
                    {formType === 'tour' ? '📅 Schedule Brooksville Lot Tour' : '📋 Request Turnkey Quote'}
                  </h4>
                  <button
                    onClick={() => setFormType(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleFormSubmit} className="space-y-2.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Smith"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-ehsDeepBlue"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 352-555-0199"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-ehsDeepBlue"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-ehsDeepBlue"
                    />
                  </div>

                  {formType === 'tour' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Preferred Date *</label>
                        <input
                          type="date"
                          required
                          value={formData.tourDate}
                          onChange={(e) => setFormData({ ...formData, tourDate: e.target.value })}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-ehsDeepBlue"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Time</label>
                        <select
                          value={formData.tourTime}
                          onChange={(e) => setFormData({ ...formData, tourTime: e.target.value })}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-ehsDeepBlue bg-white"
                        >
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="12:00 PM">12:00 PM</option>
                          <option value="2:00 PM">2:00 PM</option>
                          <option value="4:00 PM">4:00 PM</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Land Status</label>
                      <select
                        value={formData.landStatus}
                        onChange={(e) => setFormData({ ...formData, landStatus: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-ehsDeepBlue bg-white"
                      >
                        <option value="Own land already">I already own land</option>
                        <option value="Looking for land-and-home package">Looking for land & home package</option>
                        <option value="Placing in a manufactured community">Placing in a manufactured community</option>
                        <option value="Researching options">Just researching</option>
                      </select>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full bg-ehsDeepBlue hover:bg-ehsNavy text-white font-extrabold py-2 rounded-xl transition-all shadow-md mt-1"
                  >
                    {formSubmitting ? 'Sending details...' : formType === 'tour' ? 'Confirm Lot Tour Request' : 'Send Quote Request →'}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center">
                    🔒 By submitting, you agree to be contacted by Easy HomeSource.
                  </p>
                </form>
              </div>
            )}

            {/* Success Message Banner */}
            {formSuccessMessage && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-900 shadow-sm animate-in fade-in">
                <p className="font-semibold">{formSuccessMessage}</p>
                <div className="mt-2 flex gap-2">
                  <a href={`tel:${siteInfo.phoneHref}`} className="font-bold underline text-emerald-800">
                    Call 352-558-8888
                  </a>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white p-3 rounded-2xl border border-slate-200 w-fit">
                <span className="animate-pulse">●</span>
                <span className="animate-pulse delay-100">●</span>
                <span className="animate-pulse delay-200">●</span>
                <span className="ml-1 text-[11px]">Easy HomeSource is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              onClick={() => handleSendMessage('Show homes under $100k')}
              className="bg-slate-100 hover:bg-ehsSoftBlue hover:text-ehsDeepBlue px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700 border border-slate-200 transition-colors"
            >
              💰 Under $100k
            </button>
            <button
              onClick={() => {
                setFormType('tour');
                setShowCallout(false);
              }}
              className="bg-slate-100 hover:bg-ehsSoftBlue hover:text-ehsDeepBlue px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700 border border-slate-200 transition-colors"
            >
              📅 Book Lot Tour
            </button>
            <button
              onClick={() => handleSendMessage('How does land, delivery, and setup work?')}
              className="bg-slate-100 hover:bg-ehsSoftBlue hover:text-ehsDeepBlue px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700 border border-slate-200 transition-colors"
            >
              🚜 Land & Setup
            </button>
            <button
              onClick={() => handleSendMessage('How does manufactured home financing work?')}
              className="bg-slate-100 hover:bg-ehsSoftBlue hover:text-ehsDeepBlue px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700 border border-slate-200 transition-colors"
            >
              💳 Financing
            </button>
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about homes, tours, pricing..."
              className="flex-1 px-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-full focus:outline-none focus:border-ehsDeepBlue focus:ring-1 focus:ring-ehsDeepBlue"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-ehsDeepBlue hover:bg-ehsNavy disabled:opacity-50 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
              aria-label="Send message"
            >
              <svg className="w-4 h-4 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

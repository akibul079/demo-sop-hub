import React from 'react';
import { CreditCard, CheckCircle2, Download, FileText } from 'lucide-react';

export const BillingSettings = () => {
    return (
        <div className="space-y-8 animate-fadeIn max-w-4xl">

            {/* 8.1 Subscription */}
            <div className="bg-gradient-to-r from-monday-dark to-gray-800 p-6 rounded-xl shadow-lg text-white">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="bg-blue-500/20 text-blue-200 text-xs font-bold px-2 py-1 rounded border border-blue-400/30 uppercase tracking-wide">Current Plan</span>
                        <h3 className="text-2xl font-bold mt-2">Professional Plan</h3>
                        <p className="text-white/70 text-sm">$29/month • Billed Annually</p>
                    </div>
                    <button className="bg-white text-monday-dark px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors">Change Plan</button>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-white/60 mb-1">
                            <span>Seat Usage</span>
                            <span>45 / 50</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-monday-primary w-[90%] rounded-full"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                        <div>
                            <div className="text-xl font-bold">1.2GB</div>
                            <div className="text-xs text-white/50">Storage Used</div>
                        </div>
                        <div>
                            <div className="text-xl font-bold">142</div>
                            <div className="text-xs text-white/50">Total SOPs</div>
                        </div>
                        <div>
                            <div className="text-xl font-bold">12k</div>
                            <div className="text-xs text-white/50">API Calls</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 8.2 Payment Methods */}
            <div className="bg-white p-6 rounded-xl shadow-card border border-monday-border">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-monday-dark">Payment Method</h3>
                    <button className="text-sm text-monday-primary font-bold hover:underline">Update</button>
                </div>

                <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-12 h-8 bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
                        {/* Simplified Visa Icon */}
                        <div className="font-bold text-blue-800 italic text-xs">VISA</div>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">Visa ending in 4242</p>
                        <p className="text-xs text-gray-500">Expires 12/28</p>
                    </div>
                    <CheckCircle2 className="ml-auto text-green-500" size={20} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Billing Email</label>
                        <input type="email" defaultValue="accounts@acme.com" className="w-full px-3 py-2 border border-monday-border rounded-md focus:outline-none focus:border-monday-primary" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">VAT / Tax ID</label>
                        <input type="text" defaultValue="US-992831" className="w-full px-3 py-2 border border-monday-border rounded-md focus:outline-none focus:border-monday-primary" />
                    </div>
                </div>
            </div>

            {/* 8.3 Invoice History */}
            <div className="bg-white p-6 rounded-xl shadow-card border border-monday-border">
                <h3 className="text-lg font-bold text-monday-dark mb-6">Invoice History</h3>
                <div className="divide-y divide-gray-100">
                    {[
                        { date: 'Oct 01, 2023', amount: '$348.00', status: 'Paid', inv: '#INV-2023-001' },
                        { date: 'Sep 01, 2023', amount: '$348.00', status: 'Paid', inv: '#INV-2023-002' },
                        { date: 'Aug 01, 2023', amount: '$348.00', status: 'Paid', inv: '#INV-2023-003' },
                    ].map((inv, i) => (
                        <div key={i} className="py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-100 rounded text-gray-500"><FileText size={16} /></div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{inv.inv}</p>
                                    <p className="text-xs text-gray-500">{inv.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="text-sm font-medium text-gray-900">{inv.amount}</span>
                                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{inv.status}</span>
                                <button className="text-gray-400 hover:text-monday-dark"><Download size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

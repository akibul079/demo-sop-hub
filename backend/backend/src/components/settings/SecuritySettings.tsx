import React, { useState } from 'react';
import { Shield, Key, Eye, FileText, Download, CheckCircle2 } from 'lucide-react';

export const SecuritySettings = () => {
    const [twoFaEnabled, setTwoFaEnabled] = useState(false);

    return (
        <div className="space-y-8 animate-fadeIn max-w-4xl">

            {/* 6.1 Authentication */}
            <div className="bg-white p-6 rounded-xl shadow-card border border-monday-border">
                <h3 className="text-lg font-bold text-monday-dark mb-6">Authentication</h3>

                <div className="space-y-6">
                    {/* SSO - Admin Feature */}
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <Shield size={18} className="text-purple-600" />
                                <h4 className="font-bold text-gray-900">Single Sign-On (SSO)</h4>
                                <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded">ENTERPRISE</span>
                            </div>
                            <button className="text-sm font-medium text-gray-400 cursor-not-allowed">Configure</button>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">Allow users to log in using your Identity Provider (Google, Microsoft 365, Okta).</p>
                        <div className="flex gap-2">
                            <div className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center grayscale opacity-50"><img src="https://authjs.dev/img/providers/google.svg" className="w-4 h-4" alt="" /></div>
                            <div className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center grayscale opacity-50"><img src="https://authjs.dev/img/providers/azure-ad.svg" className="w-4 h-4" alt="" /></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Enforce 2FA</label>
                            <select className="w-full px-3 py-2 border border-monday-border rounded-md bg-white focus:outline-none focus:border-monday-primary">
                                <option>Optional</option>
                                <option>Mandatory for Admins</option>
                                <option>Mandatory for Everyone</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Session Timeout</label>
                            <select className="w-full px-3 py-2 border border-monday-border rounded-md bg-white focus:outline-none focus:border-monday-primary">
                                <option>Never</option>
                                <option>1 Hour</option>
                                <option>8 Hours</option>
                                <option>24 Hours</option>
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Password Policy</p>
                        <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked readOnly className="rounded text-green-500" /> Min 8 chars</label>
                            <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked readOnly className="rounded text-green-500" /> Special chars</label>
                            <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked readOnly className="rounded text-green-500" /> Numbers required</label>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6.2 Audit & Logs */}
            <div className="bg-white p-6 rounded-xl shadow-card border border-monday-border">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-monday-dark">Audit & Security Logs</h3>
                    <button className="flex items-center gap-2 text-sm text-monday-primary font-medium hover:bg-blue-50 px-3 py-1.5 rounded transition-colors">
                        <Download size={16} /> Export CSV
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 border border-gray-200 rounded-lg hover:border-monday-primary cursor-pointer transition-colors bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FileText size={20} /></div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Activity Logs</p>
                                <p className="text-xs text-gray-500">Who did what, when.</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg hover:border-monday-primary cursor-pointer transition-colors bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 text-red-600 rounded-lg"><Eye size={20} /></div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Access Logs</p>
                                <p className="text-xs text-gray-500">Sensitive SOP views.</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg hover:border-monday-primary cursor-pointer transition-colors bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg"><Key size={20} /></div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Login History</p>
                                <p className="text-xs text-gray-500">Auth attempts & locations.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6.3 Data Governance */}
            <div className="bg-white p-6 rounded-xl shadow-card border border-monday-border">
                <h3 className="text-lg font-bold text-monday-dark mb-6">Data Governance</h3>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-4">
                    <div>
                        <p className="text-sm font-bold text-gray-900">Full Data Export</p>
                        <p className="text-xs text-gray-500">Download a complete backup of all SOPs and User data.</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-bold rounded hover:bg-gray-50">JSON</button>
                        <button className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-bold rounded hover:bg-gray-50">CSV</button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Data Retention Policy</label>
                    <select className="w-full px-3 py-2 border border-monday-border rounded-md bg-white focus:outline-none focus:border-monday-primary">
                        <option>Keep indefinitely (Default)</option>
                        <option>Delete data 30 days after cancellation</option>
                        <option>Delete data 90 days after cancellation</option>
                    </select>
                </div>
            </div>

        </div>
    );
};

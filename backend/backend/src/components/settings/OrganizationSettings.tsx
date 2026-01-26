import React, { useState } from 'react';
import { Upload, HelpCircle, Save } from 'lucide-react';

export const OrganizationSettings = () => {
    const [workspaceName, setWorkspaceName] = useState('Acme Corporation');
    const [subdomain, setSubdomain] = useState('acme');
    const [primaryColor, setPrimaryColor] = useState('#0073EA');

    return (
        <div className="space-y-8 animate-fadeIn max-w-4xl">

            {/* 2.1 General Workspace */}
            <div className="bg-white p-6 rounded-xl shadow-card border border-monday-border">
                <h3 className="text-lg font-bold text-monday-dark mb-6">General Workspace</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Workspace Name</label>
                        <input type="text" value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} className="w-full px-3 py-2 border border-monday-border rounded-md focus:outline-none focus:border-monday-primary" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Workspace URL</label>
                        <div className="flex">
                            <input type="text" value={subdomain} onChange={e => setSubdomain(e.target.value)} className="flex-1 px-3 py-2 border border-r-0 border-monday-border rounded-l-md focus:outline-none focus:border-monday-primary" />
                            <span className="bg-gray-50 border border-monday-border px-3 py-2 rounded-r-md text-gray-500 text-sm flex items-center">.sopapp.com</span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Custom Domain</label>
                        <div className="flex gap-2">
                            <input type="text" placeholder="sops.company.com" className="flex-1 px-3 py-2 border border-monday-border rounded-md focus:outline-none focus:border-monday-primary" />
                            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors">Verify</button>
                        </div>
                        <p className="text-xs text-gray-400">Requires CNAME configuration.</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Support Contact Email</label>
                        <input type="email" placeholder="help@company.com" className="w-full px-3 py-2 border border-monday-border rounded-md focus:outline-none focus:border-monday-primary" />
                        <p className="text-xs text-gray-400">Where users send help requests.</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Favicon</label>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 border border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50">
                                <Upload size={16} className="text-gray-400" />
                            </div>
                            <button className="text-sm text-monday-primary font-medium hover:underline">Upload .ICO / .PNG</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2.2 Branding & White Labeling */}
            <div className="bg-white p-6 rounded-xl shadow-card border border-monday-border">
                <h3 className="text-lg font-bold text-monday-dark mb-6">Branding & White Labeling</h3>

                <div className="space-y-8">
                    {/* Logos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo (Light Mode)</label>
                            <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg bg-white">
                                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400 font-bold text-xs">LOGO</div>
                                <div className="flex flex-col">
                                    <button className="text-sm text-monday-primary font-bold hover:underline text-left">Upload Image</button>
                                    <span className="text-xs text-gray-400">Recommended 200x50px</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo (Dark Mode)</label>
                            <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg bg-gray-900">
                                <div className="w-16 h-16 bg-white/10 rounded flex items-center justify-center text-white/50 font-bold text-xs">LOGO</div>
                                <div className="flex flex-col">
                                    <button className="text-sm text-white font-bold hover:underline text-left">Upload Image</button>
                                    <span className="text-xs text-gray-400">Recommended 200x50px</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Colors */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Brand Color Primary</label>
                        <div className="flex items-center gap-4">
                            <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-12 h-12 p-1 rounded cursor-pointer border border-gray-200" />
                            <div className="flex flex-col">
                                <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded border border-gray-200">{primaryColor}</span>
                                <span className="text-xs text-gray-400 mt-1">Affects buttons, links, and accents.</span>
                            </div>
                        </div>
                    </div>

                    {/* PDF Branding */}
                    <div className="border-t border-gray-100 pt-6">
                        <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">PDF Export Branding <span className="bg-monday-primary/10 text-monday-primary text-[10px] px-2 py-0.5 rounded-full">PRO</span></h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="text-sm text-gray-700">Include Header Logo</span>
                                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                    <input type="checkbox" name="toggle" id="toggle-logo" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-monday-primary right-0" checked readOnly />
                                    <label htmlFor="toggle-logo" className="toggle-label block overflow-hidden h-5 rounded-full bg-monday-primary cursor-pointer"></label>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Watermark Text</label>
                                <input type="text" placeholder="CONFIDENTIAL" className="w-full px-3 py-2 border border-monday-border rounded-md focus:outline-none focus:border-monday-primary" />
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Footer Text</label>
                                <textarea rows={2} placeholder="Confidential Property of [Company Name] - Do not distribute." className="w-full px-3 py-2 border border-monday-border rounded-md focus:outline-none focus:border-monday-primary"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button className="px-8 py-2.5 bg-monday-primary text-white rounded-lg hover:bg-monday-primaryHover transition-colors font-medium shadow-md flex items-center gap-2">
                    <Save size={18} /> Save Changes
                </button>
            </div>

        </div>
    );
};

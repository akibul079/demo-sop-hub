import React, { useState } from 'react';
import { Save, AlertTriangle, Clock, Share2 } from 'lucide-react';

export const SOPConfiguration = () => {
    return (
        <div className="space-y-8 animate-fadeIn max-w-4xl">

            {/* 3.1 Editor & Content */}
            <div className="bg-white p-6 rounded-xl shadow-card border border-monday-border">
                <h3 className="text-lg font-bold text-monday-dark mb-6">Editor & Content</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Default Editor Mode</label>
                        <select className="w-full px-3 py-2 border border-monday-border rounded-md bg-white focus:outline-none focus:border-monday-primary">
                            <option value="visual">Visual (WYSIWYG)</option>
                            <option value="markdown">Markdown</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Rich Media Max Size</label>
                        <select className="w-full px-3 py-2 border border-monday-border rounded-md bg-white focus:outline-none focus:border-monday-primary">
                            <option value="5">5 MB</option>
                            <option value="10">10 MB</option>
                            <option value="50">50 MB</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Auto-Save Interval (Seconds)</label>
                        <input type="number" defaultValue={30} className="w-full px-3 py-2 border border-monday-border rounded-md focus:outline-none focus:border-monday-primary" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Allowed Media Types</label>
                        <div className="flex flex-wrap gap-4 mt-2">
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" defaultChecked /> Images</label>
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" defaultChecked /> Videos</label>
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" defaultChecked /> Embeds</label>
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" defaultChecked /> Code Blocks</label>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3.2 Review & Verification */}
            <div className="bg-white p-6 rounded-xl shadow-card border border-monday-border">
                <h3 className="text-lg font-bold text-monday-dark mb-6">Review & Verification Cycles</h3>
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="text-yellow-600" size={20} />
                            <div>
                                <p className="text-sm font-bold text-gray-900">Staleness Alert</p>
                                <p className="text-xs text-gray-600">Mark SOP as "Stale" if not updated in X months.</p>
                            </div>
                        </div>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" name="toggle" id="toggle-stale" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-monday-primary right-0" checked readOnly />
                            <label htmlFor="toggle-stale" className="toggle-label block overflow-hidden h-5 rounded-full bg-monday-primary cursor-pointer"></label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Default Period</label>
                            <select className="w-full px-3 py-2 border border-monday-border rounded-md bg-white focus:outline-none focus:border-monday-primary">
                                <option value="3">3 Months</option>
                                <option value="6">6 Months</option>
                                <option value="12">12 Months</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Default Reviewer</label>
                            <select className="w-full px-3 py-2 border border-monday-border rounded-md bg-white focus:outline-none focus:border-monday-primary">
                                <option value="author">Original Author</option>
                                <option value="manager">Department Head</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="peer-review" className="w-4 h-4 text-monday-primary rounded border-gray-300 focus:ring-monday-primary" />
                        <label htmlFor="peer-review" className="text-sm text-gray-700 font-medium cursor-pointer">Enforce Peer Review (2nd party approval required for publishing)</label>
                    </div>
                </div>
            </div>

            {/* 3.3 Version Control */}
            <div className="bg-white p-6 rounded-xl shadow-card border border-monday-border">
                <h3 className="text-lg font-bold text-monday-dark mb-6">Version Control</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Version retention period</label>
                        <select className="w-full px-3 py-2 border border-monday-border rounded-md bg-white focus:outline-none focus:border-monday-primary">
                            <option value="30">30 Days</option>
                            <option value="365">1 Year</option>
                            <option value="unlimited">Unlimited</option>
                        </select>
                    </div>
                    <div className="flex flex-col justify-end gap-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" defaultChecked className="w-4 h-4 text-monday-primary rounded" /> Enable Major/Minor Versioning (v1.0 vs v1.1)
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 text-monday-primary rounded" /> Force Change Log entry on publish
                        </label>
                    </div>
                </div>
            </div>

            {/* 3.4 Sharing */}
            <div className="bg-white p-6 rounded-xl shadow-card border border-monday-border">
                <h3 className="text-lg font-bold text-monday-dark mb-6">Sharing & Public Access</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        <div>
                            <p className="text-sm font-bold text-gray-900">Allow Public Links</p>
                            <p className="text-xs text-gray-500">Share SOPs with people outside your workspace.</p>
                        </div>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" name="toggle" id="toggle-public" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 left-0" readOnly />
                            <label htmlFor="toggle-public" className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"></label>
                        </div>
                    </div>

                    <div className="opacity-50 pointer-events-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Link Expiration (Default)</label>
                                <select className="w-full px-3 py-2 border border-monday-border rounded-md bg-white">
                                    <option>7 Days</option>
                                    <option>30 Days</option>
                                    <option>Never</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 pt-8">
                                <input type="checkbox" className="w-4 h-4 text-monday-primary rounded" />
                                <label className="text-sm text-gray-700">Require Password by default</label>
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

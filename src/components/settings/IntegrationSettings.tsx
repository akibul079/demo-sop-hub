import React, { useState } from 'react';
import { Webhook, Code, Link, Plus } from 'lucide-react';

export const IntegrationSettings = () => {
    return (
        <div className="space-y-8 animate-fadeIn max-w-4xl">

            {/* 7.1 Native Integrations */}
            <div className="bg-white p-6 rounded-xl shadow-card border border-monday-border">
                <h3 className="text-lg font-bold text-monday-dark mb-6">Native Integrations</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { name: 'Slack', icon: 'https://cdn.icon-icons.com/icons2/2699/PNG/512/slack_logo_icon_168705.png', desc: 'Notifications & Search', connected: true },
                        { name: 'Microsoft Teams', icon: 'https://cdn.icon-icons.com/icons2/2699/PNG/512/microsoft_teams_logo_icon_168706.png', desc: 'Tab & Notifications', connected: false },
                        { name: 'Jira', icon: 'https://cdn.icon-icons.com/icons2/2699/PNG/512/atlassian_jira_logo_icon_170512.png', desc: 'Link SOPs to Issues', connected: false },
                        { name: 'Google Drive', icon: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo.png', desc: 'File Attachments', connected: false },
                        { name: 'Zapier', icon: 'https://cdn.icon-icons.com/icons2/2699/PNG/512/zapier_logo_icon_169037.png', desc: 'Automation Workflows', connected: false },
                    ].map((app, i) => (
                        <div key={i} className="border border-gray-200 rounded-xl p-5 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                            <img src={app.icon} alt={app.name} className="w-10 h-10 mb-3 object-contain" />
                            <h4 className="font-bold text-gray-900">{app.name}</h4>
                            <p className="text-xs text-gray-500 mb-4 h-8">{app.desc}</p>
                            <button className={`w-full py-1.5 rounded text-sm font-medium transition-colors ${app.connected
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}>
                                {app.connected ? 'Connected' : 'Connect'}
                            </button>
                        </div>
                    ))}

                    <div className="border border-dashed border-gray-300 rounded-xl p-5 flex flex-col items-center justify-center text-center bg-gray-50 text-gray-400">
                        <Plus size={24} className="mb-2" />
                        <span className="text-sm font-medium">Request Integration</span>
                    </div>
                </div>
            </div>

            {/* 7.2 Developer Resources */}
            <div className="bg-white p-6 rounded-xl shadow-card border border-monday-border">
                <h3 className="text-lg font-bold text-monday-dark mb-6">Developer Resources</h3>

                <div className="space-y-8">
                    {/* API Access */}
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Code size={18} className="text-monday-primary" />
                                <h4 className="font-bold text-gray-900">API Access</h4>
                            </div>
                            <p className="text-sm text-gray-500">Read/Write access to SOPs and Users via REST API.</p>
                        </div>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" name="toggle" id="toggle-api" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-monday-primary right-0" checked readOnly />
                            <label htmlFor="toggle-api" className="toggle-label block overflow-hidden h-5 rounded-full bg-monday-primary cursor-pointer"></label>
                        </div>
                    </div>

                    {/* Keys */}
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300 flex justify-between items-center group">
                        <span>sk_live_51Mz...Xy9z</span>
                        <button className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition-colors opacity-0 group-hover:opacity-100">Reveal</button>
                    </div>

                    {/* Webhooks */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Webhook size={18} className="text-gray-600" />
                                <h4 className="font-bold text-gray-900">Webhooks</h4>
                            </div>
                            <button className="text-xs font-bold text-monday-primary hover:underline">+ Add Endpoint</button>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                <div>
                                    <p className="text-sm font-bold text-gray-800">https://api.company.com/sop-hook</p>
                                    <div className="flex gap-2 text-[10px] mt-1">
                                        <span className="bg-blue-100 text-blue-700 px-1.5 rounded">sop.published</span>
                                        <span className="bg-blue-100 text-blue-700 px-1.5 rounded">sop.updated</span>
                                    </div>
                                </div>
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

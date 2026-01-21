import React, { useState } from 'react';
import { Save, Bell, Mail, Smartphone, MessageSquare } from 'lucide-react';

export const NotificationSettings = () => {
    return (
        <div className="space-y-8 animate-fadeIn max-w-4xl">

            {/* 5.1 Trigger Events Matrix */}
            <div className="bg-white p-6 rounded-xl shadow-card border border-monday-border">
                <h3 className="text-lg font-bold text-monday-dark mb-2">Notification Preferences</h3>
                <p className="text-sm text-gray-500 mb-6">Choose how and when you want to be notified.</p>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-4 font-medium text-gray-500 text-sm w-1/3">Trigger Event</th>
                                <th className="py-4 font-medium text-gray-900 text-sm text-center w-1/6"><div className="flex flex-col items-center gap-1"><Mail size={18} className="text-gray-400" /> Email</div></th>
                                <th className="py-4 font-medium text-gray-900 text-sm text-center w-1/6"><div className="flex flex-col items-center gap-1"><Bell size={18} className="text-gray-400" /> In-App</div></th>
                                <th className="py-4 font-medium text-gray-900 text-sm text-center w-1/6"><div className="flex flex-col items-center gap-1"><Smartphone size={18} className="text-gray-400" /> Push</div></th>
                                <th className="py-4 font-medium text-gray-900 text-sm text-center w-1/6"><div className="flex flex-col items-center gap-1"><MessageSquare size={18} className="text-gray-400" /> Slack</div></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[
                                { label: 'SOP Assignment', desc: 'When you are assigned to an SOP' },
                                { label: 'Due Date Reminder', desc: '24 hours before a checklist is due' },
                                { label: 'SOP Updated', desc: 'Content changes in SOPs you watch' },
                                { label: 'Review Request', desc: 'When your approval is needed' },
                                { label: 'Comment Mention', desc: 'When someone @mentions you' }
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="py-4 pr-4">
                                        <p className="text-sm font-bold text-gray-900">{row.label}</p>
                                        <p className="text-xs text-gray-400">{row.desc}</p>
                                    </td>
                                    <td className="py-4 text-center"><input type="checkbox" defaultChecked className="w-4 h-4 text-monday-primary rounded border-gray-300 focus:ring-monday-primary" /></td>
                                    <td className="py-4 text-center"><input type="checkbox" defaultChecked className="w-4 h-4 text-monday-primary rounded border-gray-300 focus:ring-monday-primary" /></td>
                                    <td className="py-4 text-center"><input type="checkbox" className="w-4 h-4 text-monday-primary rounded border-gray-300 focus:ring-monday-primary" /></td>
                                    <td className="py-4 text-center"><input type="checkbox" className="w-4 h-4 text-monday-primary rounded border-gray-300 focus:ring-monday-primary" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-card border border-monday-border">
                <h3 className="text-lg font-bold text-monday-dark mb-4">Frequency</h3>
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <p className="text-sm font-bold text-gray-900">Digest Email</p>
                            <p className="text-xs text-gray-500">Receive a summary of activity instead of individual emails.</p>
                        </div>
                        <select className="px-3 py-2 border border-monday-border rounded-md bg-white focus:outline-none focus:border-monday-primary text-sm min-w-[150px]">
                            <option>Daily at 9:00 AM</option>
                            <option>Weekly on Monday</option>
                            <option>Never (Instant)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button className="px-8 py-2.5 bg-monday-primary text-white rounded-lg hover:bg-monday-primaryHover transition-colors font-medium shadow-md flex items-center gap-2">
                    <Save size={18} /> Save Preferences
                </button>
            </div>

        </div>
    );
};

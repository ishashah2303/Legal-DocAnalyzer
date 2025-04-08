import React from 'react'

const SettingsPage = () => {
  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-[#6B3A1E] mb-6">Settings</h2>
            <p className="text-gray-700 mb-8">Manage your account settings and preferences.</p>
            
            <div className="space-y-12">
              <section>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Account Information</h3>
                <div className="bg-[#F5F0EB] p-6 rounded-lg border border-[#E8D8C9]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        value="user@example.com" 
                        disabled
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subscription</label>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Pro Plan</span>
                        <span className="text-sm text-gray-600">Renews May 1, 2025</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              
              <section>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Preferences</h3>
                <div className="bg-[#F5F0EB] p-6 rounded-lg border border-[#E8D8C9]">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive emails about your document analysis</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A0522D]"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Dark Mode</p>
                        <p className="text-sm text-gray-500">Use dark theme for the interface</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A0522D]"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Auto-save Documents</p>
                        <p className="text-sm text-gray-500">Automatically save analysis results</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A0522D]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </section>
              
              <section>
                <h3 className="text-lg font-medium text-gray-800 mb-4">API Integration</h3>
                <div className="bg-[#F5F0EB] p-6 rounded-lg border border-[#E8D8C9]">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                      <div className="flex">
                        <input 
                          type="password" 
                          value="••••••••••••••••••••••••" 
                          disabled
                          className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-l-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
                        />
                        <button className="px-4 py-2 bg-[#A0522D] text-white rounded-r-md hover:bg-[#8B4513]">
                          Copy
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Use this key to access our API programmatically</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                      <input 
                        type="text" 
                        placeholder="https://your-app.com/webhook" 
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
                      />
                      <p className="text-xs text-gray-500 mt-1">Receive notifications when document analysis is complete</p>
                    </div>
                  </div>
                </div>
              </section>
              
              <div className="flex justify-end space-x-4">
                <button className="bg-gray-200 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-300 transition-colors font-medium">
                  Cancel
                </button>
                <button className="bg-[#A0522D] text-white py-2 px-6 rounded-md hover:bg-[#8B4513] transition-colors font-medium">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
          </div>
   
  )
}

export default SettingsPage

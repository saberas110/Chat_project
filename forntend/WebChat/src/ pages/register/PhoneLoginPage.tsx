import React, { useState, useRef } from 'react';


export default function PhoneLoginPage({ onPhoneSubmit }){
  const [phoneNumber, setPhoneNumber] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phoneNumber) {
      onPhoneSubmit(phoneNumber);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">S@S</span>
          </div>
        </div>

        <h2 className="text-gray-800 text-lg font-medium text-center mb-6 leading-relaxed">
          Please enter your phone number
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">
              Your phone number
            </label>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
              <div className="bg-gray-50 px-4 py-3 border-r border-gray-300 text-gray-700 font-medium min-w-[60px]">
                +98
              </div>
              <input
                type="tel"
                className="flex-1 px-4 py-3 outline-none text-gray-700 placeholder-gray-400"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className="hidden"
              />
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 transition-all ${
                keepSignedIn 
                  ? 'bg-blue-500 border-blue-500' 
                  : 'bg-white border-gray-300'
              }`}>
                {keepSignedIn && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-gray-700 text-sm">Keep me signed in</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
          >
            NEXT
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <div className="text-center">
          <button className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 py-2 px-4 rounded-lg font-medium transition-colors">
            LOG IN BY QR CODE
          </button>
        </div>
      </div>
    </div>
  );
}
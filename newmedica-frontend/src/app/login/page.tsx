
"use client";

import { useState } from 'react';
import { User, UserType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { users } from '@/data/users';

const LoginPage = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [foundUser, setFoundUser] = useState<User | null>(null);

  // ... (rest of the state declarations for sign up)
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<UserType>('Basic');
  const [icNo, setIcNo] = useState('');
  const [hpNo, setHpNo] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [coRegNo, setCoRegNo] = useState('');
  const [coEmailAddress, setCoEmailAddress] = useState('');
  const [tinNo, setTinNo] = useState('');
  const [picEinvoice, setPicEinvoice] = useState('');
  const [picEinvoiceEmail, setPicEinvoiceEmail] = useState('');
  const [picEinvoiceTelNo, setPicEinvoiceTelNo] = useState('');


  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && email) {
      if (isSignUp) {
        setStep(2);
      } else {
        const userExists = users.find(u => u.email === email);
        if (userExists) {
          setFoundUser(userExists);
          setStep(2);
        } else {
          // Handle user not found
          alert('User not found.');
        }
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (foundUser && password) {
      // In a real app, you'd verify the password
      login(foundUser.id);
      router.push('/account');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      email,
      password,
      userType,
      extra_fields: {
        firstName: name,
        icNo,
        hpNo,
        hospitalName,
        department,
        position,
        companyName,
        companyAddress,
        coRegNo,
        coEmailAddress,
        tinNo,
        picEinvoice,
        picEinvoiceEmail,
        picEinvoiceTelNo,
      }
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/auth/register", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Something went wrong');
      }

      alert('Registration successful! Please log in.');
      // Reset to login view
      setIsSignUp(false);
      setStep(1);

    } catch (error: any) {
      alert(`Registration failed: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center items-center">
      <div className="max-w-md w-full text-center">
        {step === 1 && (
          <>
            <h1 className="text-3xl font-bold mb-2">Welcome</h1>
            <p className="text-gray-600 mb-8">Sign up or log in to continue</p>
            <div className="flex justify-center border-b mb-8">
              <button 
                className={`px-6 py-2 font-semibold ${isSignUp ? 'border-b-2 border-black' : 'text-gray-500'}`}
                onClick={() => setIsSignUp(true)}
              >
                Sign up
              </button>
              <button 
                className={`px-6 py-2 font-semibold ${!isSignUp ? 'border-b-2 border-black' : 'text-gray-500'}`}
                onClick={() => setIsSignUp(false)}
              >
                Login
              </button>
            </div>
            <form onSubmit={handleContinue}>
              <input 
                type="email" 
                placeholder="Phone or Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 h-12 border border-gray-300 rounded-md shadow-sm mb-4"
              />
              <button type="submit" className="w-full bg-black text-white py-3 rounded-md">
                Continue
              </button>
            </form>
          </>
        )}

        {step === 2 && !isSignUp && foundUser && (
          <>
            <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 bg-purple-600 text-white flex items-center justify-center rounded-full text-3xl font-bold mb-4">
                    {foundUser.firstName.charAt(0).toUpperCase()}{foundUser.lastName?.charAt(0).toUpperCase()}
                </div>
                <p className="font-semibold text-lg">{foundUser.firstName}</p>
                <button onClick={() => { setStep(1); setFoundUser(null); }} className="text-sm text-gray-500 hover:underline">
                    Not you?
                </button>
            </div>
            <form onSubmit={handleLogin}>
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 h-12 border border-gray-300 rounded-md shadow-sm mb-4"
                />
                <button type="submit" className="w-full bg-black text-white py-3 rounded-md mb-4">
                    Login
                </button>
                <div className="text-center">
                    <a href="#" className="text-sm text-gray-600 hover:underline">Forgot your password?</a>
                </div>
                 <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                </div>
                <button type="button" className="w-full border border-gray-300 text-gray-700 py-3 rounded-md">
                    Send me login link
                </button>
            </form>
          </>
        )}

        {step === 2 && isSignUp && (
          <>
            <h1 className="text-3xl font-bold mb-2">Almost done</h1>
            <p className="text-gray-600 mb-8">We're excited to have you join our member. Fill in detail for your account</p>
            <form onSubmit={handleSignUp} className="text-left">
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input 
                  type="text" 
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 h-12 border border-gray-300 rounded-md mt-1"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password"  className="block text-sm font-medium text-gray-700">Password</label>
                <input 
                  type="password" 
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 h-12 border border-gray-300 rounded-md mt-1"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="userType" className="block text-sm font-medium text-gray-700">I am a...</label>
                <select 
                  id="userType" 
                  value={userType} 
                  onChange={(e) => setUserType(e.target.value as UserType)}
                  className="w-full p-3 h-12 border border-gray-300 rounded-md mt-1"
                >
                  <option value="Basic">Basic User</option>
                  <option value="Agent">Agent</option>
                  <option value="Healthcare">Healthcare Professional</option>
                </select>
              </div>
              
              {/* Conditional Fields Go Here */}
              {userType === 'Healthcare' && (
                <div className="space-y-4 mt-4 pt-4 mb-4 border-t">
                  <h3 className="font-semibold text-gray-800">Healthcare Professional Details</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IC No <span className="text-red-500">*</span> </label>
                    <input required type="text" value={icNo} onChange={(e) => setIcNo(e.target.value)} className="w-full p-3 h-12 border border-gray-300 rounded-md mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">HP No <span className="text-red-500">*</span> </label>
                    <input required type="text" value={hpNo} onChange={(e) => setHpNo(e.target.value)} className="w-full p-3 h-12 border border-gray-300 rounded-md mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hospital Name <span className="text-red-500">*</span> </label>
                    <input required type="text" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} className="w-full p-3 h-12 border border-gray-300 rounded-md mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department <span className="text-red-500">*</span> </label>
                    <input required type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full p-3 h-12 border border-gray-300 rounded-md mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position <span className="text-red-500">*</span> </label>
                    <input required type="text" value={position} onChange={(e) => setPosition(e.target.value)} className="w-full p-3 h-12 border border-gray-300 rounded-md mt-1" />
                  </div>
                </div>
              )}

              {userType === 'Agent' && (
                <div className="space-y-4 mt-4 pt-4 mb-4 border-t">
                  <h3 className="font-semibold text-gray-800">Agent Details</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IC No <span className="text-red-500">*</span></label>
                    <input required type="text" value={icNo} onChange={(e) => setIcNo(e.target.value)} className="w-full p-3 h-12 border border-gray-300 rounded-md mt-1" /> 
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">HP No <span className="text-red-500">*</span></label>
                    <input required type="text" value={hpNo} onChange={(e) => setHpNo(e.target.value)} className="w-full p-3 h-12 border border-gray-300 rounded-md mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name <span className="text-red-500">*</span></label>
                    <input required type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full p-3 h-12 border border-gray-300 rounded-md mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Address <span className="text-red-500">*</span></label>
                    <input required type="text" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} className="w-full p-3 h-12 border border-gray-300 rounded-md mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Co Reg No <span className="text-red-500">*</span></label>
                    <input required type="text" value={coRegNo} onChange={(e) => setCoRegNo(e.target.value)} className="w-full p-3 h-12 border border-gray-300 rounded-md mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Co Email Address <span className="text-red-500">*</span></label>
                    <input required type="text" value={coEmailAddress} onChange={(e) => setCoEmailAddress(e.target.value)} className="w-full p-3 h-12 border border-gray-300 rounded-md mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">TIN No <span className="text-red-500">*</span></label>
                    <input required type="text" value={tinNo} onChange={(e) => setTinNo(e.target.value)} className="w-full p-3 h-12 border border-gray-300 rounded-md mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">PIC of E-invoice <span className="text-red-500">*</span></label>
                    <input required type="text" value={picEinvoice} onChange={(e) => setPicEinvoice(e.target.value)} className="w-full p-3 h-12 border border-gray-300 rounded-md mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">PIC of E-invoice, email address & tel no <span className="text-red-500">*</span></label>
                    <input required type="text" value={picEinvoiceEmail} onChange={(e) => setPicEinvoiceEmail(e.target.value)} className="w-full p-3 h-12 border border-gray-300 rounded-md mt-1" />
                  </div>
                </div>
              )}

              <button type="submit" className="w-full bg-black text-white py-3 rounded-md">
                Continue
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;

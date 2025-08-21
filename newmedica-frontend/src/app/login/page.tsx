
"use client";

import { useState } from 'react';
import { UserType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
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


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/account');
    } catch (error) {
      alert('Login failed. Please check your credentials.');
      console.error(error);
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

    } catch (error: any) {
      alert(`Registration failed: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center items-center">
      <div className="max-w-md w-full text-center">
        
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
            {!isSignUp ? (
              <form onSubmit={handleLogin}>
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 h-12 border border-gray-300 rounded-md shadow-sm mb-4"
                />
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
              </form>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-2">Almost done</h1>
                <p className="text-gray-600 mb-8">We're excited to have you join our member. Fill in detail for your account</p>
                <form onSubmit={handleSignUp} className="text-left">
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input 
                      type="email" 
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 h-12 border border-gray-300 rounded-md mt-1"
                    />
                  </div>
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

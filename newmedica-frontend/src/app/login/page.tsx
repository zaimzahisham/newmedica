'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { loginSchema, registerSchema, LoginFormData, RegisterFormData } from '@/lib/validations/auth';
import { showSuccessToast } from '@/components/CustomAlert';

const LoginPage = () => {
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { 
    register: registerLogin, 
    handleSubmit: handleLoginSubmit, 
    formState: { errors: loginErrors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { 
    register: registerSignUp, 
    handleSubmit: handleSignUpSubmit, 
    watch,
    formState: { errors: signUpErrors } 
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: 'Basic',
    },
  });

  const userType = watch('userType');

  const onLogin: SubmitHandler<LoginFormData> = async (data) => {
    setApiError(null);
    try {
      await login(data.email, data.password);
      router.push('/account');
    } catch (error) {
      setApiError('Login failed. Please check your credentials.');
      console.error(error);
    }
  };

  const onSignUp: SubmitHandler<RegisterFormData> = async (data) => {
    setApiError(null);
    const { ...rest } = data;
    const payload = {
      email: rest.email,
      password: rest.password,
      userType: rest.userType,
      extra_fields: {
        firstName: rest.firstName,
        icNo: rest.icNo,
        hpNo: rest.hpNo,
        hospitalName: rest.hospitalName,
        department: rest.department,
        position: rest.position,
        companyName: rest.companyName,
        companyAddress: rest.companyAddress,
        coRegNo: rest.coRegNo,
        coEmailAddress: rest.coEmailAddress,
        tinNo: rest.tinNo,
        picEinvoice: rest.picEinvoice,
        picEinvoiceEmail: rest.picEinvoiceEmail,
        picEinvoiceTelNo: rest.picEinvoiceTelNo,
      },
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/auth/register", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Something went wrong');
      }

      showSuccessToast('Registration successful! Please log in.');
      setIsSignUp(false);
    } catch (error: unknown) {
      setApiError(`Registration failed: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
    }
  };

  const baseInputClasses = "w-full p-3 h-12 border rounded-md";
  const errorInputClasses = "border-red-500";

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

        {apiError && <p className="text-red-500 text-sm mb-4">{apiError}</p>}

        {!isSignUp ? (
          <form onSubmit={handleLoginSubmit(onLogin)} className="text-left space-y-4">
            <div>
              <input 
                {...registerLogin('email')} 
                placeholder={loginErrors.email?.message || "Email"} 
                className={`${baseInputClasses} ${loginErrors.email ? errorInputClasses : 'border-gray-300'}`}
              />
            </div>
            <div>
              <input 
                {...registerLogin('password')} 
                type="password" 
                placeholder={loginErrors.password?.message || "Password"} 
                className={`${baseInputClasses} ${loginErrors.password ? errorInputClasses : 'border-gray-300'}`}
              />
            </div>
            <button type="submit" className="w-full bg-black text-white py-3 rounded-md">Login</button>
            <div className="text-center">
              <a href="#" className="text-sm text-gray-600 hover:underline">Forgot your password?</a>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignUpSubmit(onSignUp)} className="text-left space-y-4">
            {/* Common Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input {...registerSignUp('email')} className={`${baseInputClasses} ${signUpErrors.email ? errorInputClasses : 'border-gray-300'} mt-1`} />
              {signUpErrors.email && <p className="text-red-500 text-xs mt-1">{signUpErrors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input {...registerSignUp('firstName')} className={`${baseInputClasses} ${signUpErrors.firstName ? errorInputClasses : 'border-gray-300'} mt-1`} />
              {signUpErrors.firstName && <p className="text-red-500 text-xs mt-1">{signUpErrors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input {...registerSignUp('password')} type="password" className={`${baseInputClasses} ${signUpErrors.password ? errorInputClasses : 'border-gray-300'} mt-1`} />
              {signUpErrors.password && <p className="text-red-500 text-xs mt-1">{signUpErrors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input {...registerSignUp('confirmPassword')} type="password" className={`${baseInputClasses} ${signUpErrors.confirmPassword ? errorInputClasses : 'border-gray-300'} mt-1`} />
              {signUpErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{signUpErrors.confirmPassword.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">I am a...</label>
              <select {...registerSignUp('userType')} className={`${baseInputClasses} ${signUpErrors.userType ? errorInputClasses : 'border-gray-300'} mt-1`}>
                <option value="Basic">Basic User</option>
                <option value="Agent">Agent</option>
                <option value="Healthcare">Healthcare Professional</option>
              </select>
            </div>

            {/* Conditional Fields */}
            {userType === 'Healthcare' && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-gray-800">Healthcare Professional Details</h3>
                {signUpErrors._healthcareError && <p className="text-red-500 text-xs mt-1">{signUpErrors._healthcareError.message}</p>}
                <div>
                  <label className="block text-sm font-medium text-gray-700">IC No <span className="text-red-500">*</span></label>
                  <input {...registerSignUp('icNo')} className={`${baseInputClasses} ${signUpErrors.icNo ? errorInputClasses : 'border-gray-300'} mt-1`} />
                  {signUpErrors.icNo && <p className="text-red-500 text-xs mt-1">{signUpErrors.icNo.message}</p>}
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700">HP No <span className="text-red-500">*</span></label>
                  <input {...registerSignUp('hpNo')} className={`${baseInputClasses} ${signUpErrors.hpNo ? errorInputClasses : 'border-gray-300'} mt-1`} />
                  {signUpErrors.hpNo && <p className="text-red-500 text-xs mt-1">{signUpErrors.hpNo.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hospital Name <span className="text-red-500">*</span></label>
                  <input {...registerSignUp('hospitalName')} className={`${baseInputClasses} ${signUpErrors.hospitalName ? errorInputClasses : 'border-gray-300'} mt-1`} />
                  {signUpErrors.hospitalName && <p className="text-red-500 text-xs mt-1">{signUpErrors.hospitalName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department <span className="text-red-500">*</span></label>
                  <input {...registerSignUp('department')} className={`${baseInputClasses} ${signUpErrors.department ? errorInputClasses : 'border-gray-300'} mt-1`} />
                  {signUpErrors.department && <p className="text-red-500 text-xs mt-1">{signUpErrors.department.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position <span className="text-red-500">*</span></label>
                  <input {...registerSignUp('position')} className={`${baseInputClasses} ${signUpErrors.position ? errorInputClasses : 'border-gray-300'} mt-1`} />
                  {signUpErrors.position && <p className="text-red-500 text-xs mt-1">{signUpErrors.position.message}</p>}
                </div>
              </div>
            )}

            {userType === 'Agent' && (
               <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-gray-800">Agent Details</h3>
                {signUpErrors._agentError && <p className="text-red-500 text-xs mt-1">{signUpErrors._agentError.message}</p>}
                 <div>
                  <label className="block text-sm font-medium text-gray-700">IC No <span className="text-red-500">*</span></label>
                  <input {...registerSignUp('icNo')} className={`${baseInputClasses} ${signUpErrors.icNo ? errorInputClasses : 'border-gray-300'} mt-1`} />
                  {signUpErrors.icNo && <p className="text-red-500 text-xs mt-1">{signUpErrors.icNo.message}</p>}
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700">HP No <span className="text-red-500">*</span></label>
                  <input {...registerSignUp('hpNo')} className={`${baseInputClasses} ${signUpErrors.hpNo ? errorInputClasses : 'border-gray-300'} mt-1`} />
                  {signUpErrors.hpNo && <p className="text-red-500 text-xs mt-1">{signUpErrors.hpNo.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name <span className="text-red-500">*</span></label>
                  <input {...registerSignUp('companyName')} className={`${baseInputClasses} ${signUpErrors.companyName ? errorInputClasses : 'border-gray-300'} mt-1`} />
                  {signUpErrors.companyName && <p className="text-red-500 text-xs mt-1">{signUpErrors.companyName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Address <span className="text-red-500">*</span></label>
                  <input {...registerSignUp('companyAddress')} className={`${baseInputClasses} ${signUpErrors.companyAddress ? errorInputClasses : 'border-gray-300'} mt-1`} />
                  {signUpErrors.companyAddress && <p className="text-red-500 text-xs mt-1">{signUpErrors.companyAddress.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Reg No <span className="text-red-500">*</span></label>
                  <input {...registerSignUp('coRegNo')} className={`${baseInputClasses} ${signUpErrors.coRegNo ? errorInputClasses : 'border-gray-300'} mt-1`} />
                  {signUpErrors.coRegNo && <p className="text-red-500 text-xs mt-1">{signUpErrors.coRegNo.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Email Address <span className="text-red-500">*</span></label>
                  <input {...registerSignUp('coEmailAddress')} className={`${baseInputClasses} ${signUpErrors.coEmailAddress ? errorInputClasses : 'border-gray-300'} mt-1`} />
                  {signUpErrors.coEmailAddress && <p className="text-red-500 text-xs mt-1">{signUpErrors.coEmailAddress.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">TIN No <span className="text-red-500">*</span></label>
                  <input {...registerSignUp('tinNo')} className={`${baseInputClasses} ${signUpErrors.tinNo ? errorInputClasses : 'border-gray-300'} mt-1`} />
                  {signUpErrors.tinNo && <p className="text-red-500 text-xs mt-1">{signUpErrors.tinNo.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">PIC of E-invoice <span className="text-red-500">*</span></label>
                  <input {...registerSignUp('picEinvoice')} className={`${baseInputClasses} ${signUpErrors.picEinvoice ? errorInputClasses : 'border-gray-300'} mt-1`} />
                  {signUpErrors.picEinvoice && <p className="text-red-500 text-xs mt-1">{signUpErrors.picEinvoice.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">PIC of E-invoice Email <span className="text-red-500">*</span></label>
                  <input {...registerSignUp('picEinvoiceEmail')} className={`${baseInputClasses} ${signUpErrors.picEinvoiceEmail ? errorInputClasses : 'border-gray-300'} mt-1`} />
                  {signUpErrors.picEinvoiceEmail && <p className="text-red-500 text-xs mt-1">{signUpErrors.picEinvoiceEmail.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">PIC of E-invoice Tel No <span className="text-red-500">*</span></label>
                  <input {...registerSignUp('picEinvoiceTelNo')} className={`${baseInputClasses} ${signUpErrors.picEinvoiceTelNo ? errorInputClasses : 'border-gray-300'} mt-1`} />
                  {signUpErrors.picEinvoiceTelNo && <p className="text-red-500 text-xs mt-1">{signUpErrors.picEinvoiceTelNo.message}</p>}
                </div>
              </div>
            )}

            <button type="submit" className="w-full bg-black text-white py-3 rounded-md">Continue</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
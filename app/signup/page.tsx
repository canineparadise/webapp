"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  HeartIcon,
  SparklesIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export default function SignUp() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Password validation
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    // Check for password complexity
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasDigit = /\d/.test(formData.password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      formData.password,
    );

    if (!hasUpperCase || !hasLowerCase || !hasDigit || !hasSymbol) {
      toast.error(
        "Password must contain uppercase, lowercase, numbers, and symbols",
      );
      return;
    }

    setLoading(true);

    try {
      // Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            firstName: formData.firstName,
            lastName: formData.lastName,
          },
        },
      });

      if (authError) throw authError;

      setEmailSent(true);
      toast.success(
        "Success! Please check your email to confirm your account.",
      );
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered. Please login instead.");
      } else {
        toast.error(error.message || "Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    "Easy online booking system",
    "Monthly subscription packages",
  ];

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-canine-cream to-white flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
          >
            <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto mb-6" />
          </motion.div>

          <h1 className="text-3xl font-display font-bold text-canine-navy mb-4">
            Check Your Email! 📧
          </h1>

          <p className="text-gray-600 mb-6">
            We've sent a confirmation email to:
          </p>

          <p className="font-semibold text-canine-navy mb-6 bg-canine-cream px-4 py-2 rounded-lg">
            {formData.email}
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> Click the link in the email to
              activate your account. The link expires in 1 hour for security.
            </p>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Can't find the email? Check your spam folder or request a new one.
          </p>

          <div className="space-y-3">
            <button
              onClick={async () => {
                const { error } = await supabase.auth.resend({
                  type: "signup",
                  email: formData.email,
                });
                if (!error) {
                  toast.success("Confirmation email resent!");
                }
              }}
              className="w-full bg-canine-gold text-white py-3 rounded-lg font-semibold hover:bg-canine-light-gold transition-colors"
            >
              Resend Email
            </button>

            <Link
              href="/login"
              className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream to-white">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Form */}
        <div className="flex items-center justify-center p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-xl"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-block mb-6">
                <img
                  src="/logo.jpeg"
                  alt="Canine Paradise"
                  className="h-16 w-auto mx-auto rounded-lg shadow-lg"
                />
              </Link>
              <h1 className="text-4xl font-display font-bold text-canine-navy mb-2">
                Join Canine Paradise
              </h1>
              <p className="text-gray-600">
                Create your account to get started
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      placeholder="John"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      placeholder="Smith"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      placeholder="Min 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {/* Password Requirements */}
                  <div className="mt-2 text-xs text-gray-600">
                    <p className="font-semibold mb-1">Password must include:</p>
                    <ul className="space-y-0.5 ml-4">
                      <li
                        className={`${formData.password.length >= 8 ? "text-green-600" : ""}`}
                      >
                        • At least 8 characters
                      </li>
                      <li
                        className={`${/[A-Z]/.test(formData.password) ? "text-green-600" : ""}`}
                      >
                        • Uppercase letter (A-Z)
                      </li>
                      <li
                        className={`${/[a-z]/.test(formData.password) ? "text-green-600" : ""}`}
                      >
                        • Lowercase letter (a-z)
                      </li>
                      <li
                        className={`${/\d/.test(formData.password) ? "text-green-600" : ""}`}
                      >
                        • Number (0-9)
                      </li>
                      <li
                        className={`${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? "text-green-600" : ""}`}
                      >
                        • Symbol (!@#$%^&*)
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      placeholder="Repeat password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.agreeToTerms}
                  onChange={(e) =>
                    setFormData({ ...formData, agreeToTerms: e.target.checked })
                  }
                  className="mt-1 h-4 w-4 text-canine-gold focus:ring-canine-gold border-gray-300 rounded"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-canine-gold hover:underline"
                  >
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-canine-gold hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  . Unused days do not roll over to the next month.
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-canine-gold text-white py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:bg-canine-light-gold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-3"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <SparklesIcon className="ml-2 h-5 w-5" />
                  </>
                )}
              </motion.button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-canine-gold font-semibold hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </form>
          </motion.div>
        </div>

        {/* Right Side - Info */}
        <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-canine-navy to-canine-gold p-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-md text-white"
          >
            <h2 className="text-4xl font-display font-bold mb-6">
              Welcome to the Pack!
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join our exclusive doggy daycare community and give your furry
              friend the best care possible.
            </p>

            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex items-center"
                >
                  <CheckCircleIcon className="h-6 w-6 text-white mr-3 flex-shrink-0" />
                  <span className="text-white/90">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center mb-4">
                <HeartIcon className="h-8 w-8 text-white mr-3" />
                <h3 className="text-xl font-bold">Next Steps</h3>
              </div>
              <ol className="space-y-2 text-sm text-white/90">
                <li>1. Create your account</li>
                <li>2. Verify your email</li>
                <li>3. Add your dog's details</li>
                <li>4. Book an assessment day</li>
                <li>5. Choose your subscription plan</li>
              </ol>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

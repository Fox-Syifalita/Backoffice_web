import React, { useState } from "react";
import { Eye, EyeOff, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const Register = ({ user }) => {
    const [form, setForm] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        firstName: '',
        lastName: ''
    });
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        feedback: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Password strength checker
    const checkPasswordStrength = (password) => {
        const checks = [
            { regex: /.{8,}/, message: "At least 8 characters" },
            { regex: /[a-z]/, message: "Contains lowercase letter" },
            { regex: /[A-Z]/, message: "Contains uppercase letter" },
            { regex: /\d/, message: "Contains number" },
            { regex: /[!@#$%^&*(),.?":{}|<>]/, message: "Contains special character" },
            { regex: /^(?!.*(.)\1{2,})/, message: "No repeated characters" }
        ];

        const results = checks.map(check => ({
            ...check,
            passed: check.regex.test(password)
        }));

        const score = results.filter(r => r.passed).length;
        
        return {
            score,
            results,
            strength: score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong'
        };
    };

    // Common password check (basic implementation)
    const isCommonPassword = (password) => {
        const commonPasswords = [
            'password', '123456', '123456789', 'qwerty', 'abc123',
            'password123', 'admin', 'letmein', 'welcome', '12345678',
            'monkey', '1234567890', 'dragon', 'master', 'hello',
            'login', 'pass', 'admin123', 'root', 'toor'
        ];
        return commonPasswords.includes(password.toLowerCase());
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        // Check password strength in real-time
        if (name === 'password') {
            const strength = checkPasswordStrength(value);
            setPasswordStrength(strength);
        }
    };

    const validateForm = () => {
        const errors = [];

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            errors.push("Please enter a valid email address");
        }

        // Password validation
        if (form.password !== form.confirmPassword) {
            errors.push("Passwords do not match");
        }

        if (passwordStrength.score < 4) {
            errors.push("Password is too weak. Please use a stronger password.");
        }

        if (isCommonPassword(form.password)) {
            errors.push("This password is too common. Please choose a different one.");
        }

        // Username validation
        if (form.username.length < 3) {
            errors.push("Username must be at least 3 characters long");
        }

        // Name validation
        if (form.firstName.trim().length < 2) {
            errors.push("First name must be at least 2 characters long");
        }

        if (form.lastName.trim().length < 2) {
            errors.push("Last name must be at least 2 characters long");
        }

        return errors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setMessage(validationErrors.join('. '));
            return;
        }

        setIsSubmitting(true);
        setMessage('');

        const payload = {
            first_name: form.firstName.trim(),
            last_name: form.lastName.trim(),
            username: form.username.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password,
            role: 'owner'
        };

        fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(payload),
        })
        .then(res => res.json().then(data => ({ res, data })))
        .then(({ res, data }) => {
            if (!res.ok) {
                if (data.error === 'WEAK_PASSWORD') {
                    setMessage('Password detected in data breach. Please choose a different password.');
                } else {
                    setMessage(data.error || 'Registration failed');
                }
                return;
            }

            setMessage('Registration successful! Please login.');
            
            // Clear form
            setForm({
                username: '',
                password: '',
                confirmPassword: '',
                email: '',
                firstName: '',
                lastName: ''
            });

            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        })
        .catch(err => {
            setMessage('Failed to connect to server. Please try again.');
            console.error('Register error:', err);
        })
        .finally(() => {
            setIsSubmitting(false);
        });
    };

    const getStrengthColor = (strength) => {
        switch (strength) {
            case 'weak': return 'text-red-500';
            case 'medium': return 'text-yellow-500';
            case 'strong': return 'text-green-500';
            default: return 'text-gray-500';
        }
    };

    const getStrengthBg = (strength) => {
        switch (strength) {
            case 'weak': return 'bg-red-200';
            case 'medium': return 'bg-yellow-200';
            case 'strong': return 'bg-green-200';
            default: return 'bg-gray-200';
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create New Account</h2>
            
            {message && (
                <div className={`flex items-center gap-2 p-3 mb-4 rounded-lg ${
                    message.includes('successful') 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : 'bg-red-100 text-red-700 border border-red-300'
                }`}>
                    {message.includes('successful') ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <AlertTriangle className="w-5 h-5" />
                    )}
                    <span className="text-sm">{message}</span>
                </div>
            )}

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name *
                        </label>
                        <input 
                            name="firstName" 
                            value={form.firstName} 
                            onChange={handleChange} 
                            required 
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter first name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name *
                        </label>
                        <input 
                            name="lastName" 
                            value={form.lastName} 
                            onChange={handleChange} 
                            required 
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter last name"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username *
                    </label>
                    <input 
                        name="username" 
                        value={form.username} 
                        onChange={handleChange} 
                        required 
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Choose a username"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                    </label>
                    <input 
                        type="email" 
                        name="email" 
                        value={form.email} 
                        onChange={handleChange} 
                        required 
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter email address"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password *
                    </label>
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"}
                            name="password" 
                            value={form.password} 
                            onChange={handleChange} 
                            required 
                            className="w-full border border-gray-300 px-3 py-2 pr-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Create a strong password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    
                    {form.password && (
                        <div className="mt-2">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthBg(passwordStrength.strength)}`}
                                        style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                                    ></div>
                                </div>
                                <span className={`text-xs font-medium ${getStrengthColor(passwordStrength.strength)}`}>
                                    {passwordStrength.strength}
                                </span>
                            </div>
                            
                            <div className="space-y-1">
                                {passwordStrength.results.map((check, index) => (
                                    <div key={index} className="flex items-center gap-2 text-xs">
                                        {check.passed ? (
                                            <CheckCircle className="w-3 h-3 text-green-500" />
                                        ) : (
                                            <XCircle className="w-3 h-3 text-red-500" />
                                        )}
                                        <span className={check.passed ? 'text-green-600' : 'text-red-600'}>
                                            {check.message}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            
                            {isCommonPassword(form.password) && (
                                <div className="flex items-center gap-2 text-xs text-red-600 mt-2">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>This password is too common and may be compromised</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password *
                    </label>
                    <div className="relative">
                        <input 
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword" 
                            value={form.confirmPassword} 
                            onChange={handleChange} 
                            required 
                            className="w-full border border-gray-300 px-3 py-2 pr-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Confirm your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                        <div className="flex items-center gap-2 text-xs text-red-600 mt-1">
                            <XCircle className="w-3 h-3" />
                            <span>Passwords do not match</span>
                        </div>
                    )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-blue-800">
                            <strong>Security Notice:</strong> Your password will be checked against known data breaches. 
                            Please use a unique, strong password that you haven't used elsewhere.
                        </div>
                    </div>
                </div>

                <button 
                    type="button" 
                    onClick={handleSubmit}
                    disabled={isSubmitting || passwordStrength.score < 4}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
            </div>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                        Sign in here
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Register;
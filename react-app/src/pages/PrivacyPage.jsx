import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPage = () => (
  <div className="gradient-bg min-h-screen text-white/90 flex flex-col items-center p-4 sm:p-8">
    <div className="w-full max-w-4xl">
      <header className="text-center mb-12">
        <Link to="/" className="inline-block mb-6">
          <div className="bg-white/5 backdrop-blur-lg rounded-full p-4 shadow-lg">
            <i className="fas fa-calendar-check text-5xl text-gradient"></i>
          </div>
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">Privacy Policy</h1>
        <p className="text-lg opacity-80 mb-8">Last updated: September 7, 2025</p>
      </header>
      <main className="bg-white/5 backdrop-blur-lg rounded-xl shadow-xl p-6 sm:p-10 content-card leading-relaxed">
        <h2 className="text-[1.5rem] font-bold mb-4 border-b border-white/10 pb-2">Introduction</h2>
        <p>Welcome to Punch.In Scholar Companion ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application. By using the service, you agree to the collection and use of information in accordance with this policy.</p>
        
        <h2 className="text-[1.5rem] font-bold mb-4 border-b border-white/10 pb-2">Information We Collect</h2>
        <p>We collect information that you provide directly to us and information that is automatically collected when you use our service.</p>
        <ul className="list-disc ml-6 mb-5">
          <li><strong>Account Information:</strong> When you register for an account, we collect your email address and display name through Google Authentication or the email/password you provide. This is used solely for authentication and to personalize your experience.</li>
          <li><strong>User Content:</strong> We store the data you input into the application, including your subjects, attendance records (classes attended and total classes), and weekly timetable. This data is essential for the application to perform its functions.</li>
          <li><strong>AI Interaction Data:</strong> Prompts you enter into the AI features (Strategic Bunk Planner, Study Planner, Topic Suggester) are sent to the Google Gemini API to generate a response. We do not store the prompts or the AI-generated responses in our database.</li>
        </ul>
        
        <h2 className="text-[1.5rem] font-bold mb-4 border-b border-white/10 pb-2">How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul className="list-disc ml-6 mb-5">
          <li>Provide, operate, and maintain our services.</li>
          <li>Personalize your experience, such as greeting you by your display name.</li>
          <li>Securely save your data to your account so you can access it from any device.</li>
          <li>Process your requests to our AI features via the Google Gemini API.</li>
        </ul>
        
        <h2 className="text-[1.5rem] font-bold mb-4 border-b border-white/10 pb-2">Data Storage and Security</h2>
        <p>Your user-provided data (subjects, attendance, timetable, and profile) is stored securely in Google's Firebase Firestore database. We use Firebase's built-in security rules to ensure that only you can access your own data. We do not share your personal data with any third parties.</p>

        <h2 className="text-[1.5rem] font-bold mb-4 border-b border-white/10 pb-2">Third-Party Services</h2>
        <p>Our application relies on the following third-party services:</p>
        <ul className="list-disc ml-6 mb-5">
          <li><strong>Google Firebase:</strong> For user authentication and database storage.</li>
          <li><strong>Google Gemini API:</strong> To power our artificial intelligence features. Your interaction with these features is subject to Google's privacy policies.</li>
        </ul>

        <h2 className="text-[1.5rem] font-bold mb-4 border-b border-white/10 pb-2">Your Rights</h2>
        <p>You have the right to access and modify your data at any time through the application's interface. You can delete your account and all associated data by sending a request to our contact email.</p>

        <h2 className="text-[1.5rem] font-bold mb-4 border-b border-white/10 pb-2">Contact Us</h2>
        <p>If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at: <a href="mailto:aadithyavimal.work@gmail.com" className="text-indigo-400 hover:underline">aadithyavimal.work@gmail.com</a>.</p>
      </main>
      <div className="text-center mt-8">
        <Link to="/" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg">
          Back to App
        </Link>
      </div>
    </div>
  </div>
);

export default PrivacyPage;

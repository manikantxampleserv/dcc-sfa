/**
 * ## Privacy Policy Page
 *
 * Professional privacy policy page matching DCC-SFA design patterns.
 * Built with consistent styling, responsive design, and modern UI components.
 *
 * #### Features
 * - Comprehensive privacy policy content
 * - Responsive design with modern UI
 * - Consistent branding and color scheme
 * - Professional layout with proper typography
 * - Navigation back to login page
 */

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Privacy Policy Page Component
 * @returns JSX.Element - Rendered privacy policy page
 */
const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">
                  D
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                DCC-SFA
              </span>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 sm:px-8 py-8 sm:py-12">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Privacy Policy
              </h1>
              <p className="text-blue-100 text-lg sm:text-xl max-w-2xl mx-auto">
                Your privacy is important to us. This policy explains how we
                collect, use, and protect your information.
              </p>
              <div className="mt-6 text-sm text-blue-200">
                Last updated: January 15, 2025
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-6 sm:px-8 py-8 sm:py-12">
            <div className="prose prose-lg max-w-none">
              {/* Introduction */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  Introduction
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  DCC Sales Force Automation System ("DCC-SFA", "we", "us", or
                  "our") is committed to protecting your privacy. This Privacy
                  Policy explains how we collect, use, disclose, and safeguard
                  your information when you use our sales force automation
                  platform and related services.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By using our services, you agree to the collection and use of
                  information in accordance with this policy. If you do not
                  agree with the terms of this Privacy Policy, please do not
                  access or use our services.
                </p>
              </section>

              {/* Information We Collect */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  Information We Collect
                </h2>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Personal Information
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Name, email address, and contact information</li>
                    <li>Company and job title information</li>
                    <li>User credentials and authentication data</li>
                    <li>Profile information and preferences</li>
                    <li>Communication records and support interactions</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Business Information
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Customer and prospect data</li>
                    <li>Sales orders and transaction records</li>
                    <li>Product catalogs and pricing information</li>
                    <li>Route and territory management data</li>
                    <li>Performance metrics and analytics</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Technical Information
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Device information and IP addresses</li>
                    <li>Browser type and version</li>
                    <li>Usage patterns and system logs</li>
                    <li>Cookies and similar tracking technologies</li>
                    <li>Location data (when permitted)</li>
                  </ul>
                </div>
              </section>

              {/* How We Use Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  How We Use Your Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">
                      Service Delivery
                    </h3>
                    <ul className="list-disc list-inside text-blue-800 space-y-2 text-sm">
                      <li>Provide and maintain our platform</li>
                      <li>Process transactions and orders</li>
                      <li>Manage user accounts and permissions</li>
                      <li>Deliver customer support</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">
                      Business Operations
                    </h3>
                    <ul className="list-disc list-inside text-green-800 space-y-2 text-sm">
                      <li>Generate reports and analytics</li>
                      <li>Improve system performance</li>
                      <li>Conduct research and development</li>
                      <li>Ensure system security</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-3">
                      Communication
                    </h3>
                    <ul className="list-disc list-inside text-purple-800 space-y-2 text-sm">
                      <li>Send important notifications</li>
                      <li>Provide system updates</li>
                      <li>Share marketing materials</li>
                      <li>Respond to inquiries</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-orange-900 mb-3">
                      Legal Compliance
                    </h3>
                    <ul className="list-disc list-inside text-orange-800 space-y-2 text-sm">
                      <li>Comply with legal obligations</li>
                      <li>Protect against fraud</li>
                      <li>Enforce our terms of service</li>
                      <li>Respond to legal requests</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Information Sharing */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">4</span>
                  </div>
                  Information Sharing and Disclosure
                </h2>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-yellow-600 text-xl">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-yellow-800">
                        We Do Not Sell Your Data
                      </h3>
                      <p className="text-yellow-700 mt-1">
                        We do not sell, trade, or rent your personal information
                        to third parties for marketing purposes.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-4">
                  We may share your information only in the following limited
                  circumstances:
                </p>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 text-xs font-bold">•</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Service Providers
                      </h4>
                      <p className="text-gray-700 text-sm">
                        With trusted third-party service providers who assist us
                        in operating our platform, conducting business, or
                        serving users.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 text-xs font-bold">•</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Legal Requirements
                      </h4>
                      <p className="text-gray-700 text-sm">
                        When required by law or to protect our rights, property,
                        or safety, or that of our users.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 text-xs font-bold">•</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Business Transfers
                      </h4>
                      <p className="text-gray-700 text-sm">
                        In connection with any merger, sale of assets, or
                        acquisition of our business.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 text-xs font-bold">•</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Consent</h4>
                      <p className="text-gray-700 text-sm">
                        With your explicit consent for any other purpose not
                        covered in this policy.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Security */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">5</span>
                  </div>
                  Data Security
                </h2>

                <div className="bg-green-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">
                    Security Measures
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">🔒</span>
                        <span className="text-green-800 text-sm">
                          Encryption in transit and at rest
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">🛡️</span>
                        <span className="text-green-800 text-sm">
                          Multi-factor authentication
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">🔐</span>
                        <span className="text-green-800 text-sm">
                          Role-based access controls
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">📊</span>
                        <span className="text-green-800 text-sm">
                          Regular security audits
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">🔍</span>
                        <span className="text-green-800 text-sm">
                          Intrusion detection systems
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">💾</span>
                        <span className="text-green-800 text-sm">
                          Secure data backups
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  While we implement industry-standard security measures to
                  protect your information, no method of transmission over the
                  internet or electronic storage is 100% secure. We cannot
                  guarantee absolute security but are committed to maintaining
                  the highest standards of data protection.
                </p>
              </section>

              {/* Your Rights */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">6</span>
                  </div>
                  Your Rights and Choices
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Access and Portability
                      </h4>
                      <p className="text-blue-800 text-sm">
                        Request access to your personal data and receive it in a
                        portable format.
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">
                        Correction
                      </h4>
                      <p className="text-green-800 text-sm">
                        Update or correct inaccurate personal information in
                        your account.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 mb-2">
                        Deletion
                      </h4>
                      <p className="text-purple-800 text-sm">
                        Request deletion of your personal data, subject to legal
                        requirements.
                      </p>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-900 mb-2">
                        Communication Preferences
                      </h4>
                      <p className="text-orange-800 text-sm">
                        Opt out of marketing communications while receiving
                        essential service updates.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    How to Exercise Your Rights
                  </h4>
                  <p className="text-gray-700 text-sm mb-3">
                    To exercise any of these rights, please contact us using the
                    information provided in the "Contact Us" section below. We
                    will respond to your request within 30 days.
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>📧</span>
                    <span>Email: privacy@dcc-sfa.com</span>
                  </div>
                </div>
              </section>

              {/* Data Retention */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">7</span>
                  </div>
                  Data Retention
                </h2>

                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We retain your personal information only for as long as
                    necessary to fulfill the purposes outlined in this Privacy
                    Policy, unless a longer retention period is required or
                    permitted by law.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-700 text-sm">
                        <strong>Account Information:</strong> Retained while
                        your account is active and for 3 years after closure
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-700 text-sm">
                        <strong>Transaction Records:</strong> Retained for 7
                        years for accounting and legal compliance
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-700 text-sm">
                        <strong>Communication Logs:</strong> Retained for 2
                        years for customer support purposes
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-700 text-sm">
                        <strong>Analytics Data:</strong> Retained for 1 year in
                        aggregated, anonymized form
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Cookies and Tracking */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">8</span>
                  </div>
                  Cookies and Tracking Technologies
                </h2>

                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    Types of Cookies We Use
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <span className="text-white text-lg">🍪</span>
                      </div>
                      <h4 className="font-semibold text-blue-900 text-sm">
                        Essential
                      </h4>
                      <p className="text-blue-800 text-xs">
                        Required for basic functionality
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <span className="text-white text-lg">⚙️</span>
                      </div>
                      <h4 className="font-semibold text-green-900 text-sm">
                        Functional
                      </h4>
                      <p className="text-green-800 text-xs">
                        Remember your preferences
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <span className="text-white text-lg">📊</span>
                      </div>
                      <h4 className="font-semibold text-purple-900 text-sm">
                        Analytics
                      </h4>
                      <p className="text-purple-800 text-xs">
                        Help us improve our service
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  You can control cookie preferences through your browser
                  settings. However, disabling certain cookies may affect the
                  functionality of our platform. We use cookies to enhance your
                  experience, remember your preferences, and analyze how our
                  platform is used.
                </p>
              </section>

              {/* International Transfers */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">9</span>
                  </div>
                  International Data Transfers
                </h2>

                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Your information may be transferred to and processed in
                    countries other than your country of residence. These
                    countries may have different data protection laws than your
                    country.
                  </p>

                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Safeguards for International Transfers
                    </h4>
                    <ul className="list-disc list-inside text-blue-800 text-sm space-y-1">
                      <li>
                        Standard contractual clauses approved by relevant
                        authorities
                      </li>
                      <li>
                        Adequacy decisions from data protection authorities
                      </li>
                      <li>Certification schemes and codes of conduct</li>
                      <li>Binding corporate rules for intra-group transfers</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Children's Privacy */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">10</span>
                  </div>
                  Children's Privacy
                </h2>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-yellow-600 text-xl">👶</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-yellow-800">
                        Age Restriction
                      </h3>
                      <p className="text-yellow-700 mt-1">
                        Our services are not intended for children under 16
                        years of age. We do not knowingly collect personal
                        information from children under 16. If you are a parent
                        or guardian and believe your child has provided us with
                        personal information, please contact us.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Policy Updates */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">11</span>
                  </div>
                  Changes to This Privacy Policy
                </h2>

                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We may update this Privacy Policy from time to time to
                    reflect changes in our practices, technology, legal
                    requirements, or other factors. When we make changes, we
                    will:
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-blue-600 text-xs font-bold">
                          1
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Update the "Last Updated" date
                        </h4>
                        <p className="text-gray-700 text-sm">
                          We will revise the date at the top of this policy to
                          indicate when changes were made.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-blue-600 text-xs font-bold">
                          2
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Notify Users of Material Changes
                        </h4>
                        <p className="text-gray-700 text-sm">
                          For significant changes, we will provide notice
                          through email or platform notifications.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-blue-600 text-xs font-bold">
                          3
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Provide Review Period
                        </h4>
                        <p className="text-gray-700 text-sm">
                          We will give you reasonable time to review changes
                          before they take effect.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 bg-blue-50 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>
                        Your continued use of our services after any changes to
                        this Privacy Policy constitutes acceptance of the
                        updated policy.
                      </strong>
                    </p>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">12</span>
                  </div>
                  Contact Us
                </h2>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-blue-900 mb-2">
                      Questions About This Privacy Policy?
                    </h3>
                    <p className="text-blue-800">
                      We're here to help. Contact our privacy team for any
                      questions or concerns.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-lg">📧</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Email</h4>
                          <p className="text-gray-600 text-sm">
                            privacy@dcc-sfa.com
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Send us an email and we'll respond within 24-48 hours.
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-lg">🏢</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Address
                          </h4>
                          <p className="text-gray-600 text-sm">
                            DCC-SFA Privacy Office
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">
                        123 Business District
                        <br />
                        Suite 456, Tech City
                        <br />
                        Country, Postal Code
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Data Protection Officer
                      </h4>
                      <p className="text-gray-700 text-sm mb-2">
                        For complex privacy matters or data protection concerns,
                        contact our Data Protection Officer:
                      </p>
                      <p className="text-blue-600 font-medium">
                        dpo@dcc-sfa.com
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900">DCC-SFA</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Copyright © 2025 DCC Sales Force Automation System. All rights
              reserved.
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Back to Login
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">Privacy Policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

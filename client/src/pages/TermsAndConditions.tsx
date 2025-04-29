import React from 'react'

const TermsAndConditions = () => {
    return (
        <div className="max-w-4xl mx-auto p-6 sm:p-10 text-gray-800">
            <h1 className="text-3xl font-bold mb-6 text-center">Terms and Conditions</h1>

            <p className="text-sm text-gray-500 mb-8 text-center">Effective Date: April 29, 2025</p>

            <p className="mb-6">
                Welcome to <strong>WebGrave</strong>. By accessing or using our website and services, you agree to be bound by the following terms and conditions. Please read them carefully.
            </p>

            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
                    <p>
                        By using WebGrave, you confirm that you are at least 18 years old or have the consent of a guardian, and that you agree to comply with these Terms and Conditions. If you do not agree, please do not use the service.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">2. Services Provided</h2>
                    <p>
                        WebGrave allows users to create digital memorials, upload content (photos, text, videos), and optionally purchase services such as barcode links on gravestones and digital flower donations.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">3. Account Responsibility</h2>
                    <p>
                        You are responsible for maintaining the confidentiality of your account and password. You agree to notify us immediately if you suspect any unauthorized use of your account.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">4. Content Guidelines</h2>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Offensive, illegal, or defamatory content.</li>
                        <li>Content that infringes on copyrights, trademarks, or privacy rights of others.</li>
                        <li>False or misleading information.</li>
                    </ul>
                    <p className="mt-2">
                        We reserve the right to remove any content that violates these terms.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">5. Intellectual Property</h2>
                    <p>
                        All trademarks, logos, and content on WebGrave (except user-generated content) are the property of WebGrave. You may not use, copy, or reproduce any part of the platform without written permission.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">6. Payments and Donations</h2>
                    <p>
                        All payments made on the platform, including digital flower donations and one-time service purchases, are final and non-refundable except under conditions outlined in our Refund Policy.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">7. Termination</h2>
                    <p>
                        WebGrave reserves the right to suspend or terminate any account that violates these Terms and Conditions, with or without notice.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">8. Limitation of Liability</h2>
                    <p>
                        WebGrave is not liable for any direct, indirect, incidental, or consequential damages arising from your use of the platform. We do not guarantee uninterrupted service or error-free content.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">9. Changes to Terms</h2>
                    <p>
                        We may update these Terms at any time. Continued use of the platform after changes means you accept the updated terms.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
                    <p>
                        If you have any questions about these terms, contact us at <a href="mailto:info@webgrave.com" className="text-blue-600 underline">info@webgrave.com</a>.
                    </p>
                </section>
            </div>
        </div>
    )
}

export default TermsAndConditions

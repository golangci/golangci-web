import * as React from "react";

const Page: React.StatelessComponent<any> = (props) => (
    <div className="static-page-container">
        <h1>Privacy</h1>

        <h2>General Information</h2>
        <p>
        We collect the e-mail addresses of those who sign up with GolangCI, aggregate information on
        what pages consumers access or visit, and information volunteered by the consumer. The information
        we collect is used to improve the content of our web pages and the quality of our service, and is
        not shared with or sold to other organizations for commercial purposes, except to provide products
        or services you’ve requested, when we have your permission, or under the following circumstances:
        </p>
        <ul>
            <li>It is necessary to share information in order to investigate, prevent, or take action
                regarding illegal activities, suspected fraud, situations involving potential threats
                to the physical safety of any person, violations of Terms of Service, or as otherwise
                required by law.</li>
            <li>We transfer information about you if GolangCI is acquired by or merged with another company.
                In this event, GolangCI LLC will notify you before information about you is transferred
                and becomes subject to a different privacy policy.</li>
        </ul>

        <h2>Information Gathering and Usage</h2>
        <p>
        GolangCI LLC uses collected information for the following general
        purposes: products and services provision, billing, identification and
        authentication, services improvement, contact, and research.
        </p>

        <h2>Cookies</h2>
        <p>A cookie is a small amount of data, which often includes an anonymous unique identifier,
            that is sent to your browser from a web site’s computers and stored on your computer’s hard drive.</p>
        <ul>
            <li>Cookies are required to use the GolangCI service.</li>
            <li>We use cookies to record current session information, but do not use permanent
                cookies. You are required to re-login to your GolangCI account after the browser
                session has ended to protect you against others accidentally accessing your account contents.</li>
        </ul>

        <h2>Data Storage</h2>
        <p>GolangCI LLC uses third party vendors and hosting partners to provide the necessary hardware,
            software, networking, storage, and related technology required to run GolangCI. Although GolangCI LLC
            owns the code, databases, and all rights to the GolangCI application, you retain all rights to your data.</p>

        <h2>Source Code</h2>
        <ul>
            <li>GolangCI LLC employees do not access GolangCI users’ private source code unless GolangCI
                users give GolangCI LLC employees explicit written permission to access their source
                code in order to provide support.
            </li>
            <li>GolangCI’s source code is openly available. Browse the code and email us with questions.
            </li>
        </ul>

        <h2>Disclosure</h2>
        <p>GolangCI LLC may disclose personally identifiable information under special circumstances,
            such as to comply with subpoenas or when your actions violate the Terms of Service.</p>

        <h2>Changes</h2>
        <p>GolangCI LLC may periodically update this policy. We will notify you about significant changes
            in the way we treat personal information by sending a notice to the primary email address
            specified in your GolangCI account or by placing a prominent notice on our site.</p>
    </div>
);

export default Page;

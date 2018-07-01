import * as React from "react";

const Page: React.StatelessComponent<any> = (props) => (
    <div className="static-page-container">
        <h1>Terms of Service</h1>
        <p>
            By using the golangci.com web site (“Service”) you are agreeing to be bound by the following terms and conditions (“Terms of Service”).
        </p>
        <p>
            GolangCI reserves the right to update and change the Terms of Service from time to time without notice.
            Any new features that augment or enhance the current Service, including the release of new tools and resources,
            shall be subject to the Terms of Service.
            Continued use of the Service after any such changes shall constitute your consent to such changes.
        </p>

        <p>
            Violation of any of the terms below will result in the termination of your Account.
            While GolangCI prohibits such conduct and Content on the Service, you understand and agree
            that GolangCI LLC cannot be responsible for the Content posted on the Service and you nonetheless
            may be exposed to such materials. You agree to use the Service at your own risk.
        </p>

        <h2>Account Terms</h2>
        <ul>
            <li>You must be 13 years or older to use this Service.</li>
            <li>You must be a human. Accounts registered by “bots” or other automated methods are not permitted.</li>
            <li>You are responsible for maintaining the security of your account.
                GolangCI LLC cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.</li>
            <li>You may not use the Service for any illegal or unauthorized purpose.
                You must not, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws).</li>
        </ul>

        <h2>Payment and Refund Terms</h2>
        <ul>
            <li>All paid plans must enter a valid credit card. Free accounts are not required to provide credit card details.</li>
            <li>The Service is billed in advance on a monthly basis and is non-refundable.
                There will be no refunds or credits for partial months of service, upgrade/downgrade refunds,
                or refunds for months unused with an open account.
                In order to treat everyone equally, no exceptions will be made.
            </li>
            <li>All fees are exclusive of all taxes, levies, or duties imposed by taxing authorities,
                and you shall be responsible for payment of all such taxes, levies, or duties, excluding only United States (federal or state) taxes.
            </li>
        </ul>

        <h2>Cancellation and Termination</h2>
        <ul>
            <li>You are solely responsible for properly canceling service.
                An email or phone request to cancel your account is not considered cancellation.
            </li>
            <li>If you cancel Service before the end of your current paid up month,
                your cancellation will take effect immediately and you will not be charged again.
            </li>
            <li>GolangCI, in its sole discretion, has the right to suspend or terminate your account
                and refuse any and all current or future use of the Service, or any other
                GolangCI LLC service, for any reason at any time.
                Such termination of the Service will result in the deactivation or
                deletion of your Account or your access to your Account.
                GolangCI reserves the right to refuse service to anyone for any reason at any time.
            </li>
        </ul>

        <h2>Modifications to the Service and Prices</h2>
        <ul>
            <li>GolangCI reserves the right at any time and from time to time to modify or discontinue,
                temporarily or permanently, the Service (or any part thereof) with or without notice.
            </li>
            <li>Prices of all Services, including but not limited to monthly subscription plan
                fees to the Service, are subject to change upon 30 days notice from us.
                Such notice may be provided at any time by sending a notice to the primary email address
                specified in your GolangCI account or by placing a prominent notice on our site.
            </li>
            <li>GolangCI shall not be liable to you or to any third party for any modification, price change, suspension or discontinuance of the Service.
            </li>
        </ul>

        <h2>Copyright and Content Ownership</h2>
        <p>
            We claim no intellectual property rights over the material you provide to the Service.
        </p>
        <p>
            The look and feel of the Service is © {(new Date()).getFullYear()} GolangCI LLC.
            All rights reserved. The name and logos for GolangCI are property of GolangCI LLC.
            All rights reserved. You may not duplicate, copy, or reuse any portion of the HTML/CSS, Javascript,
            or visual design elements or concepts without express written permission from GolangCI.
            You may not use the GolangCI name with express written permission.
        </p>

        <h2>General Conditions</h2>
        <ul>
            <li>Your use of the Service is at your sole risk. The service is provided on an “as is” and “as available” basis.</li>
            <li>You understand that GolangCI uses third party vendors and hosting partners to provide the
                necessary hardware, software, networking, storage, and related technology required to run the Service.</li>
            <li>You must not modify, adapt or hack the Service or modify another website so as to falsely imply
                that it is associated with the Service, GolangCI, or any other GolangCI LLC service.</li>
            <li>Verbal, physical, written or other abuse (including threats of abuse or retribution) of any GolangCI customer,
                employee, member, or officer will result in immediate account termination.</li>
            <li>GolangCI does not warrant that (i) the service will meet your specific requirements,
                (ii) the service will be uninterrupted, timely, secure, or error-free,
                (iii) the results that may be obtained from the use of the service will be accurate or reliable,
                (iv) the quality of any products, services, information, or other material purchased or
                obtained by you through the service will meet your expectations, and
                (v) any errors in the Service will be corrected.
            </li>
            <li>You expressly understand and agree that GolangCI LLC shall not be liable for any direct,
                indirect, incidental, special, consequential or exemplary damages, including but not limited
                to, damages for loss of profits, goodwill, use, data or other intangible losses
                (even if GolangCI LLC has been advised of the possibility of such damages), resulting from:
                (i) the use or the inability to use the service;
                (ii) the cost of procurement of substitute goods and services resulting from any goods,
                data, information or services purchased or obtained or messages received or
                transactions entered into through or from the service;
                (iii) unauthorized access to or alteration of your transmissions or data;
                (iv) statements or conduct of any third party on the service;
                (v) or any other matter relating to the service.
            </li>
            <li>The failure of GolangCI LLC to exercise or enforce any right or provision
                of the Terms of Service shall not constitute a waiver of such right or provision.
                The Terms of Service constitutes the entire agreement between you and GolangCI LLC and govern
                your use of the Service, superceding any prior agreements between you and GolangCI LLC (including,
                but not limited to, any prior versions of the Terms of Service).
            </li>
        </ul>
    </div>
);

export default Page;
